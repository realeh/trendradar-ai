import { NextResponse } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export function rateLimit(request: Request, limit = 20, windowMs = 60_000) {
  const key = getClientKey(request);
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) } }
    );
  }

  return null;
}

export async function readJsonBody<T extends Record<string, unknown>>(request: Request, maxBytes = 8_192) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { error: NextResponse.json({ error: "Expected application/json." }, { status: 415 }) };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { error: NextResponse.json({ error: "Request body is too large." }, { status: 413 }) };
  }

  try {
    return { data: JSON.parse(text) as T };
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }) };
  }
}

export function sanitizePrompt(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function noStoreJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers
    }
  });
}
