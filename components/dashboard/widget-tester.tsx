"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** Loads the real widget on this page so developers can send themselves a test. */
export function WidgetTester({ projectId, waiting }: { projectId: string; waiting: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;
    const script = document.createElement("script");
    script.src = `/widget.js?v=${Date.now()}`;
    script.async = true;
    script.dataset.project = projectId;
    document.body.appendChild(script);
    return () => {
      script.remove();
      document.querySelector(`[data-feedbackbox="${projectId}"]`)?.remove();
    };
  }, [loaded, projectId]);

  // While waiting for the first message, quietly check for it.
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [waiting, router]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-medium">Send yourself a test</h2>
        <p className="mt-0.5 text-sm text-muted-fg">
          {loaded
            ? "The widget is live in the corner of this page. Send something!"
            : "Load the real widget on this page and submit test feedback."}
        </p>
        {waiting && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm" role="status">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Waiting for your first feedback…
          </p>
        )}
      </div>
      <Button variant={loaded ? "secondary" : "primary"} onClick={() => setLoaded((l) => !l)}>
        {loaded ? "Remove test widget" : "Try the widget"}
      </Button>
    </div>
  );
}
