import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const GITHUB_URL = "https://github.com/App-Chef/feedbackbox";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <a href={GITHUB_URL} className="hidden rounded-lg px-3 py-2 text-sm text-muted-fg hover:text-fg sm:inline-block">
            GitHub
          </a>
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-muted-fg hover:text-fg">
            Sign in
          </Link>
          <ButtonLink href="/signup" size="sm">
            Get started
          </ButtonLink>
        </nav>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line-soft">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted-fg sm:flex-row sm:justify-between sm:px-8">
          <p>Feedbackbox — small, fast, open source.</p>
          <p className="flex gap-4">
            <a href={GITHUB_URL} className="hover:text-fg">
              GitHub
            </a>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} className="hover:text-fg">
              MIT License
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
