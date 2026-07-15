import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import FirstSection from "./components/FirstSection";
import ScrollTextSection from "./components/ScrollTextSection";
import SecondSection from "./components/SecondSection";
import FourthSection from "./components/FourthSection";
import FifthSection from "./components/FifthSection";
import FAQSection from "./components/FAQSection";
import AboutPage from "./components/AboutPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ReturnPolicy from "./components/ReturnPolicy";
import ProductsPage from "./components/ProductsPage";
import CategoryPage from "./components/CategoryPage.jsx";
import AllProductsPage from "./components/AllProductsPage.jsx";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProductDetailsModal from "./components/ProductDetailsModal";
import { NumaStore } from "./utils/store";
import AuthDrawer from "./components/AuthDrawer";
import AdminDashboard from "./components/AdminDashboard";
import { useAuth } from "./context/AuthContext.jsx";
import { Heart, Check, AlertCircle, X } from "lucide-react";

function App() {
  const { user: currentUser, isAdmin, loading: authLoading, adminJustSignedIn, setAdminJustSignedIn } = useAuth();
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("soaps");
  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);
  useEffect(() => {
    const loadDatabaseData = async () => {
      try {
        await NumaStore.syncFromDatabase();
      } catch (err) {
        console.error("Failed to sync database data on mount:", err);
      }
    };
    loadDatabaseData();
  }, []);
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (adminJustSignedIn) {
      setAdminJustSignedIn(false);
      setIsAdminView(true);
      showToast("Welcome Admin! Redirecting to Admin Dashboard...", "success");
    }
  }, [adminJustSignedIn]);
  const handleAddProductToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        showToast(`Increased quantity of ${product.name} in cart`, "success");
        return prevCart.map(
          (item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      showToast(`Added ${product.name} to cart`, "success");
      return [...prevCart, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };
  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(
      (prevCart) => prevCart.map(
        (item) => item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };
  const handleRemoveItem = (productId) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
    if (item) {
      showToast(`Removed ${item.product.name} from cart`, "info");
    }
  };
  const handleCheckout = () => {
    if (!currentUser) {
      showToast("You must sign in before checking out.", "info");
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    const order = NumaStore.createOrder(cart);
    setIsCartOpen(false);
    setCart([]);
    showToast(`Order logged! Transaction #${order.id} placed at ${new Date(order.timestamp).toLocaleTimeString()}`, "success");
  };
  const handleToggleFavorite = (product) => {
    const isFav = favorites.some((p) => p.id === product.id);
    if (isFav) {
      setFavorites((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Removed ${product.name} from favorites`, "info");
    } else {
      setFavorites((prev) => [...prev, product]);
      showToast(`Added ${product.name} to favorites`, "fav");
    }
  };
  const handleNavigateToProducts = (category) => {
    const targetElement = document.getElementById("products-section");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  const openAdmin = () => {
    if (!isAdmin) {
      showToast("Admin access required.", "info");
      return;
    }
    setIsAdminView(true);
  };

  if (authLoading) {
    return jsx("div", { className: "min-h-screen bg-[#f3f6ed] flex items-center justify-center", children: jsx("p", { className: "text-sm text-[#19221f]/60 font-display", children: "Loading session..." }) });
  }

  return jsx("div", { id: "skincare-root", className: "min-h-screen relative font-sans text-[#19221f] bg-[#f3f6ed]", children: isAdminView && isAdmin ? jsx(
    AdminDashboard,
    {
      onClose: () => setIsAdminView(false),
      showToast
    }
  ) : jsx(AnimatePresence, { mode: "wait", children: isLoading ? jsx(LoadingScreen, { onComplete: () => setIsLoading(false) }, "loader") : jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.8, ease: "easeOut" },
      className: "flex flex-col min-h-screen",
      children: [
        jsx(
          Header,
          {
            cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            onCartClick: () => setIsCartOpen(true),
            onFavoritesClick: () => setIsFavOpen(true),
            onNavigateToProducts: (category) => {
              setCurrentPage("products");
              window.scrollTo(0, 0);
            },
            onNavigateToAllProducts: () => {
              setCurrentPage("all-products");
              window.scrollTo(0, 0);
            },
            onNavigateToCategory: (slug) => {
              setCurrentPage("category");
              setActiveCategory(slug);
              window.scrollTo(0, 0);
            },
            favoritesCount: favorites.length,
            currentPage,
            activeCategory,
            onAboutClick: () => {
              setCurrentPage("about");
              window.scrollTo(0, 0);
            },
            onLogoClick: () => {
              setCurrentPage("home");
              window.scrollTo(0, 0);
            },
            user: currentUser,
            onUserClick: () => setIsAuthOpen(true)
          }
        ),
        jsx("main", { className: "flex-grow", children: jsx(AnimatePresence, { mode: "wait", children: currentPage === "home" ? jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
            children: [
              jsx(
                FirstSection,
                {
                  onShowNowClick: () => setCurrentPage("products"),
                  onNavigateToShop: () => setCurrentPage("all-products"),
                  onOpenProduct: (_e, id) => {
                    const product = NumaStore.getProducts().find((p) => p.id === id);
                    if (product) setSelectedProduct(product);
                  }
                }
              ),
              jsx(ScrollTextSection, {}),
              jsx(
                SecondSection,
                {
                  onLearnMoreClick: () => {
                    setCurrentPage("about");
                    window.scrollTo(0, 0);
                  }
                }
              ),
              jsx(FourthSection, {}),
              jsx(
                FifthSection,
                {
                  onAddProductToCart: handleAddProductToCart,
                  onOpenProductDetails: (product) => setSelectedProduct(product)
                }
              ),
              jsx(FAQSection, {})
            ]
          },
          "home-view"
        ) : currentPage === "all-products" ? jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
            children: jsx(
              AllProductsPage,
              {
                onAddProductToCart: handleAddProductToCart,
                onOpenProductDetails: (product) => setSelectedProduct(product),
                favorites,
                onToggleFavorite: handleToggleFavorite
              }
            )
          },
          "all-products-view"
        ) : currentPage === "category" ? jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
            children: jsx(
              CategoryPage,
              {
                categorySlug: activeCategory,
                onAddProductToCart: handleAddProductToCart,
                onNavigateHome: () => {
                  setCurrentPage("home");
                  window.scrollTo(0, 0);
                },
                showToast,
                favorites,
                onToggleFavorite: handleToggleFavorite,
                onOpenProductDetails: (product) => setSelectedProduct(product)
              }
            )
          },
          "category-view"
        ) : currentPage === "about" ? jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
            children: jsx(AboutPage, {
              onAddProductToCart: handleAddProductToCart,
              onNavigateHome: () => {
                setCurrentPage("home");
                window.scrollTo(0, 0);
              },
              showToast
            })
          },
          "about-view"
        ) : currentPage === "privacy" ? jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
            children: jsx(PrivacyPolicy, {
              onNavigateHome: () => {
                setCurrentPage("home");
                window.scrollTo(0, 0);
              }
            })
          },
          "privacy-view"
        ) : currentPage === "return-policy" ? jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
            children: jsx(ReturnPolicy, {
              onNavigateHome: () => {
                setCurrentPage("home");
                window.scrollTo(0, 0);
              }
            })
          },
          "return-policy-view"
        ) : jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.4 },
            children: jsx(
              ProductsPage,
              {
                onAddProductToCart: handleAddProductToCart,
                onOpenProductDetails: (product) => setSelectedProduct(product),
                favorites,
                onToggleFavorite: handleToggleFavorite
              }
            )
          },
          "products-view"
        ) }) }),
        jsx(Footer, {
          onPrivacyClick: () => {
            setCurrentPage("privacy");
            window.scrollTo(0, 0);
          },
          onReturnPolicyClick: () => {
            setCurrentPage("return-policy");
            window.scrollTo(0, 0);
          }
        }),
        jsx(
          CartDrawer,
          {
            isOpen: isCartOpen,
            onClose: () => setIsCartOpen(false),
            items: cart,
            onUpdateQuantity: handleUpdateQuantity,
            onRemoveItem: handleRemoveItem,
            onCheckout: handleCheckout
          }
        ),
        jsx(
          ProductDetailsModal,
          {
            product: selectedProduct,
            onClose: () => setSelectedProduct(null),
            onAddToCart: handleAddProductToCart,
            cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            onCartClick: () => setIsCartOpen(true),
            favoritesCount: favorites.length,
            onFavoritesClick: () => setIsFavOpen(true),
            onNavigateToProducts: (category) => {
              setSelectedProduct(null);
              setCurrentPage("products");
              window.scrollTo(0, 0);
            },
            onNavigateToAllProducts: () => {
              setSelectedProduct(null);
              setCurrentPage("all-products");
              window.scrollTo(0, 0);
            },
            onNavigateToCategory: (slug) => {
              setSelectedProduct(null);
              setCurrentPage("category");
              setActiveCategory(slug);
              window.scrollTo(0, 0);
            },
            onAboutClick: () => {
              setSelectedProduct(null);
              setCurrentPage("about");
              window.scrollTo(0, 0);
            },
            onLogoClick: () => {
              setSelectedProduct(null);
              setCurrentPage("home");
              window.scrollTo(0, 0);
            },
            currentPage,
            user: currentUser,
            isAdmin,
            onUserClick: () => setIsAuthOpen(true)
          }
        ),
        jsx(AnimatePresence, { children: isFavOpen && jsxs(Fragment, { children: [

          jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 0.4 },
              exit: { opacity: 0 },
              onClick: () => setIsFavOpen(false),
              className: "fixed inset-0 z-50 bg-[#19221f]"
            }
          ),
          jsxs(
            motion.div,
            {
              initial: { x: "100%" },
              animate: { x: 0 },
              exit: { x: "100%" },
              transition: { type: "spring", damping: 30, stiffness: 300 },
              className: "fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-[#f3f6ed] shadow-2xl flex flex-col border-l border-[#19221f]/10",
              children: [
                jsxs("div", { className: "p-6 border-b border-[#19221f]/10 flex items-center justify-between bg-white", children: [
                  jsxs("div", { className: "flex items-center space-x-2", children: [
                    jsx(Heart, { className: "w-5 h-5 stroke-[1.5] fill-[#19221f]" }),
                    jsx("h2", { className: "font-syne text-lg font-bold tracking-tight uppercase", children: "Your Favorites" })
                  ] }),
                  jsx(
                    "button",
                    {
                      onClick: () => setIsFavOpen(false),
                      className: "p-2 hover:bg-[#19221f]/5 rounded-full transition-colors",
                      children: jsx(X, { className: "w-5 h-5 stroke-[1.5]" })
                    }
                  )
                ] }),
                jsx("div", { className: "flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar", children: favorites.length === 0 ? jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center space-y-4", children: [
                  jsx(Heart, { className: "w-10 h-10 text-[#19221f]/30 stroke-[1.5]" }),
                  jsxs("div", { children: [
                    jsx("h3", { className: "font-syne text-base font-bold text-[#19221f]", children: "No favorites yet" }),
                    jsx("p", { className: "text-xs text-[#19221f]/60 max-w-[240px] mt-1", children: "Tap products to discover, read insights, and mark your favorite items here." })
                  ] })
                ] }) : favorites.map((product) => jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-[#19221f]/5", children: [
                  jsxs(
                    "div",
                    {
                      className: "flex items-center space-x-3 cursor-pointer",
                      onClick: () => {
                        setSelectedProduct(product);
                        setIsFavOpen(false);
                      },
                      children: [
                        jsx("div", { className: "w-14 h-16 rounded-lg overflow-hidden bg-neutral-100 border border-[#19221f]/5", children: jsx("img", { src: product.image, alt: product.name, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
                        jsxs("div", { children: [
                          jsx("h4", { className: "font-syne text-xs font-bold text-[#19221f]", children: product.name }),
                          jsxs("span", { className: "font-display text-[10px] font-bold text-[#19221f]/50", children: [
                            "₨",
                            product.price.toFixed(2)
                          ] })
                        ] })
                      ]
                    }
                  ),
                  jsxs("div", { className: "flex items-center space-x-2", children: [
                    jsx(
                      "button",
                      {
                        onClick: () => {
                          handleAddProductToCart(product);
                          setIsFavOpen(false);
                        },
                        className: "bg-[#19221f] text-[#f3f6ed] text-[10px] font-display font-semibold uppercase tracking-wider py-1.5 px-3 rounded-full hover:bg-[#2c3d37] transition-colors",
                        children: "Add"
                      }
                    ),
                    jsx(
                      "button",
                      {
                        onClick: () => handleToggleFavorite(product),
                        className: "text-red-500 hover:text-red-700 text-xs font-display font-medium p-1",
                        children: "Remove"
                      }
                    )
                  ] })
                ] }, product.id)) })
              ]
            }
          )
        ] }) }),
        jsx(AnimatePresence, { children: toast.visible && jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 50, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 20, scale: 0.95 },
            className: "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[#19221f] text-[#f3f6ed] p-4 rounded-2xl flex items-center space-x-3 shadow-2xl border border-white/10 select-none",
            children: [
              jsxs("div", { className: "flex-shrink-0", children: [
                toast.type === "success" && jsx("div", { className: "w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400", children: jsx(Check, { className: "w-4 h-4 stroke-[2.5]" }) }),
                toast.type === "fav" && jsx("div", { className: "w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400", children: jsx(Heart, { className: "w-4 h-4 fill-pink-400 stroke-none" }) }),
                toast.type === "info" && jsx("div", { className: "w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400", children: jsx(AlertCircle, { className: "w-4 h-4 stroke-[2.5]" }) })
              ] }),
              jsx("div", { className: "flex-grow", children: jsx("p", { className: "text-xs font-display font-medium tracking-wide", children: toast.message }) })
            ]
          }
        ) }),
        jsx(
          AuthDrawer,
          {
            isOpen: isAuthOpen,
            onClose: () => setIsAuthOpen(false),
            currentUser,
            onLoginSuccess: (user) => {
              showToast(`Signed in successfully as ${user.displayName}!`, "success");
              NumaStore.syncFromDatabase().catch((err) => {
                console.error("Database sync failed on login:", err);
              });
            },
            onLogoutSuccess: () => {
              setIsAdminView(false);
              showToast("Signed out successfully.", "info");
            },
            onOpenAdmin: openAdmin
          }
        )
      ]
    },
    "content"
  ) }) });
}
export {
  App as default
};