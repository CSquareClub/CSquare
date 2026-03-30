import { listPublicGalleryItems } from "@/lib/gallery-store";

function normalizeImage(url: string) {
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return trimmed;
}

export default async function GalleryGrid() {
  const items = await listPublicGalleryItems();

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
        Gallery images will appear here once uploaded from admin portal.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card/70">
          <img
            src={normalizeImage(item.imageUrl)}
            alt={item.title}
            className="h-52 w-full object-cover"
            loading="lazy"
          />
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
