import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Mail, Lock, Sparkles, LogOut, ClipboardList, ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

function AuthDrawer({
  isOpen,
  onClose,
  onLoginSuccess,
  onLogoutSuccess,
  currentUser,
  onOpenAdmin
}) {
  const { signOut, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoadingAuth(true);
    try {
      const redirectTo = `${window.location.origin}`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });
      if (authError) throw authError;
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      setError(err.message || "Google authentication failed. Please try again.");
      setIsLoadingAuth(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email) {
      setError("Please provide a valid email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoadingAuth(true);
    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name || email.split("@")[0] }
          }
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setSuccessMsg("Check your email to confirm your account, then sign in.");
          setIsRegister(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (signInError) throw signInError;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user && onLoginSuccess) {
        const role = isAdmin ? "admin" : "user";
        const displayName =
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User";
        onLoginSuccess({ displayName, role, email: user.email, provider: "email" });
      }
      onClose();
    } catch (err) {
      console.error("Authentication failed:", err);
      if (err.message?.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.message?.includes("Invalid login")) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Authentication failed. Please verify your details.");
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email) {
      setError("Enter your email to receive a reset link.");
      return;
    }
    setIsLoadingAuth(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}`
      });
      if (resetError) throw resetError;
      setSuccessMsg("Password reset link sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Could not send reset email.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
    onLogoutSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return jsxs(Fragment, {
    children: [
      jsx("div", {
        className: "fixed inset-0 bg-[#19221f]/30 backdrop-blur-xs z-50 transition-opacity",
        onClick: onClose
      }),
      jsxs(motion.div, {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring", damping: 25, stiffness: 200 },
        className: "fixed top-0 right-0 h-full w-full max-w-md bg-[#f5f4f0] text-[#19221f] shadow-2xl z-50 flex flex-col border-l border-[#19221f]/5",
        children: [
          jsxs("div", {
            className: "p-6 border-b border-[#19221f]/5 flex items-center justify-between",
            children: [
              jsxs("h2", {
                className: "font-syne text-lg font-bold uppercase tracking-wider text-[#19221f] flex items-center gap-2",
                children: [jsx(Sparkles, { className: "w-4 h-4 text-[#7a493b]" }), currentUser ? "My Profile" : "Sign In"]
              }),
              jsx("button", {
                onClick: onClose,
                className: "w-10 h-10 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[#19221f] hover:bg-[#19221f]/10 transition-colors",
                children: jsx(X, { className: "w-4 h-4" })
              })
            ]
          }),
          jsx("div", {
            className: "flex-grow overflow-y-auto p-6 space-y-8",
            children: currentUser
              ? jsxs("div", {
                  className: "space-y-6",
                  children: [
                    jsxs("div", {
                      className: "bg-[#f3f6ed] p-6 rounded-3xl border border-[#19221f]/5 flex flex-col items-center text-center space-y-4",
                      children: [
                        jsx("div", {
                          className: "w-16 h-16 rounded-full bg-[#7a493b] text-[#f3f6ed] flex items-center justify-center text-2xl font-bold font-syne shadow-sm",
                          children: currentUser.displayName.charAt(0).toUpperCase()
                        }),
                        jsxs("div", {
                          children: [
                            jsx("h3", { className: "font-syne text-base font-bold text-[#19221f]", children: currentUser.displayName }),
                            jsx("p", { className: "text-xs font-mono text-[#19221f]/60 mt-0.5", children: currentUser.email }),
                            currentUser.role === "admin" &&
                              jsx("span", {
                                className: "inline-block mt-2 text-[9px] font-mono uppercase tracking-wider font-bold bg-[#7a493b]/10 text-[#7a493b] px-2 py-0.5 rounded-full",
                                children: "Admin"
                              })
                          ]
                        }),
                        jsxs("div", {
                          className: "inline-flex items-center space-x-1.5 bg-white px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold border border-[#19221f]/5",
                          children: [
                            jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500" }),
                            jsxs("span", { children: ["Authenticated via ", currentUser.provider] })
                          ]
                        })
                      ]
                    }),
                    jsxs("div", { className: "space-y-3", children: [
                      isAdmin &&
                        jsxs("button", {
                          onClick: () => { onClose(); onOpenAdmin(); },
                          className: "w-full bg-[#19221f]/5 hover:bg-[#19221f]/10 text-[#19221f] py-4 px-5 rounded-2xl text-xs font-display uppercase tracking-wider font-bold transition-all flex items-center justify-between border border-[#19221f]/5",
                          children: [
                            jsxs("span", { className: "flex items-center gap-2", children: [
                              jsx(ClipboardList, { className: "w-4 h-4 text-[#7a493b]" }),
                              "Admin Dashboard / Store Lab"
                            ] }),
                            jsx("span", { className: "text-[10px] bg-[#7a493b]/10 text-[#7a493b] px-2 py-0.5 rounded-md font-mono", children: "LAB" })
                          ]
                        }),
                      jsxs("button", {
                        onClick: handleLogout,
                        className: "w-full bg-[#7a493b] hover:bg-[#5e382d] text-[#f3f6ed] py-4 px-5 rounded-2xl text-xs font-display uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-sm",
                        children: [jsx(LogOut, { className: "w-4 h-4" }), "Sign Out Account"]
                      })
                    ] })
                  ]
                })
              : jsxs("div", { className: "space-y-6", children: [
                  jsxs("div", { className: "space-y-2", children: [
                    jsx("h3", { className: "font-syne text-xl font-bold text-[#19221f]", children: isForgotPassword ? "Reset Password" : "Unlock Skin Wellness" }),
                    jsx("p", {
                      className: "text-xs text-[#19221f]/60 font-display leading-relaxed",
                      children: isForgotPassword
                        ? "Enter your email and we will send a secure reset link."
                        : "Join Biotech Sciences to track purchase histories, sync your wishlist, and experience tailored formulations."
                    })
                  ] }),
                  !isForgotPassword &&
                    jsxs("div", { className: "space-y-3", children: [
                      jsxs("button", {
                        onClick: handleGoogleLogin,
                        type: "button",
                        disabled: isLoadingAuth,
                        className: "w-full bg-white hover:bg-[#f3f6ed] border border-[#19221f]/10 rounded-2xl py-3.5 px-4 text-xs font-display tracking-wider font-bold flex items-center justify-center gap-2.5 transition-all disabled:opacity-50",
                        children: [
                          jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", children: [
                            jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
                            jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
                            jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z", fill: "#FBBC05" }),
                            jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z", fill: "#EA4335" })
                          ] }),
                          jsx("span", { children: "Continue with Google" })
                        ]
                      }),
                      jsxs("div", { className: "relative flex py-2 items-center", children: [
                        jsx("div", { className: "flex-grow border-t border-[#19221f]/10" }),
                        jsx("span", { className: "flex-shrink mx-4 text-[9px] font-mono text-[#19221f]/40 font-bold uppercase tracking-widest", children: "Or via Email" }),
                        jsx("div", { className: "flex-grow border-t border-[#19221f]/10" })
                      ] })
                    ] }),
                  error && jsxs("div", {
                    className: "bg-red-50 text-red-600 p-3.5 rounded-xl text-xs flex items-center gap-2 border border-red-100 font-display",
                    children: [jsx(ShieldAlert, { className: "w-4 h-4 flex-shrink-0" }), jsx("span", { children: error })]
                  }),
                  successMsg && jsx("div", {
                    className: "bg-green-50 text-green-700 p-3.5 rounded-xl text-xs border border-green-100 font-display",
                    children: successMsg
                  }),
                  isForgotPassword
                    ? jsxs("form", { onSubmit: handleForgotPassword, className: "space-y-4", children: [
                        jsxs("div", { className: "space-y-1", children: [
                          jsx("label", { className: "text-[9px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Email" }),
                          jsxs("div", { className: "relative", children: [
                            jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#19221f]/35" }),
                            jsx("input", {
                              type: "email", required: true, value: email,
                              onChange: (e) => setEmail(e.target.value),
                              className: "w-full bg-[#f3f6ed]/50 border border-[#19221f]/10 rounded-xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display",
                              placeholder: "your@email.com"
                            })
                          ] })
                        ] }),
                        jsx("button", {
                          type: "submit", disabled: isLoadingAuth,
                          className: "w-full bg-[#19221f] text-[#f3f6ed] hover:bg-[#7a493b] transition-colors py-4 rounded-xl text-xs font-mono uppercase font-bold tracking-widest shadow-sm disabled:opacity-50",
                          children: isLoadingAuth ? "Sending..." : "Send Reset Link"
                        }),
                        jsx("button", {
                          type: "button",
                          onClick: () => { setIsForgotPassword(false); setError(""); },
                          className: "w-full text-[10px] font-display text-[#7a493b] hover:underline uppercase tracking-wider font-bold",
                          children: "Back to Sign In"
                        })
                      ] })
                    : jsxs("form", { onSubmit: handleEmailSubmit, className: "space-y-4", children: [
                        isRegister && jsxs("div", { className: "space-y-1", children: [
                          jsx("label", { className: "text-[9px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Your Name" }),
                          jsx("input", {
                            type: "text", value: name, onChange: (e) => setName(e.target.value),
                            className: "w-full bg-[#f3f6ed]/50 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#7a493b] font-display",
                            placeholder: "Jane Doe"
                          })
                        ] }),
                        jsxs("div", { className: "space-y-1", children: [
                          jsx("label", { className: "text-[9px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Email" }),
                          jsxs("div", { className: "relative", children: [
                            jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#19221f]/35" }),
                            jsx("input", {
                              type: "email", required: true, value: email,
                              onChange: (e) => setEmail(e.target.value),
                              className: "w-full bg-[#f3f6ed]/50 border border-[#19221f]/10 rounded-xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display",
                              placeholder: "your@email.com"
                            })
                          ] })
                        ] }),
                        jsxs("div", { className: "space-y-1", children: [
                          jsx("label", { className: "text-[9px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold", children: "Password" }),
                          jsxs("div", { className: "relative", children: [
                            jsx(Lock, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#19221f]/35" }),
                            jsx("input", {
                              type: "password", required: true, value: password,
                              onChange: (e) => setPassword(e.target.value),
                              className: "w-full bg-[#f3f6ed]/50 border border-[#19221f]/10 rounded-xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display",
                              placeholder: "Min. 8 characters"
                            })
                          ] })
                        ] }),
                        !isRegister && jsx("div", { className: "text-right", children: jsx("button", {
                          type: "button",
                          onClick: () => { setIsForgotPassword(true); setError(""); },
                          className: "text-[10px] font-display text-[#7a493b] hover:underline font-bold",
                          children: "Forgot password?"
                        }) }),
                        jsx("button", {
                          type: "submit", disabled: isLoadingAuth,
                          className: "w-full bg-[#19221f] text-[#f3f6ed] hover:bg-[#7a493b] transition-colors py-4 rounded-xl text-xs font-mono uppercase font-bold tracking-widest shadow-sm disabled:opacity-50",
                          children: isLoadingAuth ? "Please wait..." : isRegister ? "Register & Sign In" : "Sign In"
                        })
                      ] }),
                  !isForgotPassword && jsx("div", { className: "text-center", children: jsx("button", {
                    type: "button",
                    onClick: () => { setIsRegister(!isRegister); setError(""); },
                    className: "text-[10px] font-display text-[#7a493b] hover:underline uppercase tracking-wider font-bold",
                    children: isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"
                  }) })
                ] })
          })
        ]
      })
    ]
  });
}

export default AuthDrawer;
