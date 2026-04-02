import { createEvent, listPublicEvents } from "@/lib/events-store";
import { authOptions } from "@/lib/authOptions";
import { eventSchema } from "@/lib/event-schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await listPublicEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch public events", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
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

    const parsed = eventSchema.safeParse({
      title: String(body?.title ?? "").trim(),
      tagline: body?.tagline ? String(body.tagline).trim() : undefined,
      description: String(body?.description ?? "").trim(),
      category: String(body?.category ?? "").trim(),
      eventType: body?.eventType,
      tags: Array.isArray(body?.tags)
        ? body.tags.filter((tag: unknown) => typeof tag === "string").map((tag: string) => tag.trim()).filter(Boolean)
        : undefined,
      startDateTime: body?.startDateTime ? new Date(String(body.startDateTime)) : undefined,
      endDateTime: body?.endDateTime ? new Date(String(body.endDateTime)) : undefined,
      venueName: body?.venueName ? String(body.venueName).trim() : undefined,
      city: body?.city ? String(body.city).trim() : undefined,
      onlineLink: body?.onlineLink ? String(body.onlineLink).trim() : undefined,
      organizerName: String(body?.organizerName ?? "").trim(),
      contactEmail: String(body?.contactEmail ?? "").trim(),
      registrationLink: String(body?.registrationLink ?? "").trim(),
      registrationDeadline: body?.registrationDeadline ? new Date(String(body.registrationDeadline)) : undefined,
      bannerImage: body?.bannerImage ? String(body.bannerImage).trim() : undefined,
      prizes: body?.prizes ? String(body.prizes).trim() : undefined,
      rules: body?.rules ? String(body.rules).trim() : undefined,
      schedule: body?.schedule ? String(body.schedule).trim() : undefined,
      status: body?.status,
      slug: body?.slug ? String(body.slug).trim() : slugify(String(body?.title ?? "")),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    if (input.endDateTime.getTime() <= input.startDateTime.getTime()) {
      return NextResponse.json({ error: "endDateTime must be after startDateTime" }, { status: 400 });
    }
    if (input.registrationDeadline && input.registrationDeadline.getTime() > input.startDateTime.getTime()) {
      return NextResponse.json({ error: "registrationDeadline must be before startDateTime" }, { status: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
      return NextResponse.json({ error: "slug must use lowercase letters, numbers, and hyphens only" }, { status: 400 });
    }

    const allowedCategories = ["Hackathon", "Workshop", "Fest", "Meetup"];
    const safeCategory = allowedCategories.includes(input.category) ? input.category : "Meetup";

    const location = input.eventType === "Online" ? input.onlineLink || "Online" : buildLocation(input.venueName, input.city);

    const detailLines = [
      input.tagline ? `**Tagline**\n${input.tagline}` : null,
      `**Event Type**\n${input.eventType}`,
      input.tags?.length ? `**Tags**\n${input.tags.join(", ")}` : null,
      `**Slug**\n${input.slug}`,
      input.registrationDeadline
        ? `**Registration Deadline**\n${input.registrationDeadline.toISOString()}`
        : null,
      input.onlineLink ? `**Online Link**\n${input.onlineLink}` : null,
      `**Organizer**\n${input.organizerName}`,
      `**Contact Email**\n${input.contactEmail}`,
      input.prizes ? `**Prizes & Benefits**\n${input.prizes}` : null,
      input.rules ? `**Rules**\n${input.rules}` : null,
      input.schedule ? `**Timeline / Schedule**\n${input.schedule}` : null,
    ].filter(Boolean);

    const fullDescription = detailLines.length
      ? `${input.description}\n\n---\n${detailLines.join("\n")}`
      : input.description;

    // Parse sponsors array if provided
    const sponsorsArray: any[] = Array.isArray(body?.sponsors)
      ? body.sponsors.filter((s: any) => s?.title && String(s.title).trim()).map((s: any) => ({
          title: String(s.title).trim(),
          logoUrl: null,
          logoLightUrl: s.logoLightUrl || null,
          logoDarkUrl: s.logoDarkUrl || null,
          devfolioApplyLogoLightUrl: s.devfolioApplyLogoLightUrl || null,
          devfolioApplyLogoDarkUrl: s.devfolioApplyLogoDarkUrl || null,
          instagramUrl: s.instagramUrl || null,
          linkedinUrl: s.linkedinUrl || null,
        }))
      : [];

    const communityPartnersArray: any[] = Array.isArray(body?.communityPartners)
      ? body.communityPartners
          .filter((p: any) => p?.name && String(p.name).trim())
          .map((p: any) => ({
            name: String(p.name).trim(),
            logoUrl: p.logoUrl || null,
            logoLightUrl: p.logoLightUrl || null,
            logoDarkUrl: p.logoDarkUrl || null,
            instagramUrl: p.instagramUrl || null,
            linkedinUrl: p.linkedinUrl || null,
          }))
      : [];

    const created = await createEvent({
      title: input.title,
      description: fullDescription,
      startDate: input.startDateTime.toISOString(),
      endDate: input.endDateTime.toISOString(),
      location,
      attendees: null,
      category: safeCategory,
      image: input.bannerImage || null,
      sponsorTitle: null,
      sponsorLogoUrl: null,
      sponsorLogoLightUrl: null,
      sponsorLogoDarkUrl: null,
      devfolioApplyLogoLightUrl: null,
      devfolioApplyLogoDarkUrl: null,
      isPublished: input.status === "published",
      registrationUrl: input.registrationLink,
      sponsors: sponsorsArray,
      communityPartners: communityPartnersArray,
    });

    return NextResponse.json({ ...created, slug: input.slug, status: input.status }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
