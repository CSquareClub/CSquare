import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listAdminEventsFromDb } from "@/lib/event-service";
import { setEventStatusAction } from "@/app/admin/(dashboard)/events/actions";

function formatDate(date: Date): string {
  return date.toLocaleString();
}

export default async function AdminEventsPage() {
  const events = await listAdminEventsFromDb();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage draft/published events with external registration links.</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">Create Event</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-lg font-semibold">All Events</h2>
        </div>

        {events.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => {
              const nextStatus = event.status === "published" ? "draft" : "published";
              const actionLabel = event.status === "published" ? "Unpublish" : "Publish";

              return (
                <div key={event.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.category} • {event.eventType} • {event.status}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Starts: {formatDate(event.startDateTime)}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">/events/{event.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/events/${event.id}`}>Edit</Link>
                    </Button>
                    <form action={setEventStatusAction.bind(null, event.id, nextStatus)}>
                      <Button type="submit" size="sm" variant={event.status === "published" ? "secondary" : "default"}>
                        {actionLabel}
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
