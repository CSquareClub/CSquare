import { createEvent, listPublicEvents } from "@/lib/events-store";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const events = await listPublicEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch public events", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildLocation(venueName?: string | null, city?: string | null): string | null {
  const parts = [venueName, city].map((part) => (part || "").trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const title = String(body?.title || "").trim();
    const tagline = String(body?.tagline || "").trim();
    const description = String(body?.description || "").trim();
    const category = String(body?.category || "").trim();
    const eventType = String(body?.eventType || "").trim();
    const tags = Array.isArray(body?.tags)
      ? body.tags.filter((tag: unknown) => typeof tag === "string").map((tag: string) => tag.trim()).filter(Boolean)
      : [];
    const startDateTime = body?.startDateTime ? new Date(String(body.startDateTime)) : null;
    const endDateTime = body?.endDateTime ? new Date(String(body.endDateTime)) : null;
    const registrationDeadline = body?.registrationDeadline ? new Date(String(body.registrationDeadline)) : null;
    const venueName = body?.venueName ? String(body.venueName).trim() : null;
    const city = body?.city ? String(body.city).trim() : null;
    const onlineLink = body?.onlineLink ? String(body.onlineLink).trim() : null;
    const organizerName = String(body?.organizerName || "").trim();
    const contactEmail = String(body?.contactEmail || "").trim();
    const registrationLink = body?.registrationLink ? String(body.registrationLink).trim() : "";
    const bannerImage = body?.bannerImage ? String(body.bannerImage).trim() : null;
    const prizes = body?.prizes ? String(body.prizes).trim() : null;
    const rules = body?.rules ? String(body.rules).trim() : null;
    const schedule = body?.schedule ? String(body.schedule).trim() : null;
    const sponsors = body?.sponsors ? String(body.sponsors).trim() : null;
    const status = body?.status === "published" ? "published" : "draft";
    const slugInput = body?.slug ? String(body.slug).trim() : "";
    const slug = slugInput || slugify(title);

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (!startDateTime || Number.isNaN(startDateTime.getTime())) {
      return NextResponse.json({ error: "startDateTime is required and must be valid" }, { status: 400 });
    }
    if (!endDateTime || Number.isNaN(endDateTime.getTime())) {
      return NextResponse.json({ error: "endDateTime is required and must be valid" }, { status: 400 });
    }
    if (endDateTime.getTime() <= startDateTime.getTime()) {
      return NextResponse.json({ error: "endDateTime must be after startDateTime" }, { status: 400 });
    }
    if (!organizerName) {
      return NextResponse.json({ error: "organizerName is required" }, { status: 400 });
    }
    if (!contactEmail || !isValidEmail(contactEmail)) {
      return NextResponse.json({ error: "contactEmail is required and must be valid" }, { status: 400 });
    }
    if (registrationDeadline && Number.isNaN(registrationDeadline.getTime())) {
      return NextResponse.json({ error: "registrationDeadline must be valid" }, { status: 400 });
    }
    if (registrationDeadline && registrationDeadline.getTime() > startDateTime.getTime()) {
      return NextResponse.json({ error: "registrationDeadline must be before startDateTime" }, { status: 400 });
    }
    if (onlineLink && !isValidUrl(onlineLink)) {
      return NextResponse.json({ error: "onlineLink must be a valid URL" }, { status: 400 });
    }
    if (!registrationLink) {
      return NextResponse.json({ error: "registrationLink is required" }, { status: 400 });
    }
    if (!isValidUrl(registrationLink)) {
      return NextResponse.json({ error: "registrationLink must be a valid URL" }, { status: 400 });
    }
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "slug must use lowercase letters, numbers, and hyphens only" }, { status: 400 });
    }

    const allowedCategories = ["Hackathon", "Workshop", "Fest", "Meetup"];
    const safeCategory = allowedCategories.includes(category) ? category : "Meetup";
    const allowedTypes = ["Online", "Offline", "Hybrid"];
    const safeEventType = allowedTypes.includes(eventType) ? eventType : "Offline";

    const location = safeEventType === "Online" ? onlineLink || "Online" : buildLocation(venueName, city);

    const detailLines = [
      tagline ? `Tagline: ${tagline}` : null,
      `Event Type: ${safeEventType}`,
      tags.length ? `Tags: ${tags.join(", ")}` : null,
      `Slug: ${slug}`,
      registrationDeadline ? `Registration Deadline: ${registrationDeadline.toISOString()}` : null,
      onlineLink ? `Online Link: ${onlineLink}` : null,
      `Organizer: ${organizerName}`,
      `Contact Email: ${contactEmail}`,
      prizes ? `Prizes: ${prizes}` : null,
      rules ? `Rules: ${rules}` : null,
      schedule ? `Schedule: ${schedule}` : null,
      sponsors ? `Sponsors: ${sponsors}` : null,
    ].filter(Boolean);

    const fullDescription = detailLines.length
      ? `${description}\n\n---\n${detailLines.join("\n")}`
      : description;

    const created = await createEvent({
      title,
      description: fullDescription,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      location,
      attendees: null,
      category: safeCategory,
      image: bannerImage,
      sponsorTitle: null,
      sponsorLogoUrl: null,
      sponsorLogoLightUrl: null,
      sponsorLogoDarkUrl: null,
      devfolioApplyLogoLightUrl: null,
      devfolioApplyLogoDarkUrl: null,
      isPublished: status === "published",
      registrationUrl: registrationLink,
      sponsors: [],
    });

    return NextResponse.json({ ...created, slug, status }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
