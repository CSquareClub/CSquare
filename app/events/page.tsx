import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import EventsClient from './EventsClient';
import { listPublicEvents } from '@/lib/events-store';
import { isDatabaseConfigured } from '@/lib/db';
import type { ClubEvent } from '@/lib/events-store';
import DatabaseUnavailableBanner from '@/components/database-unavailable-banner';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const dbConfigured = isDatabaseConfigured();
  let allEvents: ClubEvent[] = [];

  try {
    allEvents = await listPublicEvents();
  } catch (error) {
    console.error('Failed to load events page data', error);
  }

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />
      {!dbConfigured ? <DatabaseUnavailableBanner className="pt-4" /> : null}
      <EventsClient allEvents={allEvents} />
      <Footer />
    </div>
  );
}
