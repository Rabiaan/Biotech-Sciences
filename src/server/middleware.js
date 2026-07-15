import { verifyAccessToken } from "./supabaseAdmin.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { isAdminEmail } from "../lib/config.server.js";

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  req.user = null;
  req.userRole = null;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const { user, error } = await verifyAccessToken(token);
    if (error || !user) {
      return next();
    }

    let role = "user";
    try {
      const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      if (rows.length > 0) {
        role = rows[0].role || "user";
      } else if (isAdminEmail(user.email)) {
        role = "admin";
      }
    } catch {
      role = isAdminEmail(user.email) ? "admin" : "user";
    }

    req.user = {
      uid: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0]
    };
    req.userRole = role;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireJsonContent(req, res, next) {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const ct = req.headers["content-type"] || "";
    if (!ct.includes("application/json")) {
      return res.status(415).json({ error: "Content-Type must be application/json" });
    }
  }
  next();
}

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}
