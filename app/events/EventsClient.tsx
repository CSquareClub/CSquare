'use client';

import { useMemo } from 'react';
import EventCard from '@/components/events/event-card';
import { formatEventDate, formatEventTime } from '@/lib/event-time-utils';
import type { ClubEvent } from '@/lib/events-store';

interface EventsClientProps {
  allEvents: ClubEvent[];
}

export default function EventsClient({ allEvents }: EventsClientProps) {
  const sortedEvents = useMemo(() => {
    return [...allEvents].sort((a, b) => {
      const aDate = new Date(a.startDate || a.date || 0).getTime();
      const bDate = new Date(b.startDate || b.date || 0).getTime();
      return aDate - bDate;
    });
  }, [allEvents]);

  return (
    <main className="relative z-10">
      <section className="pb-24 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All Events</h1>
            <p className="mt-2 text-foreground/65">
              {sortedEvents.length > 0
                ? `Explore ${sortedEvents.length} upcoming and past events from C Square`
                : 'No events available at the moment'}
            </p>
          </div>

          {sortedEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  date={formatEventDate(event.startDate || event.date)}
                  time={formatEventTime(event.startDate || event.date, event.endDate || event.startDate || event.date)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/60 p-12 text-center">
              <p className="text-foreground/65">No events right now. Please check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
