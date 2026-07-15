import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingCart, Heart } from "lucide-react";
import { NumaStore } from "../utils/store";
import { motion } from "framer-motion";
function ThirdSection({
  onAddProductToCart,
  onOpenProductDetails,
  favorites = [],
  onToggleFavorite
}) {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const allProducts = NumaStore.getProducts();
  const featuredCategories = ["Skincare (Creams & Serums)", "Facewash", "Soaps", "Hair Care", "Oral Supplements"];
  const displayProducts = allProducts.filter((p) => featuredCategories.includes(p.category));
  const goToSlide = (index) => {
    if (index < 0 || index >= displayProducts.length) return;
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / displayProducts.length;
      container.scrollTo({
        left: index * cardWidth,
        behavior: "smooth"
      });
    }
  };
  const scroll = (direction) => {
    let nextIndex = activeIndex;
    if (direction === "left") {
      nextIndex = activeIndex > 0 ? activeIndex - 1 : displayProducts.length - 1;
    } else {
      nextIndex = activeIndex < displayProducts.length - 1 ? activeIndex + 1 : 0;
    }
    goToSlide(nextIndex);
  };
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const totalWidth = container.scrollWidth - container.clientWidth;
      if (totalWidth <= 0) return;
      const ratio = scrollLeft / (container.scrollWidth / displayProducts.length);
      const index = Math.round(ratio);
      if (index >= 0 && index < displayProducts.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "products-section",
      className: "bg-[#f3f6ed] text-[#19221f] py-20 md:py-28 px-6 md:px-12 border-t border-[#19221f]/5",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto space-y-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-end justify-between gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-[700px]", children: [
            /* @__PURE__ */ jsx("div", { className: "flex", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center space-x-2 bg-transparent border border-[#19221f]/30 rounded-full py-1 px-4 text-[10px] md:text-xs uppercase font-display font-medium tracking-widest select-none", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-[#19221f] rounded-full animate-pulse" }),
              /* @__PURE__ */ jsx("span", { children: "Best Selling Products" })
            ] }) }),
            /* @__PURE__ */ jsx("h2", { className: "font-syne text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight", children: "Skincare That Brings Out Your Natural Radiance" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 self-end lg:self-auto", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => scroll("left"),
                "aria-label": "Scroll left",
                className: "w-12 h-12 rounded-full border border-[#19221f]/25 bg-white flex items-center justify-center text-[#19221f] hover:bg-[#19221f] hover:text-[#f3f6ed] transition-colors duration-300",
                children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5 stroke-[1.5]" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => scroll("right"),
                "aria-label": "Scroll right",
                className: "w-12 h-12 rounded-full bg-[#19221f] flex items-center justify-center text-[#f3f6ed] hover:bg-[#2c3d37] transition-colors duration-300",
                children: /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 stroke-[1.5]" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: scrollContainerRef,
            onScroll: handleScroll,
            className: "flex lg:grid lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto lg:overflow-x-visible pb-6 no-scrollbar snap-x snap-mandatory",
            children: displayProducts.map((product) => /* @__PURE__ */ jsxs(
              motion.div,
              {
                className: "min-w-[85vw] sm:min-w-[340px] lg:min-w-0 snap-start flex-shrink-0 flex flex-col relative rounded-[2.25rem] overflow-hidden group border border-[#19221f]/5 shadow-sm bg-white",
                whileHover: { y: -6 },
                transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
                children: [
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "w-full aspect-[4/5] overflow-hidden cursor-pointer bg-neutral-100 relative",
                      onClick: () => onOpenProductDetails(product),
                      children: [
                        /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: product.image,
                            alt: product.name,
                            className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",
                            referrerPolicy: "no-referrer"
                          }
                        ),
                        onToggleFavorite && /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: (e) => {
                              e.stopPropagation();
                              onToggleFavorite(product);
                            },
                            className: "absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/95 border border-[#19221f]/5 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-md text-[#7a493b]",
                            title: "Add to Wishlist",
                            children: /* @__PURE__ */ jsx(
                              Heart,
                              {
                                className: `w-4 h-4 transition-colors ${favorites.some((fav) => fav.id === product.id) ? "fill-[#7a493b] stroke-[#7a493b]" : "stroke-[#19221f]/70"}`
                              }
                            )
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "absolute bottom-5 left-4 right-4 bg-[#f3f6ed]/95 backdrop-blur-sm rounded-[1.75rem] py-3.5 px-4 md:px-5 flex items-center justify-between shadow-md border border-white/20", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "flex flex-col space-y-0.5 cursor-pointer flex-1 min-w-0 pr-3",
                        onClick: () => onOpenProductDetails(product),
                        children: [
                          /* @__PURE__ */ jsx("h3", { className: "font-syne text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#19221f] leading-tight truncate max-w-full", children: product.name }),
                          /* @__PURE__ */ jsxs("span", { className: "font-display text-[10px] sm:text-xs font-bold text-[#19221f]/60 tracking-wider truncate", children: [
                            "₨",
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
                        className: "w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[#19221f] hover:bg-[#19221f] hover:text-[#f3f6ed] transition-colors duration-300 flex-shrink-0",
                        "aria-label": `Add ${product.name} to cart`,
                        children: /* @__PURE__ */ jsx(ShoppingCart, { className: "w-4 h-4 stroke-[1.5]" })
                      }
                    )
                  ] })
                ]
              },
              product.id
            ))
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center space-x-2 pt-2", children: displayProducts.map((_, idx) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => goToSlide(idx),
            className: `h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? "w-8 bg-[#19221f]" : "w-2 bg-[#19221f]/20 hover:bg-[#19221f]/40"}`,
            "aria-label": `Go to slide ${idx + 1}`
          },
          idx
        )) })
      ] })
    }
  );
}
export {
  ThirdSection as default
};
