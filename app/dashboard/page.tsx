import { ArrowRight, Code2, Inbox, Sparkles } from "lucide-react";
import Link from "next/link";
import { NewProjectForm } from "@/components/dashboard/new-project";
import { PageContainer, PageHeader } from "@/components/dashboard/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { StatCards } from "@/components/dashboard/stat-cards";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeedbackList, getProjects } from "@/lib/data";

export default async function OverviewPage() {
  const projects = await getProjects();

  if (projects.length === 0) return <Onboarding />;

  const totals = projects.reduce(
    (acc, p) => ({
      total: acc.total + p.counts.total,
      open: acc.open + p.counts.open,
      in_progress: acc.in_progress + p.counts.in_progress,
      resolved: acc.resolved + p.counts.resolved,
    }),
    { total: 0, open: 0, in_progress: 0, resolved: 0 },
  );
  const names = new Map(projects.map((p) => [p.id, p.name]));
  const recent = await getFeedbackList(
    projects.map((p) => p.id),
    { q: "", status: "all", type: "all" },
    6,
  );

  return (
    <PageContainer>
      <PageHeader title="Overview" description="Everything your users told you, across all projects." />

      <div className="mt-8">
        <StatCards counts={totals} />
      </div>

      <section className="mt-12" aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="font-display text-lg font-semibold tracking-tight">
          Latest feedback
        </h2>
        <div className="mt-4 space-y-3">
          {recent.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-5" aria-hidden="true" />}
              title="No feedback yet."
              action={
                <ButtonLink href={`/dashboard/projects/${projects[0].id}/install`}>Install widget</ButtonLink>
              }
            >
              Install the widget on your website and your first user message will appear here.
            </EmptyState>
          ) : (
            recent.map((f) => (
              <FeedbackCard
                key={f.id}
                feedback={f}
                projectName={projects.length > 1 ? names.get(f.project_id) : undefined}
                href={`/dashboard/projects/${f.project_id}/feedback/${f.id}`}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="projects-heading">
        <div className="flex items-center justify-between">
          <h2 id="projects-heading" className="font-display text-lg font-semibold tracking-tight">
            Projects
          </h2>
          <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-muted-fg hover:text-fg">
            All projects <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {projects.slice(0, 4).map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

function Onboarding() {
  const steps = [
    { icon: Sparkles, title: "Create a project", text: "One project per website or app." },
    { icon: Code2, title: "Add the widget", text: "Paste one script tag. That's it." },
    { icon: Inbox, title: "Read feedback", text: "Messages land here, with context." },
  ];

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl py-4 sm:py-10">
        <p className="text-sm font-medium text-muted-fg">Welcome 👋</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Let&apos;s hear from your users.
        </h1>
        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-xl border border-line-soft bg-surface p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-fg">
                <Icon className="size-4 text-fg" aria-hidden="true" />
                Step {i + 1}
              </div>
              <p className="mt-2 font-medium">{title}</p>
              <p className="mt-0.5 text-sm text-muted-fg">{text}</p>
            </li>
          ))}
        </ol>
        <Card raised className="mt-8 p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">Create your first project</h2>
          <p className="mt-1 mb-5 text-sm text-muted-fg">You&apos;ll get your widget snippet right after.</p>
          <NewProjectForm autoFocus />
        </Card>
      </div>
    </PageContainer>
  );
}
