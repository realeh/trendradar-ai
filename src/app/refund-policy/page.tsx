import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Refund Policy — TrendRadar AI"
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund Policy" updated="July 5, 2026">
      <LegalSection title="1. Monthly subscriptions">
        <p>
          TrendRadar AI plans (Starter, Growth, Scale) are billed monthly in advance via Stripe. Your subscription
          renews automatically each month until you cancel.
        </p>
      </LegalSection>

      <LegalSection title="2. Cancelling">
        <p>
          You can cancel anytime from your account settings. Cancelling stops future renewals — you keep access
          through the end of the billing period you already paid for, and you will not be charged again after that.
        </p>
      </LegalSection>

      <LegalSection title="3. First-time subscriber guarantee">
        <p>
          If you&apos;re on your first paid subscription with us and it&apos;s within 7 days of your initial charge,
          email <a href="mailto:ethanhung0@gmail.com" className="font-bold underline">ethanhung0@gmail.com</a> and
          we&apos;ll refund that charge in full, no questions asked.
        </p>
      </LegalSection>

      <LegalSection title="4. After the first 7 days">
        <p>
          Outside the first-time guarantee window, payments for the current billing period are non-refundable —
          cancelling stops future charges but doesn&apos;t refund time already paid for. We may make exceptions at our
          discretion for billing errors (for example, being charged after you already cancelled).
        </p>
      </LegalSection>

      <LegalSection title="5. Billing errors">
        <p>
          If you believe you were charged incorrectly (duplicate charge, charged after cancellation, wrong plan
          price), contact us and we&apos;ll investigate and correct it.
        </p>
      </LegalSection>

      <LegalSection title="6. How refunds are issued">
        <p>Approved refunds are returned to the original payment method through Stripe and typically appear within 5–10 business days, depending on your bank.</p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Refund questions: <a href="mailto:ethanhung0@gmail.com" className="font-bold underline">ethanhung0@gmail.com</a>.
        </p>
      </LegalSection>

      <p className="rounded-md bg-coral/10 p-4 text-xs leading-6 text-ink/70 dark:bg-coral/15 dark:text-paper/70">
        The 7-day first-time guarantee is a suggested default — adjust it to whatever policy you actually want to
        offer before launch. Have this reviewed alongside your Terms of Service by a licensed attorney, since refund
        obligations can vary by jurisdiction (e.g. EU/UK consumer withdrawal rights).
      </p>
    </LegalLayout>
  );
}
