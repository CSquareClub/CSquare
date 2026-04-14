import { NextRequest, NextResponse } from "next/server";
import { checkDuplicateAlgolympiaRegistration } from "@/lib/algolympia-registrations-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const isDuplicate = await checkDuplicateAlgolympiaRegistration([email]);

    return NextResponse.json({
      success: true,
      exists: isDuplicate,
    });
  } catch (error) {
    console.error("Error checking AlgOlympia email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
