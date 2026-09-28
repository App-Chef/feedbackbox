import { UpdatePasswordForm } from "@/components/auth/auth-forms";
import { requireUser } from "@/lib/supabase/server";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  // The recovery link signs the user in before landing here.
  await requireUser();
  return <UpdatePasswordForm />;
}
