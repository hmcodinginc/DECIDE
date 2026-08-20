import { Link } from "react-router";
import { BrandMark } from "@/components/common/BrandMark";
import { Container } from "@/components/common/Container";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/config/routes";

const PRODUCT_LINKS = [
  { to: ROUTES.pricing, label: "Pricing" },
  { to: ROUTES.newDecision, label: "Make a Decision" },
  { to: ROUTES.login, label: "Log in" },
] as const;

const LEGAL_LINKS = [
  { to: ROUTES.about, label: "About us" },
  { to: ROUTES.contact, label: "Contact" },
  { to: ROUTES.terms, label: "Terms & Conditions" },
  { to: ROUTES.privacy, label: "Privacy Policy" },
] as const;

function SiteFooter() {
  return (
    <footer className="border-t border-white/6 py-12">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <BrandMark size="sm" />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {BRAND.tagline}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              Product
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {PRODUCT_LINKS.map((item) => (
                <Link key={item.to} to={item.to} className="link-hover w-fit">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              Legal
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {LEGAL_LINKS.map((item) => (
                <Link key={item.to} to={item.to} className="link-hover w-fit">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-white/6 pt-6 text-sm text-muted-foreground">
          © {BRAND.copyrightFrom}–present {BRAND.operator}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export { SiteFooter };
