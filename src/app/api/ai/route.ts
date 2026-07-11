import { NextResponse } from "next/server";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { getCommerceAIResponse } from "@/lib/openai-commerce";
import { requireActiveSubscription } from "@/lib/auth-server";

export async function POST(request: Request) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  // Same reasoning as /api/simulate: the page redirect alone doesn't stop a
  // direct API call, so the subscription check has to live here too.
  const { error: authError } = await requireActiveSubscription(request);
  if (authError) return authError;

  const body = await readJsonBody<{ query?: unknown }>(request);
  if (body.error) return body.error;

  const query = sanitizePrompt(body.data?.query);
  if (!query) {
    return NextResponse.json({ error: "Please provide a question." }, { status: 400 });
  }

  const response = await getCommerceAIResponse(query);

  return noStoreJson({
    ...response
  });
}
