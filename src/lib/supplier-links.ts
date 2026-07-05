/**
 * Builds a link to a product's real supplier on CJ Dropshipping.
 *
 * Why this isn't a direct product-page permalink: CJ's developer API only
 * returns a UUID-style `pid` (e.g. "04A22450-67F0-4617-A132-E7AE7F8963B0"),
 * which is a different identifier from the numeric id CJ's own storefront
 * uses in its product-page URLs ("https://cjdropshipping.com/product/<slug>-p-<numericId>.html").
 * The two id systems aren't interchangeable, so building a URL from the API's
 * pid would risk a broken/404 link. Searching CJ's live catalog by SKU
 * (verified real search URL pattern: "https://cjdropshipping.com/search/<query>.html")
 * reliably lands on the same real listing without guessing an id we don't have.
 */
export function buildCjSupplierUrl(query: string): string {
  const cleaned = query.trim();
  if (!cleaned) return "https://cjdropshipping.com/";

  const slug = encodeURIComponent(cleaned).replace(/%20/g, "+");
  return `https://cjdropshipping.com/search/${slug}.html`;
}
