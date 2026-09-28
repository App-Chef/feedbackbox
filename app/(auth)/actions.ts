"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";
import { credentialsSchema, emailSchema, passwordSchema } from "@/lib/validation/auth";

export type AuthState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back so the form keeps what the user typed (React resets forms after actions). */
  email?: string;
};

const typedEmail = (formData: FormData) => String(formData.get("email") ?? "").slice(0, 254);

const callbackUrl = (next: string) => `${env.appUrl}/auth/callback?next=${encodeURIComponent(next)}`;

function firstErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0])] ??= i.message;
  return out;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = typedEmail(formData);
  const parsed = credentialsSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { email, fieldErrors: firstErrors(parsed.error.issues) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") return { email, error: "Please confirm your email first. Check your inbox." };
    return { email, error: "That email and password don't match." };
  }

  redirect(safeRedirectPath(formData.get("next") as string | null));
}

export async function signInWithMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = typedEmail(formData);
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { email, fieldErrors: { email: parsed.error.issues[0].message } };

  const supabase = await createClient();
  const next = safeRedirectPath(formData.get("next") as string | null);
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: callbackUrl(next) },
  });
  if (error) {
    return {
      email,
      error: error.status === 429 ? "Too many requests. Please wait a minute." : "We couldn't send the link. Please try again.",
    };
  }
  return { message: `We sent a sign-in link to ${parsed.data}.` };
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = typedEmail(formData);
  const parsed = credentialsSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { email, fieldErrors: firstErrors(parsed.error.issues) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: callbackUrl("/dashboard") },
  });
  if (error) {
    if (error.code === "weak_password") return { email, fieldErrors: { password: "That password is too weak. Try a longer one." } };
    if (error.code === "user_already_exists") return { email, error: "An account with this email already exists. Try signing in." };
    return { email, error: "We couldn't create your account. Please try again." };
  }

  // Email confirmation disabled: the user is signed in right away.
  if (data.session) redirect("/dashboard");
  return { message: `Almost there! We sent a confirmation link to ${parsed.data.email}.` };
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient();
  const next = safeRedirectPath(formData.get("next") as string | null);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = typedEmail(formData);
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { email, fieldErrors: { email: parsed.error.issues[0].message } };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: callbackUrl("/reset-password") });
  // Same answer whether or not the account exists.
  return { message: `If an account exists for ${parsed.data}, a reset link is on its way.` };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) return { fieldErrors: { password: parsed.error.issues[0].message } };
  if (formData.get("password") !== formData.get("confirm")) {
    return { fieldErrors: { confirm: "Passwords don't match." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Choose a different password from your current one." } };
    return { error: "We couldn't update your password. The link may have expired." };
  }
  return { message: "Password updated." };
}
