import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import EventsClient from './EventsClient';
import { listPublicEvents } from '@/lib/events-store';
import type { ClubEvent } from '@/lib/events-store';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
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
      <EventsClient allEvents={allEvents} />
      <Footer />
    </div>
  );
}
