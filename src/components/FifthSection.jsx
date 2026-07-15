import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { NumaStore } from "../utils/store";
import { motion, AnimatePresence } from "framer-motion";
function FifthSection({ onAddProductToCart, onOpenProductDetails }) {
  const categories = NumaStore.getCategories();
  const [activeTab, setActiveTab] = useState(categories[0]?.name || "");
  const getFilteredProducts = () => {
    const storeProds = NumaStore.getProducts();
    return storeProds.filter((p) => p.category === activeTab);
  };
  const filteredProducts = getFilteredProducts();
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "collections-section",
      className: "bg-[#fafbf9] text-[#19221f] py-20 md:py-28 px-6 md:px-12 border-t border-[#19221f]/5",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center space-y-6", children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-syne text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-center max-w-[800px] leading-tight", children: [
            "Feel Beautiful Inside and Out ",
            /* @__PURE__ */ jsx("br", {}),
            "with Every Product"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2 pt-2", children: categories.map((cat) => {
            const isSelected = activeTab === cat.name;
            return /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveTab(cat.name),
                className: "relative px-5 py-2.5 rounded-full text-[10px] md:text-xs font-display font-medium tracking-widest uppercase transition-colors duration-200",
                children: [
                  isSelected && /* @__PURE__ */ jsx(motion.div, { layoutId: "fifthSectionTab", className: "absolute inset-0 bg-[#19221f] rounded-full shadow-sm", transition: { type: "spring", stiffness: 400, damping: 30 } }),
                  /* @__PURE__ */ jsx("span", { className: "relative z-10 " + (isSelected ? "text-[#f3f6ed]" : "text-[#19221f]/60 hover:text-[#19221f]"), children: cat.name })
                ]
              },
              cat.name
            );
          }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", children: filteredProducts.map((product) => /* @__PURE__ */ jsxs(
          motion.div,
          {
            layout: true,
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95 },
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            className: "flex flex-col relative rounded-[2.25rem] overflow-hidden group border border-[#19221f]/5 shadow-sm bg-white",
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-full aspect-[4/5] overflow-hidden cursor-pointer bg-neutral-100",
                  onClick: () => onOpenProductDetails(product),
                  children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: product.image,
                      alt: product.name,
                      className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",
                      referrerPolicy: "no-referrer"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "absolute bottom-5 left-4 right-4 bg-[#f3f6ed]/95 backdrop-blur-sm rounded-[1.75rem] py-3.5 px-5 flex items-center justify-between shadow-md border border-white/20", children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex flex-col space-y-0.5 cursor-pointer flex-1 min-w-0 pr-3",
                    onClick: () => onOpenProductDetails(product),
                    children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-syne text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#19221f] leading-tight truncate", children: product.subtitle }),
                      /* @__PURE__ */ jsxs("span", { className: "font-display text-[10px] sm:text-xs font-bold text-[#19221f]/60 tracking-wider truncate", children: [
                        "\u20A8",
                        product.price.toFixed(2)
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      onAddProductToCart(product);
                    },
                    className: "w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[#19221f] hover:bg-[#19221f] hover:text-[#fafbf9] transition-colors duration-300 flex-shrink-0",
                    "aria-label": `Add ${product.name} to cart`,
                    children: /* @__PURE__ */ jsx(ShoppingCart, { className: "w-4 h-4 stroke-[1.5]" })
                  }
                )
              ] })
            ]
          },
          product.id
        )) }) })
      ]
    }
  );
}
export {
  FifthSection as default
};
