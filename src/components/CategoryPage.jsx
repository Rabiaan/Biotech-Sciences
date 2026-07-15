import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { Star, Heart } from "lucide-react";
import { NumaStore } from "../utils/store";
import { isSaleActive, getDisplayPrice } from "../lib/sale.js";

const CATEGORY_DESCRIPTIONS = {
  "Soaps": "Liposomal cleansing bars engineered for targeted skin therapy with prolonged active ingredient contact.",
  "Hair Care": "Scientifically formulated hair nourishment solutions with liposomal delivery for scalp health and strand strength.",
  "Facewash": "Advanced medicated facial cleansers utilizing liposomal technology for continuous, gentle active release.",
  "Skincare (Creams & Serums)": "Targeted treatment creams and serums with biomimetic delivery systems for enhanced skin absorption and efficacy.",
  "Oral Supplements": "Clinically-dosed liposomal and hyaluronic supplements for systemic wellness and antioxidant support."
};

function CategoryPage({ categorySlug = "soaps", onAddProductToCart, onNavigateHome, showToast, favorites = [], onToggleFavorite, onOpenProductDetails }) {
  const [selectedCategory, setSelectedCategory] = useState(categorySlug);

  useEffect(() => {
    setSelectedCategory(categorySlug);
  }, [categorySlug]);

  const categoriesList = useMemo(() => NumaStore.getCategories(), []);

  const slugToName = useMemo(() => {
    const map = {};
    for (const cat of categoriesList) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      map[slug] = cat.name;
    }
    return map;
  }, [categoriesList]);

  const currentCategoryName = slugToName[selectedCategory] || categoriesList[0]?.name || "Soaps";
  const currentCategory = {
    name: currentCategoryName,
    shortDescription: CATEGORY_DESCRIPTIONS[currentCategoryName] || ""
  };

  const filteredProducts = useMemo(() => {
    const allProducts = NumaStore.getProducts();
    return allProducts.filter((p) => p.category === currentCategoryName);
  }, [currentCategoryName]);

  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "bg-[#f3f6ed] text-[#19221f] min-h-screen pt-28 pb-20 selection:bg-[#b08df3]/30 relative",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto px-6 md:px-12", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
             className: "absolute top-15 left-6 md:left-12 z-30",
            children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onNavigateHome,
                className: "flex items-center space-x-2 bg-white/80 hover:bg-white text-[#19221f] text-xs font-display tracking-widest uppercase font-bold py-3 px-5 rounded-full border border-[#19221f]/5 backdrop-blur-md shadow-sm transition-all hover:translate-x-[-2px]",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "\u2190" }),
                  /* @__PURE__ */ jsx("span", { children: "Back to Home" })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4", children: [
            /* @__PURE__ */ jsxs("nav", { className: "text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold select-none", children: [
              "Homepage ",
              /* @__PURE__ */ jsx("span", { className: "mx-2", children: "\u2192" }),
              "Products ",
              /* @__PURE__ */ jsx("span", { className: "mx-2", children: "\u2192" }),
              /* @__PURE__ */ jsx("span", { className: "text-[#19221f]", children: currentCategory.name })
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "font-syne text-4xl md:text-5xl font-bold tracking-tight text-[#19221f]", children: currentCategory.name })
          ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-[#19221f]/60 font-display max-w-[500px] mt-2", children: currentCategory.shortDescription }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-b border-[#19221f]/10 mt-8 py-3 overflow-x-auto no-scrollbar flex items-center justify-start space-x-4", children: categoriesList.map((cat) => {
            const catSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            const isSelected = selectedCategory === catSlug;
            return /* @__PURE__ */ jsx(
              "button",
              {
                key: catSlug,
                onClick: () => setSelectedCategory(catSlug),
                className: `px-6 py-3 rounded-full text-xs font-display font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${isSelected ? "bg-[#19221f] text-[#f3f6ed]" : "hover:bg-[#19221f]/5 text-[#19221f]/60 hover:text-[#19221f]"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { children: cat.name })
                ]
              }
            );
          }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mt-10", children: filteredProducts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "col-span-full text-center py-20", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-[#19221f]/60 font-display", children: "No products found in this category." }) }) : filteredProducts.map((product) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#19221f]/5 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-md duration-500",
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    onClick: () => onOpenProductDetails && onOpenProductDetails(product),
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
                      product.label && /* @__PURE__ */ jsx("span", { className: `absolute top-4 left-4 text-[8px] font-mono tracking-widest uppercase font-extrabold px-3 py-1 rounded-full ${product.label === "BESTSELLER" ? "bg-[#7a493b] text-white" : "bg-[#19221f] text-white"}`, children: product.label }),
                      isSaleActive(product) && /* @__PURE__ */ jsx("span", { className: "absolute top-4 left-4 mt-7 text-[8px] font-mono tracking-widest uppercase font-extrabold bg-red-500 text-white px-3 py-1 rounded-full", children: "Sale" }),
                      onToggleFavorite && /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            onToggleFavorite(product);
                          },
                          className: "absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#19221f]/5 flex items-center justify-center hover:scale-115 active:scale-90 transition-all shadow-sm",
                          title: "Add to Wishlist",
                          children: /* @__PURE__ */ jsx(Heart, { className: `w-3.5 h-3.5 transition-colors ${favorites.some((fav) => fav.id === product.id) ? "fill-[#7a493b] stroke-[#7a493b]" : "stroke-[#19221f]/70"}` })
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "p-5 flex-grow flex flex-col justify-between space-y-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 cursor-pointer", onClick: () => onOpenProductDetails && onOpenProductDetails(product), children: [
                        /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1", children: [
                          [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-[#7a493b] stroke-[#7a493b]" }, i)),
                          /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono font-extrabold text-[#19221f]/45 uppercase tracking-wider ml-1.5", children: [
                            product.reviewsCount,
                            " Reviews"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("h3", { className: "font-syne text-sm font-bold text-[#19221f] line-clamp-1", children: product.name }),
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-display text-[#19221f]/55 line-clamp-2 leading-relaxed", children: product.description })
                      ] }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between pt-2 border-t border-[#19221f]/5", children: [
                        /* @__PURE__ */ jsx("div", { className: "flex items-baseline space-x-2", children: [
                          /* @__PURE__ */ jsx("span", { className: "font-syne text-sm font-bold text-[#19221f]", children: [
                            "₨",
                            getDisplayPrice(product).price.toFixed(2)
                          ] }),
                          getDisplayPrice(product).original != null && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold text-[#19221f]/35 line-through", children: [
                            "₨",
                            getDisplayPrice(product).original.toFixed(2)
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => onAddProductToCart && onAddProductToCart(product),
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
          ] })
    }
  );
}

export { CategoryPage as default };