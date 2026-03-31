import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import ClubDescription from '@/components/home/club-description';
import GalleryGrid from '@/components/events/gallery-grid';
import EventCard from '@/components/events/event-card';
import { listPublicEvents } from '@/lib/events-store';
import Link from 'next/link';
const EVENT_TIMEZONE = 'Asia/Kolkata';

function toEpoch(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatEventDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Format as dd/mm/yyyy in IST
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatEventTime(startValue: Date | string | null | undefined, endValue: Date | string | null | undefined): string | null {
  if (!startValue) return null;
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return null;
  const startLabel = start.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  if (!endValue) return startLabel;
  const end = new Date(endValue);
  if (Number.isNaN(end.getTime())) return startLabel;
  // If same day, show only time range
  if (
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const endLabel = end.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startLabel} - ${endLabel}`;
  }
  // If different days, show both dates and times
  const startDate = start.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
  const endDate = end.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
  const endLabel = end.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${startLabel}, ${startDate} - ${endLabel}, ${endDate}`;
}

export default async function Home() {
  const allEvents = await listPublicEvents();
  const now = Date.now();
  const currentEvents = allEvents
    .filter((event) => {
      const endEpoch = toEpoch(event.endDate || event.date);
      return endEpoch === null || endEpoch >= now;
    })
    .slice(0, 3);
  const recentPublishedEvents = [...allEvents]
    .sort((a, b) => (toEpoch(b.startDate || b.date) ?? 0) - (toEpoch(a.startDate || a.date) ?? 0))
    .slice(0, 3);
  const homeEvents = currentEvents.length > 0 ? currentEvents : recentPublishedEvents;

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
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Published Events</h2>
                <p className="mt-2 text-sm text-foreground/65">
                  {currentEvents.length > 0 ? "Happening now and coming up next." : "Latest published events from the club."}
                </p>
              </div>
              <Link href="/events" className="text-sm font-medium text-primary hover:underline">
                View all events
              </Link>
            </div>

            {homeEvents.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {homeEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    date={formatEventDate(event.startDate || event.date)}
                    time={formatEventTime(event.startDate || event.date, event.endDate || event.startDate || event.date)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                No published events right now. Please check back soon.
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
