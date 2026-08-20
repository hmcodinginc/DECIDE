import { z } from "zod";
import { emailSchema, firstNameSchema, lastNameSchema } from "@/lib/validation/auth";

export const contactSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  message: z
    .string()
    .trim()
    .min(12, "Tell us a little more so we can actually help.")
    .max(2000, "Keep it under 2000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
