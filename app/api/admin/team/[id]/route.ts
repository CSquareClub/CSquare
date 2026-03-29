import { authOptions } from "@/lib/authOptions";
import { deleteTeamMember, updateTeamMember } from "@/lib/team-store";
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
    const memberId = Number(id);

    if (Number.isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await updateTeamMember(memberId, {
      name: body.name,
      role: body.role,
      about: body.about,
      linkedin: typeof body.linkedin !== "undefined" ? body.linkedin || null : undefined,
      image: typeof body.image !== "undefined" ? body.image || null : undefined,
      isPublished: typeof body.isPublished !== "undefined" ? Boolean(body.isPublished) : undefined,
      sortOrder: typeof body.sortOrder !== "undefined" ? Number(body.sortOrder) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update team member", error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const memberId = Number(id);

    if (Number.isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
    }

    const deleted = await deleteTeamMember(memberId);
    if (!deleted) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete team member", error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
