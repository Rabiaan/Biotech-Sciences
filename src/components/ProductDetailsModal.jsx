import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { X, Star, Users, Sparkles, Shield, Heart, Trash2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { NumaStore } from "../utils/store";
import { isSaleActive, getDisplayPrice } from "../lib/sale.js";
import { getAuthHeaders } from "../lib/supabase.js";
import Header from "./Header";
import Footer from "./Footer";
function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  cartCount,
  onCartClick,
  favoritesCount,
  onFavoritesClick,
  onNavigateToProducts,
  onNavigateToAllProducts,
  onNavigateToCategory,
  onAboutClick,
  onLogoClick,
  currentPage,
  user,
  isAdmin,
  onUserClick
}) {
  useEffect(() => {
    if (!product) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [product]);

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!product) return;
    fetch(`/api/products/${product.id}/reviews`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data); })
      .catch(() => {});
  }, [product?.id]);

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const headers = {};
      if (user) {
        const authHeaders = await getAuthHeaders();
        Object.assign(headers, authHeaders);
      } else {
        headers["Content-Type"] = "application/json";
      }
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment, displayName: reviewName || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setReviews((prev) => [data, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      setReviewName("");
      setShowForm(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: await getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(err.message);
    }
  }

  if (!product) return null;
  const companionProduct = NumaStore.getProducts().find((p) => p.id !== product.id) || NumaStore.getProducts()[0];
  return /* @__PURE__ */ jsx(AnimatePresence, { children: /* @__PURE__ */ jsxs(
    "div",
    {
      id: "details-full-overlay",
      className: "fixed inset-0 z-50 flex flex-col bg-[#f3f6ed] text-[#19221f]",
      children: [
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "absolute top-25 left-6 md:left-12 z-50 flex items-center space-x-2 bg-white/80 hover:bg-white text-[#19221f] text-xs font-display tracking-widest uppercase font-bold py-3 px-5 rounded-full border border-[#19221f]/5 backdrop-blur-md shadow-sm transition-all hover:translate-x-[-2px]", children: [
          /* @__PURE__ */ jsx("span", { children: "\u2190" }),
          /* @__PURE__ */ jsx("span", { children: "Back to Shop" })
        ] }),
        /* @__PURE__ */ jsx(Header, {
          cartCount: cartCount,
          onCartClick: (e) => { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); onClose(); onCartClick(); },
          onFavoritesClick: (e) => { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); onClose(); onFavoritesClick(); },
          onNavigateToProducts: (e) => { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); onClose(); onNavigateToProducts && onNavigateToProducts(); },
          onNavigateToAllProducts: (e) => { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); onClose(); onNavigateToAllProducts && onNavigateToAllProducts(); },
          onNavigateToCategory: (slug) => { onClose(); onNavigateToCategory && onNavigateToCategory(slug); },
          favoritesCount: favoritesCount,
          onAboutClick: (e) => { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); onClose(); onAboutClick(); },
          onLogoClick: (e) => { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); onClose(); onLogoClick(); },
          currentPage: currentPage,
          user: user,
          onUserClick: (e) => { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); onClose(); onUserClick(); }
        }),
        /* @__PURE__ */ jsxs("div", { className: "flex-grow overflow-y-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-20 relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start", children: [
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-8 lg:sticky lg:top-28", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1 text-[#b57351]", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-current stroke-none" }, i)) }),
                /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50", children: "PRODUCT EXCELLENCE RATING" })
              ] }),
              /* @__PURE__ */ jsxs("h2", { className: "font-syne text-4xl sm:text-5xl lg:text-[2.85rem] font-bold text-[#19221f] leading-[1.1] tracking-tight", children: [
                "One Pump ",
                /* @__PURE__ */ jsx("br", { className: "hidden lg:inline" }),
                "Away From ",
                /* @__PURE__ */ jsx("br", {}),
                "Healthier Skin."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-[#19221f]/75 font-display leading-relaxed", children: "Gentle, effective formulas crafted with clean botanical extracts. Designed to preserve vital cellular moisture while restoring natural dermal balance. True beauty starts with conscious science that is kind to your face and the planet." }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    onAddToCart(product);
                    onClose();
                  },
                  className: "inline-flex items-center justify-between bg-[#515f5a] text-[#fafbf9] hover:bg-[#2e3734] transition-colors duration-300 rounded-full py-4 px-8 min-w-[210px] text-xs font-display font-bold tracking-widest uppercase shadow-md group",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: "Buy Now" }),
                    /* @__PURE__ */ jsx("span", { className: "mx-3 opacity-30", children: "|" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "₨",
                      getDisplayPrice(product).price.toFixed(2),
                      getDisplayPrice(product).original != null && /* @__PURE__ */ jsx("span", { className: "ml-2 text-[10px] line-through opacity-70", children: [
                        "₨",
                        getDisplayPrice(product).original.toFixed(2)
                      ] })
                    ] })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl overflow-hidden bg-white/60 border border-white/40 shadow-sm max-w-[340px]", children: [
                /* @__PURE__ */ jsx("div", { className: "relative w-full aspect-video", children: /* @__PURE__ */ jsx("iframe", { src: "https://www.youtube.com/embed/bBzYzEaSLlE", title: "Biotech Sciences Video", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, className: "w-full h-full" }) }),
                /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider font-extrabold text-[#7a493b] leading-tight block", children: "Watch how our formulas elevate your routine" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-6 sm:space-x-8 pt-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[#7a493b]", children: /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-current" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col leading-tight", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#19221f]", children: product.rating }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[#19221f]/45 font-semibold tracking-wider uppercase", children: "Product Rating" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[#7a493b]", children: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col leading-tight", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#19221f]", children: "3.4M+" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[#19221f]/45 font-semibold tracking-wider uppercase", children: "Customer Globally" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 flex flex-col items-center justify-center relative py-6", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute w-[280px] sm:w-[360px] md:w-[440px] aspect-square border border-[#19221f]/5 rounded-full pointer-events-none select-none z-0" }),
              /* @__PURE__ */ jsx("div", { className: "absolute w-[200px] sm:w-[260px] md:w-[310px] aspect-square border border-[#19221f]/10 rounded-full pointer-events-none select-none z-0" }),
              /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-[380px] aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden bg-transparent z-10 flex items-center justify-center", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: product.image,
                  alt: product.name,
                  className: "w-full h-full object-cover filter drop-shadow-2xl hover:scale-[1.03] transition-transform duration-700",
                  referrerPolicy: "no-referrer"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 inline-flex items-center space-x-2 bg-white/50 rounded-full px-4.5 py-1.5 border border-white/40 shadow-sm z-10 text-[10px] font-mono tracking-widest uppercase font-extrabold text-[#19221f]/75", children: [
                isSaleActive(product) && /* @__PURE__ */ jsx("span", { className: "text-white bg-red-500 px-2 py-0.5 rounded-full", children: "SALE" }),
                /* @__PURE__ */ jsx("span", { children: "FORMULATION VOLUME:" }),
                /* @__PURE__ */ jsx("span", { className: "text-[#7a493b]", children: product.volume })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 space-y-10 lg:pt-16", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-[#7a493b]", children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 stroke-[2]" }),
                  /* @__PURE__ */ jsx("span", { className: "font-syne text-xs font-bold uppercase tracking-widest text-[#19221f]", children: "Plant-Based Formulas" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-display text-[#19221f]/75 leading-relaxed pl-6 border-l border-[#19221f]/10", children: "Formulated without parabens, phthalates, synthetic sulfates, or common mineral allergens. Pure bio-active extracts only." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-[#7a493b]", children: [
                  /* @__PURE__ */ jsx(Shield, { className: "w-4 h-4 stroke-[2]" }),
                  /* @__PURE__ */ jsx("span", { className: "font-syne text-xs font-bold uppercase tracking-widest text-[#19221f]", children: "Eco-Friendly Bottles" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-display text-[#19221f]/75 leading-relaxed pl-6 border-l border-[#19221f]/10", children: "Packaged exclusively in lightweight, fully recyclable amber glass or bioplastics designed to withstand solar UV degradation." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-[#7a493b]", children: [
                  /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4 stroke-[2]" }),
                  /* @__PURE__ */ jsx("span", { className: "font-syne text-xs font-bold uppercase tracking-widest text-[#19221f]", children: "Everyday Luxury" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-display text-[#19221f]/75 leading-relaxed pl-6 border-l border-[#19221f]/10", children: "Silky, light-absorbing textures crafted to absorb instantaneously into your dermis without heavy, greasy residue." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-[#19221f]/10 space-y-3", children: [
                /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50", children: "KEY BENEFIT LIST" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: product.details.map((detail, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2.5 text-xs text-[#19221f]/80 font-display", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#7a493b]" }),
                  /* @__PURE__ */ jsx("span", { children: detail })
                ] }, idx)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-20 space-y-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#19221f]", children: "Customer Reviews" }),
                reviews.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/45", children: [reviews.length, " review", reviews.length !== 1 ? "s" : "", " for this product"] })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: () => setShowForm((v) => !v), className: "inline-flex items-center space-x-1.5 bg-[#515f5a] text-white text-[10px] font-display font-bold tracking-widest uppercase py-2.5 px-5 rounded-full hover:bg-[#2e3734] transition-colors", children: [
                /* @__PURE__ */ jsx("span", { children: showForm ? "Cancel" : "Write a Review" })
              ] })
            ] }),
            showForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleReviewSubmit, className: "bg-white/60 border border-white/40 rounded-2xl p-6 space-y-5", children: [
              submitError && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2", children: submitError }),
              !user && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50", children: "YOUR NAME (OPTIONAL)" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: reviewName, onChange: (e) => setReviewName(e.target.value), maxLength: 200, className: "w-full bg-white/80 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs font-display text-[#19221f] placeholder:text-[#19221f]/35 focus:outline-none focus:ring-1 focus:ring-[#7a493b]/30", placeholder: "Anonymous" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50", children: "YOUR RATING" }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setReviewRating(n), className: "p-0.5", children: /* @__PURE__ */ jsx(Star, { className: "w-5 h-5 transition-colors " + (n <= reviewRating ? "text-[#b57351] fill-current" : "text-[#19221f]/15") }, n) })) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50", children: "YOUR REVIEW" }),
                /* @__PURE__ */ jsx("textarea", { value: reviewComment, onChange: (e) => setReviewComment(e.target.value), rows: 4, required: true, maxLength: 1000, className: "w-full bg-white/80 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs font-display text-[#19221f] placeholder:text-[#19221f]/35 focus:outline-none focus:ring-1 focus:ring-[#7a493b]/30 resize-none", placeholder: "Share your experience with this product..." })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "submit", disabled: submitting || !reviewComment.trim(), className: "inline-flex items-center justify-center bg-[#515f5a] text-white text-[10px] font-display font-bold tracking-widest uppercase py-3 px-8 rounded-full hover:bg-[#2e3734] disabled:opacity-40 transition-colors", children: submitting ? "Submitting..." : "Submit Review" })
            ] }),
            reviews.length === 0 && !showForm && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/45 font-display italic", children: "No reviews yet. Be the first to share your thoughts!" }),
            reviews.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: reviews.map((rev) => /* @__PURE__ */ jsxs("div", { className: "bg-white/50 border border-white/40 rounded-2xl p-5 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-full bg-[#7a493b]/10 flex items-center justify-center text-[#7a493b] text-[10px] font-bold font-syne", children: (rev.displayName || "C").charAt(0).toUpperCase() }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col leading-tight", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#19221f]", children: rev.displayName || "Customer" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[#19221f]/40 font-mono", children: new Date(rev.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-0.5", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 " + (n <= rev.rating ? "text-[#b57351] fill-current" : "text-[#19221f]/10") }, n)) }),
                    isAdmin && /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteReview(rev.id), title: "Delete review", className: "p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-display text-[#19221f]/75 leading-relaxed", children: rev.comment })
            ] }, rev.id)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-b border-[#19221f]/10 py-10 mt-20", children: [
            /* @__PURE__ */ jsx("div", { className: "text-center mb-6", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/45", children: "RECOGNIZED & FEATURED IN GLOBAL EDITORIALS" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-[#19221f]/40 font-syne text-[11px] sm:text-xs tracking-widest font-extrabold uppercase", children: [
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "HEIRESS" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "TOZO" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "HELLBABES" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "cocokind" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "Oxyfresh" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "DOT & KEY" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "Skaybags" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "Bellefit" }),
              /* @__PURE__ */ jsx("span", { className: "hover:text-[#19221f]/80 transition-colors", children: "AMAZING LACE" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-[#515f5a] text-[#fbf5f2] py-20 px-6 md:px-12 text-center border-t border-black/15", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[800px] mx-auto space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#fbf5f2]", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-syne text-2xl sm:text-3xl md:text-[2.25rem] font-medium leading-snug tracking-tight text-[#fbf5f2]", children: '"We believe that the future of skincare is rooted in restoring natural balance and empowering human potential."' }),
          /* @__PURE__ */ jsx("div", { className: "w-12 h-[1px] bg-white/20 mx-auto pt-2" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono tracking-widest uppercase font-bold text-white/45 block", children: "OUR CLINICAL FOUNDING MISSION" })
          ] }) })
      ] })
      ] }),
    }); }
export {
  ProductDetailsModal as default
};
