"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { statusSchema } from "@/lib/validation/feedback";
import { projectSchema, widgetConfigSchema } from "@/lib/validation/project";
import type { FeedbackStatus } from "@/lib/constants";

// All mutations run as the signed-in user, so Row Level Security decides
// what they can touch. Validation here is for friendly error messages.

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

async function getUserClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { supabase, user } = await getUserClient();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data, error } = await supabase
    .from("projects")
    .insert({ name: parsed.data.name, description: parsed.data.description })
    .select("id")
    .single();

  if (error || !data) return { error: "We couldn't create the project. Please try again." };

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/projects/${data.id}/install?new=1`);
}

export async function updateProject(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { supabase } = await getUserClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ name: parsed.data.name, description: parsed.data.description })
    .eq("id", projectId)
    .select("id");

  if (error || !data?.length) return { error: "We couldn't update the project. Please try again." };

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function updateWidgetConfig(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = widgetConfigSchema.safeParse({
    buttonLabel: formData.get("buttonLabel"),
    accentColor: formData.get("accentColor"),
    position: formData.get("position"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { supabase } = await getUserClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ widget_config: parsed.data })
    .eq("id", projectId)
    .select("id");

  if (error || !data?.length) return { error: "We couldn't save the widget settings. Please try again." };

  revalidatePath(`/dashboard/projects/${projectId}`, "layout");
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<ActionState> {
  const { supabase } = await getUserClient();
  const { data, error } = await supabase.from("projects").delete().eq("id", projectId).select("id");
  if (error || !data?.length) return { error: "We couldn't delete the project. Please try again." };

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/projects");
}

export async function updateFeedbackStatus(feedbackId: string, status: FeedbackStatus): Promise<ActionState> {
  if (!z.uuid().safeParse(feedbackId).success || !statusSchema.safeParse(status).success) {
    return { error: "Invalid status change." };
  }

  const { supabase } = await getUserClient();
  const { data, error } = await supabase
    .from("feedback")
    .update({ status })
    .eq("id", feedbackId)
    .select("project_id");

  if (error || !data?.length) return { error: "We couldn't update the status. Please try again." };

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteFeedback(feedbackId: string, projectId: string): Promise<ActionState> {
  const { supabase } = await getUserClient();
  const { data, error } = await supabase.from("feedback").delete().eq("id", feedbackId).select("id");
  if (error || !data?.length) return { error: "We couldn't delete this feedback. Please try again." };

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/projects/${projectId}`);
}
