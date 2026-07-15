import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { NumaStore } from "../utils/store";

function Header({
  cartCount,
  onCartClick,
  onFavoritesClick,
  onNavigateToProducts,
  onNavigateToAllProducts,
  onNavigateToCategory,
  favoritesCount,
  onAboutClick,
  onLogoClick,
  currentPage = "home",
  activeCategory,
  user,
  onUserClick
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const categoriesList = useMemo(() => NumaStore.getCategories(), []);

  const navCategories = useMemo(() => categoriesList.map((c) => ({
    id: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: c.name
  })), [categoriesList]);

  function isActive(item) {
    if (item.id === "all-products") return currentPage === "all-products";
    if (item.id === "about") return currentPage === "about";
    if (currentPage === "category") {
      const itemSlug = item.id.replace("category-", "");
      return itemSlug === activeCategory;
    }
    return false;
  }

  const navItems = useMemo(() => {
    const items = [{ id: "all-products", label: "Shop", onClick: onNavigateToAllProducts }];
    navCategories.forEach((cat) => {
      items.push({ id: `category-${cat.id}`, label: cat.name, onClick: () => onNavigateToCategory(cat.id) });
    });
    items.push({ id: "about", label: "Science & About", onClick: onAboutClick });
    return items;
  }, [navCategories, onNavigateToAllProducts, onNavigateToCategory, onAboutClick]);

  function handleMobileNavClick(action) {
    setMobileMenuOpen(false);
    if (action) action();
  }

  return /* @__PURE__ */ jsxs(
    "header",
    {
      id: "site-header",
      className: "sticky top-0 z-50 bg-[#f3f6ed]/95 backdrop-blur-md text-[#19221f] transition-all duration-300",
      children: [
        /* @__PURE__ */ jsxs(motion.div, {
          initial: { y: -20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          className: "max-w-[1440px] mx-auto px-6 md:px-12 h-20 md:h-24 flex items-center justify-between",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onLogoClick,
                className: "font-syne text-lg md:text-xl font-extrabold tracking-widest uppercase hover:opacity-80 transition-opacity flex items-center gap-1.5",
                children: /* @__PURE__ */ jsx(motion.img, {
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                  src: "/src/assets/images/logo.png",
                  alt: "Biotech Sciences",
                  className: "h-8 md:h-10 w-auto"
                })
              }
            ),
            /* @__PURE__ */ jsx("nav", { className: "hidden md:flex items-center space-x-8 lg:space-x-12", children: navItems.map((item) => {
              const active = isActive(item);
              return /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: item.onClick,
                  className: "relative text-xs font-display tracking-wider uppercase font-medium py-1",
                  children: [
                    /* @__PURE__ */ jsx(motion.span, {
                      className: `relative z-10 transition-colors duration-200 ${active ? "text-[#2e3734] font-bold" : "text-[#19221f]/60 hover:text-[#19221f]"}`,
                      whileHover: { y: -1 },
                      transition: { type: "spring", stiffness: 400, damping: 20 },
                      children: item.label
                    }),
                    active && /* @__PURE__ */ jsx(motion.div, {
                      layoutId: "navbarUnderline",
                      className: "absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e3734] rounded-full",
                      transition: { type: "spring", stiffness: 400, damping: 30 }
                    })
                  ]
                },
                item.id
              );
            }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 md:space-x-6", children: [
              /* @__PURE__ */ jsx(motion.button, {
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 },
                onClick: onCartClick,
                className: "relative p-2",
                "aria-label": "Shopping cart",
                children: [
                  /* @__PURE__ */ jsx(ShoppingBag, { className: "w-4.5 h-4.5 stroke-[1.5]" }),
                  cartCount > 0 && /* @__PURE__ */ jsx(motion.span, {
                    initial: { scale: 0 },
                    animate: { scale: 1 },
                    transition: { type: "spring", stiffness: 500, damping: 25 },
                    className: "absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#19221f] text-[#f3f6ed] rounded-full text-[9px] flex items-center justify-center font-bold",
                    children: cartCount
                  })
                ]
              }),
              /* @__PURE__ */ jsx(motion.button, {
                whileHover: { scale: 1.1 },
                whileTap: { scale: 0.9 },
                onClick: onFavoritesClick,
                className: "relative p-2",
                "aria-label": "Favorites",
                children: [
                  /* @__PURE__ */ jsx(Heart, { className: `w-4.5 h-4.5 stroke-[1.5] ${favoritesCount > 0 ? "fill-[#19221f]" : ""}` }),
                  favoritesCount > 0 && /* @__PURE__ */ jsx(motion.span, {
                    initial: { scale: 0 },
                    animate: { scale: 1 },
                    transition: { type: "spring", stiffness: 500, damping: 25 },
                    className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  })
                ]
              }),
              /* @__PURE__ */ jsx(motion.button, {
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 },
                onClick: onUserClick,
                className: "hidden md:flex p-2 items-center space-x-1.5",
                "aria-label": "User account",
                children: user ? /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1.5 bg-[#19221f]/5 px-2.5 py-1 rounded-full text-[10px] font-display font-medium uppercase tracking-wider text-[#19221f]", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-4.5 h-4.5 rounded-full bg-[#7a493b] text-[#f3f6ed] flex items-center justify-center font-bold text-[9px]", children: user.displayName.charAt(0).toUpperCase() }),
                  /* @__PURE__ */ jsx("span", { className: "truncate max-w-[80px]", children: user.displayName.split(" ")[0] })
                ] }) : /* @__PURE__ */ jsx(User, { className: "w-4.5 h-4.5 stroke-[1.5]" })
              }),
              /* @__PURE__ */ jsx(motion.button, {
                whileTap: { scale: 0.9 },
                onClick: () => setMobileMenuOpen(true),
                className: "md:hidden p-2",
                "aria-label": "Open menu",
                children: /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5 stroke-[1.5]" })
              })
            ] })
          ]
        }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: mobileMenuOpen && /* @__PURE__ */ jsxs(motion.div, {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2 },
          className: "fixed inset-0 z-[60] md:hidden",
          children: [
            /* @__PURE__ */ jsx("div", {
              className: "absolute inset-0 bg-black/40",
              onClick: () => setMobileMenuOpen(false)
            }),
            /* @__PURE__ */ jsxs(motion.div, {
              initial: { x: "100%" },
              animate: { x: 0 },
              exit: { x: "100%" },
              transition: { type: "spring", stiffness: 300, damping: 30 },
              className: "absolute right-0 top-0 h-full w-[80%] max-w-[360px] bg-[#f3f6ed] shadow-2xl flex flex-col",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 h-20 border-b border-[#19221f]/10", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-syne text-sm font-bold tracking-widest uppercase", children: "Menu" }),
                  /* @__PURE__ */ jsx(motion.button, {
                    whileTap: { scale: 0.9 },
                    onClick: () => setMobileMenuOpen(false),
                    className: "p-2",
                    "aria-label": "Close menu",
                    children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 stroke-[1.5]" })
                  })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6 py-6", children: /* @__PURE__ */ jsx("nav", { className: "flex flex-col space-y-1", children: navItems.map((item) => {
                  const active = isActive(item);
                  return /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleMobileNavClick(item.onClick),
                      className: `w-full text-left py-3 px-4 rounded-xl text-sm font-display tracking-wider uppercase font-medium transition-colors ${active ? "bg-[#19221f] text-[#f3f6ed]" : "text-[#19221f]/70 hover:bg-[#19221f]/5 hover:text-[#19221f]"}`,
                      children: item.label
                    },
                    item.id
                  );
                }) }) }),
                /* @__PURE__ */ jsxs("div", { className: "border-t border-[#19221f]/10 px-6 py-5 space-y-3", children: [
                  user ? /* @__PURE__ */ jsxs("button", {
                    onClick: () => handleMobileNavClick(onUserClick),
                    className: "w-full flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-[#19221f]/5 transition-colors",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-[#7a493b] text-[#f3f6ed] flex items-center justify-center font-bold text-xs", children: user.displayName.charAt(0).toUpperCase() }),
                      /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[#19221f]", children: user.displayName }),
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-[#19221f]/50 font-display uppercase tracking-wider", children: "My Account" })
                      ] })
                    ]
                  }) : /* @__PURE__ */ jsxs("button", {
                    onClick: () => handleMobileNavClick(onUserClick),
                    className: "w-full flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-[#19221f]/5 transition-colors text-[#19221f]/70",
                    children: [
                      /* @__PURE__ */ jsx(User, { className: "w-4.5 h-4.5 stroke-[1.5]" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-display tracking-wider uppercase font-medium", children: "Sign In" })
                    ]
                  })
                ] })
              ]
            })
          ]
        }) })
      ]
    }
  );
}
export {
  Header as default
};
