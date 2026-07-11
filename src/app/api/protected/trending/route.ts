import { requireActiveSubscription } from "@/lib/auth-server";
import { noStoreJson, rateLimit } from "@/lib/api-security";
import { deriveFilterOptions, getActiveProducts } from "@/lib/product-store";

export async function GET(request: Request) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  const { error: authError } = await requireActiveSubscription(request);
  if (authError) return authError;

  const products = await getActiveProducts();
  const { categories, countries, platforms } = deriveFilterOptions(products);
  const isDemoData = products[0]?.dataSource === "demo";

  return noStoreJson({ products, categories, countries, platforms, isDemoData });
}
