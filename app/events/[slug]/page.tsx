import Link from "next/link";
import { notFound } from "next/navigation";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GridBackground from "@/components/grid-background";
import { Button } from "@/components/ui/button";
import { getPublishedEventBySlug } from "@/lib/event-service";
import { hasDevfolioRegistrationLink, parseEventSponsors } from "@/lib/event-sponsors";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: Date): string {
  return value.toLocaleString();
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const parsedSponsors = parseEventSponsors(event.sponsors);
  const hasSponsors = parsedSponsors.length > 0;
  const registrationLabel = hasDevfolioRegistrationLink(event.registrationLink)
    ? "Apply with Devfolio"
    : "Register Now";

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Button asChild variant="outline" size="sm" className="mb-6">
            <Link href="/events">Back to Events</Link>
          </Button>

          <article className="overflow-hidden rounded-2xl border border-border bg-card/70">
            {event.bannerImage ? (
              <div className="border-b border-border bg-background/40 p-4">
                <img src={event.bannerImage} alt={event.title} className="mx-auto max-h-[420px] w-full object-contain" />
              </div>
            ) : null}

            <div className="space-y-5 p-6 md:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-primary/80">{event.category} • {event.eventType}</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{event.title}</h1>
                {event.tagline ? <p className="mt-2 text-foreground/75">{event.tagline}</p> : null}
              </div>

              <p className="text-foreground/80">{event.description}</p>

              <div className="grid gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm md:grid-cols-2">
                <p><span className="font-medium">Start:</span> {formatDate(event.startDateTime)}</p>
                <p><span className="font-medium">End:</span> {formatDate(event.endDateTime)}</p>
                {event.registrationDeadline ? (
                  <p><span className="font-medium">Registration Deadline:</span> {formatDate(event.registrationDeadline)}</p>
                ) : null}
                <p><span className="font-medium">Organizer:</span> {event.organizerName}</p>
                <p><span className="font-medium">Contact:</span> {event.contactEmail}</p>
                {event.eventType === "Online" ? (
                  <p><span className="font-medium">Mode:</span> Online</p>
                ) : (
                  <p><span className="font-medium">Venue:</span> {[event.venueName, event.city].filter(Boolean).join(", ") || "TBA"}</p>
                )}
              </div>

              {event.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {event.prizes ? <section><h2 className="mb-1 text-lg font-semibold">Prizes</h2><p className="text-sm text-foreground/75">{event.prizes}</p></section> : null}
              {event.rules ? <section><h2 className="mb-1 text-lg font-semibold">Rules</h2><p className="text-sm text-foreground/75">{event.rules}</p></section> : null}
              {event.schedule ? <section><h2 className="mb-1 text-lg font-semibold">Schedule</h2><p className="text-sm text-foreground/75">{event.schedule}</p></section> : null}
              {hasSponsors ? (
                <section>
                  <h2 className="mb-3 text-lg font-semibold">Sponsors</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {parsedSponsors.map((sponsor) => (
                      <div key={`${event.id}-${sponsor.title}`} className="rounded-xl border border-border bg-background/40 p-4">
                        <p className="mb-2 text-sm font-medium">{sponsor.title}</p>
                        {sponsor.logoLightUrl || sponsor.logoDarkUrl ? (
                          <div className="flex items-center justify-center rounded-lg border border-border bg-card/70 p-3">
                            {sponsor.logoLightUrl ? (
                              <img
                                src={sponsor.logoLightUrl}
                                alt={sponsor.title}
                                className="max-h-12 w-auto object-contain dark:hidden"
                              />
                            ) : null}
                            {sponsor.logoDarkUrl ? (
                              <img
                                src={sponsor.logoDarkUrl}
                                alt={sponsor.title}
                                className="hidden max-h-12 w-auto object-contain dark:block"
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : event.sponsors ? (
                <section>
                  <h2 className="mb-1 text-lg font-semibold">Sponsors</h2>
                  <p className="text-sm text-foreground/75">{event.sponsors}</p>
                </section>
              ) : null}

              <Button asChild>
                <a href={event.registrationLink} target="_blank" rel="noreferrer">
                  {registrationLabel}
                </a>
              </Button>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
