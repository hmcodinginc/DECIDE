import { Link } from "react-router";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/config/routes";

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      description={`Last updated 20 August 2026. These terms are between you and ${BRAND.operator}, the operator of ${BRAND.name} (${BRAND.url}).`}
    >
      <LegalSection title="1. The service">
        <p>
          DECIDE is a decision-support product. You give it options, priorities, and
          constraints. It scores what you provided and returns a recommendation, reasons,
          and trade-offs.
        </p>
        <p>
          DECIDE is not a lawyer, doctor, financial adviser, career counsellor, or
          licensed professional. Recommendations are not professional advice and are not
          a guarantee that a choice will work out in the real world.
        </p>
      </LegalSection>

      <LegalSection title="2. Who can use it">
        <p>
          You must be able to form a binding contract under the laws of India. Paid
          plans are for users 18 or older. If you create an account, you are responsible
          for the email and password you use, and for activity on that account.
        </p>
      </LegalSection>

      <LegalSection title="3. What you provide">
        <p>
          You may add names, notes, prices, links, ratings, and other details. DECIDE
          works from what you enter. If an optional product link cannot be read, you
          are expected to type the details yourself. Do not submit content you do not
          have the right to use, and do not submit unlawful, harmful, or infringing
          material.
        </p>
        <p>
          You keep rights in the decision content you create. You grant {BRAND.operator}{" "}
          a limited licence to host, process, and display that content so the product
          can work for you (save, score, show history).
        </p>
      </LegalSection>

      <LegalSection title="4. Accounts, guests, and limits">
        <p>
          You can try DECIDE without an account, subject to guest limits. Free accounts
          include a lifetime cap of decision analyses as shown on the{" "}
          <Link to={ROUTES.pricing} className="link-hover text-foreground">
            pricing page
          </Link>
          . We may change Free limits with notice on that page. Paid plans unlock the
          entitlements listed at checkout.
        </p>
      </LegalSection>

      <LegalSection title="5. Billing">
        <p>
          Paid subscriptions are processed by Razorpay. Prices are in Indian Rupees.
          By starting checkout you also agree to Razorpay’s terms. Access is unlocked
          after payment is confirmed on our side — not from the checkout window alone.
        </p>
        <p>
          You can manage or cancel through DECIDE billing and Razorpay as applicable.
          Except where Indian consumer law requires otherwise, fees already charged for
          a started billing period are not refunded because you stopped using the
          product. Billing errors: email {BRAND.contactEmail}.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>
          Do not attempt to break, scrape, or overload the service; bypass plan limits;
          reverse engineer except as allowed by law; use DECIDE to harm others; or
          submit other people’s personal data without a lawful basis. We may suspend
          accounts that abuse the service or create legal risk.
        </p>
      </LegalSection>

      <LegalSection title="7. Availability and changes">
        <p>
          We aim for a reliable product but do not promise uninterrupted uptime, perfect
          page-reading, or error-free scoring. Features, plans, and these terms may
          change. Continued use after an update means you accept the new terms. Material
          changes will be reflected by the date at the top of this page.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          DECIDE, the DECIDE mark, the site design, and the software are owned by{" "}
          {BRAND.operator}. You may not copy, resell, or brand the product as your own.
          Feedback you send may be used to improve the product without an obligation to
          you.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimer">
        <p>
          THE SERVICE IS PROVIDED “AS IS”. To the fullest extent allowed by law,{" "}
          {BRAND.operator} disclaims warranties of merchantability, fitness for a
          particular purpose, and non-infringement. You remain responsible for the
          choice you actually make.
        </p>
      </LegalSection>

      <LegalSection title="10. Liability">
        <p>
          To the fullest extent allowed by law, {BRAND.operator} is not liable for
          indirect, incidental, special, or consequential loss, or for lost profits,
          data, or goodwill, arising from use of DECIDE. Our total liability for a
          claim is limited to the amount you paid us for the service in the three
          months before the claim, or ₹1,000, whichever is greater. Some jurisdictions
          do not allow certain limits; in those cases our liability is limited to the
          maximum permitted.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing law">
        <p>
          These terms are governed by the laws of India. Courts in India have exclusive
          jurisdiction, subject to any non-waivable consumer rights you have.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${BRAND.contactEmail}`} className="link-hover text-foreground">
            {BRAND.contactEmail}
          </a>{" "}
          or the{" "}
          <Link to={ROUTES.contact} className="link-hover text-foreground">
            contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export { TermsPage };
