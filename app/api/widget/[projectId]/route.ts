import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_WIDGET_CONFIG } from "@/lib/constants";
import { createPublicClient } from "@/lib/supabase/admin";
import { widgetConfigSchema } from "@/lib/validation/project";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
};

/** Public appearance settings for the widget. Exposes nothing else about the project. */
export async function GET(_request: Request, ctx: RouteContext<"/api/widget/[projectId]">) {
  const { projectId } = await ctx.params;
  if (!z.uuid().safeParse(projectId).success) {
    return NextResponse.json({ error: "Unknown project." }, { status: 404, headers });
  }

  const { data, error } = await createPublicClient().rpc("get_widget_config", { p_project_id: projectId });
  if (error) {
    return NextResponse.json({ error: "Couldn't load widget." }, { status: 500, headers: { ...headers, "Cache-Control": "no-store" } });
  }
  if (!data) return NextResponse.json({ error: "Unknown project." }, { status: 404, headers });

  const parsed = widgetConfigSchema.safeParse({ ...DEFAULT_WIDGET_CONFIG, ...(data as object) });
  return NextResponse.json(parsed.success ? parsed.data : DEFAULT_WIDGET_CONFIG, { headers });
}
