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
