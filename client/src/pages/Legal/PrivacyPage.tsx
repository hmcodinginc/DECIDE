import { Link } from "react-router";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/config/routes";

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description={`Last updated 20 August 2026. ${BRAND.operator} (“we”) operates ${BRAND.name}. This policy explains what we collect, why, and how to reach us.`}
    >
      <LegalSection title="1. Who we are">
        <p>
          Controller: {BRAND.operator}. Contact:{" "}
          <a href={`mailto:${BRAND.contactEmail}`} className="link-hover text-foreground">
            {BRAND.contactEmail}
          </a>
          . Site: {BRAND.url}.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p>
          <span className="text-foreground">Account.</span> Email, name, and
          authentication data when you sign up. We do not require Google or other
          social login.
        </p>
        <p>
          <span className="text-foreground">Decisions.</span> Questions, options, notes,
          optional URLs, prices, ratings, priorities, and results you create. Guest
          work may stay on your device until you sign in and save.
        </p>
        <p>
          <span className="text-foreground">Billing.</span> Plan, subscription status,
          and Razorpay identifiers needed to confirm payment. Card and UPI details are
          handled by Razorpay, not stored as full payment credentials on DECIDE.
        </p>
        <p>
          <span className="text-foreground">Contact.</span> If you write to us, we
          receive your name, email, and message.
        </p>
        <p>
          <span className="text-foreground">Technical.</span> Browser storage for
          session and local drafts; basic logs needed to run and secure the app.
        </p>
      </LegalSection>

      <LegalSection title="3. Why we use it">
        <p>
          To provide the product (score options, save history, enforce plan limits),
          to authenticate you, to process subscriptions, to reply to support, and to
          keep the service secure. We do not sell your personal data.
        </p>
      </LegalSection>

      <LegalSection title="4. Optional URL lookup">
        <p>
          If you paste a product link, our servers may fetch publicly available page
          details (such as a title or price) to prefill empty fields. We do not store
          the page HTML. Sites that block this fetch simply are not read — you can
          still type the details. Do not paste links that expose private or
          authenticated pages.
        </p>
      </LegalSection>

      <LegalSection title="5. Who we share with">
        <p>
          <span className="text-foreground">Supabase</span> hosts authentication and
          data. <span className="text-foreground">Razorpay</span> processes payments.{" "}
          <span className="text-foreground">Infrastructure providers</span> that host
          the site and functions may process data as processors. We share data when
          required by law, or to protect {BRAND.operator}, you, or others from harm
          or fraud.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and local storage">
        <p>
          We use essential storage for login sessions and local decision drafts. We do
          not run advertising trackers or sell browsing profiles. Clearing site data
          may log you out and remove unsaved guest decisions on that device.
        </p>
      </LegalSection>

      <LegalSection title="7. Retention">
        <p>
          Account and saved decisions last until you delete them or close the account,
          unless a longer period is required for billing, disputes, or law. Payment
          records follow Razorpay and applicable tax rules.
        </p>
      </LegalSection>

      <LegalSection title="8. Your choices">
        <p>
          You can access and update account details in Settings, stop using the
          product, and email us to ask for a copy or deletion of personal data we hold,
          subject to legal holds. You may object to or restrict certain processing
          where the law gives you that right.
        </p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>
          DECIDE is not directed at children under 18, and we do not knowingly collect
          their data for accounts or payments.
        </p>
      </LegalSection>

      <LegalSection title="10. Security and transfers">
        <p>
          We use industry-typical safeguards (HTTPS, access controls). No method of
          transmission is perfectly secure. Processors may store data in regions they
          operate; we choose providers we believe are appropriate for this product.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We will update this page when the policy changes. The date above is the
          latest version.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Privacy questions:{" "}
          <a href={`mailto:${BRAND.contactEmail}`} className="link-hover text-foreground">
            {BRAND.contactEmail}
          </a>{" "}
          or{" "}
          <Link to={ROUTES.contact} className="link-hover text-foreground">
            contact us
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export { PrivacyPage };
