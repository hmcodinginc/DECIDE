import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { LegalPage } from "@/components/legal/LegalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BRAND } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { contactSchema } from "@/lib/validation/contact";
import { splitFullName } from "@/lib/validation/auth";
import { sendContactQuery } from "@/services/contact/contact-service";

function ContactPage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [gmailUrl, setGmailUrl] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!user) return;
    const names = splitFullName(user.displayName);
    setFirstName((current) => current || names.firstName);
    setLastName((current) => current || names.lastName);
    setEmail((current) => current || user.email || "");
  }, [user]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (honeypot) {
      setOpened(true);
      return;
    }
    const parsed = contactSchema.safeParse({ firstName, lastName, email, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }
    setError(null);
    const result = sendContactQuery(parsed.data);
    setGmailUrl(result.url);
    setOpened(result.opened);
  };

  return (
    <LegalPage
      eyebrow="Contact"
      title="Tell us what you need"
      description="Billing, product, or legal — write once. We reply from the same inbox."
    >
      <div className="rounded-3xl border border-white/8 bg-white/3 p-5 sm:p-8">
        {gmailUrl ? (
          <div>
            <p className="font-display text-2xl text-foreground">
              {opened ? "Gmail is open." : "Gmail didn’t pop up."}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your message is addressed to {BRAND.contactEmail}. Click Send in Gmail.
              We&apos;ll reply to {email || "the email you entered"}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href={gmailUrl} target="_blank" rel="noreferrer">
                  Open Gmail
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGmailUrl(null);
                  setOpened(false);
                  setMessage("");
                }}
              >
                Edit message
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contact-first">First name</Label>
                <Input
                  id="contact-first"
                  className="mt-2"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact-last">Last name</Label>
                <Input
                  id="contact-last"
                  className="mt-2"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                className="mt-2"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {user?.email ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Filled from your DECIDE account. You can edit it.
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="contact-message">Your query</Label>
              <Textarea
                id="contact-message"
                className="mt-2 min-h-36"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What should we look at?"
              />
            </div>
            <div className="sr-only" aria-hidden>
              <label htmlFor="contact-company">Company</label>
              <input
                id="contact-company"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button type="submit">Send with Gmail</Button>
          </form>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Direct email:{" "}
        <a href={`mailto:${BRAND.contactEmail}`} className="link-hover text-foreground">
          {BRAND.contactEmail}
        </a>
        . Also see{" "}
        <Link to={ROUTES.terms} className="link-hover text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link to={ROUTES.privacy} className="link-hover text-foreground">
          Privacy
        </Link>
        .
      </p>
    </LegalPage>
  );
}

export { ContactPage };
