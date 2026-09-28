import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center px-4 py-10 sm:justify-center">
      <div className="w-full max-w-sm animate-rise">
        <Logo />
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
