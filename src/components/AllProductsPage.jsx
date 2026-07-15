import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { NumaStore } from "../utils/store";
import { isSaleActive, getDisplayPrice } from "../lib/sale.js";

function AllProductsPage({ onAddProductToCart, onOpenProductDetails, favorites = [], onToggleFavorite }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoriesList = useMemo(() => {
    const storeCats = NumaStore.getCategories();
    return [
      { id: "all", name: "All Products" },
      ...storeCats.map((c) => ({ id: c.name, name: c.name }))
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    const allProducts = NumaStore.getProducts();
    if (selectedCategory === "all") {
      return allProducts;
    }
    return allProducts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "bg-[#f3f6ed] text-[#19221f] min-h-screen pt-28 pb-20 selection:bg-[#b08df3]/30 relative",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-6 md:px-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4", children: [
            /* @__PURE__ */ jsxs("nav", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold select-none", children: [
              "Homepage ",
              /* @__PURE__ */ jsx("span", { className: "mx-2", children: "\u2192" }),
              " All Products"
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "font-syne text-4xl md:text-5xl font-bold tracking-tight text-[#19221f]", children: "All Products" })
          ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-b border-[#19221f]/10 mt-8 py-3 overflow-x-auto no-scrollbar flex items-center justify-start space-x-1", children: categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return /* @__PURE__ */ jsx(
              "button",
              {
                key: cat.id,
                onClick: () => setSelectedCategory(cat.id),
                className: "relative px-6 py-3 rounded-full text-xs font-display font-bold tracking-wider uppercase whitespace-nowrap transition-colors duration-200",
                children: [
                  isSelected && /* @__PURE__ */ jsx(motion.div, { layoutId: "allProductsTab", className: "absolute inset-0 bg-[#19221f] rounded-full", transition: { type: "spring", stiffness: 400, damping: 30 } }),
                  /* @__PURE__ */ jsx("span", { className: "relative z-10 " + (isSelected ? "text-[#f3f6ed]" : "text-[#19221f]/60"), children: cat.name })
                ]
              }
            );
          }) }),
        /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(motion.div, { key: selectedCategory, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mt-10", children: filteredProducts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "col-span-full text-center py-20", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-[#19221f]/60 font-display", children: "No products found in this category." }) }) : filteredProducts.map((product, index) => /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 30, scale: 0.95 },
              animate: { opacity: 1, y: 0, scale: 1 },
              transition: { duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] },
              className: "group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#19221f]/5 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-md duration-500",
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    onClick: () => onOpenProductDetails(product),
                    className: "relative w-full aspect-square bg-[#fafbf9] cursor-pointer overflow-hidden border-b border-[#19221f]/5",
                    children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: product.image,
                          alt: product.name,
                          className: "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700",
                          referrerPolicy: "no-referrer"
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "absolute top-4 left-4 flex flex-col gap-1.5", children: [
                          product.label && /* @__PURE__ */ jsx("span", { className: `text-[8px] font-mono tracking-widest uppercase font-extrabold px-3 py-1 rounded-full ${product.label === "BESTSELLER" ? "bg-[#7a493b] text-white" : "bg-[#19221f] text-white"}`, children: product.label }),
                          isSaleActive(product) && /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono tracking-widest uppercase font-extrabold bg-red-500 text-white px-3 py-1 rounded-full", children: "Sale" })
                        ] }),
                      onToggleFavorite && /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            onToggleFavorite(product);
                          },
                          className: "absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#19221f]/5 flex items-center justify-center hover:scale-115 active:scale-90 transition-all shadow-sm",
                          title: "Add to Wishlist",
                          children: /* @__PURE__ */ jsx(
                            Heart,
                            {
                              className: `w-3.5 h-3.5 transition-colors ${favorites.some((fav) => fav.id === product.id) ? "fill-[#7a493b] stroke-[#7a493b]" : "stroke-[#19221f]/70"}`
                            }
                          )
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "p-5 flex-grow flex flex-col justify-between space-y-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 cursor-pointer", onClick: () => onOpenProductDetails(product), children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                          [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-[#7a493b] stroke-[#7a493b]" }, i)),
                          /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono font-extrabold text-[#19221f]/45 uppercase tracking-wider ml-1.5", children: [
                            product.reviewsCount,
                            " Reviews"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("h3", { className: "font-syne text-sm font-bold text-[#19221f] line-clamp-1", children: product.name }),
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-display text-[#19221f]/55 line-clamp-2 leading-relaxed", children: product.description })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-[#19221f]/5", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline space-x-2", children: [
                          /* @__PURE__ */ jsxs("span", { className: "font-syne text-sm font-bold text-[#19221f]", children: [
                            "₨",
                            getDisplayPrice(product).price.toFixed(2)
                          ] }),
                          getDisplayPrice(product).original != null && /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono font-bold text-[#19221f]/35 line-through", children: [
                            "₨",
                            getDisplayPrice(product).original.toFixed(2)
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => onAddProductToCart(product),
                            className: "text-[9px] font-display font-extrabold uppercase tracking-widest bg-[#19221f]/5 hover:bg-[#2e3734] hover:text-[#f5f4f0] text-[#19221f] transition-all py-2.5 px-4.5 rounded-full",
                            children: "Buy Now"
                          }
                        )
                      ] })
                    ] })
                  ]
                },
                product.id
              )) })
          })
        ] })
    }
  );
}

export { AllProductsPage as default };