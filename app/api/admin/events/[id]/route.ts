import { authOptions } from "@/lib/authOptions";
import { deleteEvent, updateEvent } from "@/lib/events-store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const body = await req.json();
    const locationValue = typeof body.location === "string" ? body.location : "";
    const isChandigarhUniversityVenue = /chandigarh university/i.test(locationValue);

    // Process sponsors array if provided
    const sponsors = body.sponsors !== undefined ? body.sponsors.map((sponsor: any) => ({
      title: sponsor.title,
      logoUrl: null,
      logoLightUrl: sponsor.logoLightUrl || null,
      logoDarkUrl: sponsor.logoDarkUrl || null,
      devfolioApplyLogoLightUrl: sponsor.devfolioApplyLogoLightUrl || null,
      devfolioApplyLogoDarkUrl: sponsor.devfolioApplyLogoDarkUrl || null,
      instagramUrl: sponsor.instagramUrl || null,
      linkedinUrl: sponsor.linkedinUrl || null,

    })) : undefined;

    // Process community partners array if provided
    const communityPartners = body.communityPartners !== undefined ? body.communityPartners.map((partner: any) => ({
      name: partner.name,
      logoUrl: partner.logoUrl || null,
      logoLightUrl: partner.logoLightUrl || null,
      logoDarkUrl: partner.logoDarkUrl || null,
      instagramUrl: partner.instagramUrl || null,
      linkedinUrl: partner.linkedinUrl || null,
    })) : undefined;

    const updated = await updateEvent(eventId, {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      date: body.date,
      time: body.time,
      location: body.location,
      attendees:
        typeof body.attendees === "undefined"
          ? undefined
          : body.attendees === null || body.attendees === ""
            ? null
            : Number(body.attendees),
      eventFee:
        typeof body.eventFee === "undefined"
          ? undefined
          : body.eventFee === null || body.eventFee === ""
            ? null
            : Number(body.eventFee),
      accommodationFee:
        isChandigarhUniversityVenue
          ? 500
          : typeof body.accommodationFee === "undefined"
            ? undefined
            : body.accommodationFee === null || body.accommodationFee === ""
              ? null
              : Number(body.accommodationFee),
      category: body.category,
      image: body.image,
      sponsorTitle: typeof body.sponsorTitle !== "undefined" ? body.sponsorTitle || null : undefined,
      sponsorLogoLightUrl:
        typeof body.sponsorLogoLightUrl !== "undefined" ? body.sponsorLogoLightUrl || null : undefined,
      sponsorLogoDarkUrl:
        typeof body.sponsorLogoDarkUrl !== "undefined" ? body.sponsorLogoDarkUrl || null : undefined,
      devfolioApplyLogoLightUrl:
        typeof body.devfolioApplyLogoLightUrl !== "undefined" ? body.devfolioApplyLogoLightUrl || null : undefined,
      devfolioApplyLogoDarkUrl:
        typeof body.devfolioApplyLogoDarkUrl !== "undefined" ? body.devfolioApplyLogoDarkUrl || null : undefined,
      sponsorLogoUrl: typeof body.sponsorLogoUrl !== "undefined" ? body.sponsorLogoUrl || null : undefined,
      isPublished: typeof body.isPublished !== "undefined" ? Boolean(body.isPublished) : undefined,
      registrationUrl: typeof body.registrationUrl !== "undefined" ? body.registrationUrl || null : undefined,
      sponsors,
      communityPartners,
    });

    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update event", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const deleted = await deleteEvent(eventId);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
