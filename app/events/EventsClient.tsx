"use client";
import { useMemo, useState } from 'react';
import EventCard from '@/components/events/event-card';

function toEpoch(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatEventDate(value: string | null | undefined): string | null {
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

export default function EventsClient({ allEvents }: { allEvents: any[] }) {
  const now = Date.now();
  // Memoize filtered lists
  const upcomingEvents = useMemo(() =>
    allEvents.filter((event) => {
      const endEpoch = toEpoch(event.endDate || event.date);
      return endEpoch === null || endEpoch >= now;
    }), [allEvents, now]
  );
  const pastHighlights = useMemo(() =>
    allEvents.filter((event) => {
      const endEpoch = toEpoch(event.endDate || event.date);
      return endEpoch !== null && endEpoch < now;
    }), [allEvents, now]
  );

  // Limit number of items rendered at once
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const UPCOMING_LIMIT = 6;
  const PAST_LIMIT = 6;
  const displayedUpcoming = showAllUpcoming ? upcomingEvents : upcomingEvents.slice(0, UPCOMING_LIMIT);
  const displayedPast = showAllPast ? pastHighlights : pastHighlights.slice(0, PAST_LIMIT);

  return (
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
            {displayedUpcoming.length ? (
              displayedUpcoming.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  date={formatEventDate(event.startDate || event.date)}
                />
              ))
            ) : (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                No upcoming events right now. Check back soon.
              </div>
            )}
          </div>
          {upcomingEvents.length > UPCOMING_LIMIT && !showAllUpcoming && (
            <div className="flex justify-center mt-6">
              <button className="rounded-full bg-blue-600 text-white px-6 py-2 font-semibold shadow hover:bg-blue-700 transition" onClick={() => setShowAllUpcoming(true)}>
                Show More
              </button>
            </div>
          )}
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

          {displayedPast.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {displayedPast.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  date={formatEventDate(event.startDate || event.date)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
              Past highlights will appear here once events conclude.
            </div>
          )}
          {pastHighlights.length > PAST_LIMIT && !showAllPast && (
            <div className="flex justify-center mt-6">
              <button className="rounded-full bg-blue-600 text-white px-6 py-2 font-semibold shadow hover:bg-blue-700 transition" onClick={() => setShowAllPast(true)}>
                Show More
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}