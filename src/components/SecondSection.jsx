import { jsx, jsxs } from "react/jsx-runtime";
import { Award, ArrowRight } from "lucide-react";
function SecondSection({ onLearnMoreClick }) {
  const features = [
    {
      number: "01",
      title: "Liposomal Actives",
      desc: "Every ingredient is encapsulated in liposomes for deeper penetration, better absorption, and visible results."
    },
    {
      number: "02",
      title: "Galenic Science",
      desc: "Precision-formulated using pharmaceutical-grade processes to ensure stability, bioavailability, and efficacy."
    },
    {
      number: "03",
      title: "Plant-Based & Clean",
      desc: "Free from parabens, phthalates, and synthetic sulfates. Pure bio-active extracts in eco-friendly packaging."
    }
  ];
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "about-section",
      className: "bg-[#f3f6ed] text-[#19221f] py-20 md:py-28 px-6 md:px-12 border-t border-[#19221f]/5",
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-6 flex flex-col space-y-8", children: [
            /* @__PURE__ */ jsx("div", { className: "flex", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center space-x-2 bg-transparent border border-[#19221f]/30 rounded-full py-1 px-4 text-[10px] md:text-xs uppercase font-display font-medium tracking-widest select-none", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-[#19221f] rounded-full animate-pulse" }),
              /* @__PURE__ */ jsx("span", { children: "Why Our Products" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-syne text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight tracking-tight max-w-full lg:max-w-[500px]", children: "Galenic Formulations. Real Results." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-[#19221f]/70 leading-relaxed max-w-[520px]", children: "Backed by 20 years of pharmaceutical expertise, every Biotech Sciences product uses liposomal encapsulation to deliver active ingredients deeper into your skin. Science you can see, formulas you can trust." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6 pt-4", children: [
              features.map((feat, index) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "group flex flex-col md:flex-row items-start md:space-x-6 py-5 border-t border-[#19221f]/10",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "font-syne text-2xl md:text-3xl font-light text-[#19221f]/30 group-hover:text-[#19221f] transition-colors duration-300 mb-2 md:mb-0", children: feat.number }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg md:text-xl font-bold tracking-tight text-[#19221f]", children: feat.title }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-[#19221f]/70 leading-relaxed max-w-full lg:max-w-[440px]", children: feat.desc })
                    ] })
                  ]
                },
                index
              )),
              /* @__PURE__ */ jsx("div", { className: "border-t border-[#19221f]/10" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-6 w-full flex flex-col justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-[4/5] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-md", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "/src/assets/images/skincare_woman_closeup_1783091734129.png",
                alt: "Skincare woman closeup with gel patches",
                className: "w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700",
                referrerPolicy: "no-referrer"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-6 left-6 max-w-[85%] bg-[#f3f6ed]/95 backdrop-blur-md rounded-full py-2.5 px-4 flex items-center space-x-3.5 border border-white/20 shadow-md", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-[#202b28] flex items-center justify-center text-[#f3f6ed]", children: /* @__PURE__ */ jsx(Award, { className: "w-5 h-5 stroke-[1.5]" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-[#19221f] uppercase tracking-wide leading-tight", children: "Best Skincare Product" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] md:text-[11px] text-[#19221f]/60 font-semibold uppercase tracking-wider leading-none", children: "Award Winning" })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end pt-16 md:pt-20 border-b border-[#19221f]/5 pb-4", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onLearnMoreClick,
              className: "group flex items-center space-x-2 text-xs md:text-sm font-display uppercase tracking-widest font-bold hover:opacity-70 transition-opacity",
              children: [
                /* @__PURE__ */ jsx("span", { children: "Learn More" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 transition-transform group-hover:translate-x-1" })
              ]
            }
          )
        ] })
      ] })
    }
  );
}
export {
  SecondSection as default
};
