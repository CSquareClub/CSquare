"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteEventAction } from "@/app/admin/(dashboard)/events/actions";
import { Button } from "@/components/ui/button";

type DeleteEventButtonProps = {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
};

export function DeleteEventButton({ eventId, eventSlug, eventTitle }: DeleteEventButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${eventTitle}" everywhere?\n\nThis permanently removes this event from the admin dashboard, public events pages, and linked listings. This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEventAction(eventId, eventSlug);

      if (!result.ok) {
        window.alert(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button type="button" size="sm" variant="destructive" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
