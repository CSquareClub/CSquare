'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

interface EventCardProps {
  id: string | number;
  title: string | null;
  description: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  attendees: number | null;
  category: string | null;
  image: string | null;
  sponsorTitle?: string | null;
  sponsorLogoUrl?: string | null;
  sponsorLogoLightUrl?: string | null;
  sponsorLogoDarkUrl?: string | null;
  registrationUrl?: string | null;
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

export default function EventCard({
  id,
  title,
  description,
  date,
  time,
  location,
  attendees,
  category,
  image,
  sponsorTitle,
  sponsorLogoUrl,
  sponsorLogoLightUrl,
  sponsorLogoDarkUrl,
  registrationUrl,
}: EventCardProps) {
  const safeTitle = (title || 'Untitled Event').trim() || 'Untitled Event';
  const eventHref = useMemo(
    () => `/events/${slugifyTitle(safeTitle)}?id=${encodeURIComponent(String(id))}`,
    [id, safeTitle]
  );
  const normalizedImage = useMemo(() => normalizeEventImageUrl(image), [image]);
  const fallbackImage = useMemo(
    () =>
      `https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80`,
    []
  );
  const [currentImage, setCurrentImage] = useState(normalizedImage || fallbackImage);
  const lightSponsorLogo = sponsorLogoLightUrl || sponsorLogoUrl || null;
  const darkSponsorLogo = sponsorLogoDarkUrl || sponsorLogoLightUrl || sponsorLogoUrl || null;
  const sponsorLogoAlt = sponsorTitle?.trim().toLowerCase() === 'devfolio' ? 'DEVFOLIO LOGO' : 'Sponsor logo';

  const openEventInNewTab = () => {
    window.open(eventHref, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a,button')) {
      return;
    }

    openEventInNewTab();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    if (event.target instanceof Element && event.target.closest('a,button')) {
      return;
    }

    event.preventDefault();
    openEventInNewTab();
  };

  return (
    <div
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card/70 transition-all duration-500 hover:border-[#dc2626]/35 hover:bg-card hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]"
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open ${safeTitle} details`}
    >
      {/* Subtle top highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
      
      {/* Image Banner */}
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-card">
        <img
          src={currentImage}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={safeTitle}
          onError={() => setCurrentImage(fallbackImage)}
        />
        {/* Gradient Overlay for Text Polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent opacity-90" />
        
        {/* Floating Category Tag */}
        {category ? (
          <span className="absolute top-4 right-4 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30 backdrop-blur-md">
            {category}
          </span>
        ) : null}
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-10 -mt-8">
        {date ? (
          <div className="flex items-start justify-between mb-4">
            <span className="rounded-md border border-border bg-card/80 px-2 py-1 text-sm font-medium text-foreground/60 backdrop-blur-sm">{date}</span>
          </div>
        ) : null}

        <h3 className="text-xl font-bold mb-3 text-foreground/90 transition-colors leading-tight">
          <Link
            href={eventHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group-hover:text-[#dc2626] hover:text-[#dc2626] transition-colors"
          >
            {safeTitle}
          </Link>
        </h3>

        {description ? <p className="text-foreground/60 text-sm mb-6 leading-relaxed flex-grow">{description}</p> : null}

        {lightSponsorLogo || darkSponsorLogo ? (
          <div className="mb-6 rounded-lg border border-border bg-background/60 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/60">
              Sponsored by {sponsorTitle?.trim() || "Our Partner"}
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

        {time || location || typeof attendees === 'number' ? (
          <div className="space-y-3 mb-6 text-sm text-foreground/60">
            {time ? (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#dc2626]" />
                <span>{time}</span>
              </div>
            ) : null}
            {location ? (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#dc2626]" />
                <span>{location}</span>
              </div>
            ) : null}
            {typeof attendees === 'number' ? (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#dc2626]" />
                <span>Capacity: {attendees}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          {registrationUrl ? (
            <Link
              href={registrationUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-[#dc2626] hover:bg-[#dc2626] hover:text-white group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              Register Now
            </Link>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground/50"
            >
              Details Soon
            </button>
          )}
          <Link
            href={eventHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${safeTitle} details`}
            className="rounded-md p-1 text-[#dc2626] transition-transform hover:translate-x-1"
          >
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
