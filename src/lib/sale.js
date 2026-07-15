/**
 * Sale helpers shared between the admin dashboard and the storefront.
 *
 * A product is considered "on sale" only when:
 *   - onSale is true
 *   - a salePrice is set
 *   - the current time is within [saleStart, saleEnd] (when those are provided)
 */

export function isSaleActive(product) {
  if (!product || !product.onSale) return false;
  if (product.salePrice == null || product.salePrice === "") return false;
  const now = Date.now();
  if (product.saleStart) {
    const start = new Date(product.saleStart).getTime();
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (product.saleEnd) {
    const end = new Date(product.saleEnd).getTime();
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}

/**
 * Returns the price the customer should pay right now, plus the original
 * price to strike through when a sale is active.
 */
export function getDisplayPrice(product) {
  if (isSaleActive(product)) {
    return { price: Number(product.salePrice), original: product.price };
  }
  return { price: product.price, original: null };
}
