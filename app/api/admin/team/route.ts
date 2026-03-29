import { authOptions } from "@/lib/authOptions";
import { createTeamMember, listAdminTeam } from "@/lib/team-store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await listAdminTeam();
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch team members", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const member = await createTeamMember({
      name: body.name,
      role: body.role,
      about: body.about,
      linkedin: body.linkedin || null,
      image: body.image || null,
      isPublished: typeof body.isPublished !== "undefined" ? Boolean(body.isPublished) : true,
      sortOrder: Number(body.sortOrder || 0),
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to create team member", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
