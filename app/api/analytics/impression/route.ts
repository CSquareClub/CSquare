import { trackWebsiteImpression } from "@/lib/analytics-store";
import { NextRequest, NextResponse } from "next/server";

const VISITOR_COOKIE = "csq_vid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = String(body?.path || "").trim();

    if (!path || !path.startsWith("/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
    }

    const referrerHeader = req.headers.get("referer");
    const userAgent = req.headers.get("user-agent");

    await trackWebsiteImpression({
      path,
      visitorId,
      referrer: referrerHeader,
      userAgent,
    });

    const response = NextResponse.json({ ok: true });

    if (!req.cookies.get(VISITOR_COOKIE)?.value) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Failed to track impression", error);
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}
