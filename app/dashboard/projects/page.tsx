import { FolderPlus } from "lucide-react";
import { Suspense } from "react";
import { NewProjectButton } from "@/components/dashboard/new-project";
import { PageContainer, PageHeader } from "@/components/dashboard/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getProjects } from "@/lib/data";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <PageContainer>
      <PageHeader
        title="My projects"
        description="Each project gets its own widget and inbox."
        actions={
          <Suspense>
            <NewProjectButton />
          </Suspense>
        }
      />
      <div className="mt-8">
        {projects.length === 0 ? (
          <EmptyState icon={<FolderPlus className="size-5" aria-hidden="true" />} title="No projects yet.">
            Create a project for each website or app you want to collect feedback on.
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
