import { z } from "zod";

export const optionInputSchema = z.object({
  name: z.string().trim().min(1, "Give this option a name.").max(80),
  description: z.string().trim().max(800).default(""),
  url: z
    .string()
    .trim()
    .max(2048, "That link is too long. Paste a shorter URL or put extra details in notes.")
    .default(""),
  notes: z.string().trim().max(1200).default(""),
  price: z.number().nonnegative().nullable().default(null),
});

export const questionSchema = z
  .string()
  .trim()
  .min(4, "Tell DECIDE what you're trying to choose.")
  .max(180);

export const constraintsSchema = z.object({
  maxBudget: z.number().positive().nullable(),
  mustHaves: z.array(z.string().trim().min(1).max(80)).max(8),
  dealBreakers: z.array(z.string().trim().min(1).max(80)).max(8),
});

export const emailSchema = z.email("Enter a valid email.");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.");

export type OptionInput = z.infer<typeof optionInputSchema>;
