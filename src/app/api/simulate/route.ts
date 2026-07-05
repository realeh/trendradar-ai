import { NextResponse } from "next/server";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { simulateProductAnalysis } from "@/lib/product-simulator-engine";
import { getActiveProducts } from "@/lib/product-store";

export async function POST(request: Request) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  const body = await readJsonBody<{ input?: unknown }>(request);
  if (body.error) return body.error;

  const input = sanitizePrompt(body.data?.input, 300);
  if (!input) {
    return NextResponse.json({ error: "Please provide a product name or link." }, { status: 400 });
  }

  const products = await getActiveProducts();
  const result = simulateProductAnalysis(input, products);

  return noStoreJson({ result });
}
