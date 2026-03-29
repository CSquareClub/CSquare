import { listPublicEvents } from "@/lib/events-store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await listPublicEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch public events", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
