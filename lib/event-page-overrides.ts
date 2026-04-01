import { promises as fs } from 'node:fs';
import path from 'node:path';

const EVENT_OVERRIDES_ROOT = path.join(process.cwd(), 'app', 'events', 'published');

export type EventPageOverride = {
  heading?: string;
  body?: string;
  extraCtaLabel?: string;
  extraCtaUrl?: string;
};

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function getEventPageOverride(slug: string): Promise<EventPageOverride | null> {
  if (!isSafeSlug(slug)) return null;

  const overridePath = path.join(EVENT_OVERRIDES_ROOT, slug, 'override.json');

  try {
    const raw = await fs.readFile(overridePath, 'utf8');
    const parsed = JSON.parse(raw) as EventPageOverride;

    return {
      heading: typeof parsed.heading === 'string' ? parsed.heading.trim() : undefined,
      body: typeof parsed.body === 'string' ? parsed.body.trim() : undefined,
      extraCtaLabel: typeof parsed.extraCtaLabel === 'string' ? parsed.extraCtaLabel.trim() : undefined,
      extraCtaUrl: typeof parsed.extraCtaUrl === 'string' ? parsed.extraCtaUrl.trim() : undefined,
    };
  } catch {
    return null;
  }
}
