import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/sidebar";
import { getProjects } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { user } = await requireUser();
  const projects = await getProjects();

  return (
    <DashboardShell
      email={user.email ?? ""}
      projects={projects.map((p) => ({ id: p.id, name: p.name, open: p.counts.open }))}
    >
      {children}
    </DashboardShell>
  );
}
