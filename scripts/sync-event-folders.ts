import { promises as fs } from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { listAdminEvents, listPublicEvents } from '../lib/events-store';

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

async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
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

function hasAllEventsFlag(): boolean {
  return process.argv.includes('--all-events');
}

async function main(): Promise<void> {
  const root = path.join(process.cwd(), 'app', 'events', 'published');
  await ensureDir(root);
  const slugsFromArgs = parseSlugsFromArgs();
  const includeAllEvents = hasAllEventsFlag();

  let eventSlugs: string[] = [];
  let modeLabel = 'manual';
  let renamedCount = 0;
  let renameConflictCount = 0;

  if (slugsFromArgs.length > 0) {
    eventSlugs = slugsFromArgs;
    modeLabel = 'manual-slugs';
  } else {
    try {
      const events = includeAllEvents ? await listAdminEvents() : await listPublicEvents();

      for (const event of events) {
        const preferredSlug = event.slug?.trim();
        if (!preferredSlug) continue;

        const preferredDir = path.join(root, preferredSlug);
        const preferredExists = await dirExists(preferredDir);
        const titleSlug = slugifyTitle((event.title || '').trim() || `event-${event.id}`);
        const legacyCandidates = [`published-event-${event.id}`, `event-${event.id}`, titleSlug]
          .map((candidate) => candidate.trim())
          .filter((candidate) => candidate && candidate !== preferredSlug);

        const legacyDir = await (async () => {
          for (const candidate of legacyCandidates) {
            const candidateDir = path.join(root, candidate);
            if (await dirExists(candidateDir)) return candidateDir;
          }
          return null;
        })();

        if (!legacyDir) continue;

        if (preferredExists) {
          renameConflictCount += 1;
          console.warn(`Skipped rename due to existing target folder: ${preferredSlug}`);
          continue;
        }

        await fs.rename(legacyDir, preferredDir);
        renamedCount += 1;
      }

      eventSlugs = events
        .map((event) => {
          const preferredSlug = event.slug?.trim();
          if (preferredSlug) return preferredSlug;
          return slugifyTitle((event.title || '').trim() || `event-${event.id}`);
        })
        .filter(Boolean);
      modeLabel = includeAllEvents ? 'all-events' : 'published-only';
    } catch (error) {
      const target = includeAllEvents ? 'all events' : 'published events';
      console.warn(`Could not auto-load ${target} from database.`);
      console.warn('Use: npm run sync:event-folders -- --slugs=event-one,event-two');
      console.warn(error);
    }
  }

  const uniqueSlugs = [...new Set(eventSlugs)];

  let createdCount = 0;

  for (const slug of uniqueSlugs) {
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
      'Each event gets: app/events/published/<event-slug>/override.json',
      '',
      'Fields:',
      '- heading: section title shown on event detail page',
      '- body: multi-line text displayed as additional event details',
      '- extraCtaLabel: optional CTA button label',
      '- extraCtaUrl: optional CTA button link',
      '',
      'Published-only mode: npm run sync:event-folders',
      'All-events mode (includes older/archived): npm run sync:event-folders -- --all-events',
      'Manual mode: npm run sync:event-folders -- --slugs=event-one,event-two',
      '',
      'Run this whenever events are added or updated.',
    ].join('\n') + '\n'
  );

  console.log(`Sync mode: ${modeLabel}`);
  console.log(`Events resolved: ${uniqueSlugs.length}`);
  console.log(`Legacy folders renamed: ${renamedCount}`);
  console.log(`Rename conflicts skipped: ${renameConflictCount}`);
  console.log(`New override folders initialized: ${createdCount}`);
}

main().catch((error) => {
  console.error('Failed to sync event folders:', error);
  process.exitCode = 1;
});
