import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { Star, Heart } from "lucide-react";
import { NumaStore } from "../utils/store";
import { isSaleActive, getDisplayPrice } from "../lib/sale.js";

function ProductsPage({
  onAddProductToCart,
  onOpenProductDetails,
  favorites = [],
  onToggleFavorite
}) {
  const [selectedCategory, setSelectedCategory] = useState("Soaps");
  const [sortBy, setSortBy] = useState("recommended");
  const [priceRange, setPriceRange] = useState(320);
  const categoriesList = useMemo(() => {
    const storeCats = NumaStore.getCategories();
    const storeProds = NumaStore.getProducts();
    return storeCats.map((cat) => {
      const actualCount = storeProds.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
      return {
        name: cat.name,
        count: actualCount
      };
    });
  }, [selectedCategory]);

  const rawProducts = useMemo(() => {
    const storeProds = NumaStore.getProducts();
    return storeProds.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [selectedCategory]);
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];
    result = result.filter((p) => p.price <= priceRange);
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [rawProducts, priceRange, sortBy]);

  return /* @__PURE__ */ jsxs("div", { className: "bg-[#f5f4f0] text-[#19221f] min-h-screen pt-28 pb-20 selection:bg-[#7a493b]/20 relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-6 md:px-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold select-none", children: [
          "Homepage ",
          /* @__PURE__ */ jsx("span", { className: "mx-2", children: "\u2192" }),
          " Products"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-6", children: [
          /* @__PURE__ */ jsx("h1", { className: "font-syne text-[5vw] sm:text-[4vw] md:text-[3vw] font-medium tracking-tight text-[#19221f] leading-none", children: "A boost rich nourishing" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-[#19221f]/60 font-display max-w-[340px] leading-relaxed md:text-right", children: "Explore a handpicked edit of skincare, makeup & wellness essentials \u2014 guided by trust, not trends." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-t border-b border-[#19221f]/10 mt-8 py-3 overflow-x-auto no-scrollbar flex items-center justify-between md:justify-start md:space-x-4", children: categoriesList.map((cat) => {
        const isSelected = selectedCategory === cat.name;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setSelectedCategory(cat.name);
            },
            className: `px-6 py-3 rounded-full text-xs font-display font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${isSelected ? "bg-[#19221f] text-[#f5f4f0]" : "hover:bg-[#19221f]/5 text-[#19221f]/60 hover:text-[#19221f]"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: cat.name }),
              /* @__PURE__ */ jsx("span", { className: `text-[9px] font-mono ${isSelected ? "text-white/60" : "text-[#19221f]/40"}`, children: cat.count })
            ]
          },
          cat.name
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-6 mt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 bg-white px-4 py-2.5 rounded-full border border-[#19221f]/5 shadow-sm text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#19221f]/50 uppercase tracking-widest font-bold text-[9px] font-mono", children: "Sort by" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "bg-transparent border-none text-[#19221f] font-bold uppercase tracking-wider text-[10px] focus:outline-none cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("option", { value: "recommended", children: "Recommended" }),
                /* @__PURE__ */ jsx("option", { value: "price-asc", children: "Price: Low to High" }),
                /* @__PURE__ */ jsx("option", { value: "price-desc", children: "Price: High to Low" }),
                /* @__PURE__ */ jsx("option", { value: "rating", children: "Top Rated" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mt-4", children: [
        filteredProducts.map((product) => {
          return /* @__PURE__ */ jsxs(
            "div",
            {
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
                        product.subLabel && /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono tracking-widest uppercase font-extrabold bg-[#eae8e2] text-[#19221f] px-3 py-1 rounded-full", children: product.subLabel }),
                        isSaleActive(product) && /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono tracking-widest uppercase font-extrabold bg-red-500 text-white px-3 py-1 rounded-full", children: "Sale" })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-[#19221f]/5 px-2.5 py-1 rounded-lg text-[9px] font-mono text-[#19221f]/70 font-bold uppercase tracking-wider", children: product.volume }),
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
          );
        })
      ] })
    ] }),
  ] });
}
export {
  ProductsPage as default
};
