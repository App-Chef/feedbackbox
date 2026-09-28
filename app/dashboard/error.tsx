"use client";

import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { PageContainer } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <EmptyState
        title="Couldn't load this page."
        action={
          <Button variant="secondary" onClick={() => retry()}>
            <RotateCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        }
      >
        Something went wrong while talking to the database. Your data is safe — give it another try.
      </EmptyState>
    </PageContainer>
  );
}
