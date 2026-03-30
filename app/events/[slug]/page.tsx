import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';

import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import { getPublicEventById, listPublicEvents } from '@/lib/events-store';

export const dynamic = 'force-dynamic';

function normalizeEventImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  return trimmed;
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type EventDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function EventDetailsPage({ params, searchParams }: EventDetailsPageProps) {
  const { slug } = await params;
  const { id } = await searchParams;

  let event = null;

  if (id) {
    const eventId = Number.parseInt(id, 10);
    if (Number.isFinite(eventId)) {
      event = await getPublicEventById(eventId);
    }
  }

  if (!event) {
    const events = await listPublicEvents();
    event = events.find((entry) => slugifyTitle(entry.title || `event-${entry.id}`) === slug) ?? null;
  }

  if (!event) {
    notFound();
  }

  const safeTitle = event.title?.trim() || 'Untitled Event';
  const imageUrl = normalizeEventImageUrl(event.image);
  const lightSponsorLogo = event.sponsorLogoLightUrl || event.sponsorLogoUrl;
  const darkSponsorLogo = event.sponsorLogoDarkUrl || event.sponsorLogoLightUrl || event.sponsorLogoUrl;
  const sponsorLogoAlt = event.sponsorTitle?.trim().toLowerCase() === 'devfolio' ? 'DEVFOLIO LOGO' : 'Sponsor logo';
  const fallbackImage =
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="mb-8 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-[#dc2626]"
          >
            <ArrowLeft size={16} />
            Back to Events
          </Link>

          <article className="overflow-hidden rounded-2xl border border-border bg-card/70">
            <div className="relative h-64 w-full bg-card md:h-96">
              <img src={imageUrl || fallbackImage} alt={safeTitle} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
              {event.category ? (
                <span className="absolute right-4 top-4 rounded-full border border-[#dc2626]/30 bg-[#dc2626]/20 px-3 py-1 text-xs font-semibold text-[#dc2626]">
                  {event.category}
                </span>
              ) : null}
            </div>

            <div className="space-y-6 p-6 md:p-8">
              <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{safeTitle}</h1>
                {event.description ? <p className="text-foreground/70">{event.description}</p> : null}
              </header>

              {event.startDate || event.endDate || event.location || typeof event.attendees === 'number' ? (
                <div className="grid gap-4 rounded-xl border border-border bg-background/50 p-4 text-sm text-foreground/75 md:grid-cols-3">
                  {event.startDate || event.endDate ? (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#dc2626]" />
                      <span>
                        {event.startDate ? new Date(event.startDate).toLocaleString() : 'Start TBD'}
                        {event.endDate ? ` - ${new Date(event.endDate).toLocaleString()}` : ''}
                      </span>
                    </div>
                  ) : null}
                  {event.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#dc2626]" />
                      <span>{event.location}</span>
                    </div>
                  ) : null}
                  {typeof event.attendees === 'number' ? (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#dc2626]" />
                      <span>Capacity: {event.attendees}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {lightSponsorLogo || darkSponsorLogo ? (
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/65">
                    Sponsored by {event.sponsorTitle?.trim() || "Our Partner"}
                  </p>
                  {lightSponsorLogo ? (
                    <img
                      src={normalizeEventImageUrl(lightSponsorLogo)}
                      alt={sponsorLogoAlt}
                      className="h-20 w-full object-contain dark:hidden"
                      loading="lazy"
                    />
                  ) : null}
                  {darkSponsorLogo ? (
                    <img
                      src={normalizeEventImageUrl(darkSponsorLogo)}
                      alt={sponsorLogoAlt}
                      className="hidden h-20 w-full object-contain dark:block"
                      loading="lazy"
                    />
                  ) : null}
                </div>
              ) : null}

              {event.registrationUrl ? (
                <Link
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                >
                  Register Now
                </Link>
              ) : (
                <div className="inline-flex cursor-not-allowed items-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground/50">
                  Registration unavailable
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
