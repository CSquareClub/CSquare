import Link from "next/link";

import { DeleteEventButton } from "@/app/admin/(dashboard)/events/_components/delete-event-button";
import { PublishEventButton } from "@/app/admin/(dashboard)/events/_components/publish-event-button";
import { Button } from "@/components/ui/button";
import { listAdminEventsFromDb } from "@/lib/event-service";

function formatDate(date: Date): string {
  return date.toLocaleString();
}

export default async function AdminEventsPage() {
  const events = await listAdminEventsFromDb();
  const publishedCount = events.filter((event) => event.status === "published").length;
  const draftCount = events.length - publishedCount;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage draft/published events with external registration links.</p>
          </div>
          <Button asChild>
            <Link href="/admin/events/create">Create Event</Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-semibold">{events.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Published</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">{publishedCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Drafts</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">{draftCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-lg font-semibold">All Events</h2>
        </div>

        {events.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => (
                <div key={event.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.category} • {event.eventType} •
                      <span className={event.status === "published" ? "text-green-600" : "text-amber-600"}>
                        {" "}
                        {event.status === "published" ? "published" : "draft"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Starts: {formatDate(event.startDateTime)}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">Public URL: /events/{event.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 md:pt-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/events/${event.id}`}>Edit</Link>
                    </Button>
                    <PublishEventButton eventId={event.id} currentStatus={event.status as "draft" | "published"} />
                    <DeleteEventButton eventId={event.id} eventSlug={event.slug} eventTitle={event.title} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
