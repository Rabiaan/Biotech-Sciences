import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
function FirstSection({ onOpenProduct, onNavigateToShop }) {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "hero-section",
      className: "relative min-h-screen bg-[#f3f6ed] text-[#19221f] overflow-hidden pt-6 pb-20 md:pb-28 px-6 md:px-12 flex flex-col justify-between",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-between relative", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center w-full pt-2 select-none", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2.5 bg-[#19221f]/5 border border-[#19221f]/10 rounded-full py-1.5 px-4 shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "font-syne text-sm font-black tracking-tight text-[#19221f]", children: "4.8/5" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1 text-[#7a493b]", children: /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 fill-current" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase font-display font-extrabold text-[#19221f]/60 tracking-wider", children: "23,510 GLOWING REVIEWS" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 items-start z-40 pt-8 relative", children: [
        /* @__PURE__ */ jsx("div", { className: "md:col-span-4 flex flex-col justify-between h-full pt-4 md:pt-16 md:pr-8 relative z-30", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx(
            motion.p,
            {
              initial: { opacity: 0, x: -30 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.8, delay: 0.2 },
              className: "text-sm md:text-base text-[#19221f]/80 leading-relaxed max-w-[280px]",
              children: "Transform your skincare routine with premium products that restore, protect, and enhance your natural glow every day."
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "mt-6 relative z-30", children: /* @__PURE__ */ jsx(
            motion.button,
            {
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
              onClick: (e) => {
                e.stopPropagation();
                onNavigateToShop?.(e);
                window.scrollTo(0, 0);
              },
              className: "bg-[#19221f] text-[#f3f6ed] font-display text-xs tracking-wider uppercase font-medium py-4 px-10 rounded-full hover:bg-[#2e3e38] transition-colors shadow-md inline-flex items-center space-x-2 relative z-30 pointer-events-auto",
              children: /* @__PURE__ */ jsx("span", { children: "Shop Now" })
            }
          ) })
        ] }) }),
          /* @__PURE__ */ jsx("div", { className: "md:col-span-6 flex justify-end md:pt-4", children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: 30 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.8, delay: 0.3 },
              onClick: (e) => {
                e.stopPropagation();
                const id = "biotech-hyasomal-complete-repair-complex";
                onOpenProduct?.(e, id);
                window.scrollTo(0, 0);
              },
              className: "w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-sm border border-[#19221f]/5 cursor-pointer group relative",
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/Hyasomal Complete Repair Complex Serum.png",
                    alt: "Hyasomal Complete Repair Complex Serum",
                    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                    referrerPolicy: "no-referrer"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-[#19221f]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase font-display bg-[#f3f6ed] text-[#19221f] py-1.5 px-3 rounded-full font-medium tracking-widest shadow-sm pointer-events-none", children: "View Serum" })
                ] })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center -mt-8 md:-mt-24 mb-6 z-20", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none whitespace-nowrap", style: { zIndex: -1 }, children: /* @__PURE__ */ jsx("span", { className: "font-syne text-[10vw] font-black uppercase text-[#19221f] tracking-tighter leading-none opacity-90", children: "SKINCARE" }) }),
          /* @__PURE__ */ jsxs("h1", { className: "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 font-syne text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.85] text-[#19221f] flex flex-col items-center drop-shadow-md pointer-events-none", children: [
            /* @__PURE__ */ jsx("span", { children: "GLOW" }),
            /* @__PURE__ */ jsx("span", { children: "NATURALLY" })
          ] }),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 50 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
              className: "relative z-20 w-full md:w-[30%] aspect-[4/5] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-lg pointer-events-none",
                children: [
                  /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/skincare_woman_serum_1783091693743.png",
                    alt: "Skincare client holding avocado",
                    className: "w-full h-full object-cover",
                    referrerPolicy: "no-referrer"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-[#f3f6ed]/90 backdrop-blur-md rounded-full py-2.5 px-3.5 flex items-center space-x-3 border border-white/20 shadow-md", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white border border-[#19221f]/10", children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: "/images/skincare_cream_small_1783091715408.png",
                      alt: "Mini Product",
                      className: "w-full h-full object-cover",
                      referrerPolicy: "no-referrer"
                    }
                  ) }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#19221f] leading-tight font-display font-medium", children: "While giving you an invigorating cleansing experience." })
                ] }),
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex md:hidden flex-col items-center space-y-6 z-30 px-4 mt-6", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                onNavigateToShop?.(e);
                window.scrollTo(0, 0);
              },
              className: "w-full bg-[#19221f] text-[#f3f6ed] font-display text-xs tracking-wider uppercase font-medium py-4 rounded-full shadow-md text-center relative z-30",
              children: "Shop Now"
            }
          ) }),
        ] }),
      ] })
    }
  );
}
export {
  FirstSection as default
};
