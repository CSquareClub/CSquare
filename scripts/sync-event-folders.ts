import { promises as fs } from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { listPublicEvents } from '../lib/events-store';

loadEnv({ path: path.join(process.cwd(), '.env.local') });
loadEnv({ path: path.join(process.cwd(), '.env') });

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function ensureFile(filePath: string, content: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return false;
  } catch {
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  }
}

function parseSlugsFromArgs(): string[] {
  const slugsArg = process.argv.find((arg) => arg.startsWith('--slugs='));
  if (!slugsArg) return [];

  const raw = slugsArg.slice('--slugs='.length).trim();
  if (!raw) return [];

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => slugifyTitle(item));
}

async function main(): Promise<void> {
  const root = path.join(process.cwd(), 'app', 'events', 'published');
  await ensureDir(root);
  const slugsFromArgs = parseSlugsFromArgs();

  let eventSlugs: string[] = [];

  if (slugsFromArgs.length > 0) {
    eventSlugs = slugsFromArgs;
  } else {
    try {
      const events = await listPublicEvents();
      eventSlugs = events
        .map((event) => slugifyTitle((event.title || '').trim() || `event-${event.id}`))
        .filter(Boolean);
    } catch (error) {
      console.warn('Could not auto-load published events from database.');
      console.warn('Use: pnpm sync:event-folders -- --slugs=event-one,event-two');
      console.warn(error);
    }
  }

  let createdCount = 0;

  for (const slug of eventSlugs) {
    if (!slug) continue;

    const eventDir = path.join(root, slug);
    await ensureDir(eventDir);

    const overridePath = path.join(eventDir, 'override.json');
    const created = await ensureFile(
      overridePath,
      JSON.stringify(
        {
          heading: 'Additional Event Details',
          body: 'Add event-specific details here that are not available in the admin portal.',
          extraCtaLabel: '',
          extraCtaUrl: '',
        },
        null,
        2
      ) + '\n'
    );

    if (created) createdCount += 1;
  }

  const readmePath = path.join(root, 'README.txt');
  await ensureFile(
    readmePath,
    [
      'This folder contains code-managed, per-event page customizations.',
      '',
      'Each published event gets: app/events/published/<event-slug>/override.json',
      '',
      'Fields:',
      '- heading: section title shown on event detail page',
      '- body: multi-line text displayed as additional event details',
      '- extraCtaLabel: optional CTA button label',
      '- extraCtaUrl: optional CTA button link',
      '',
      'Auto mode: pnpm sync:event-folders',
      'Manual mode: pnpm sync:event-folders -- --slugs=event-one,event-two',
      '',
      'Run this whenever new events are published.',
    ].join('\n') + '\n'
  );

  console.log(`Published events resolved: ${eventSlugs.length}`);
  console.log(`New override folders initialized: ${createdCount}`);
}

main().catch((error) => {
  console.error('Failed to sync event folders:', error);
  process.exitCode = 1;
});
