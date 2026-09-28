import { SignUpForm } from "@/components/auth/auth-forms";
import { env } from "@/lib/env";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return <SignUpForm googleEnabled={env.googleAuthEnabled} />;
}
