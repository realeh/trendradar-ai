import { AppShell } from "@/components/app-shell";
import { CommerceChat } from "@/components/commerce-chat";
import { PageHeader } from "@/components/page-header";

export default function AIDiscoveryPage() {
  return (
    <AppShell>
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          eyebrow="AI Discovery"
          title="Commerce intelligence chat"
          description="Talk to TrendRadar AI like an ecommerce consultant. It interprets constraints and explains why each product fits."
        />
        <CommerceChat />
      </div>
    </AppShell>
  );
}
