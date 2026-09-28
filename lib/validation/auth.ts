import { z } from "zod";

export const emailSchema = z.email({ error: "Enter a valid email address." }).trim().toLowerCase().max(254);

export const passwordSchema = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(72, { error: "Use at most 72 characters." });

export const credentialsSchema = z.object({ email: emailSchema, password: passwordSchema });
