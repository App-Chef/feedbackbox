import { SignInForm } from "@/components/auth/auth-forms";
import { env } from "@/lib/env";
import { safeRedirectPath } from "@/lib/utils";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <SignInForm
      next={typeof next === "string" ? safeRedirectPath(next) : undefined}
      googleEnabled={env.googleAuthEnabled}
      linkError={typeof error === "string" ? error : undefined}
    />
  );
}
