import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/auth-forms";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free Feedbackbox account. Start collecting user feedback in minutes with our lightweight feedback widget.",
  openGraph: {
    title: "Sign up for Feedbackbox",
    description: "Create your free account and start collecting user feedback in minutes.",
  },
};

export default function SignUpPage() {
  return <SignUpForm googleEnabled={env.googleAuthEnabled} />;
}
