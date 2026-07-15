import { jsx, jsxs } from "react/jsx-runtime";
function Footer({ onPrivacyClick, onReturnPolicyClick }) {
  return /* @__PURE__ */ jsxs(
    "footer",
    {
      id: "site-footer",
      className: "relative bg-[#19221f] text-[#fafbf9] pt-12 md:pt-20 pb-6 px-6 md:px-12 overflow-hidden",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] mx-auto relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mb-20", children: [
            /* About Us */
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-6 space-y-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#fafbf9] uppercase tracking-wider", children: "About Us" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-[#fafbf9]/60 font-display leading-relaxed", children: "We have 20 years' experience of skin care pharmaceutical industry, 20 years of learning, research and cosmetology brands development." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-[#fafbf9]/60 font-display leading-relaxed", children: "We create \u201CLIPOSOMAL\u201D \u2014 a brand infused with love and care, dedicated to make a real difference in people\u2019s lives, because of its uniqueness that is \u201CGalenic Formulations, encapsulated in Liposomes.\u201D Because at Biotech Sciences, Your skin matters for us." })
            ] }),
            /* Contact Info */
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-6 space-y-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-syne text-lg font-bold text-[#fafbf9] uppercase tracking-wider", children: "Contact Info" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#fafbf9]/60 font-display leading-relaxed", children: "We love to hear your query and our team is 24 hours available to solve your issue." }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs font-mono text-[#fafbf9]/70 uppercase tracking-wider", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[#a7c3ba] font-bold flex-shrink-0", children: "ADDRESS:" }),
                  /* @__PURE__ */ jsx("span", { children: "Karachi - Pakistan" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[#a7c3ba] font-bold flex-shrink-0", children: "PHONE:" }),
                  /* @__PURE__ */ jsx("a", { href: "tel:+923332927735", className: "hover:text-[#fafbf9] transition-colors", children: "+92-333-2927735" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[#a7c3ba] font-bold flex-shrink-0", children: "EMAIL:" }),
                  /* @__PURE__ */ jsx("a", { href: "mailto:info@biotechsciences.org", className: "hover:text-[#fafbf9] transition-colors lowercase", children: "info@biotechsciences.org" })
                ] })
              ] })
            ] })
          ] }),
          /* Social + Copyright */
          /* @__PURE__ */ jsxs("div", { className: "border-t border-[#fafbf9]/10 pt-10 space-y-6 relative z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 sm:space-x-6 text-[11px] sm:text-xs font-display tracking-wider font-semibold uppercase text-[#fafbf9]/70", children: [
                /* @__PURE__ */ jsx("a", { href: "https://www.facebook.com/share/19jcTKj4c7/", target: "_blank", rel: "noopener noreferrer", className: "hover:text-[#fafbf9] transition-colors", children: "Facebook" }),
                /* @__PURE__ */ jsx("a", { href: "https://www.instagram.com/biotechsciences?igsh=Y29pMHN0MnVzeDBs", target: "_blank", rel: "noopener noreferrer", className: "hover:text-[#fafbf9] transition-colors", children: "Instagram" }),
                /* @__PURE__ */ jsx("a", { href: "https://api.whatsapp.com/send?phone=%2B923002927735", target: "_blank", rel: "noopener noreferrer", className: "hover:text-[#fafbf9] transition-colors", children: "WhatsApp" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 sm:space-x-6 text-[11px] sm:text-xs font-display tracking-wider font-semibold uppercase text-[#fafbf9]/70", children: [
                /* @__PURE__ */ jsx("span", { onClick: onReturnPolicyClick, className: "cursor-pointer hover:text-[#fafbf9] transition-colors", children: "Return Policy" }),
                /* @__PURE__ */ jsx("span", { onClick: onPrivacyClick, className: "cursor-pointer hover:text-[#fafbf9] transition-colors", children: "Privacy Policy" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-[#fafbf9]/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-display tracking-wider text-[#fafbf9]/40", children: [
              /* @__PURE__ */ jsx("span", { children: "\u00a9 " + new Date().getFullYear() + " Biotech Sciences. All rights reserved." }),
              /* @__PURE__ */ jsxs("span", { children: ["Designed & Created by ", /* @__PURE__ */ jsx("a", { href: "https://frame-gen.com/", target: "_blank", rel: "noopener noreferrer", className: "text-[#fafbf9]/60 hover:text-[#fafbf9] transition-colors underline underline-offset-2", children: "Framegen" })] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-20px] sm:bottom-[-40px] md:bottom-[-60px] left-0 right-0 w-full select-none pointer-events-none opacity-[0.035] overflow-hidden text-center z-0 px-2", children: /* @__PURE__ */ jsx("span", { className: "font-syne text-[10vw] font-black uppercase text-white tracking-widest leading-none block", children: "BIOTECH SCIENCES" }) })
      ]
    }
  );
}
export {
  Footer as default
};
