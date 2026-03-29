import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import EventCard from '@/components/events/event-card';
import { listPublicEvents } from '@/lib/events-store';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const allEvents = await listPublicEvents();
  const now = Date.now();
  const upcomingEvents = allEvents.filter((event) => new Date(event.date).getTime() >= now);
  const pastHighlights = allEvents.filter((event) => new Date(event.date).getTime() < now);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/70">
              Events
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Learn, Build, Ship
            </h1>
            <p className="text-lg text-foreground/65">
              Join C Square events to sharpen your skills through workshops, hack nights, and real build experiences.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Upcoming Events</h2>
                <p className="mt-2 text-sm text-foreground/65">Register early to reserve your slot.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    date={new Date(event.date).toLocaleDateString()}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                  No upcoming events right now. Check back soon.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Past Highlights</h2>
                <p className="mt-2 text-sm text-foreground/65">Moments that shaped our technical community.</p>
              </div>
            </div>

            {pastHighlights.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {pastHighlights.map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    date={new Date(event.date).toLocaleDateString()}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                Past highlights will appear here once events conclude.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
