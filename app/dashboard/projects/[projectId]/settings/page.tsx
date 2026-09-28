import { notFound } from "next/navigation";
import { DeleteProjectSection, ProjectDetailsForm, WidgetSettingsForm } from "@/components/dashboard/project-settings";
import { DEFAULT_WIDGET_CONFIG } from "@/lib/constants";
import { getProject } from "@/lib/data";
import { widgetConfigSchema } from "@/lib/validation/project";

export const metadata = { title: "Project settings" };

export default async function ProjectSettingsPage({ params }: PageProps<"/dashboard/projects/[projectId]/settings">) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  const parsed = widgetConfigSchema.safeParse({ ...DEFAULT_WIDGET_CONFIG, ...(project.widget_config as object) });
  const config = parsed.success ? parsed.data : DEFAULT_WIDGET_CONFIG;

  return (
    <div className="space-y-10">
      <ProjectDetailsForm project={project} />
      <WidgetSettingsForm projectId={project.id} config={config} />
      <DeleteProjectSection project={project} />
    </div>
  );
}
