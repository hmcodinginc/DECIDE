import { z } from "zod";

const namePart = (label: "First name" | "Last name") =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label.toLowerCase()}.`)
    .max(40, `${label} is too long.`)
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      `${label} can contain letters only.`,
    );

export const firstNameSchema = namePart("First name");
export const lastNameSchema = namePart("Last name");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const passwordSchema = z.string().min(8, "Use at least 8 characters.");

export const signupPasswordSchema = passwordSchema
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .regex(/[^A-Za-z0-9]/, "Password must include a symbol.");

export function toFullName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
}
