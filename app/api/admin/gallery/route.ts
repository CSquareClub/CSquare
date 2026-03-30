import { authOptions } from "@/lib/authOptions";
import { createGalleryItem, listAdminGalleryItems } from "@/lib/gallery-store";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const rows = await listAdminGalleryItems();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch gallery", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const title = String(body?.title || "").trim();
    const eventName = String(body?.eventName || "").trim();
    const imageUrl = String(body?.imageUrl || "").trim();
    const description = String(body?.description || "").trim();
    const isPublished = Boolean(body?.isPublished ?? true);

    if (!title || !eventName || !imageUrl) {
      return NextResponse.json({ error: "Title, event name and image URL are required" }, { status: 400 });
    }

    const created = await createGalleryItem({
      title,
      eventName,
      imageUrl,
      description,
      isPublished,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery item", error);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}
