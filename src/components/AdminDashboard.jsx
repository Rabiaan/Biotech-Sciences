import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Package,
  Layers,
  ShoppingBag,
  PlusCircle,
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Plus,
  Trash,
  Pencil,
  Eye,
  Search,
  BarChart3,
  Users,
  MessageSquare,
  X,
  Image as ImageIcon
} from "lucide-react";
import { isSaleActive } from "../lib/sale.js";
import { NumaStore } from "../utils/store";
import { getAuthHeaders } from "../lib/supabase.js";
import ContactQueries from "./ContactQueries";

function AdminDashboard({ onClose, showToast }) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [products, setProducts] = useState(() => NumaStore.getProducts());
  const [categories, setCategories] = useState(() => NumaStore.getCategories());
  const [orders, setOrders] = useState(() => NumaStore.getOrders());
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [users, setUsers] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [orderFilterDate, setOrderFilterDate] = useState("");
  const [orderFilterMonth, setOrderFilterMonth] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchAdminData = useCallback(async (email = "") => {
    setIsLoading(true);
    setLoadError("");
    try {
      const headers = await getAuthHeaders();
      const [prodRes, catRes, reportRes, usersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/admin/reports", { headers }),
        fetch("/api/admin/users", { headers })
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (reportRes.ok) setReports(await reportRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      else if (usersRes.status === 403) setLoadError("Admin access required.");

      const orderUrl = email
        ? `/api/admin/orders?email=${encodeURIComponent(email)}`
        : "/api/admin/orders";
      const orderRes = await fetch(orderUrl, { headers });
      if (orderRes.ok) {
        setOrders(await orderRes.json());
      } else if (orderRes.status === 403) {
        setLoadError("Admin access required.");
      }
      await NumaStore.syncFromDatabase();
    } catch (err) {
      setLoadError("Failed to load dashboard data. Using cached data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/messages", { headers });
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleEmailSearch = (e) => {
    e.preventDefault();
    fetchAdminData(emailFilter.trim());
  };
  const fetchTodayOrders = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/orders/today", { headers });
      if (res.ok) setTodayOrders(await res.json());
    } catch (err) {
      console.error("Failed to fetch today's orders:", err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (orderFilterDate) params.set("date", orderFilterDate);
      if (orderFilterMonth) params.set("month", orderFilterMonth);
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { headers });
      if (res.ok) setTodayOrders(await res.json());
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }, [orderFilterDate, orderFilterMonth]);

  const downloadOrdersCSV = (rows) => {
    if (!rows || rows.length === 0) {
      if (showToast) showToast("No orders to export", "info");
      return;
    }
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["Order ID", "Date", "Customer", "Email", "Status", "Items", "Subtotal", "Shipping", "Total"];
    const lines = rows.map((o) => [
      o.id,
      new Date(o.timestamp).toISOString(),
      o.displayName,
      o.userEmail,
      o.status,
      (o.items || []).map((i) => `${i.name} x${i.quantity}`).join("; "),
      o.subtotal,
      o.shipping,
      o.total
    ].map(esc).join(","));
    const csv = [header.map(esc).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${orderFilterDate || orderFilterMonth || "export"}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleMessage = useCallback(async (id, answered) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ answered })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
        );
      }
    } catch (err) {
      console.error("Failed to update message:", err);
    }
  }, []);

  const reloadData = () => fetchAdminData(emailFilter);

  const handleOrderStatusChange = async (orderId, status) => {
    setStatusUpdating(orderId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      setTodayOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      if (showToast) showToast(`Order ${orderId} marked as ${status}`, "success");
    } catch (err) {
      if (showToast) showToast("Could not update order status", "info");
    } finally {
      setStatusUpdating(null);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    if (activeTab === "queries") {
      fetchMessages();
    }
  }, [activeTab, fetchMessages]);

  useEffect(() => {
    if (activeTab === "todayOrders") {
      fetchTodayOrders();
    }
  }, [activeTab, fetchTodayOrders]);

  const handleViewUserHistory = useCallback(async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setUserOrders([]);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${user.id}/orders`, { headers });
      if (res.ok) setUserOrders(await res.json());
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    }
  }, []);
  const handleDeleteUser = useCallback(async (user) => {
    if (!window.confirm(`Delete user "${user.displayName || user.email}"? This action cannot be undone.`)) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (showToast) showToast(`Deleted user ${user.displayName || user.email}`, "success");
    } catch (err) {
      if (showToast) showToast(err.message || "Could not delete user", "info");
    }
  }, [showToast]);

  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Soaps");
  const [newProdPrice, setNewProdPrice] = useState("35.00");
  const [newProdStock, setNewProdStock] = useState("25");
  const [newProdVolume, setNewProdVolume] = useState("50 ml");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdLabel, setNewProdLabel] = useState("");
  const [newProdTexture, setNewProdTexture] = useState("Cream");
  const [newProdFragrance, setNewProdFragrance] = useState("Fresh");
  const [newProdDetails, setNewProdDetails] = useState([""]);
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdOnSale, setNewProdOnSale] = useState(false);
  const [newProdSalePrice, setNewProdSalePrice] = useState("");
  const [newProdSaleStart, setNewProdSaleStart] = useState("");
  const [newProdSaleEnd, setNewProdSaleEnd] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [mediaImages, setMediaImages] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState("add");
  const handleAddDetailField = () => {
    setNewProdDetails([...newProdDetails, ""]);
  };
  const handleDetailChange = (index, value) => {
    const updated = [...newProdDetails];
    updated[index] = value;
    setNewProdDetails(updated);
  };
  const handleRemoveDetailField = (index) => {
    setNewProdDetails(newProdDetails.filter((_, i) => i !== index));
  };
  const openImagePicker = useCallback(async (target) => {
    setImagePickerTarget(target);
    setShowImagePicker(true);
    setMediaLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/media/images", { headers });
      if (res.ok) {
        const data = await res.json();
        setMediaImages(data.images || []);
      } else {
        setMediaImages([]);
      }
    } catch (err) {
      console.error("Failed to load media images:", err);
      setMediaImages([]);
    } finally {
      setMediaLoading(false);
    }
  }, []);
  const handleSelectMediaImage = (url) => {
    if (imagePickerTarget === "edit") setEditImage(url);
    else setNewProdImage(url);
    setShowImagePicker(false);
  };
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    if (newProdOnSale && (!newProdSalePrice || parseFloat(newProdSalePrice) <= 0)) {
      if (showToast) showToast("Enter a sale price when marking a product on sale.", "info");
      return;
    }
    const filteredDetails = newProdDetails.filter((d) => d.trim() !== "");
    const selectedImage = newProdImage || "/src/assets/images/Anti-Fungal Soap.png";
    NumaStore.addProduct({
      name: newProdName,
      category: newProdCategory,
      price: parseFloat(newProdPrice) || 25,
      stock: parseInt(newProdStock) || 20,
      volume: newProdVolume,
      description: newProdDescription || "An expert botanical formulation created to nourish skin layers and deliver long term skin wellness.",
      details: filteredDetails.length > 0 ? filteredDetails : ["Dermatologically certified formulation", "Safe for morning and evening routines"],
      texture: newProdTexture,
      fragranceProfile: newProdFragrance,
      label: newProdLabel || null,
      image: selectedImage,
      onSale: newProdOnSale,
      salePrice: newProdOnSale ? parseFloat(newProdSalePrice) : null,
      saleStart: newProdOnSale ? newProdSaleStart || null : null,
      saleEnd: newProdOnSale ? newProdSaleEnd || null : null
    });
    if (showToast) {
      showToast(`Successfully added product: ${newProdName}`, "success");
    }
    setNewProdName("");
    setNewProdPrice("35.00");
    setNewProdStock("25");
    setNewProdVolume("50 ml");
    setNewProdDescription("");
    setNewProdLabel("");
    setNewProdDetails([""]);
    setNewProdImage("");
    setNewProdOnSale(false);
    setNewProdSalePrice("");
    setNewProdSaleStart("");
    setNewProdSaleEnd("");
    reloadData();
    setActiveTab("inventory");
  };
  const [newCatName, setNewCatName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    NumaStore.addCategory(newCatName.trim());
    if (showToast) {
      showToast(`Added category: ${newCatName}`, "success");
    }
    setNewCatName("");
    reloadData();
  };
  const openEditCategory = (cat) => {
    setEditingCategory(cat.name);
    setEditCatName(cat.name);
    setShowCategoryModal(true);
  };
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editCatName.trim()) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/categories/${encodeURIComponent(editingCategory)}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCatName.trim() })
      });
      if (!res.ok) throw new Error("Failed to update category");
      if (showToast) showToast(`Renamed category to ${editCatName.trim()}`, "success");
      setShowCategoryModal(false);
      setEditingCategory(null);
      reloadData();
    } catch (err) {
      if (showToast) showToast("Could not update category", "info");
    }
  };
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Products currently in this category will keep their label, but the category itself will be removed.`)) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/categories/${encodeURIComponent(cat.name)}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Failed to delete category");
      if (showToast) showToast(`Deleted category: ${cat.name}`, "success");
      reloadData();
    } catch (err) {
      if (showToast) showToast("Could not delete category", "info");
    }
  };

  // ── Edit / update product ──────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState(null);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Soaps");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editVolume, setEditVolume] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editTexture, setEditTexture] = useState("Cream");
  const [editFragrance, setEditFragrance] = useState("Fresh");
  const [editDescription, setEditDescription] = useState("");
  const [editDetails, setEditDetails] = useState([""]);
  const [editImage, setEditImage] = useState("");
  const [editOnSale, setEditOnSale] = useState(false);
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editSaleStart, setEditSaleStart] = useState("");
  const [editSaleEnd, setEditSaleEnd] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const openEdit = (product) => {
    setEditId(product.id);
    setEditName(product.name || "");
    setEditCategory(product.category || "Soaps");
    setEditPrice(String(product.price ?? ""));
    setEditStock(String(product.stock ?? ""));
    setEditVolume(product.volume || "");
    setEditLabel(product.label || "");
    setEditTexture(product.texture || "Cream");
    setEditFragrance(product.fragranceProfile || "Fresh");
    setEditDescription(product.description || "");
    setEditDetails(Array.isArray(product.details) && product.details.length ? product.details : [""]);
    setEditImage(product.image || "");
    setEditOnSale(Boolean(product.onSale));
    setEditSalePrice(product.salePrice != null ? String(product.salePrice) : "");
    setEditSaleStart(product.saleStart ? toLocalInputValue(product.saleStart) : "");
    setEditSaleEnd(product.saleEnd ? toLocalInputValue(product.saleEnd) : "");
    setEditingProduct(product);
    setShowEditModal(true);
  };
  const toLocalInputValue = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const handleEditDetailChange = (index, value) => {
    const updated = [...editDetails];
    updated[index] = value;
    setEditDetails(updated);
  };
  const handleEditAddDetail = () => setEditDetails([...editDetails, ""]);
  const handleEditRemoveDetail = (index) => setEditDetails(editDetails.filter((_, i) => i !== index));
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    if (editOnSale && (!editSalePrice || parseFloat(editSalePrice) <= 0)) {
      if (showToast) showToast("Enter a sale price when marking a product on sale.", "info");
      return;
    }
    const filteredDetails = editDetails.filter((d) => d.trim() !== "");
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/products/${encodeURIComponent(editId)}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          price: parseFloat(editPrice) || 0,
          stock: parseInt(editStock) || 0,
          volume: editVolume,
          label: editLabel || null,
          texture: editTexture,
          fragranceProfile: editFragrance,
          description: editDescription,
          details: filteredDetails,
          image: editImage || "/src/assets/images/Anti-Fungal Soap.png",
          onSale: editOnSale,
          salePrice: editOnSale ? parseFloat(editSalePrice) : null,
          saleStart: editOnSale ? editSaleStart || null : null,
          saleEnd: editOnSale ? editSaleEnd || null : null
        })
      });
      if (!res.ok) throw new Error("Failed to update product");
      if (showToast) showToast(`Updated ${editName}`, "success");
      setEditingProduct(null);
      setShowEditModal(false);
      reloadData();
    } catch (err) {
      if (showToast) showToast("Could not update product", "info");
    }
  };
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Failed to delete product");
      if (showToast) showToast(`Deleted ${product.name}`, "success");
      reloadData();
    } catch (err) {
      if (showToast) showToast("Could not delete product", "info");
    }
  };
  const stats = useMemo(() => {
    const totalInventoryCount = products.reduce((sum, p) => sum + (p.stock !== void 0 ? p.stock : 20), 0);
    const lowStockCount = products.filter((p) => (p.stock !== void 0 ? p.stock : 20) < 15).length;
    const totalSalesRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    return {
      totalInventoryCount,
      lowStockCount: reports?.lowStockCount ?? lowStockCount,
      totalSalesRevenue: reports?.totalRevenue ?? totalSalesRevenue,
      productTypesCount: products.length,
      categoriesCount: categories.length,
      ordersCount: reports?.ordersCount ?? orders.length,
      averageOrderValue: reports?.averageOrderValue ?? (orders.length ? totalSalesRevenue / orders.length : 0),
      statusBreakdown: reports?.statusBreakdown ?? {}
    };
  }, [products, categories, orders, reports]);
  return /* @__PURE__ */ jsx("div", { className: "bg-[#f5f4f0] text-[#19221f] min-h-screen pt-28 pb-20 selection:bg-[#7a493b]/20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-6 md:px-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#19221f]/5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("nav", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold select-none", children: [
          "Control Panel ",
          /* @__PURE__ */ jsx("span", { className: "mx-2", children: "\u2192" }),
          " Lab Studio Admin"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "font-syne text-3xl md:text-4xl font-bold tracking-tight text-[#19221f]", children: "Biotech Sciences Laboratory" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onClose,
          className: "inline-flex items-center space-x-2 bg-white hover:bg-[#19221f] hover:text-[#f3f6ed] text-[#19221f] py-3 px-6 rounded-full border border-[#19221f]/15 text-xs font-display font-semibold uppercase tracking-wider transition-all shadow-sm",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Return to Store" })
          ]
        }
      )
    ] }),
    loadError && jsx("div", { className: "mt-6 bg-amber-50 text-amber-800 text-xs p-4 rounded-xl border border-amber-100", children: loadError }),
    isLoading && jsx("div", { className: "mt-4 text-xs text-[#19221f]/50 font-mono", children: "Syncing dashboard data..." }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700", children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-[#19221f]/50 uppercase tracking-widest font-bold", children: "Total Sales Revenue" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-syne font-extrabold text-[#19221f] mt-0.5", children: [
            "₨",
            stats.totalSalesRevenue.toFixed(2)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-[#19221f]/50 uppercase tracking-widest font-bold", children: "Active Orders" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-syne font-extrabold text-[#19221f] mt-0.5", children: [
            stats.ordersCount,
            " completed"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700", children: /* @__PURE__ */ jsx(Package, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-[#19221f]/50 uppercase tracking-widest font-bold", children: "Active Stock units" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-syne font-extrabold text-[#19221f] mt-0.5", children: [
            stats.totalInventoryCount,
            " items"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-[#19221f]/50 uppercase tracking-widest font-bold", children: "Low stock alerts" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-syne font-extrabold text-[#19221f] mt-0.5", children: [
            stats.lowStockCount,
            " items < 15"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex border-b border-[#19221f]/10 mt-12 overflow-x-auto no-scrollbar gap-6", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("inventory"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "inventory" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(Package, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Stock & Inventory" }),
            activeTab === "inventory" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("addProduct"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "addProduct" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(PlusCircle, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Add New Product" }),
            activeTab === "addProduct" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("categories"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "categories" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(Layers, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Categories" }),
            activeTab === "categories" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("reports"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "reports" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Reports" }),
            activeTab === "reports" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("users"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "users" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "User Registry" }),
            activeTab === "users" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("todayOrders"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "todayOrders" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Today's Orders" }),
            activeTab === "todayOrders" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("orders"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "orders" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(ShoppingBag, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Orders Ledger" }),
            activeTab === "orders" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("queries"),
          className: `pb-4 text-xs font-mono font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === "queries" ? "text-[#7a493b] font-extrabold" : "text-[#19221f]/55 hover:text-[#19221f]"}`,
          children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Queries" }),
            activeTab === "queries" && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7a493b] rounded-full" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
      activeTab === "inventory" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Stock Inventory Catalog" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: reloadData,
              className: "p-2 bg-white border border-[#19221f]/10 rounded-full hover:bg-neutral-100 text-[#19221f]/70 hover:text-[#19221f] transition-all flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-bold shadow-xs",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Refresh" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 overflow-hidden shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#f3f6ed] border-b border-[#19221f]/5 text-[9px] font-mono uppercase tracking-widest text-[#19221f]/60 font-bold", children: [
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Product Details" }),
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Category" }),
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Price" }),
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Stock Status" }),
              /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Texture / Fragrance" }),
              /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6 text-right", children: "Actions" })
            ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#19221f]/5 text-xs font-display", children: products.map((p) => {
            const stockVal = p.stock !== void 0 ? p.stock : 20;
            const isLow = stockVal < 15;
            const isOut = stockVal === 0;
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f3f6ed]/25 transition-colors", children: [
              /* @__PURE__ */ jsxs("td", { className: "py-4.5 px-6 flex items-center space-x-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-[#19221f]/5", children: /* @__PURE__ */ jsx("img", { src: p.image, alt: p.name, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-syne font-bold text-[#19221f]", children: p.name }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-[#19221f]/40 font-bold uppercase tracking-wider", children: p.volume })
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-4.5 px-6 font-mono text-[10px] uppercase tracking-wider text-[#19221f]/70 font-semibold", children: p.category }),
              /* @__PURE__ */ jsxs("td", { className: "py-4.5 px-6 font-syne font-bold text-[#19221f]", children: [
                "₨",
                p.price.toFixed(2),
                isSaleActive(p) && /* @__PURE__ */ jsx("span", { className: "ml-2 align-middle text-[8px] font-mono font-extrabold uppercase tracking-widest bg-red-500 text-white px-2 py-0.5 rounded-full", children: "Sale" })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-4.5 px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsx("span", { className: `w-2.5 h-2.5 rounded-full ${isOut ? "bg-red-500" : isLow ? "bg-amber-400 animate-pulse" : "bg-green-500"}` }),
                /* @__PURE__ */ jsx("span", { className: `font-mono text-[10px] uppercase tracking-wider font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-700" : "text-green-700"}`, children: isOut ? "Out of Stock" : isLow ? `${stockVal} units (Low)` : `${stockVal} units (Good)` })
              ] }) }),
              /* @__PURE__ */ jsxs("td", { className: "py-4.5 px-6 text-[#19221f]/60 font-mono text-[10px]", children: [
                p.texture || "Cream",
                " / ",
                p.fragranceProfile || "Fresh"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-4.5 px-6 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => openEdit(p),
                    title: "Edit product",
                    className: "p-2 bg-[#19221f]/5 hover:bg-[#7a493b] hover:text-white text-[#19221f] rounded-lg transition-all",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDeleteProduct(p),
                    title: "Delete product",
                    className: "p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg transition-all",
                    children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ] }, p.id);
          }) })
        ] }) }) })
      ] }),
      activeTab === "addProduct" && /* @__PURE__ */ jsx("div", { className: "bg-white p-8 md:p-10 rounded-3xl border border-[#19221f]/5 shadow-sm", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleAddProductSubmit, className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Publish Formulation" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/60 font-display mt-0.5", children: "Introduce a new product line into the dynamic skincare catalog." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Product Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: newProdName,
                onChange: (e) => setNewProdName(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]",
                placeholder: "e.g., Hydrating Enzyme Gel Cleanser"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Category Line" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: newProdCategory,
                onChange: (e) => setNewProdCategory(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-mono uppercase tracking-wider font-bold text-[#19221f]",
                children: categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.name, children: cat.name }, cat.name))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Price ($ USD)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                required: true,
                value: newProdPrice,
                onChange: (e) => setNewProdPrice(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]",
                placeholder: "e.g., 35.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Initial Inventory Stock units" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                required: true,
                value: newProdStock,
                onChange: (e) => setNewProdStock(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]",
                placeholder: "e.g., 25"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Volume / Quantity label" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: newProdVolume,
                onChange: (e) => setNewProdVolume(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]",
                placeholder: "e.g., 50 ml / 1.7 fl. oz"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Badge Overlay Label (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: newProdLabel,
                onChange: (e) => setNewProdLabel(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]",
                placeholder: "e.g., NEW, BESTSELLER"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Texture Formulation" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: newProdTexture,
                onChange: (e) => setNewProdTexture(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-mono uppercase tracking-wider font-bold text-[#19221f]",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "Gel", children: "Gel" }),
                  /* @__PURE__ */ jsx("option", { value: "Cream", children: "Cream" }),
                  /* @__PURE__ */ jsx("option", { value: "Oil", children: "Oil" }),
                  /* @__PURE__ */ jsx("option", { value: "Salt / Scrub", children: "Salt / Scrub" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Fragrance Profile" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: newProdFragrance,
                onChange: (e) => setNewProdFragrance(e.target.value),
                className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-mono uppercase tracking-wider font-bold text-[#19221f]",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "Fresh", children: "Fresh" }),
                  /* @__PURE__ */ jsx("option", { value: "Woody", children: "Woody" }),
                  /* @__PURE__ */ jsx("option", { value: "Floral", children: "Floral" }),
                  /* @__PURE__ */ jsx("option", { value: "Citrus", children: "Citrus" }),
                  /* @__PURE__ */ jsx("option", { value: "Herbal", children: "Herbal" }),
                  /* @__PURE__ */ jsx("option", { value: "Sweet / Gourmand", children: "Sweet / Gourmand" }),
                  /* @__PURE__ */ jsx("option", { value: "Fragrance-Free", children: "Fragrance-Free" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Product Image" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-[#19221f]/5 flex-shrink-0 flex items-center justify-center", children: newProdImage ? /* @__PURE__ */ jsx("img", { src: newProdImage, alt: "Selected", className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) : /* @__PURE__ */ jsx(ImageIcon, { className: "w-6 h-6 text-[#19221f]/30" }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => openImagePicker("add"),
                  className: "inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#7a493b] border border-[#7a493b]/20 hover:border-[#7a493b] bg-[#7a493b]/5 hover:bg-[#7a493b]/10 rounded-full px-4 py-2.5 transition-all",
                  children: [
                    /* @__PURE__ */ jsx(ImageIcon, { className: "w-3.5 h-3.5" }),
                    "Select from Media"
                  ]
                }
              ),
              newProdImage && /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setNewProdImage(""),
                  className: "block text-[10px] font-mono text-[#19221f]/50 underline",
                  children: "Clear selection"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[#19221f]/40 font-display", children: newProdImage || "No image selected — a default will be used." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Formulation Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              required: true,
              rows: 3,
              value: newProdDescription,
              onChange: (e) => setNewProdDescription(e.target.value),
              className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f] resize-none",
              placeholder: "Enter full narrative describing the active ingredients, benefits, and results..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Key scientific specifications (Bullet points)" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: handleAddDetailField,
                className: "text-[9px] font-mono font-bold uppercase tracking-widest text-[#7a493b] flex items-center gap-1.5 py-1 px-3 border border-[#7a493b]/20 hover:border-[#7a493b] bg-[#7a493b]/5 hover:bg-[#7a493b]/10 rounded-full transition-all",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                  "Add bullet"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: newProdDetails.map((detail, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: detail,
                onChange: (e) => handleDetailChange(index, e.target.value),
                className: "flex-grow bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]",
                placeholder: `Bullet spec #${index + 1} (e.g. Ceramide-infused micro-hydration)`
              }
            ),
            newProdDetails.length > 1 && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleRemoveDetailField(index),
                className: "p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100/50",
                children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" })
              }
            )
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-[#19221f]/10 pt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "On Sale" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#19221f]/55 font-display mt-0.5", children: "Mark this product as discounted. You will be asked for the sale price and schedule." })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setNewProdOnSale((v) => !v),
                className: `relative w-12 h-6 rounded-full transition-colors ${newProdOnSale ? "bg-[#7a493b]" : "bg-[#19221f]/15"}`,
                children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${newProdOnSale ? "translate-x-6" : ""}` })
              }
            )
          ] }),
          newProdOnSale && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Sale Price ($ USD)" }),
              /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", required: true, value: newProdSalePrice, onChange: (e) => setNewProdSalePrice(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]", placeholder: "e.g., 19.99" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Sale Starts (optional)" }),
              /* @__PURE__ */ jsx("input", { type: "datetime-local", value: newProdSaleStart, onChange: (e) => setNewProdSaleStart(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Sale Ends (optional)" }),
              /* @__PURE__ */ jsx("input", { type: "datetime-local", value: newProdSaleEnd, onChange: (e) => setNewProdSaleEnd(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "w-full bg-[#19221f] text-[#f3f6ed] text-[10px] font-mono font-bold uppercase tracking-widest py-4 rounded-full hover:bg-[#7a493b] transition-all duration-300 shadow-md",
            children: "Publish Formulation Line"
          }
        ) })
      ] }) }),
      activeTab === "categories" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-10 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1 bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-syne text-base font-bold text-[#19221f]", children: "Add Category" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#19221f]/60 font-display mt-0.5", children: "Establish a new category line within the laboratory database." })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleAddCategorySubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[9px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Category Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: newCatName,
                  onChange: (e) => setNewCatName(e.target.value),
                  className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]",
                  placeholder: "e.g. Body Care, Sun Protection"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                className: "w-full bg-[#19221f] text-[#f3f6ed] text-[10px] font-mono font-bold uppercase tracking-widest py-3.5 rounded-full hover:bg-[#7a493b] transition-all duration-300 shadow-xs",
                children: "Add Category"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Established Categories" }),
          /* @__PURE__ */ jsx("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#f3f6ed] border-b border-[#19221f]/5 text-[9px] font-mono uppercase tracking-widest text-[#19221f]/60 font-bold", children: [
              /* @__PURE__ */ jsx("th", { className: "py-4 px-6", children: "Category Name" }),
              /* @__PURE__ */ jsx("th", { className: "py-4 px-6 text-right", children: "Associated Products" }),
              /* @__PURE__ */ jsx("th", { className: "py-4 px-6 text-right", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#19221f]/5 text-xs font-display", children: categories.map((cat) => {
              const actualProductsCount = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
              return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f3f6ed]/20 transition-colors", children: [
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6 font-syne font-bold text-[#19221f] uppercase tracking-wide", children: cat.name }),
                /* @__PURE__ */ jsxs("td", { className: "py-4 px-6 text-right font-mono text-[10px] text-[#19221f]/60 font-extrabold uppercase", children: [
                  actualProductsCount,
                  " items"
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => openEditCategory(cat),
                      title: "Edit category",
                      className: "p-2 bg-[#19221f]/5 hover:bg-[#7a493b] hover:text-white text-[#19221f] rounded-lg transition-all",
                      children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleDeleteCategory(cat),
                      title: "Delete category",
                      className: "p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg transition-all",
                      children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" })
                    }
                  )
                ] }) })
              ] }, cat.name);
            }) })
          ] }) })
        ] })
      ] }),
      activeTab === "users" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "User Registry" }),
          /* @__PURE__ */ jsxs("button", { onClick: reloadData, className: "p-2 bg-white border border-[#19221f]/10 rounded-full hover:bg-neutral-100 text-[#19221f]/70 hover:text-[#19221f] transition-all flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-bold shadow-xs", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsx("span", { children: "Refresh" })
          ] })
        ] }),
        users.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 py-20 text-center space-y-3", children: [
          /* @__PURE__ */ jsx(Users, { className: "w-10 h-10 mx-auto text-[#19221f]/20" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50 font-display font-medium", children: "No users registered yet." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 overflow-hidden shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#f3f6ed] border-b border-[#19221f]/5 text-[9px] font-mono uppercase tracking-widest text-[#19221f]/60 font-bold", children: [
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "User" }),
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Email" }),
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Role" }),
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6", children: "Joined" }),
            /* @__PURE__ */ jsx("th", { className: "py-4.5 px-6 text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#19221f]/5 text-xs font-display", children: users.map((u) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f3f6ed]/25 transition-colors", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-4.5 px-6", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3", children: /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[10px] font-mono font-bold text-[#19221f]/70 uppercase", children: (u.displayName || u.email || "U").charAt(0) }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-syne font-bold text-[#19221f] text-xs", children: u.displayName || "User" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-[#19221f]/40 font-bold", children: u.id })
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-4.5 px-6 font-mono text-[10px] text-[#19221f]/70", children: u.email }),
            /* @__PURE__ */ jsx("td", { className: "py-4.5 px-6", children: /* @__PURE__ */ jsxs("span", { className: `px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`, children: [
              u.role || "user",
              " "
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: "py-4.5 px-6 font-mono text-[10px] text-[#19221f]/60", children: [
              new Date(u.createdAt).toLocaleDateString(),
              " ",
              new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-4.5 px-6 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => handleViewUserHistory(u), className: "text-[10px] font-mono uppercase font-bold text-[#7a493b] hover:underline", children: "Purchase History" }),
              u.role !== "admin" && /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteUser(u), title: "Delete user", className: "p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg transition-all", children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" }) })
            ] }) })
          ] }, u.id)) })
        ] }) }) })
      ] }),
      activeTab === "orders" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Transaction History Ledger" }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleEmailSearch, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#19221f]/40" }),
              /* @__PURE__ */ jsx("input", {
                type: "email",
                value: emailFilter,
                onChange: (e) => setEmailFilter(e.target.value),
                placeholder: "Filter by customer email",
                className: "pl-9 pr-3 py-2 text-xs rounded-full border border-[#19221f]/10 bg-white font-display w-56"
              })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "text-[10px] font-mono uppercase font-bold bg-[#19221f] text-white px-4 py-2 rounded-full", children: "Search" }),
            emailFilter && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => { setEmailFilter(""); fetchAdminData(""); }, className: "text-[10px] font-mono text-[#7a493b] underline", children: "Clear" })
          ] })
        ] }),
        orders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 py-20 text-center space-y-3", children: [
          /* @__PURE__ */ jsx(ShoppingBag, { className: "w-10 h-10 mx-auto text-[#19221f]/20" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50 font-display font-medium", children: "No customer orders recorded in local ledger." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: orders.map((order) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-white rounded-3xl border border-[#19221f]/5 overflow-hidden shadow-sm p-6 space-y-4",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#19221f]/5", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-bold text-[#7a493b]", children: order.id }),
                    /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#19221f]/30" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-[#19221f]/60 uppercase tracking-wider font-bold", children: new Date(order.timestamp).toLocaleString() })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-[11px] font-display text-[#19221f]", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold", children: order.displayName }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[#19221f]/40 font-normal", children: [
                      "(",
                      order.userEmail,
                      ")"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsxs("select", {
                  value: order.status,
                  disabled: statusUpdating === order.id,
                  onChange: (e) => handleOrderStatusChange(order.id, e.target.value),
                  className: `text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${order.status === "Delivered" ? "bg-green-100 text-green-700 border-green-200" : order.status === "Shipped" ? "bg-blue-100 text-blue-700 border-blue-200" : order.status === "Cancelled" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}`,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "Pending", children: "Pending" }),
                    /* @__PURE__ */ jsx("option", { value: "Processing", children: "Processing" }),
                    /* @__PURE__ */ jsx("option", { value: "Shipped", children: "Shipped" }),
                    /* @__PURE__ */ jsx("option", { value: "Delivered", children: "Delivered" }),
                    /* @__PURE__ */ jsx("option", { value: "Cancelled", children: "Cancelled" })
                  ]
                }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "divide-y divide-[#19221f]/5", children: order.items.map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "py-3 flex items-center justify-between text-xs font-display", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-10 rounded overflow-hidden bg-neutral-100 border border-[#19221f]/5 flex-shrink-0", children: /* @__PURE__ */ jsx("img", { src: item.image, alt: item.name, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h5", { className: "font-syne font-bold text-[#19221f]", children: item.name }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-[#19221f]/40 font-bold", children: [
                      "₨",
                      item.price.toFixed(2),
                      " each"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "font-mono text-[11px] font-bold text-[#19221f]", children: [
                  "QTY: ",
                  item.quantity,
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-[#19221f]/35 mx-1.5", children: "|" }),
                  " Total: ₨",
                  (item.price * item.quantity).toFixed(2)
                ] })
              ] }, idx)) }),
              /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-[#19221f]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-mono text-[#19221f]/50 uppercase tracking-widest font-bold", children: [
                  "Subtotal: ₨",
                  order.subtotal.toFixed(2),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "mx-2", children: "|" }),
                  " Shipping: ₨",
                  order.shipping.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "font-syne text-sm font-extrabold text-[#19221f] self-end sm:self-auto", children: [
                  "TRANSACTION TOTAL: ",
                  /* @__PURE__ */ jsxs("span", { className: "text-[#7a493b] font-extrabold", children: [
                    "₨",
                    order.total.toFixed(2)
                  ] })
                ] })
              ] })
            ]
          },
          order.id
        )) })
      ] }),
      activeTab === "reports" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Sales & Inventory Summary" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm space-y-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-syne font-bold text-sm", children: "Revenue Overview" }),
            /* @__PURE__ */ jsxs("p", { className: "text-2xl font-syne font-extrabold text-[#7a493b]", children: ["₨", stats.totalSalesRevenue.toFixed(2)] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#19221f]/60", children: ["Average order: ₨", stats.averageOrderValue.toFixed(2)] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#19221f]/60", children: [stats.ordersCount, " total orders"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm space-y-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-syne font-bold text-sm", children: "Order Status Breakdown" }),
            Object.keys(stats.statusBreakdown).length === 0
              ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50", children: "No orders yet." })
              : Object.entries(stats.statusBreakdown).map(([status, count]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-mono", children: [
                  /* @__PURE__ */ jsx("span", { children: status }),
                  /* @__PURE__ */ jsx("span", { className: "font-bold", children: count })
                ] }, status))
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl border border-[#19221f]/5 shadow-sm md:col-span-2 space-y-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-syne font-bold text-sm flex items-center gap-2", children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 text-amber-600" }), " Low Stock Alerts (< 15 units)"] }),
            (reports?.lowStockItems || products.filter((p) => p.stock < 15)).length === 0
              ? /* @__PURE__ */ jsx("p", { className: "text-xs text-green-700", children: "All products are adequately stocked." })
              : (reports?.lowStockItems || products.filter((p) => p.stock < 15)).map((p) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs border-b border-[#19221f]/5 pb-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-syne font-bold", children: p.name }),
                  /* @__PURE__ */ jsxs("span", { className: "text-amber-700 font-mono font-bold", children: [p.stock, " units left"] })
                ] }, p.id))
          ] })
        ] })
      ] }),
      activeTab === "todayOrders" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Orders of the Day" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50 font-display mt-0.5", children: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: fetchTodayOrders, className: "p-2 bg-white border border-[#19221f]/10 rounded-full hover:bg-neutral-100 text-[#19221f]/70 hover:text-[#19221f] transition-all flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-bold shadow-xs", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsx("span", { children: "Refresh" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#19221f]/5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Date" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: orderFilterDate, onChange: (e) => setOrderFilterDate(e.target.value), className: "bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-full px-3 py-2 text-xs font-display text-[#19221f]" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Month" }),
            /* @__PURE__ */ jsx("input", { type: "month", value: orderFilterMonth, onChange: (e) => setOrderFilterMonth(e.target.value), className: "bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-full px-3 py-2 text-xs font-display text-[#19221f]" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: loadOrders, className: "text-[10px] font-mono font-bold uppercase tracking-widest bg-[#19221f] text-white px-4 py-2 rounded-full hover:bg-[#7a493b] transition-all", children: "Apply Filter" }),
          (orderFilterDate || orderFilterMonth) && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => { setOrderFilterDate(""); setOrderFilterMonth(""); fetchTodayOrders(); }, className: "text-[10px] font-mono font-bold uppercase tracking-widest text-[#7a493b] underline", children: "Clear / Today" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => downloadOrdersCSV(todayOrders), className: "ml-auto inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-[#7a493b] text-white px-4 py-2 rounded-full hover:bg-[#5e3a3f] transition-all", children: [
            /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
            "Download CSV"
          ] })
        ] }),
        todayOrders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 py-20 text-center space-y-3", children: [
          /* @__PURE__ */ jsx(ShoppingBag, { className: "w-10 h-10 mx-auto text-[#19221f]/20" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50 font-display font-medium", children: "No orders placed today." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: todayOrders.map((order) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-white rounded-3xl border border-[#19221f]/5 overflow-hidden shadow-sm p-6 space-y-4",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#19221f]/5", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-bold text-[#7a493b]", children: order.id }),
                    /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#19221f]/30" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-[#19221f]/60 uppercase tracking-wider font-bold", children: new Date(order.timestamp).toLocaleTimeString() })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-[11px] font-display text-[#19221f]", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold", children: order.displayName }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[#19221f]/40 font-normal", children: [
                      "(",
                      order.userEmail,
                      ")"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsxs("select", {
                  value: order.status,
                  disabled: statusUpdating === order.id,
                  onChange: (e) => handleOrderStatusChange(order.id, e.target.value),
                  className: `text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${order.status === "Delivered" ? "bg-green-100 text-green-700 border-green-200" : order.status === "Shipped" ? "bg-blue-100 text-blue-700 border-blue-200" : order.status === "Cancelled" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}`,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "Pending", children: "Pending" }),
                    /* @__PURE__ */ jsx("option", { value: "Processing", children: "Processing" }),
                    /* @__PURE__ */ jsx("option", { value: "Shipped", children: "Shipped" }),
                    /* @__PURE__ */ jsx("option", { value: "Delivered", children: "Delivered" }),
                    /* @__PURE__ */ jsx("option", { value: "Cancelled", children: "Cancelled" })
                  ]
                }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "divide-y divide-[#19221f]/5", children: order.items.map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "py-3 flex items-center justify-between text-xs font-display", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-10 rounded overflow-hidden bg-neutral-100 border border-[#19221f]/5 flex-shrink-0", children: /* @__PURE__ */ jsx("img", { src: item.image, alt: item.name, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h5", { className: "font-syne font-bold text-[#19221f]", children: item.name }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-[#19221f]/40 font-bold", children: [
                      "₨",
                      item.price.toFixed(2),
                      " each"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "font-mono text-[11px] font-bold text-[#19221f]", children: [
                  "QTY: ",
                  item.quantity,
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-[#19221f]/35 mx-1.5", children: "|" }),
                  " Total: ₨",
                  (item.price * item.quantity).toFixed(2)
                ] })
              ] }, idx)) }),
              /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-[#19221f]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-mono text-[#19221f]/50 uppercase tracking-widest font-bold", children: [
                  "Subtotal: ₨",
                  order.subtotal.toFixed(2),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "mx-2", children: "|" }),
                  " Shipping: ₨",
                  order.shipping.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "font-syne text-sm font-extrabold text-[#19221f] self-end sm:self-auto", children: [
                  "TRANSACTION TOTAL: ",
                  /* @__PURE__ */ jsxs("span", { className: "text-[#7a493b] font-extrabold", children: [
                    "₨",
                    order.total.toFixed(2)
                  ] })
                ] })
              ] })
            ]
          },
          order.id
        )) })
      ] }),
      activeTab === "queries" && /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(ContactQueries, { messages, loading: messagesLoading, onToggle: handleToggleMessage, onRefresh: fetchMessages }) }),
      showEditModal && editingProduct && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4", onClick: () => { setShowEditModal(false); setEditingProduct(null); }, children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 shadow-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[#19221f]/5 flex items-center justify-between sticky top-0 bg-white z-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Edit Product" }),
            /* @__PURE__ */ jsx("button", { onClick: () => { setShowEditModal(false); setEditingProduct(null); }, className: "p-2 hover:bg-[#19221f]/5 rounded-full transition-colors", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 stroke-[1.5]" }) })
          ] }),
          /* @__PURE__ */ jsx("form", { onSubmit: handleEditSubmit, className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Product Name" }),
                /* @__PURE__ */ jsx("input", { type: "text", required: true, value: editName, onChange: (e) => setEditName(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Category Line" }),
                /* @__PURE__ */ jsx("select", { value: editCategory, onChange: (e) => setEditCategory(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-mono uppercase tracking-wider font-bold text-[#19221f]", children: categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.name, children: cat.name }, cat.name)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Price ($ USD)" }),
                /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", required: true, value: editPrice, onChange: (e) => setEditPrice(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Stock units" }),
                /* @__PURE__ */ jsx("input", { type: "number", required: true, value: editStock, onChange: (e) => setEditStock(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Volume / Quantity label" }),
                /* @__PURE__ */ jsx("input", { type: "text", required: true, value: editVolume, onChange: (e) => setEditVolume(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Badge Overlay Label (Optional)" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: editLabel, onChange: (e) => setEditLabel(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Texture Formulation" }),
                /* @__PURE__ */ jsxs("select", { value: editTexture, onChange: (e) => setEditTexture(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-mono uppercase tracking-wider font-bold text-[#19221f]", children: [
                  /* @__PURE__ */ jsx("option", { value: "Gel", children: "Gel" }),
                  /* @__PURE__ */ jsx("option", { value: "Cream", children: "Cream" }),
                  /* @__PURE__ */ jsx("option", { value: "Oil", children: "Oil" }),
                  /* @__PURE__ */ jsx("option", { value: "Salt / Scrub", children: "Salt / Scrub" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Fragrance Profile" }),
                /* @__PURE__ */ jsxs("select", { value: editFragrance, onChange: (e) => setEditFragrance(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-mono uppercase tracking-wider font-bold text-[#19221f]", children: [
                  /* @__PURE__ */ jsx("option", { value: "Fresh", children: "Fresh" }),
                  /* @__PURE__ */ jsx("option", { value: "Woody", children: "Woody" }),
                  /* @__PURE__ */ jsx("option", { value: "Floral", children: "Floral" }),
                  /* @__PURE__ */ jsx("option", { value: "Citrus", children: "Citrus" }),
                  /* @__PURE__ */ jsx("option", { value: "Herbal", children: "Herbal" }),
                  /* @__PURE__ */ jsx("option", { value: "Sweet / Gourmand", children: "Sweet / Gourmand" }),
                  /* @__PURE__ */ jsx("option", { value: "Fragrance-Free", children: "Fragrance-Free" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Product Image" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-[#19221f]/5 flex-shrink-0 flex items-center justify-center", children: editImage ? /* @__PURE__ */ jsx("img", { src: editImage, alt: "Selected", className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) : /* @__PURE__ */ jsx(ImageIcon, { className: "w-6 h-6 text-[#19221f]/30" }) }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => openImagePicker("edit"),
                      className: "inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#7a493b] border border-[#7a493b]/20 hover:border-[#7a493b] bg-[#7a493b]/5 hover:bg-[#7a493b]/10 rounded-full px-4 py-2.5 transition-all",
                      children: [
                        /* @__PURE__ */ jsx(ImageIcon, { className: "w-3.5 h-3.5" }),
                        "Select from Media"
                      ]
                    }
                  ),
                  editImage && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setEditImage(""),
                      className: "block text-[10px] font-mono text-[#19221f]/50 underline",
                      children: "Clear selection"
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[#19221f]/40 font-display", children: editImage || "No image selected." })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Formulation Description" }),
              /* @__PURE__ */ jsx("textarea", { required: true, rows: 3, value: editDescription, onChange: (e) => setEditDescription(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f] resize-none" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Key scientific specifications (Bullet points)" }),
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleEditAddDetail, className: "text-[9px] font-mono font-bold uppercase tracking-widest text-[#7a493b] flex items-center gap-1.5 py-1 px-3 border border-[#7a493b]/20 hover:border-[#7a493b] bg-[#7a493b]/5 hover:bg-[#7a493b]/10 rounded-full transition-all", children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                  "Add bullet"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: editDetails.map((detail, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsx("input", { type: "text", required: true, value: detail, onChange: (e) => handleEditDetailChange(index, e.target.value), className: "flex-grow bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]", placeholder: `Bullet spec #${index + 1}` }),
                editDetails.length > 1 && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleEditRemoveDetail(index), className: "p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100/50", children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" }) })
              ] }, index)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-[#19221f]/10 pt-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "On Sale" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#19221f]/55 font-display mt-0.5", children: "Toggle to put this product on sale and set the discounted price." })
                ] }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEditOnSale((v) => !v), className: `relative w-12 h-6 rounded-full transition-colors ${editOnSale ? "bg-[#7a493b]" : "bg-[#19221f]/15"}`, children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${editOnSale ? "translate-x-6" : ""}` }) })
              ] }),
              editOnSale && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Sale Price ($ USD)" }),
                  /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", required: true, value: editSalePrice, onChange: (e) => setEditSalePrice(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]", placeholder: "e.g., 19.99" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Sale Starts (optional)" }),
                  /* @__PURE__ */ jsx("input", { type: "datetime-local", value: editSaleStart, onChange: (e) => setEditSaleStart(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Sale Ends (optional)" }),
                  /* @__PURE__ */ jsx("input", { type: "datetime-local", value: editSaleEnd, onChange: (e) => setEditSaleEnd(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("button", { type: "submit", className: "flex-grow bg-[#19221f] text-[#f3f6ed] text-[10px] font-mono font-bold uppercase tracking-widest py-4 rounded-full hover:bg-[#7a493b] transition-all duration-300 shadow-md", children: "Save Changes" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => { setShowEditModal(false); setEditingProduct(null); }, className: "px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-[#19221f]/15 text-[#19221f]/70 hover:bg-[#19221f]/5 transition-all", children: "Cancel" })
            ] })
          ] })
        ] })
      ] }),
      showCategoryModal && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4", onClick: () => { setShowCategoryModal(false); setEditingCategory(null); }, children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 shadow-2xl max-w-md w-full", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[#19221f]/5 flex items-center justify-between sticky top-0 bg-white z-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Edit Category" }),
            /* @__PURE__ */ jsx("button", { onClick: () => { setShowCategoryModal(false); setEditingCategory(null); }, className: "p-2 hover:bg-[#19221f]/5 rounded-full transition-colors", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 stroke-[1.5]" }) })
          ] }),
          /* @__PURE__ */ jsx("form", { onSubmit: handleEditCategorySubmit, className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Category Name" }),
              /* @__PURE__ */ jsx("input", { type: "text", required: true, value: editCatName, onChange: (e) => setEditCatName(e.target.value), className: "w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("button", { type: "submit", className: "flex-grow bg-[#19221f] text-[#f3f6ed] text-[10px] font-mono font-bold uppercase tracking-widest py-4 rounded-full hover:bg-[#7a493b] transition-all duration-300 shadow-md", children: "Save Changes" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => { setShowCategoryModal(false); setEditingCategory(null); }, className: "px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-[#19221f]/15 text-[#19221f]/70 hover:bg-[#19221f]/5 transition-all", children: "Cancel" })
            ] })
          ] })
        ] })
      ] }),
      showImagePicker && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4", onClick: () => setShowImagePicker(false), children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[#19221f]/5 flex items-center justify-between sticky top-0 bg-white z-10", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Select Product Image" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#19221f]/60 font-display mt-0.5", children: "Choose an image from the media library for this product." })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setShowImagePicker(false), className: "p-2 hover:bg-[#19221f]/5 rounded-full transition-colors", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 stroke-[1.5]" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: mediaLoading ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50 font-display", children: "Loading images..." }) : mediaImages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 space-y-2", children: [
            /* @__PURE__ */ jsx(ImageIcon, { className: "w-8 h-8 mx-auto text-[#19221f]/20" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50 font-display", children: "No images found. Add product images to src/assets/images (or the media folder) to use them here." })
          ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: mediaImages.map((img) => /* @__PURE__ */ jsx("button", { type: "button", key: img.name, onClick: () => handleSelectMediaImage(img.url), className: "group relative aspect-square rounded-xl overflow-hidden border border-[#19221f]/10 hover:border-[#7a493b] hover:ring-2 hover:ring-[#7a493b]/30 transition-all bg-neutral-100", children: /* @__PURE__ */ jsx("img", { src: img.url, alt: img.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", referrerPolicy: "no-referrer" }) }, img.name)) }) })
        ] })
      ] }),
      showUserModal && selectedUser && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4", onClick: () => setShowUserModal(false), children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-[#19221f]/5 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[#19221f]/5 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: selectedUser.displayName }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/60 font-display", children: selectedUser.email })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setShowUserModal(false), className: "p-2 hover:bg-[#19221f]/5 rounded-full transition-colors", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 stroke-[1.5]" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            userOrders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 space-y-3", children: [
              /* @__PURE__ */ jsx(ShoppingBag, { className: "w-8 h-8 mx-auto text-[#19221f]/20" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/50 font-display font-medium", children: "No orders found for this user." })
            ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: userOrders.map((order) => /* @__PURE__ */ jsxs("div", { className: "border border-[#19221f]/5 rounded-2xl p-4 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-bold text-[#7a493b]", children: order.id }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-[#19221f]/50", children: new Date(order.timestamp).toLocaleString() })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: `px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold ${order.status === "Delivered" ? "bg-green-100 text-green-700" : order.status === "Shipped" ? "bg-blue-100 text-blue-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: [
                  order.status,
                  " "
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: order.items.map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-10 rounded overflow-hidden bg-neutral-100 border border-[#19221f]/5 flex-shrink-0", children: /* @__PURE__ */ jsx("img", { src: item.image, alt: item.name, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
                  /* @__PURE__ */ jsx("span", { className: "font-syne font-bold text-[#19221f]", children: item.name })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono text-[11px] font-bold text-[#19221f]", children: [
                  "x",
                  item.quantity,
                  " · ₨",
                  (item.price * item.quantity).toFixed(2)
                ] })
              ] }, idx)) }),
              /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-[#19221f]/5 flex justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-[#19221f]/50 uppercase tracking-widest font-bold", children: [
                  "Subtotal: $",
                  order.subtotal.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-syne text-sm font-extrabold text-[#7a493b]", children: [
                  "₨",
                  order.total.toFixed(2)
                ] })
              ] })
            ] }, order.id)) })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  AdminDashboard as default
};
