const buckets = new Map();

export function createRateLimiter({ windowMs = 60_000, max = 60, keyPrefix = "" } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let entry = buckets.get(key);
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 };
      buckets.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    next();
  };
}

export const apiRateLimit = createRateLimiter({ windowMs: 60_000, max: 120, keyPrefix: "api" });
export const authRateLimit = createRateLimiter({ windowMs: 15 * 60_000, max: 20, keyPrefix: "auth" });
export const writeRateLimit = createRateLimiter({ windowMs: 60_000, max: 30, keyPrefix: "write" });
