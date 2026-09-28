"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteFeedback } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function DeleteFeedbackButton({ feedbackId, projectId }: { feedbackId: string; projectId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden="true" />
        Delete
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Delete this feedback?" description="This can't be undone. Consider archiving it instead.">
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteFeedback(feedbackId, projectId);
                if (result?.error) toast(result.error, "error");
                else toast("Feedback deleted");
              })
            }
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}
