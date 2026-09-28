import { notFound } from "next/navigation";
import { PageContainer } from "@/components/dashboard/page-header";
import { ProjectTabs } from "@/components/dashboard/project-tabs";
import { getProject } from "@/lib/data";

export default async function ProjectLayout({ params, children }: LayoutProps<"/dashboard/projects/[projectId]">) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h1>
        {project.description && <p className="mt-1 text-sm text-muted-fg">{project.description}</p>}
      </div>
      <ProjectTabs projectId={project.id} />
      <div className="pt-8">{children}</div>
    </PageContainer>
  );
}
