This folder contains code-managed, per-event page customizations.

Each published event gets: app/events/published/<event-slug>/override.json

Fields:
- heading: section title shown on event detail page
- body: multi-line text displayed as additional event details
- extraCtaLabel: optional CTA button label
- extraCtaUrl: optional CTA button link

Auto mode: pnpm sync:event-folders
Manual mode: pnpm sync:event-folders -- --slugs=event-one,event-two

Run this whenever new events are published.
