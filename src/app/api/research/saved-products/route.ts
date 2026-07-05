import { NextResponse } from "next/server";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { requireUser } from "@/lib/auth-server";

export async function GET(request: Request) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("saved_products")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return noStoreJson({ products: data });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (auth.error) return auth.error;

  const body = await readJsonBody<{
    productId?: unknown;
    productName?: unknown;
    status?: unknown;
    notes?: unknown;
    snapshot?: unknown;
  }>(request);
  if (body.error) return body.error;

  const productId = sanitizePrompt(body.data?.productId, 120);
  const productName = sanitizePrompt(body.data?.productName, 180);
  const status = sanitizePrompt(body.data?.status, 20) || "watch";
  const notes = sanitizePrompt(body.data?.notes, 1000);
  const allowedStatuses = ["watch", "test", "avoid", "launched"];

  if (!productId || !productName) {
    return NextResponse.json({ error: "Product id and name are required." }, { status: 400 });
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid product status." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("saved_products")
    .insert({
      user_id: auth.user.id,
      product_id: productId,
      product_name: productName,
      status,
      notes,
      snapshot: typeof body.data?.snapshot === "object" && body.data.snapshot ? body.data.snapshot : {}
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return noStoreJson({ product: data }, { status: 201 });
}
