"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEventStatusAction } from "@/app/admin/(dashboard)/events/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type PublishEventButtonProps = {
  eventId: string;
  currentStatus: "draft" | "published";
};

export function PublishEventButton({ eventId, currentStatus }: PublishEventButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const nextStatus = currentStatus === "published" ? "draft" : "published";
  const label = currentStatus === "published" ? "Unpublish" : "Publish";

  function handleToggle() {
    startTransition(async () => {
      try {
        const result = await setEventStatusAction(eventId, nextStatus);
        if (!result.ok) {
          toast({
            title: `Failed to ${nextStatus}`,
            description: result.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: `Event ${nextStatus === "published" ? "published" : "set to draft"}`,
            description: result.message,
          });
          router.refresh();
        }
      } catch (err) {
        toast({
          title: `Failed to ${nextStatus}`,
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
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
