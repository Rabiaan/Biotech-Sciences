import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, Minus, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);
  const faqs = [
    {
      question: "How long will it take to see results from your products?",
      answer: "Results vary depending on the product and your skin type. Most customers notice visible improvements within 2-4 weeks of consistent use. Our liposomal formulations are designed for deeper penetration, which means faster and more effective results compared to standard skincare products."
    },
    {
      question: "Are your products cruelty-free?",
      answer: "Absolutely. We are proud to be 100% cruelty-free. We never test any of our formulations, individual ingredients, or finished products on animals, and we only partner with ethically aligned suppliers."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship our premium collections globally. Shipping speeds and rates vary depending on your destination country. Contact our support team for specific shipping information to your location."
    },
    {
      question: "Can I return a product if I'm not satisfied?",
      answer: "We want you to love your skincare routine. If a product isn't working for your skin, simply contact our support team and we will guide you through a hassle-free return or exchange."
    },
    {
      question: "Are your products suitable for sensitive skin?",
      answer: "Yes, all our products are formulated with clean, bio-active ingredients that are free from harmful chemicals. We test extensively on sensitive skin types to ensure compatibility. Our liposomal encapsulation actually makes ingredients gentler on the skin."
    },
    {
      question: "Can I use your products if I have a specific skin condition?",
      answer: "We recommend consulting with a dermatologist if you have a specific skin condition. However, many of our products are specifically formulated to address conditions like acne, fungal infections, and hyperpigmentation."
    },
    {
      question: "Are your products vegan-friendly?",
      answer: "Yes, all our products are 100% pure vegan. We use plant-based and scientifically derived ingredients that are cruelty-free and ethically sourced."
    },
    {
      question: "How should I incorporate your products into my skincare routine?",
      answer: "Start with our facewash for cleansing, followed by treatment products like serums or creams, and always finish with sunscreen during the day. Our support team can help you build a customized routine tailored to your skin needs."
    },
    {
      question: "Do you offer samples or trial sizes of your products?",
      answer: "Currently, we offer full-size products. However, our customer support team can provide guidance on which products would be best suited for your skin type before you make a purchase."
    },
    {
      question: "Can I use your products during pregnancy or while breastfeeding?",
      answer: "We recommend consulting with your healthcare provider before using any skincare products during pregnancy or while breastfeeding. Some active ingredients may require professional guidance."
    },
    {
      question: "Do you offer wholesale or bulk purchasing options?",
      answer: "Yes, we offer wholesale and bulk purchasing options. Please contact our team at info@biotechsciences.org or call +92-333-2927735 for wholesale inquiries."
    },
    {
      question: "How can I stay informed about new product launches and promotions?",
      answer: "Follow us on Facebook and Instagram @biotechsciences to stay updated on new product launches, promotions, and skincare tips. You can also contact us via WhatsApp for instant updates."
    }
  ];
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "faq-section",
      className: "bg-[#f3f6ed] text-[#19221f] py-20 md:py-28 px-6 md:px-12 border-t border-[#19221f]/5",
      children: /* @__PURE__ */ jsx("div", { className: "max-w-[1440px] mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-6 flex flex-col justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-square md:aspect-[4/5] lg:aspect-square max-w-[540px] mx-auto rounded-[2.5rem] overflow-hidden shadow-sm", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/images/skincare_cream_small_1783091715408.png",
              alt: "Skincare cream jar on wooden pedestal",
              className: "w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700",
              referrerPolicy: "no-referrer"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] sm:w-[70%] bg-[#e5ecd8]/95 backdrop-blur-md rounded-full py-2.5 px-4 flex items-center space-x-3.5 border border-white/20 shadow-md", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-[#19221f] flex items-center justify-center text-[#f3f6ed] flex-shrink-0", children: /* @__PURE__ */ jsx(Headphones, { className: "w-5 h-5 stroke-[1.5]" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col leading-tight", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-[#19221f] uppercase tracking-wide", children: "24/7 We're Here" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] md:text-[11px] text-[#19221f]/60 font-semibold uppercase tracking-wider", children: "To Help You" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-6 flex flex-col space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "flex", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center space-x-2 bg-transparent border border-[#19221f]/30 rounded-full py-1 px-4 text-[10px] md:text-xs uppercase font-display font-medium tracking-widest select-none", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-[#19221f] rounded-full animate-pulse" }),
            /* @__PURE__ */ jsx("span", { children: "Frequently Asked Question" })
          ] }) }),
          /* @__PURE__ */ jsx("h2", { className: "font-syne text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight max-w-[540px]", children: "Answers to Your Skincare Questions, All in One Place." }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "border border-[#19221f]/15 rounded-2xl overflow-hidden bg-transparent hover:border-[#19221f]/40 transition-colors",
                children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setActiveIndex(isOpen ? null : idx),
                      className: "w-full py-4 px-5 flex items-center justify-between text-left focus:outline-none",
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "font-display text-sm md:text-base font-semibold text-[#19221f] tracking-wide pr-4", children: faq.question }),
                        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[#19221f]/75", children: isOpen ? /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4 stroke-[2]" }) : /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 stroke-[2]" }) })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: isOpen && /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      initial: { height: 0, opacity: 0 },
                      animate: { height: "auto", opacity: 1 },
                      exit: { height: 0, opacity: 0 },
                      transition: { duration: 0.3, ease: "easeInOut" },
                      children: /* @__PURE__ */ jsx("div", { className: "px-5 pb-5 pt-1 border-t border-[#19221f]/5 text-xs md:text-sm text-[#19221f]/75 leading-relaxed", children: faq.answer })
                    }
                  ) })
                ]
              },
              idx
            );
          }) })
        ] })
      ] }) })
    }
  );
}
export {
  FAQSection as default
};
