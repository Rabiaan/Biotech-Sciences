import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { useScroll } from "framer-motion";
import { useEffect } from "react";
const SCROLL_TEXT = "With over 20 years of expertise in skincare pharmaceuticals, Biotech Sciences pioneers Galenic formulations encapsulated in liposomes for unmatched bioavailability. From cross-linked dual hyaluronic acid to plant-based actives, every product is designed to nourish, protect, and rejuvenate your skin at the deepest level. Because at Biotech Sciences, your skin matters to us. With over 20 years of expertise in skincare pharmaceuticals, Biotech Sciences pioneers Galenic formulations encapsulated in liposomes for unmatched bioavailability. From cross-linked dual hyaluronic acid to plant-based actives, every product is designed to nourish, protect, and rejuvenate your skin at the deepest level.";
function ScrollTextSection() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Start effect when the top of the container is 85% down the viewport
    // End effect when the bottom of the container reaches 35% of the viewport
    offset: ["start 85%", "end 35%"]
  });
  useEffect(() => {
    // motion value -> subscribe to changes without relying on useMotionValueEvent export
    return scrollYProgress.on("change", (latest) => {
      setProgress(latest);
    });
  }, [scrollYProgress]);
  const words = SCROLL_TEXT.split(" ");
  const totalWords = words.length;
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "scroll-text-container",
      ref: containerRef,
      className: "bg-[#f3f6ed] text-[#19221f] py-16 md:py-24 lg:py-36 px-6 md:px-12 select-none border-t border-[#19221f]/5",
      children: /* @__PURE__ */ jsx("div", { className: "max-w-[1100px] mx-auto", children: /* @__PURE__ */ jsx("p", { className: "font-syne text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.25] tracking-tight text-left flex flex-wrap", children: words.map((word, i) => {
        const start = i / totalWords;
        const end = (i + 1) / totalWords;
        const wordProgress = Math.min(Math.max((progress - start) / (end - start), 0), 1);
        return /* @__PURE__ */ jsxs(
          "span",
          {
            className: "relative inline-block mr-[0.25em] mb-[0.15em]",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-[#19221f]/20 transition-colors duration-200", children: word }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "absolute inset-0 text-[#19221f] transition-opacity duration-150 ease-out select-text",
                  style: { opacity: wordProgress },
                  children: word
                }
              )
            ]
          },
          i
        );
      }) }) })
    }
  );
}
export {
  ScrollTextSection as default
};
