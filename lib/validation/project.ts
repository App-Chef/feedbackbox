import { z } from "zod";
import { WIDGET_POSITIONS } from "@/lib/constants";

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Give your project a name." })
    .max(80, { error: "Keep the name under 80 characters." }),
  description: z
    .string()
    .trim()
    .max(500, { error: "Keep the description under 500 characters." })
    .optional()
    .transform((v) => (v ? v : null)),
});

export const widgetConfigSchema = z.object({
  buttonLabel: z
    .string()
    .trim()
    .min(1, { error: "The button needs a label." })
    .max(24, { error: "Keep the label under 24 characters." }),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, { error: "Use a hex color like #ff5a1f." })
    .transform((v) => v.toLowerCase()),
  position: z.enum(WIDGET_POSITIONS),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;
