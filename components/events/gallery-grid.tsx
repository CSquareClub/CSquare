import { listPublicGalleryItems } from "@/lib/gallery-store";

type GalleryItem = {
  id: string;
  title: string;
  eventName: string;
  imageUrl: string;
  description?: string;
};

function extractDriveId(url: string): string | null {
  const trimmed = url.trim();

  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (fileMatch?.[1]) return fileMatch[1];

  const urlObj = (() => {
    try {
      return new URL(trimmed);
    } catch {
      return null;
    }
  })();

  if (!urlObj) return null;

  const idParam = urlObj.searchParams.get("id");
  if (idParam) return idParam;

  return null;
}

function normalizeImage(url: string) {
  const trimmed = url.trim();
  const driveId = extractDriveId(trimmed);

  if (driveId) {
    // Thumbnail endpoint works better for many shared Drive image links.
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
  }

  return trimmed;
}

export default async function GalleryGrid() {
  const dbItems = await listPublicGalleryItems();

  const itemsFromAdmin: GalleryItem[] = dbItems.map((item) => ({
    id: String(item.id),
    title: item.title,
    eventName: item.eventName,
    imageUrl: normalizeImage(item.imageUrl),
    description: item.description,
  }));

  const items = itemsFromAdmin;

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
        Add images from Admin Gallery to show C Square Moments.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card/70">
          <div className="flex min-h-52 items-center justify-center bg-background/40 p-3">
            <img src={item.imageUrl} alt={item.title} className="max-h-72 w-full object-contain" loading="lazy" />
          </div>
          <div className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-primary/80">{item.eventName}</p>
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            {item.description ? <p className="text-xs text-foreground/65">{item.description}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
