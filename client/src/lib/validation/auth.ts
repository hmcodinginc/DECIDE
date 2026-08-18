import { z } from "zod";

export const firstNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your first name.")
  .max(40, "First name is too long.");

export const lastNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your last name.")
  .max(40, "Last name is too long.");

export function toFullName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
}
