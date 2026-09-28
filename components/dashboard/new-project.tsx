"use client";

import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { createProject, type ActionState } from "@/app/dashboard/actions";
import { Alert } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";

export function NewProjectForm({ autoFocus }: { autoFocus?: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createProject, {});

  return (
    <Form action={action} className="space-y-4">
      <Field label="Project name" error={state.fieldErrors?.name}>
        {(props) => (
          <Input {...props} name="name" required maxLength={80} placeholder="My app" autoFocus={autoFocus} autoComplete="off" defaultValue={state.values?.name} />
        )}
      </Field>
      <Field label="Description" optional error={state.fieldErrors?.description}>
        {(props) => (
          <Textarea
            {...props}
            name="description"
            maxLength={500}
            rows={2}
            className="min-h-0"
            placeholder="What is it?"
            defaultValue={state.values?.description}
          />
        )}
      </Field>
      {state.error && <Alert>{state.error}</Alert>}
      <Button type="submit" loading={pending} className="w-full">
        Create project
      </Button>
    </Form>
  );
}

export function NewProjectButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(searchParams.get("new") === "1");

  function close() {
    setOpen(false);
    if (searchParams.get("new")) router.replace("/dashboard/projects", { scroll: false });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden="true" />
        New project
      </Button>
      <Dialog open={open} onClose={close} title="New project" description="You'll get a widget snippet right after.">
        <NewProjectForm autoFocus />
      </Dialog>
    </>
  );
}
