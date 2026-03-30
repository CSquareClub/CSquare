import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import ClubDescription from '@/components/home/club-description';
import GalleryGrid from '@/components/events/gallery-grid';
import EventCard from '@/components/events/event-card';
import { listPublishedEventsFromDb } from '@/lib/event-service';
import Link from 'next/link';

function toEpoch(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatEventDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
}

function formatEventTime(startValue: Date | string | null | undefined, endValue: Date | string | null | undefined): string | null {
  if (!startValue) return null;

  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return null;

  const startLabel = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (!endValue) return startLabel;

  const end = new Date(endValue);
  if (Number.isNaN(end.getTime())) return startLabel;

  const endLabel = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${startLabel} - ${endLabel}`;
}

export default async function Home() {
  const allEvents = await listPublishedEventsFromDb();
  const now = Date.now();
  const currentEvents = allEvents
    .filter((event) => {
      const endEpoch = toEpoch(event.endDateTime || event.startDateTime);
      return endEpoch === null || endEpoch >= now;
    })
    .slice(0, 3);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />
      
      <main className="relative z-10">
        <Hero />
        <Features />
        <ClubDescription />

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Current Events</h2>
                <p className="mt-2 text-sm text-foreground/65">Happening now and coming up next.</p>
              </div>
              <Link href="/events" className="text-sm font-medium text-primary hover:underline">
                View all events
              </Link>
            </div>

            {currentEvents.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {currentEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={formatEventDate(event.startDateTime)}
                    time={formatEventTime(event.startDateTime, event.endDateTime)}
                    location={event.venueName || event.city || null}
                    attendees={null}
                    category={event.category}
                    image={event.bannerImage}
                    registrationUrl={event.registrationLink}
                    isRegistrationOpen={toEpoch(event.endDateTime) === null || (toEpoch(event.endDateTime) ?? 0) >= now}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                No current events right now. Please check back soon.
              </div>
            )}
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">C Square Moments</h2>
                <p className="mt-2 text-sm text-foreground/65">Highlights from our workshops, coding sessions, and club events.</p>
              </div>
            </div>

            <GalleryGrid />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
