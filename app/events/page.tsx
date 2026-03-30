import Link from "next/link";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GridBackground from "@/components/grid-background";
import { Button } from "@/components/ui/button";
import { listPublishedEventsFromDb } from "@/lib/event-service";

function formatDate(value: Date): string {
  return value.toLocaleString();
}

export default async function EventsPage() {
  const events = await listPublishedEventsFromDb();

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10 py-16 md:py-20">
        <section className="mb-12">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/70">
              Events
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Upcoming & Live Events</h1>
            <p className="text-lg text-foreground/65">
              Explore club events and register via external links.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {events.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                No published events right now.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <article key={event.id} className="rounded-xl border border-border bg-card/70 p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-primary/80">{event.category}</p>
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    {event.tagline ? <p className="mt-2 text-sm text-foreground/70">{event.tagline}</p> : null}
                    <p className="mt-3 text-sm text-foreground/65">{event.description}</p>
                    <p className="mt-4 text-xs text-foreground/60">{formatDate(event.startDateTime)}</p>
                    <div className="mt-5 flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/events/${event.slug}`}>View Details</Link>
                      </Button>
                      <Button asChild size="sm">
                        <a href={event.registrationLink} target="_blank" rel="noreferrer">
                          Register Now
                        </a>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
