type GalleryItem = {
  id: string;
  title: string;
  eventName: string;
  imageUrl: string;
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

function parseSharedLinks(raw: string): GalleryItem[] {
  return raw
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, index) => {
      const [maybeTitle, maybeUrl] = entry.includes("|")
        ? entry.split("|").map((part) => part.trim())
        : ["", entry];

      const url = maybeUrl || maybeTitle;
      const title = maybeUrl ? maybeTitle : `Moment ${index + 1}`;

      return {
        id: `${index}-${url}`,
        title: title || `Moment ${index + 1}`,
        eventName: "C Square Moments",
        imageUrl: normalizeImage(url),
      };
    })
    .filter((item) => item.imageUrl.length > 0);
}

export default function GalleryGrid() {
  const rawLinks = process.env.NEXT_PUBLIC_MOMENTS_DRIVE_LINKS || "";
  const items = parseSharedLinks(rawLinks);

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
        Add your shared Drive image links to NEXT_PUBLIC_MOMENTS_DRIVE_LINKS to show C Square Moments.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card/70">
          <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" loading="lazy" />
          <div className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-primary/80">{item.eventName}</p>
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}
