"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  requestPasswordReset,
  signIn,
  signInWithGoogle,
  signInWithMagicLink,
  signUp,
  updatePassword,
  type AuthState,
} from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

function GoogleButton({ next }: { next?: string }) {
  return (
    <form action={signInWithGoogle}>
      {next && <input type="hidden" name="next" value={next} />}
      <Button type="submit" variant="secondary" className="w-full">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
        </svg>
        Continue with Google
      </Button>
    </form>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-fg" aria-hidden="true">
      <span className="h-px flex-1 bg-line-soft" />
      or
      <span className="h-px flex-1 bg-line-soft" />
    </div>
  );
}

function Status({ state }: { state: AuthState }) {
  if (state.error) return <Alert>{state.error}</Alert>;
  if (state.message) return <Alert tone="success">{state.message}</Alert>;
  return null;
}

export function SignInForm({ next, googleEnabled, linkError }: { next?: string; googleEnabled: boolean; linkError?: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  const [magicState, magicAction, magicPending] = useActionState<AuthState, FormData>(signInWithMagicLink, {});

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-fg">Collect feedback without the chaos.</p>

      {linkError && (
        <Alert className="mt-6">
          {linkError === "oauth" ? "Google sign-in didn't work. Please try again." : "That link is invalid or has expired. Please try again."}
        </Alert>
      )}

      <div className="mt-8">
        {googleEnabled && (
          <>
            <GoogleButton next={next} />
            <Divider />
          </>
        )}

        {mode === "password" ? (
          <form action={action} className="space-y-4" key="password">
            <input type="hidden" name="next" value={next ?? ""} />
            <Field label="Email" error={state.fieldErrors?.email}>
              {(p) => <Input {...p} name="email" type="email" autoComplete="email" required autoFocus />}
            </Field>
            <Field label="Password" error={state.fieldErrors?.password}>
              {(p) => <Input {...p} name="password" type="password" autoComplete="current-password" required />}
            </Field>
            <div className="-mt-1 text-right">
              <Link href="/forgot-password" className="text-xs text-muted-fg underline-offset-4 hover:text-fg hover:underline">
                Forgot password?
              </Link>
            </div>
            <Status state={state} />
            <Button type="submit" loading={pending} className="w-full">
              Sign in
            </Button>
          </form>
        ) : (
          <form action={magicAction} className="space-y-4" key="magic">
            <input type="hidden" name="next" value={next ?? ""} />
            <Field label="Email" error={magicState.fieldErrors?.email}>
              {(p) => <Input {...p} name="email" type="email" autoComplete="email" required autoFocus />}
            </Field>
            <Status state={magicState} />
            <Button type="submit" loading={magicPending} className="w-full">
              <Mail className="size-4" aria-hidden="true" />
              Email me a sign-in link
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setMode((m) => (m === "password" ? "magic" : "password"))}
          className="mt-4 w-full text-center text-sm text-muted-fg underline-offset-4 hover:text-fg hover:underline"
        >
          {mode === "password" ? "Sign in with a magic link instead" : "Sign in with a password instead"}
        </button>
      </div>

      <p className="mt-10 text-center text-sm text-muted-fg">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-fg underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-muted-fg">Start collecting feedback in two minutes.</p>

      <div className="mt-8">
        {googleEnabled && (
          <>
            <GoogleButton />
            <Divider />
          </>
        )}

        {state.message ? (
          <Alert tone="success">{state.message}</Alert>
        ) : (
          <form action={action} className="space-y-4">
            <Field label="Email" error={state.fieldErrors?.email}>
              {(p) => <Input {...p} name="email" type="email" autoComplete="email" required autoFocus />}
            </Field>
            <Field label="Password" hint="At least 8 characters." error={state.fieldErrors?.password}>
              {(p) => <Input {...p} name="password" type="password" autoComplete="new-password" minLength={8} required />}
            </Field>
            <Status state={state} />
            <Button type="submit" loading={pending} className="w-full">
              Create account
            </Button>
          </form>
        )}
      </div>

      <p className="mt-10 text-center text-sm text-muted-fg">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-fg underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-fg">We&apos;ll email you a link to choose a new one.</p>
      <div className="mt-8">
        {state.message ? (
          <Alert tone="success">{state.message}</Alert>
        ) : (
          <form action={action} className="space-y-4">
            <Field label="Email" error={state.fieldErrors?.email}>
              {(p) => <Input {...p} name="email" type="email" autoComplete="email" required autoFocus />}
            </Field>
            <Status state={state} />
            <Button type="submit" loading={pending} className="w-full">
              Send reset link
            </Button>
          </form>
        )}
      </div>
      <p className="mt-10 text-center text-sm text-muted-fg">
        <Link href="/login" className="font-medium text-fg underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export function UpdatePasswordForm({ standalone = true }: { standalone?: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});

  const form = (
    <form action={action} className="space-y-4">
      <Field label="New password" hint="At least 8 characters." error={state.fieldErrors?.password}>
        {(p) => <Input {...p} name="password" type="password" autoComplete="new-password" minLength={8} required autoFocus={standalone} />}
      </Field>
      <Field label="Confirm new password" error={state.fieldErrors?.confirm}>
        {(p) => <Input {...p} name="confirm" type="password" autoComplete="new-password" required />}
      </Field>
      <Status state={state} />
      <Button type="submit" variant={standalone ? "primary" : "secondary"} loading={pending} className={standalone ? "w-full" : undefined}>
        Update password
      </Button>
    </form>
  );

  if (!standalone) return form;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mt-1 text-sm text-muted-fg">Make it a good one.</p>
      <div className="mt-8">{form}</div>
      {state.message && (
        <ButtonLink href="/dashboard" variant="secondary" className="mt-4 w-full">
          Go to dashboard
        </ButtonLink>
      )}
    </div>
  );
}
