import { NextResponse } from "next/server";
import { noStoreJson, rateLimit } from "@/lib/api-security";
import { getSupabaseConfigStatus } from "@/lib/integrations";

export async function GET(request: Request) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  return noStoreJson({
    configured: getSupabaseConfigStatus()
  });
}
