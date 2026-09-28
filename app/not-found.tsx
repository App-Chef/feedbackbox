import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-10 font-display text-5xl font-semibold tracking-tight">404</h1>
      <p className="mt-2 text-muted-fg">This page doesn&apos;t exist.</p>
      <ButtonLink href="/" variant="secondary" className="mt-8">
        Go home
      </ButtonLink>
    </main>
  );
}
