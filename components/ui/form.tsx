"use client";

import { startTransition, type ComponentProps } from "react";

/**
 * A <form> for useActionState actions that keeps what the user typed.
 * React resets uncontrolled forms after a form action runs, which would wipe
 * the email after a failed sign-in or the fields after a validation error.
 * With JavaScript disabled, `action` still works as a normal form post.
 */
export function Form({
  action,
  ...props
}: Omit<ComponentProps<"form">, "action" | "onSubmit"> & { action: (formData: FormData) => void }) {
  return (
    <form
      {...props}
      action={action}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
    />
  );
}
