import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';

// Client component for interactive event lists
import EventsClient from './EventsClient';

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
// ...existing code...

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">C Square Moments</h2>
                <p className="mt-2 text-sm text-foreground/65">Captured moments from our workshops, hackathons, and community meetups.</p>
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
