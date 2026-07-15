import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
function FourthSection() {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "inspiration-banner-section",
      className: "relative h-[65vh] sm:h-[75vh] md:h-[85vh] bg-[#19221f] overflow-hidden flex items-center justify-center border-t border-[#19221f]/5",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 w-full h-full", children: [
          /* @__PURE__ */ jsx(
            motion.img,
            {
              src: "/images/girl_holding_skincare_1783092647172.png",
              alt: "Inspirational banner - Beautiful girl holding skincare",
              className: "w-full h-full object-cover opacity-80",
              initial: { scale: 1.1 },
              whileInView: { scale: 1 },
              transition: { duration: 2, ease: "easeOut" },
              viewport: { once: true },
              referrerPolicy: "no-referrer"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/30" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-[90%] sm:max-w-2xl md:max-w-4xl mx-auto text-center px-4", children: [
          /* @__PURE__ */ jsxs(
            motion.h2,
            {
              className: "font-syne text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#fafbf9] leading-[1.1] tracking-tight uppercase",
              initial: { opacity: 0, y: 40 },
              whileInView: { opacity: 1, y: 0 },
              transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              viewport: { once: true, margin: "-100px" },
              children: [
                "Feel beautiful inside ",
                /* @__PURE__ */ jsx("br", { className: "hidden sm:inline" }),
                "and out with each product"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "w-12 h-[2px] bg-[#e5ecd8] mx-auto mt-8 opacity-65",
              initial: { width: 0 },
              whileInView: { width: 48 },
              transition: { duration: 1, delay: 0.3 },
              viewport: { once: true }
            }
          )
        ] })
      ]
    }
  );
}
export {
  FourthSection as default
};
