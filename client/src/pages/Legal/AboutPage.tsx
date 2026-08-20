import { Link } from "react-router";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/config/routes";

function AboutPage() {
  return (
    <LegalPage
      eyebrow="HM Coding"
      title="About us"
      description="DECIDE is built by HM Coding — a small studio making tools that close the loop instead of adding another tab."
    >
      <LegalSection title="What DECIDE is">
        <p>
          Too many options. Too many reviews. Still no choice. DECIDE takes the options
          you already have, the things you actually care about, and the constraints you
          cannot ignore — then names a winner and shows the trade-off.
        </p>
        <p>
          It is not a chatbot and not a “best of 2026” list. The recommendation is for
          you, from what you provided.
        </p>
      </LegalSection>

      <LegalSection title="Who makes it">
        <p>
          {BRAND.name} is a product of {BRAND.operator}. The DECIDE name, site, and
          software are owned by {BRAND.operator}. © {BRAND.copyrightFrom}–present{" "}
          {BRAND.operator}. All rights reserved.
        </p>
      </LegalSection>

      <LegalSection title="How to reach us">
        <p>
          Email{" "}
          <a href={`mailto:${BRAND.contactEmail}`} className="link-hover text-foreground">
            {BRAND.contactEmail}
          </a>{" "}
          or send a message on the contact page. We read support, billing, and legal
          queries there.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link to={ROUTES.contact}>Contact</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.newDecision}>Make a Decision</Link>
          </Button>
        </div>
      </LegalSection>
    </LegalPage>
  );
}

export { AboutPage };
