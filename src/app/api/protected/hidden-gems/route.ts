import { requireActiveSubscription } from "@/lib/auth-server";
import { noStoreJson, rateLimit } from "@/lib/api-security";
import { getHiddenGemRecommendations } from "@/lib/hidden-gems-engine";
import { getActiveProducts } from "@/lib/product-store";

export async function GET(request: Request) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  const { error: authError } = await requireActiveSubscription(request);
  if (authError) return authError;

  const products = await getActiveProducts();
  const hidden = getHiddenGemRecommendations(products);
  const warmingUp = hidden.filter((item) => item.saturationWarning).length;

  return noStoreJson({ hidden, warmingUp });
}
