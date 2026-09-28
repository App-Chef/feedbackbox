import { UpdatePasswordForm } from "@/components/auth/auth-forms";
import { PageContainer, PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { requireUser } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-line-soft py-10 first:pt-0 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="font-medium">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-fg">{description}</p>}
      </div>
      <div className="max-w-md">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const { user } = await requireUser();
  const provider = user.app_metadata?.provider ?? "email";

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Your account." />
      <div className="mt-10">
        <Section title="Account">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-fg">Email</dt>
              <dd className="mt-0.5 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-fg">Signed in with</dt>
              <dd className="mt-0.5 font-medium capitalize">{provider}</dd>
            </div>
          </dl>
        </Section>
        <Section title="Password" description="Set or change the password for email sign-in.">
          <UpdatePasswordForm standalone={false} />
        </Section>
        <Section title="Appearance">
          <ThemeToggle />
        </Section>
        <Section title="Session">
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </Section>
      </div>
    </PageContainer>
  );
}
