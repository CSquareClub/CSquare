import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import { getPublicEventById, listPublicEvents } from '@/lib/events-store';
import { listGalleryItemsByEventId } from '@/lib/gallery-store';
import { Instagram, Linkedin } from 'lucide-react';

export const dynamic = 'force-dynamic';
const EVENT_TIMEZONE = 'Asia/Kolkata';

function renderInlineBold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`b-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderFormattedDescription(text: string): ReactNode[] {
  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={`sp-${index}`} className="h-2" />;
    }

    return (
      <p key={`ln-${index}`} className="leading-relaxed">
        {renderInlineBold(line)}
      </p>
    );
  });
}

function normalizeEventImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (fileMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1600`;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const isDriveHost = host.includes('drive.google.com') || host.includes('docs.google.com');

    if (isDriveHost) {
      const idParam = parsed.searchParams.get('id');
      if (idParam) {
        return `https://drive.google.com/thumbnail?id=${idParam}&sz=w1600`;
      }

      const ucPathMatch = parsed.pathname.match(/\/uc$/i);
      if (ucPathMatch) {
        const ucId = parsed.searchParams.get('id');
        if (ucId) {
          return `https://drive.google.com/thumbnail?id=${ucId}&sz=w1600`;
        }
      }
    }
  } catch {
    // Keep original URL when parsing fails.
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

function isDevfolioLink(url: string | null | undefined): boolean {
  if (!url) return false;
  return /devfolio\.(co|in|com)/i.test(url);
}

function isDevfolioSponsor(title: string | null | undefined): boolean {
  return title?.trim().toLowerCase() === 'devfolio';
}

function formatCurrency(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return value === 0 ? 'Nada' : `Rs ${value.toLocaleString('en-IN')}`;
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
    event =
      events.find((entry) => entry.slug === slug) ??
      events.find((entry) => slugifyTitle(entry.title || `event-${entry.id}`) === slug) ??
      null;
  }

  if (!event) {
    notFound();
  }

  const safeTitle = event.title?.trim() || 'Untitled Event';
  const imageUrl = normalizeEventImageUrl(event.image);
  const lightSponsorLogo = event.sponsorLogoLightUrl || event.sponsorLogoUrl;
  const darkSponsorLogo = event.sponsorLogoDarkUrl || event.sponsorLogoLightUrl || event.sponsorLogoUrl;
  const applyLogoLight = event.devfolioApplyLogoLightUrl || null;
  const applyLogoDark = event.devfolioApplyLogoDarkUrl || applyLogoLight;
  const isDevfolio = isDevfolioSponsor(event.sponsorTitle);
  const sponsorLogoAlt = isDevfolio ? 'DEVFOLIO LOGO' : 'Sponsor logo';
  const registrationButtonLabel = isDevfolioLink(event.registrationLink) ? 'Apply with Devfolio' : 'Register Now';
  const hasDevfolioApplyLogos = Boolean(isDevfolio && event.registrationLink && applyLogoLight && applyLogoDark);
  const eventFeeLabel = formatCurrency(event.eventFee);
  const accommodationFeeLabel = formatCurrency(event.accommodationFee);
  const isChandigarhUniversityMohaliVenue = /chandigarh university/i.test(event.location || '') && /mohali/i.test(event.location || '');
  const showAccommodationAccess = Boolean(event.showAccommodationOnPage && event.accommodationAccess);
  const fallbackImage =
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80';

  // Fetch gallery items for this event
  const galleryItems = await listGalleryItemsByEventId(event.id);
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
            <div className="relative w-full bg-card/80 p-4 md:p-5">
              <img
                src={imageUrl || fallbackImage}
                alt={safeTitle}
                className="mx-auto max-h-[520px] w-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/10 to-transparent" />
              {event.category ? (
                <span className="absolute right-4 top-4 rounded-full border border-[#dc2626]/30 bg-[#dc2626]/20 px-3 py-1 text-xs font-semibold text-[#dc2626]">
                  {event.category}
                </span>
              ) : null}
            </div>

            <div className="space-y-6 p-6 md:p-8">
              <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{safeTitle}</h1>
                {event.description ? (
                  <div className="text-foreground/70">{renderFormattedDescription(event.description)}</div>
                ) : null}
              </header>

              {eventFeeLabel || (isChandigarhUniversityMohaliVenue && accommodationFeeLabel && event.showAccommodationOnPage) || showAccommodationAccess ? (
                <section className="rounded-xl border border-border bg-background/50 p-4 text-sm text-foreground/75">
                  <h2 className="mb-2 text-lg font-semibold text-foreground">Fee Details</h2>
                  <div className="space-y-1.5">
                    {eventFeeLabel ? <p>Registration Fee: {eventFeeLabel}</p> : null}
                    {isChandigarhUniversityMohaliVenue && accommodationFeeLabel && event.showAccommodationOnPage ? (
                      <p>
                        Accommodation Fee: {accommodationFeeLabel} per person
                        {event.accommodationAccess === 'chandigarh-university-only' ? ' (Chandigarh University only)' : ' (Open to all)'}
                      </p>
                    ) : null}
                    {showAccommodationAccess ? (
                      <p>
                        Accommodation For: {event.accommodationAccess === 'chandigarh-university-only' ? 'CU only' : 'Open to all'}
                      </p>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {event.sponsors && event.sponsors.length > 0 ? (
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/65">
                    Sponsors
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {event.sponsors.map((sponsor) => (
                      <div key={sponsor.id} className="rounded-lg border border-border bg-card/70 p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
                          {sponsor.title}
                        </p>
                        <div className="flex h-12 items-center justify-center">
                          {sponsor.logoLightUrl ? (
                            <img
                              src={normalizeEventImageUrl(sponsor.logoLightUrl)}
                              alt={sponsor.title}
                              className="max-h-12 w-auto object-contain dark:hidden"
                              loading="lazy"
                            />
                          ) : null}
                          {sponsor.logoDarkUrl ? (
                            <img
                              src={normalizeEventImageUrl(sponsor.logoDarkUrl)}
                              alt={sponsor.title}
                              className="hidden max-h-12 w-auto object-contain dark:block"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        {(sponsor.instagramUrl || sponsor.linkedinUrl) ? (
                          <div className="mt-3 flex items-center justify-center gap-2">
                            {sponsor.instagramUrl ? (
                              <a
                                href={sponsor.instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${sponsor.title} Instagram`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition hover:border-[#dc2626] hover:text-[#dc2626]"
                              >
                                <Instagram size={14} />
                              </a>
                            ) : null}
                            {sponsor.linkedinUrl ? (
                              <a
                                href={sponsor.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${sponsor.title} LinkedIn`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition hover:border-[#dc2626] hover:text-[#dc2626]"
                              >
                                <Linkedin size={14} />
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : lightSponsorLogo || darkSponsorLogo ? (
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/65">
                    Sponsored by {event.sponsorTitle?.trim() || "Our Partner"}
                  </p>
                  {lightSponsorLogo ? (
                    <img
                      src={normalizeEventImageUrl(lightSponsorLogo)}
                      alt={sponsorLogoAlt}
                      className="h-16 w-full object-contain dark:hidden"
                      loading="lazy"
                    />
                  ) : null}
                  {darkSponsorLogo ? (
                    <img
                      src={normalizeEventImageUrl(darkSponsorLogo)}
                      alt={sponsorLogoAlt}
                      className="hidden h-16 w-full object-contain dark:block"
                      loading="lazy"
                    />
                  ) : null}
                </div>
              ) : null}

              {event.communityPartners && event.communityPartners.length > 0 ? (
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/65">
                    Community Partners
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {event.communityPartners.map((partner) => (
                      <div key={partner.id} className="rounded-lg border border-border bg-card/70 p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
                          {partner.name}
                        </p>
                        <div className="flex h-12 items-center justify-center">
                          {partner.logoLightUrl ? (
                            <img
                              src={normalizeEventImageUrl(partner.logoLightUrl)}
                              alt={partner.name}
                              className="max-h-12 w-auto object-contain dark:hidden"
                              loading="lazy"
                            />
                          ) : null}
                          {partner.logoDarkUrl ? (
                            <img
                              src={normalizeEventImageUrl(partner.logoDarkUrl)}
                              alt={partner.name}
                              className="hidden max-h-12 w-auto object-contain dark:block"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        {(partner.instagramUrl || partner.linkedinUrl) ? (
                          <div className="mt-3 flex items-center justify-center gap-2">
                            {partner.instagramUrl ? (
                              <a
                                href={partner.instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${partner.name} Instagram`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition hover:border-[#dc2626] hover:text-[#dc2626]"
                              >
                                <Instagram size={14} />
                              </a>
                            ) : null}
                            {partner.linkedinUrl ? (
                              <a
                                href={partner.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${partner.name} LinkedIn`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition hover:border-[#dc2626] hover:text-[#dc2626]"
                              >
                                <Linkedin size={14} />
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasDevfolioApplyLogos ? (
                <Link
                  href={event.registrationLink || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-3 transition-all hover:border-[#dc2626] hover:bg-[#dc2626]/10"
                  aria-label="Apply with Devfolio"
                >
                  <img
                    src={normalizeEventImageUrl(applyLogoLight)}
                    alt="APPLY WITH DEVFOLIO"
                    className="h-14 w-auto max-w-[320px] object-contain dark:hidden"
                    loading="lazy"
                  />
                  <img
                    src={normalizeEventImageUrl(applyLogoDark)}
                    alt="APPLY WITH DEVFOLIO"
                    className="hidden h-14 w-auto max-w-[320px] object-contain dark:block"
                    loading="lazy"
                  />
                </Link>
              ) : event.registrationLink ? (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                >
                  {registrationButtonLabel}
                </a>
              ) : (
                <div className="inline-flex cursor-not-allowed items-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground/50">
                  Registration unavailable
                </div>
              )}

            </div>
          </article>
        </div>
      </main>

      {galleryItems.length > 0 && (
        <section className="relative z-10 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">Event Moments</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card/70">
                  <div className="flex min-h-48 items-center justify-center bg-background/40 p-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-h-56 w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary/80">{item.eventName}</p>
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-foreground/60 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
