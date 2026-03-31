import { updateEvent, getPublicEventById } from "@/lib/events-store";
import { authOptions } from "@/lib/authOptions";
import { eventSchema } from "@/lib/event-schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = params.id;

    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const updated = await updateEvent(id, {
      title: input.title,
      description: input.description,
      startDate: input.startDateTime.toISOString(),
      endDate: input.endDateTime.toISOString(),
      location: input.eventType === "Online" ? input.onlineLink || "Online" : buildLocation(input.venueName, input.city),
      category: input.category,
      image: input.bannerImage || null,
      isPublished: input.status === "published",
      registrationUrl: input.registrationLink,
    });

    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update event", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

function buildLocation(venueName?: string | null, city?: string | null): string | null {
  const parts = [venueName, city].map((part) => (part || "").trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}
