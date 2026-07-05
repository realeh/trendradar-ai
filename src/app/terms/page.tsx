import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — TrendRadar AI"
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="July 5, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to and use of TrendRadar AI (the &quot;Service&quot;),
        operated by [Your Business Legal Name — to be added once your business entity is registered] (&quot;we&quot;,
        &quot;us&quot;). By creating an account or using the Service, you agree to these Terms.
      </p>

      <LegalSection title="1. What the Service is">
        <p>
          TrendRadar AI is a research and analysis tool for ecommerce and dropshipping operators. It surfaces product
          data sourced from third-party suppliers (currently CJ Dropshipping) and generates scoring, forecasts, and
          recommendations using rules-based analysis and, where configured, third-party AI models (such as Anthropic
          Claude or OpenAI).
        </p>
      </LegalSection>

      <LegalSection title="2. No guarantee of business results">
        <p>
          TrendRadar AI provides research and decision-support information only. Trend scores, launch scores, profit
          margin estimates, forecasts, and AI-generated recommendations are informational, may be wrong, and are not a
          promise or guarantee of sales, profit, or business success. You are solely responsible for evaluating any
          product, market, or supplier before acting on it, including verifying pricing, inventory, shipping times,
          and legal compliance directly with the supplier.
        </p>
      </LegalSection>

      <LegalSection title="3. Third-party data and AI output">
        <p>
          Product data (pricing, inventory, listing counts, delivery estimates) comes from CJ Dropshipping&apos;s public
          catalog and may change or be inaccurate at any time; we do not control or guarantee it. Where AI-generated
          commentary is shown, it is disclosed as such, and it may be incomplete, generic, or incorrect. Always verify
          independently before making purchasing, sourcing, or advertising decisions.
        </p>
      </LegalSection>

      <LegalSection title="4. Accounts">
        <p>
          You must provide accurate information when creating an account and are responsible for activity under your
          account and for keeping your credentials secure. You must be at least 18 years old to use the Service.
        </p>
      </LegalSection>

      <LegalSection title="5. Subscriptions and billing">
        <p>
          Paid plans are billed monthly in advance through Stripe. By subscribing, you authorize recurring charges to
          your payment method until you cancel. You can cancel anytime from your account; cancellation stops future
          renewals but does not refund the current billing period except as described in our{" "}
          <a href="/refund-policy" className="font-bold underline">Refund Policy</a>. We may change prices with
          advance notice; continued use after a price change takes effect means you accept the new price.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>
          Don&apos;t use the Service to violate any law, scrape or resell the Service&apos;s data at scale outside normal
          product use, attempt to bypass access controls, or interfere with the Service&apos;s operation or security.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          We own the Service, its software, and its branding. You own the content you input. Underlying supplier
          product data belongs to its respective source and is used under license/permitted access from that source.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers and limitation of liability">
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind, express or implied, including
          accuracy, availability, or fitness for a particular purpose. To the maximum extent permitted by law, we are
          not liable for indirect, incidental, or consequential damages, or for any lost profits or business losses
          arising from your use of, or reliance on, the Service.
        </p>
      </LegalSection>

      <LegalSection title="9. Termination">
        <p>
          We may suspend or terminate access for violation of these Terms. You may stop using the Service and cancel
          your subscription at any time.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to these Terms">
        <p>
          We may update these Terms from time to time. Material changes will be reflected by an updated &quot;Last
          updated&quot; date on this page.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing law">
        <p>These Terms are governed by the laws of [Your State/Country — to be finalized with your business registration], without regard to conflict-of-law principles.</p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:ethanhung0@gmail.com" className="font-bold underline">ethanhung0@gmail.com</a>.
        </p>
      </LegalSection>

      <p className="rounded-md bg-coral/10 p-4 text-xs leading-6 text-ink/70 dark:bg-coral/15 dark:text-paper/70">
        This is a template drafted for TrendRadar AI&apos;s actual business model and should be reviewed by a
        licensed attorney in your jurisdiction before you rely on it commercially, especially the liability,
        governing-law, and refund sections. Bracketed placeholders should be filled in once your business entity is
        registered.
      </p>
    </LegalLayout>
  );
}
