import { listPublicGalleryItems } from "@/lib/gallery-store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await listPublicGalleryItems();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch gallery", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
