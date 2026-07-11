import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — TrendRadar AI"
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 5, 2026">
      <p>
        This Privacy Policy explains what information TrendRadar AI, operated by Ethan Hung of
        Victoria, Australia (&quot;we&quot;, &quot;us&quot;), collects, how we use it, and the choices you have.
      </p>

      <LegalSection title="1. Information we collect">
        <p>
          <span className="font-bold">Account information:</span> email address and authentication data, handled via
          Supabase.
          <br />
          <span className="font-bold">Billing information:</span> subscription plan and status. Card numbers are
          entered directly into Stripe&apos;s hosted checkout — we never see or store your full card number.
          <br />
          <span className="font-bold">Usage data:</span> questions you ask the AI consultant, saved products/research
          boards, and general product-analytics events (signups, checkout starts, subscription changes) used to
          understand how the Service is used.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>
          To provide and operate the Service, process payments, respond to support requests, improve the product, and
          detect abuse. We do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection title="3. Third parties we share data with">
        <p>
          <span className="font-bold">Supabase</span> — authentication and database hosting.
          <br />
          <span className="font-bold">Stripe</span> — payment processing and subscription billing.
          <br />
          <span className="font-bold">Anthropic (Claude) and/or OpenAI</span> — when AI-generated commentary is
          enabled, the text of your question and relevant product data may be sent to these providers to generate a
          response, subject to their own privacy and data-use terms.
          <br />
          <span className="font-bold">CJ Dropshipping</span> — we query their public product catalog; we do not send
          your personal information to them.
          <br />
          We share only what&apos;s needed for each provider to perform its function, and don&apos;t sell data to
          advertisers or data brokers.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies and local storage">
        <p>
          We use essential cookies/local storage needed for login sessions and basic app functionality. We don&apos;t
          currently use third-party advertising trackers.
        </p>
      </LegalSection>

      <LegalSection title="5. Data retention">
        <p>
          We retain account and usage data for as long as your account is active, plus a reasonable period afterward
          for legal, tax, and dispute-resolution purposes. You can request deletion at any time (see Section 7).
        </p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>
          We use industry-standard practices (encrypted connections, access-controlled databases, secret-gated admin
          tools) to protect your data, but no method of transmission or storage is 100% secure.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          You can access, correct, or request deletion of your personal data by emailing{" "}
          <a href="mailto:ethanhung0@gmail.com" className="font-bold underline">ethanhung0@gmail.com</a>. Depending on
          where you live, you may have additional rights under laws like the GDPR or CCPA, including the right to
          data portability and to object to certain processing.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's privacy">
        <p>The Service is not directed at anyone under 18, and we do not knowingly collect data from children.</p>
      </LegalSection>

      <LegalSection title="9. Changes to this policy">
        <p>We may update this Privacy Policy from time to time; material changes will update the date above.</p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about this policy? Contact{" "}
          <a href="mailto:ethanhung0@gmail.com" className="font-bold underline">ethanhung0@gmail.com</a>.
        </p>
      </LegalSection>

      <p className="rounded-md bg-coral/10 p-4 text-xs leading-6 text-ink/70 dark:bg-coral/15 dark:text-paper/70">
        This is a template reflecting TrendRadar AI&apos;s actual current data flows (Supabase, Stripe, CJ
        Dropshipping, and optionally Claude/OpenAI). Have it reviewed by a licensed attorney before relying on it
        commercially, particularly if you plan to serve users in the EU/UK (GDPR) or California (CCPA), which may
        require additional specific disclosures.
      </p>
    </LegalLayout>
  );
}
