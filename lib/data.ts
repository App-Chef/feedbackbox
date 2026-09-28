import "server-only";
import { cache } from "react";
import { FEEDBACK_PAGE_SIZE } from "@/lib/constants";
import { requireUser } from "@/lib/supabase/server";
import type { FeedbackCounts, Project } from "@/lib/supabase/types";
import { toSearchPattern, type FeedbackFilters } from "@/lib/validation/filters";

// Every query runs with the signed-in user's session, so RLS scopes results
// to their own projects. Functions are cached per request with React.cache.

export type ProjectWithCounts = Project & { counts: Omit<FeedbackCounts, "project_id"> };

const EMPTY_COUNTS = { total: 0, open: 0, in_progress: 0, resolved: 0, archived: 0 };

export const getProjects = cache(async (): Promise<ProjectWithCounts[]> => {
  const { supabase } = await requireUser();
  const [projects, counts] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: true }),
    supabase.from("project_feedback_counts").select("*"),
  ]);
  if (projects.error) throw new Error("Couldn't load projects.");

  const byProject = new Map((counts.data ?? []).map((c) => [c.project_id, c]));
  return (projects.data ?? []).map((p) => {
    const c = byProject.get(p.id);
    return { ...p, counts: c ? { total: c.total, open: c.open, in_progress: c.in_progress, resolved: c.resolved, archived: c.archived } : EMPTY_COUNTS };
  });
});

export const getProject = cache(async (projectId: string): Promise<ProjectWithCounts | null> => {
  const projects = await getProjects();
  return projects.find((p) => p.id === projectId) ?? null;
});

export async function getFeedbackList(projectIds: string[], filters: FeedbackFilters, limit = FEEDBACK_PAGE_SIZE) {
  const { supabase } = await requireUser();
  if (projectIds.length === 0) return [];

  let query = supabase
    .from("feedback")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.type !== "all") query = query.eq("type", filters.type);

  const pattern = toSearchPattern(filters.q);
  if (pattern) query = query.or(`message.ilike.${pattern},email.ilike.${pattern},page_url.ilike.${pattern}`);

  const { data, error } = await query;
  if (error) throw new Error("Couldn't load feedback.");
  return data;
}

export async function getFeedback(feedbackId: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("feedback").select("*").eq("id", feedbackId).maybeSingle();
  if (error) throw new Error("Couldn't load feedback.");
  return data;
}
