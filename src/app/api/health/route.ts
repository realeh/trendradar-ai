import { noStoreJson } from "@/lib/api-security";
import { getIntegrationStatus } from "@/lib/env";

export async function GET() {
  const status = getIntegrationStatus();

  return noStoreJson({
    ok: true,
    integrations: {
      supabase: status.supabase,
      stripe: status.stripe,
      openai: status.openai
    }
  });
}
