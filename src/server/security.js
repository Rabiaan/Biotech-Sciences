const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 5000;
const MAX_NAME = 200;

export function sanitizeString(value, maxLen = MAX_TEXT) {
  if (value == null) return "";
  return String(value)
    .trim()
    .slice(0, maxLen)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

export function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim()) && email.length <= 254;
}

export function validateContactInput({ name, email, subject, message }) {
  const errors = [];
  const cleanName = sanitizeString(name, MAX_NAME);
  const cleanEmail = sanitizeString(email, 254);
  const cleanSubject = sanitizeString(subject, 200);
  const cleanMessage = sanitizeString(message, MAX_TEXT);
  if (!cleanName) errors.push("Name is required");
  if (!isValidEmail(cleanEmail)) errors.push("Valid email is required");
  if (!cleanMessage) errors.push("Message is required");
  return {
    valid: errors.length === 0,
    errors,
    data: { name: cleanName, email: cleanEmail, subject: cleanSubject || "No Subject", message: cleanMessage }
  };
}

export function validateProductInput(body) {
  const errors = [];
  if (!sanitizeString(body?.name, MAX_NAME)) errors.push("Product name is required");
  const price = Number(body?.price);
  if (!Number.isFinite(price) || price < 0) errors.push("Valid price is required");
  if (!sanitizeString(body?.category, 100)) errors.push("Category is required");
  return { valid: errors.length === 0, errors };
}

export function validateOrderStatus(status) {
  const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  return allowed.includes(status);
}

export function safeErrorMessage(err, fallback = "An unexpected error occurred") {
  if (process.env.NODE_ENV !== "production" && err?.message) {
    return err.message;
  }
  return fallback;
}
