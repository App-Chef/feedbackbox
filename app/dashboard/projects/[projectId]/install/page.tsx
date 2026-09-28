import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SnippetTabs } from "@/components/dashboard/snippet-tabs";
import { WidgetTester } from "@/components/dashboard/widget-tester";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { getProject } from "@/lib/data";
import { env } from "@/lib/env";
import { widgetSnippets } from "@/lib/snippets";

export const metadata = { title: "Install widget" };

export default async function InstallPage({ params, searchParams }: PageProps<"/dashboard/projects/[projectId]/install">) {
  const { projectId } = await params;
  const { new: isNew } = await searchParams;
  const project = await getProject(projectId);
  if (!project) notFound();

  const hasFeedback = project.counts.total > 0;

  return (
    <div className="space-y-10">
      {isNew && (
        <Alert tone="success">
          <span className="font-medium">{project.name} is ready.</span> Add the snippet below to start collecting feedback.
        </Alert>
      )}

      <section aria-labelledby="install-heading">
        <h2 id="install-heading" className="font-display text-xl font-semibold tracking-tight">
          Add this to your website
        </h2>
        <p className="mt-1 mb-5 text-sm text-muted-fg">
          One script tag. It loads asynchronously, weighs a few kilobytes and never touches your styles.
        </p>
        <SnippetTabs snippets={widgetSnippets(env.appUrl, project.id)} />
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-fg">
          Project ID
          <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[13px] text-fg">{project.id}</code>
          <CopyButton text={project.id} />
        </div>
      </section>

      <Card className="divide-y divide-line-soft">
        {hasFeedback && (
          <div className="flex items-start gap-3 p-5 animate-rise">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--status-resolved)]" aria-hidden="true" />
            <div>
              <h2 className="font-medium">Your widget is working</h2>
              <p className="mt-0.5 text-sm text-muted-fg">
                You&apos;ve received {project.counts.total} {project.counts.total === 1 ? "message" : "messages"} so far.{" "}
                <Link href={`/dashboard/projects/${project.id}`} className="font-medium text-fg underline underline-offset-4">
                  Open inbox
                </Link>
              </p>
            </div>
          </div>
        )}
        <div className="p-5">
          <WidgetTester projectId={project.id} waiting={!hasFeedback} />
        </div>
      </Card>

      <section aria-labelledby="customize-heading" className="text-sm text-muted-fg">
        <h2 id="customize-heading" className="font-medium text-fg">
          Customize
        </h2>
        <p className="mt-1">
          Change the button label, color and position in{" "}
          <Link href={`/dashboard/projects/${project.id}/settings`} className="font-medium text-fg underline underline-offset-4">
            widget settings
          </Link>
          . Changes apply within a minute, no redeploy needed.
        </p>
      </section>
    </div>
  );
}
