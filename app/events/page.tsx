import Link from "next/link";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GridBackground from "@/components/grid-background";
import { Button } from "@/components/ui/button";
import { listPublishedEventsFromDb } from "@/lib/event-service";

export const dynamic = "force-dynamic";
export const revalidate = 60;

function formatDate(value: Date): string {
  return value.toLocaleString();
}

function splitEventsByTime<T extends { startDateTime: Date; endDateTime: Date }>(events: T[]) {
  const now = Date.now();
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const event of events) {
    if (event.endDateTime.getTime() < now) {
      past.push(event);
    } else {
      upcoming.push(event);
    }
  }

  return { upcoming, past };
}

export default async function EventsPage() {
  const events = await listPublishedEventsFromDb();
  const featuredEvents = events.slice(0, 5);
  const { upcoming, past } = splitEventsByTime(events);

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

        <section className="mb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur md:p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">Search + Filters</p>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="h-10 rounded-xl border border-border bg-background/60" />
                <div className="h-10 rounded-xl border border-border bg-background/60 md:w-60" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured Events</h2>
                <p className="mt-1 text-sm text-foreground/65">Highlighted events for quick discovery.</p>
              </div>
            </div>

            {featuredEvents.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                No featured events available yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredEvents.map((event) => (
                  <article key={event.id} className="rounded-2xl border border-border bg-card/70 p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-primary/80">{event.category}</p>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="mt-4 text-xs text-foreground/60">{formatDate(event.startDateTime)}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Upcoming Events</h2>
                <p className="mt-1 text-sm text-foreground/65">Events open for participation via external registration links.</p>
              </div>
            </div>

            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                No upcoming events right now.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((event) => (
                  <article key={event.id} className="rounded-xl border border-border bg-card/70 p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-primary/80">{event.category}</p>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    {event.tagline ? <p className="mt-2 text-sm text-foreground/70">{event.tagline}</p> : null}
                    <p className="mt-3 text-sm text-foreground/65 line-clamp-3">{event.description}</p>
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

        <section>
          <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
            <details className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur" open={false}>
              <summary className="cursor-pointer list-none text-2xl font-bold tracking-tight md:text-3xl">
                Past Events
              </summary>
              <p className="mt-1 text-sm text-foreground/65">Browse previously concluded events.</p>

              {past.length === 0 ? (
                <div className="mt-4 rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                  No past events to show yet.
                </div>
              ) : (
                <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {past.map((event) => (
                    <article key={event.id} className="rounded-xl border border-border bg-card/60 p-5">
                      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-primary/80">{event.category}</p>
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <p className="mt-3 text-sm text-foreground/65 line-clamp-3">{event.description}</p>
                      <p className="mt-4 text-xs text-foreground/60">{formatDate(event.startDateTime)}</p>
                    </article>
                  ))}
                </div>
              )}
            </details>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
