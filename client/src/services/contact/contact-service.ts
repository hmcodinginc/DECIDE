import { BRAND } from "@/config/brand";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import type { ContactInput } from "@/lib/validation/contact";

export function gmailComposeUrl(input: ContactInput) {
  const subject = `DECIDE query from ${input.firstName} ${input.lastName}`;
  const body = [
    `Name: ${input.firstName} ${input.lastName}`,
    `Email: ${input.email}`,
    "",
    input.message,
  ].join("\n");
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: BRAND.contactEmail,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function sendContactQuery(input: ContactInput) {
  const url = gmailComposeUrl(input);
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  void saveInquiry(input);
  return { url, opened: Boolean(popup) };
}

async function saveInquiry(input: ContactInput) {
  if (!supabaseUrl || !supabaseAnonKey) return;
  try {
    await fetch(`${supabaseUrl}/functions/v1/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        message: input.message,
      }),
    });
  } catch {
    /* Gmail compose is the send path; logging is optional */
  }
}
