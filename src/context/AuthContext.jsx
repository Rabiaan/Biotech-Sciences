import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase.js";
import { NumaStore } from "../utils/store.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [adminJustSignedIn, setAdminJustSignedIn] = useState(false);

  const syncProfile = useCallback(async (user, accessToken) => {
    if (!user) {
      setProfile(null);
      NumaStore.logout();
      return null;
    }
    try {
      const res = await fetch("/api/users/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          uid: user.id,
          email: user.email,
          displayName:
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User"
        })
      });
      const data = res.ok ? await res.json() : {};
      const role = data.role || "user";
      const displayName =
        data.displayName ||
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "User";
      const storeUser = NumaStore.login(user.email || "", displayName, "email", user.id, role);
      setProfile(storeUser);
      return storeUser;
    } catch (err) {
      console.error("Profile sync failed:", err);
      const fallback = NumaStore.login(
        user.email || "",
        user.user_metadata?.display_name || "User",
        "email",
        user.id,
        "user"
      );
      setProfile(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      if (!mounted) return;
      setSession(initial);
      if (initial?.user) {
        syncProfile(initial.user, initial.access_token).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      setAuthError(null);
      if (nextSession?.user) {
        const synced = await syncProfile(nextSession.user, nextSession.access_token);
        // Admin role is authoritative from the server sync, but fall back to the
        // auth user's app_metadata so the redirect still works if /api/users/sync
        // fails (e.g. the server can't reach the DB).
        const isAdminRole =
          synced?.role === "admin" || nextSession.user?.app_metadata?.role === "admin";
        if (event === "SIGNED_IN") {
          NumaStore.syncFromDatabase().catch(() => {});
          if (isAdminRole) {
            if (synced?.role !== "admin") {
              const forced = NumaStore.login(
                nextSession.user.email || "",
                synced?.displayName || nextSession.user.email?.split("@")[0] || "Admin",
                "email",
                nextSession.user.id,
                "admin"
              );
              setProfile(forced);
            }
            setAdminJustSignedIn(true);
          }
        }
      } else {
        setProfile(null);
        NumaStore.logout();
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    NumaStore.logout();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: profile,
      loading,
      authError,
      setAuthError,
      isAdmin: profile?.role === "admin",
      adminJustSignedIn,
      setAdminJustSignedIn,
      signOut,
      accessToken: session?.access_token ?? null
    }),
    [session, profile, loading, authError, signOut, adminJustSignedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
