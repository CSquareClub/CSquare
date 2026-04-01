import { authOptions } from "@/lib/authOptions";
import { createEvent, listAdminEvents } from "@/lib/events-store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await listAdminEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch admin events", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Process sponsors array if provided
    const sponsors = body.sponsors ? body.sponsors.map((sponsor: any) => ({
      title: sponsor.title,
      logoUrl: sponsor.logoUrl || null,
      logoLightUrl: sponsor.logoLightUrl || null,
      logoDarkUrl: sponsor.logoDarkUrl || null,
      devfolioApplyLogoLightUrl: sponsor.devfolioApplyLogoLightUrl || null,
      devfolioApplyLogoDarkUrl: sponsor.devfolioApplyLogoDarkUrl || null,

    })) : [];

    // Process community partners array if provided
    const communityPartners = body.communityPartners ? body.communityPartners.map((partner: any) => ({
      name: partner.name,
      logoUrl: partner.logoUrl || null,
      logoLightUrl: partner.logoLightUrl || null,
      logoDarkUrl: partner.logoDarkUrl || null,
      instagramUrl: partner.instagramUrl || null,
      linkedinUrl: partner.linkedinUrl || null,
    })) : [];

    const event = await createEvent({
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      date: body.date,
      time: body.time,
      location: body.location,
      attendees:
        typeof body.attendees === "number"
          ? body.attendees
          : typeof body.attendees === "string" && body.attendees.trim() !== ""
            ? Number(body.attendees)
            : null,
      category: body.category,
      image: body.image,
      sponsorTitle: body.sponsorTitle || null,
      sponsorLogoLightUrl: body.sponsorLogoLightUrl || null,
      sponsorLogoDarkUrl: body.sponsorLogoDarkUrl || null,
      devfolioApplyLogoLightUrl: body.devfolioApplyLogoLightUrl || null,
      devfolioApplyLogoDarkUrl: body.devfolioApplyLogoDarkUrl || null,
      sponsorLogoUrl: body.sponsorLogoUrl || null,
      isPublished: Boolean(body.isPublished),
      registrationUrl: body.registrationUrl || null,
      sponsors,
      communityPartners,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
