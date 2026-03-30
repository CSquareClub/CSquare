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

    const updated = await updateEvent(eventId, {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      date: body.date,
      time: body.time,
      location: body.location,
      attendees: typeof body.attendees !== "undefined" ? Number(body.attendees) : undefined,
      category: body.category,
      image: body.image,
      sponsorLogoLightUrl:
        typeof body.sponsorLogoLightUrl !== "undefined" ? body.sponsorLogoLightUrl || null : undefined,
      sponsorLogoDarkUrl:
        typeof body.sponsorLogoDarkUrl !== "undefined" ? body.sponsorLogoDarkUrl || null : undefined,
      sponsorLogoUrl: typeof body.sponsorLogoUrl !== "undefined" ? body.sponsorLogoUrl || null : undefined,
      isPublished: typeof body.isPublished !== "undefined" ? Boolean(body.isPublished) : undefined,
      registrationUrl: typeof body.registrationUrl !== "undefined" ? body.registrationUrl || null : undefined,
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
