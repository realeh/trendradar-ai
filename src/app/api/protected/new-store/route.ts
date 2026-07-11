import { requireActiveSubscription } from "@/lib/auth-server";
import { noStoreJson, rateLimit } from "@/lib/api-security";
import { getExcludedNewStoreProducts, getNewStoreRecommendations } from "@/lib/new-store-engine";
import { getActiveProducts } from "@/lib/product-store";

export async function GET(request: Request) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  const { error: authError } = await requireActiveSubscription(request);
  if (authError) return authError;

  const products = await getActiveProducts();
  const beginnerProducts = getNewStoreRecommendations(products);
  const excludedProducts = getExcludedNewStoreProducts(products);

  return noStoreJson({ beginnerProducts, excludedProducts });
}
