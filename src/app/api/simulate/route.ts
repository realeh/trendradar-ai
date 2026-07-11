import { NextResponse } from "next/server";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { simulateProductAnalysis } from "@/lib/product-simulator-engine";
import { getActiveProducts } from "@/lib/product-store";
import { requireActiveSubscription } from "@/lib/auth-server";

export async function POST(request: Request) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  // The page-level redirect in AppShell only guards the UI — without this,
  // anyone could call this endpoint directly (curl, a script) and get the
  // full paid simulator output for free. This is the real access boundary.
  const { error: authError } = await requireActiveSubscription(request);
  if (authError) return authError;

  const body = await readJsonBody<{ input?: unknown }>(request);
  if (body.error) return body.error;

  const input = sanitizePrompt(body.data?.input, 300);
  if (!input) {
    return NextResponse.json({ error: "Please provide a product name or link." }, { status: 400 });
  }

  const products = await getActiveProducts();
  const outcome = await simulateProductAnalysis(input, products);

  if (!outcome.found) {
    return noStoreJson({
      result: null,
      noMatch: true,
      message: `No match for "${outcome.query}" in your curated catalog or CJ Dropshipping's live search. Try a more general product name or category.`
    });
  }

  return noStoreJson({ result: outcome.result });
}
