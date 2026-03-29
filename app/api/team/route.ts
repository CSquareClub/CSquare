import { listPublicTeam } from "@/lib/team-store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const members = await listPublicTeam();
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch public team", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
