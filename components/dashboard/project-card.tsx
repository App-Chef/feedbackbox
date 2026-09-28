import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ProjectWithCounts } from "@/lib/data";
import { pluralize } from "@/lib/utils";

export function ProjectCard({ project }: { project: ProjectWithCounts }) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-brutal-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold tracking-tight">{project.name}</h3>
        <ArrowUpRight
          className="size-4 text-muted-fg transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
          aria-hidden="true"
        />
      </div>
      {project.description && <p className="mt-1 line-clamp-2 text-sm text-muted-fg">{project.description}</p>}
      <div className="mt-6 flex items-center gap-4 text-sm">
        <span className="text-muted-fg">{pluralize(project.counts.total, "piece", "pieces")} of feedback</span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-medium">
          <span
            aria-hidden="true"
            className={project.counts.open > 0 ? "size-2 rounded-full bg-accent" : "size-2 rounded-full bg-line-soft"}
          />
          {project.counts.open} open
        </span>
      </div>
    </Link>
  );
}
