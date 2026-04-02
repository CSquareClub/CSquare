import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import EventsClient from './EventsClient';
import { listPublicEvents } from '@/lib/events-store';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const allEvents = await listPublicEvents();
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />
      <EventsClient allEvents={allEvents} />
      <Footer />
    </div>
  );
}
