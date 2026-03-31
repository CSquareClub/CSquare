import { authOptions } from "@/lib/authOptions";
import { deleteGalleryItem, updateGalleryItem } from "@/lib/gallery-store";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const itemId = Number(id);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid gallery id" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await updateGalleryItem(itemId, {
      title: typeof body?.title === "string" ? body.title.trim() : undefined,
      eventId: typeof body?.eventId === "number" && Number.isFinite(body.eventId) ? body.eventId : undefined,
      eventName: typeof body?.eventName === "string" ? body.eventName.trim() : undefined,
      imageUrl: typeof body?.imageUrl === "string" ? body.imageUrl.trim() : undefined,
      description: typeof body?.description === "string" ? body.description.trim() : undefined,
      isPublished: typeof body?.isPublished === "boolean" ? body.isPublished : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/events");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update gallery item", error);
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const itemId = Number(id);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid gallery id" }, { status: 400 });
    }

    const deleted = await deleteGalleryItem(itemId);
    if (!deleted) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/events");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete gallery item", error);
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
