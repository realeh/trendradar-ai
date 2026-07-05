import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { isCjConfigured, searchCjProducts } from "@/lib/cj-client";

export async function POST(request: Request) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  if (!isCjConfigured()) {
    return NextResponse.json(
      { error: "CJ_DROPSHIPPING_API_KEY is not set. Add it to your environment to search the live catalog." },
      { status: 503 }
    );
  }

  const body = await readJsonBody<{ keyword?: unknown; productFlag?: unknown; page?: unknown }>(request);
  if (body.error) return body.error;

  const keyword = sanitizePrompt(body.data?.keyword, 100);
  const productFlag = typeof body.data?.productFlag === "number" ? (body.data.productFlag as 0 | 1 | 2 | 3) : undefined;
  const page = typeof body.data?.page === "number" ? body.data.page : 1;

  try {
    const result = await searchCjProducts({ keyWord: keyword || undefined, productFlag, page, size: 20 });
    return noStoreJson(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "CJ search failed." }, { status: 502 });
  }
}
