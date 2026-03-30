import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GridBackground from "@/components/grid-background";
import EventCard from "@/components/events/event-card";
import { listPublishedEventsFromDb } from "@/lib/event-service";
import { getDevfolioApplyLogos, parseEventSponsors } from "@/lib/event-sponsors";

export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return value.toLocaleDateString();
}

function formatTime(start: Date, end: Date): string {
  const startLabel = start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${startLabel} - ${endLabel}`;
}

export default async function EventsPage() {
  const events = await listPublishedEventsFromDb();

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10 py-16 md:py-20">
        <section className="mb-12">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/70">
              Events
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Upcoming & Live Events</h1>
            <p className="text-lg text-foreground/65">
              Explore club events and register via external links.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {events.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                No published events right now.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => {
                  const parsedSponsors = parseEventSponsors(event.sponsors);
                  const sponsorRows = parsedSponsors.map((sponsor, index) => ({
                    id: index + 1,
                    eventId: 0,
                    title: sponsor.title,
                    logoUrl: sponsor.logoUrl,
                    logoLightUrl: sponsor.logoLightUrl,
                    logoDarkUrl: sponsor.logoDarkUrl,
                    devfolioApplyLogoLightUrl: sponsor.devfolioApplyLogoLightUrl,
                    devfolioApplyLogoDarkUrl: sponsor.devfolioApplyLogoDarkUrl,
                  }));
                  const devfolioApplyLogos = getDevfolioApplyLogos(parsedSponsors);

                  return (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      slug={event.slug}
                      title={event.title}
                      description={event.description}
                      date={formatDate(event.startDateTime)}
                      time={formatTime(event.startDateTime, event.endDateTime)}
                      location={event.venueName || event.city}
                      attendees={null}
                      category={event.category}
                      image={event.bannerImage}
                      sponsors={sponsorRows}
                      sponsorTitle={sponsorRows[0]?.title || null}
                      sponsorLogoUrl={sponsorRows[0]?.logoUrl || null}
                      sponsorLogoLightUrl={sponsorRows[0]?.logoLightUrl || null}
                      sponsorLogoDarkUrl={sponsorRows[0]?.logoDarkUrl || null}
                      devfolioApplyLogoLightUrl={devfolioApplyLogos.light}
                      devfolioApplyLogoDarkUrl={devfolioApplyLogos.dark}
                      registrationUrl={event.registrationLink}
                      isRegistrationOpen={event.endDateTime > new Date()}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
