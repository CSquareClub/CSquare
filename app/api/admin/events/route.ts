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

    const event = await createEvent({
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      date: body.date,
      time: body.time,
      location: body.location,
      attendees: Number(body.attendees || 0),
      category: body.category,
      image: body.image,
      sponsorLogoLightUrl: body.sponsorLogoLightUrl || null,
      sponsorLogoDarkUrl: body.sponsorLogoDarkUrl || null,
      sponsorLogoUrl: body.sponsorLogoUrl || null,
      isPublished: Boolean(body.isPublished),
      registrationUrl: body.registrationUrl || null,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
