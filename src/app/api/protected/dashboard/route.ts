import { requireActiveSubscription } from "@/lib/auth-server";
import { noStoreJson, rateLimit } from "@/lib/api-security";
import { getActiveProducts } from "@/lib/product-store";

export async function GET(request: Request) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  const { error: authError } = await requireActiveSubscription(request);
  if (authError) return authError;

  const products = await getActiveProducts();
  const isDemoData = products[0]?.dataSource === "demo";
  const lowSaturationCount = products.filter((product) => product.saturation === "Low").length;

  return noStoreJson({ products, isDemoData, lowSaturationCount });
}
