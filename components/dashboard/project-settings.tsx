"use client";

import { MessageSquare } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { deleteProject, updateProject, updateWidgetConfig, type ActionState } from "@/app/dashboard/actions";
import { Alert } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import type { WidgetConfig } from "@/lib/validation/project";
import { cn } from "@/lib/utils";

function useSavedToast(state: ActionState, message: string) {
  const toast = useToast();
  useEffect(() => {
    if (state.ok) toast(message);
  }, [state, message, toast]);
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-line-soft pb-10 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-fg">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function ProjectDetailsForm({ project }: { project: { id: string; name: string; description: string | null } }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProject.bind(null, project.id), {});
  useSavedToast(state, "Project updated");

  return (
    <Section title="Project" description="Only you can see this.">
      <Form action={action} className="space-y-4">
        <Field label="Project name" error={state.fieldErrors?.name}>
          {(p) => <Input {...p} name="name" defaultValue={state.values?.name ?? project.name} required maxLength={80} />}
        </Field>
        <Field label="Description" optional error={state.fieldErrors?.description}>
          {(p) => <Textarea {...p} name="description" defaultValue={state.values?.description ?? project.description ?? ""} maxLength={500} rows={2} className="min-h-0" />}
        </Field>
        {state.error && <Alert>{state.error}</Alert>}
        <Button type="submit" variant="secondary" loading={pending}>
          Save project
        </Button>
      </Form>
    </Section>
  );
}

export function WidgetSettingsForm({ projectId, config }: { projectId: string; config: WidgetConfig }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateWidgetConfig.bind(null, projectId), {});
  const [preview, setPreview] = useState(config);
  useSavedToast(state, "Widget settings saved");

  return (
    <Section title="Widget" description="How the feedback button looks on your site.">
      <Form action={action} className="space-y-5">
        <Field label="Button label" error={state.fieldErrors?.buttonLabel}>
          {(p) => (
            <Input
              {...p}
              name="buttonLabel"
              defaultValue={state.values?.buttonLabel ?? config.buttonLabel}
              maxLength={24}
              required
              onChange={(e) => setPreview((c) => ({ ...c, buttonLabel: e.target.value }))}
            />
          )}
        </Field>

        <Field label="Accent color" error={state.fieldErrors?.accentColor}>
          {(p) => (
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick accent color"
                value={/^#[0-9a-f]{6}$/i.test(preview.accentColor) ? preview.accentColor : "#ff5a1f"}
                onChange={(e) => setPreview((c) => ({ ...c, accentColor: e.target.value }))}
                className="size-10 shrink-0 cursor-pointer rounded-[10px] border border-line-soft bg-surface p-1"
              />
              <Input
                {...p}
                name="accentColor"
                value={preview.accentColor}
                onChange={(e) => setPreview((c) => ({ ...c, accentColor: e.target.value }))}
                maxLength={7}
                className="font-mono"
                required
              />
            </div>
          )}
        </Field>

        <fieldset>
          <legend className="text-sm font-medium">Position</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["bottom-left", "bottom-right"] as const).map((pos) => (
              <label
                key={pos}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm transition-colors duration-150",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                  preview.position === pos ? "border-line bg-muted font-medium" : "border-line-soft hover:border-muted-fg",
                )}
              >
                <input
                  type="radio"
                  name="position"
                  value={pos}
                  checked={preview.position === pos}
                  onChange={() => setPreview((c) => ({ ...c, position: pos }))}
                  className="accent-[var(--fg)]"
                />
                {pos === "bottom-left" ? "Bottom left" : "Bottom right"}
              </label>
            ))}
          </div>
        </fieldset>

        <WidgetPreview config={preview} />

        {state.error && <Alert>{state.error}</Alert>}
        <Button type="submit" variant="secondary" loading={pending}>
          Save widget settings
        </Button>
      </Form>
    </Section>
  );
}

function WidgetPreview({ config }: { config: WidgetConfig }) {
  const valid = /^#[0-9a-f]{6}$/i.test(config.accentColor);
  return (
    <div aria-label="Preview" role="img" className="relative h-36 overflow-hidden rounded-xl border border-dashed border-line-soft bg-bg">
      <div className="space-y-2 p-4" aria-hidden="true">
        <div className="h-2.5 w-1/3 rounded bg-muted" />
        <div className="h-2.5 w-2/3 rounded bg-muted" />
        <div className="h-2.5 w-1/2 rounded bg-muted" />
      </div>
      <span
        className={cn(
          "absolute bottom-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-[#0f0f0f] shadow-brutal-sm transition-all duration-200 ease-out",
          config.position === "bottom-left" ? "left-4" : "right-4",
        )}
        style={{ background: valid ? config.accentColor : "#ff5a1f" }}
      >
        <MessageSquare className="size-4" aria-hidden="true" />
        {config.buttonLabel || "Feedback"}
      </span>
    </div>
  );
}

export function DeleteProjectSection({ project }: { project: { id: string; name: string } }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <Section title="Delete project" description="Removes the project and all of its feedback.">
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Delete ${project.name}?`}
        description="All feedback will be deleted and the widget will stop working. This can't be undone."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const result = await deleteProject(project.id);
              if (result?.error) toast(result.error, "error");
            });
          }}
          className="space-y-4"
        >
          <Field label={`Type "${project.name}" to confirm`}>
            {(p) => <Input {...p} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" autoFocus />}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={pending} disabled={confirm !== project.name}>
              Delete forever
            </Button>
          </div>
        </form>
      </Dialog>
    </Section>
  );
}
