"use client";

import { useTransition } from "react";
import { setEventStatusAction } from "@/app/admin/(dashboard)/events/actions";
import { Button } from "@/components/ui/button";

type PublishEventButtonProps = {
  eventId: string;
  currentStatus: "draft" | "published";
};

export function PublishEventButton({ eventId, currentStatus }: PublishEventButtonProps) {
  const [isPending, startTransition] = useTransition();
  const nextStatus = currentStatus === "published" ? "draft" : "published";
  const label = currentStatus === "published" ? "Unpublish" : "Publish";

  function handleToggle() {
    startTransition(async () => {
      try {
        const result = await setEventStatusAction(eventId, nextStatus);
        if (!result.ok) {
          window.alert(`Failed to ${nextStatus}: ${result.message}`);
        }
      } catch (err) {
        window.alert(`Failed to ${nextStatus}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    });
  }

  return (
    <Button 
      type="button" 
      size="sm" 
      variant={currentStatus === "published" ? "secondary" : "default"}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? `${label}ing...` : label}
    </Button>
  );
}
