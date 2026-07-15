import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isSaleActive, getDisplayPrice } from "../lib/sale.js";
function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) {
  const subtotal = items.reduce((acc, item) => acc + getDisplayPrice(item.product).price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;
  return /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 0.4 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 z-50 bg-[#19221f]"
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring", damping: 30, stiffness: 300 },
        className: "fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-[#f3f6ed] shadow-2xl flex flex-col border-l border-[#19221f]/10",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[#19221f]/10 flex items-center justify-between bg-white", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5 stroke-[1.5]" }),
              /* @__PURE__ */ jsx("h2", { className: "font-syne text-lg font-bold tracking-tight uppercase", children: "Your Shopping Cart" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-2 hover:bg-[#19221f]/5 rounded-full transition-colors",
                "aria-label": "Close cart",
                children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 stroke-[1.5]" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar", children: items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[#19221f]/40", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "w-8 h-8 stroke-[1.25]" }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-syne text-base font-bold text-[#19221f]", children: "Your cart is empty" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#19221f]/60 max-w-[240px]", children: "Add some premium skincare formulated with bio ingredients to get started." })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "bg-[#19221f] text-[#f3f6ed] font-display text-xs tracking-wider uppercase font-semibold py-3 px-6 rounded-full hover:bg-[#2c3d37] transition-colors",
                children: "Continue Shopping"
              }
            )
          ] }) : items.map((item) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex space-x-4 pb-6 border-b border-[#19221f]/5 items-start",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-[#19221f]/5", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: item.product.image,
                    alt: item.product.name,
                    className: "w-full h-full object-cover",
                    referrerPolicy: "no-referrer"
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-grow space-y-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-syne text-sm font-bold text-[#19221f] leading-snug", children: item.product.name }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[#19221f]/50 font-display uppercase tracking-wider", children: item.product.volume })
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "font-syne text-sm font-bold text-[#19221f] whitespace-nowrap ml-2", children: [
                      "₨",
                      (getDisplayPrice(item.product).price * item.quantity).toFixed(2)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#19221f]/20 rounded-full py-1 px-2.5 space-x-3 bg-white", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => onUpdateQuantity(item.product.id, item.quantity - 1),
                          className: "p-1 text-[#19221f]/60 hover:text-[#19221f] transition-colors",
                          "aria-label": "Decrease quantity",
                          children: /* @__PURE__ */ jsx(Minus, { className: "w-3.5 h-3.5 stroke-[1.5]" })
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "font-syne text-xs font-bold w-4 text-center select-none", children: item.quantity }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => onUpdateQuantity(item.product.id, item.quantity + 1),
                          className: "p-1 text-[#19221f]/60 hover:text-[#19221f] transition-colors",
                          "aria-label": "Increase quantity",
                          children: /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5 stroke-[1.5]" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => onRemoveItem(item.product.id),
                        className: "text-[#19221f]/40 hover:text-red-600 p-1.5 transition-colors",
                        "aria-label": "Remove item",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 stroke-[1.5]" })
                      }
                    )
                  ] })
                ] })
              ]
            },
            item.product.id
          )) }),
          items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-6 border-t border-[#19221f]/10 space-y-4 bg-white", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-[#19221f]/70 font-display", children: [
                /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "₨",
                  subtotal.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-[#19221f]/70 font-display", children: [
                /* @__PURE__ */ jsx("span", { children: "Shipping" }),
                /* @__PURE__ */ jsx("span", { children: shipping === 0 ? "FREE" : `₨${shipping.toFixed(2)}` })
              ] }),
              shipping > 0 && /* @__PURE__ */ jsxs("div", { className: "text-[11px] sm:text-xs text-green-700 font-display font-medium leading-none", children: [
                "Add ₨",
                (50 - subtotal).toFixed(2),
                " more for FREE shipping"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-t border-[#19221f]/5 pt-2 flex justify-between text-base font-bold text-[#19221f] font-syne", children: [
                /* @__PURE__ */ jsx("span", { children: "Total" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "₨",
                  total.toFixed(2)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onCheckout,
                className: "w-full bg-[#19221f] text-[#f3f6ed] font-display text-xs tracking-wider uppercase font-semibold py-4 rounded-full hover:bg-[#2c3d37] transition-colors shadow-md text-center",
                children: "Proceed to Checkout"
              }
            )
          ] })
        ]
      }
    )
  ] }) });
}
export {
  CartDrawer as default
};
