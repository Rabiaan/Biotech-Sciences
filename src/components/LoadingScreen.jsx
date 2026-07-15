import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
function LoadingScreen({ onComplete }) {
  const [count, setCount] = useState(1);
  useEffect(() => {
    let current = 1;
    const duration = 2200;
    const startTime = performance.now();
    const updateCounter = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = (t) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      const nextCount = Math.floor(1 + easedProgress * 99);
      if (nextCount !== current) {
        current = nextCount;
        setCount(current);
      }
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(100);
        const timeout = setTimeout(() => {
          onComplete();
        }, 300);
        return () => clearTimeout(timeout);
      }
    };
    const animId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      id: "loading-screen",
      className: "fixed inset-0 z-50 flex items-center justify-center bg-[#2e3734] text-white",
      exit: {
        y: "-100%",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          id: "loading-counter",
          className: "absolute bottom-12 right-12 md:bottom-20 md:right-20 flex flex-col items-end select-none",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.3em] opacity-40 font-display mb-1", children: "Loading Experience" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline font-syne text-7xl md:text-9xl font-semibold tracking-tighter leading-none", children: [
              /* @__PURE__ */ jsx(
                motion.span,
                {
                  initial: { y: "20%", opacity: 0 },
                  animate: { y: "0%", opacity: 1 },
                  transition: { duration: 0.05 },
                  className: "font-dmsans",
                  children: count
                },
                count
              ),
              /* @__PURE__ */ jsx("span", { className: "text-xl md:text-3xl ml-1 font-display font-light opacity-30", children: "%" })
            ] })
          ]
        }
      )
    }
  );
}
export {
  LoadingScreen as default
};
