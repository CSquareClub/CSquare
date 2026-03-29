import { getDashboardAnalyticsSummary } from "@/lib/analytics-store";
import { authOptions } from "@/lib/authOptions";
import { countActiveEvents } from "@/lib/events-store";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const [count2026, count2027, activeEvents, analytics] = await Promise.all([
      prisma.cusocRegistration2026.count(),
      prisma.cusocRegistration2027.count(),
      countActiveEvents(),
      getDashboardAnalyticsSummary(),
    ]);

    return NextResponse.json({
      totalRegistrations: count2026 + count2027,
      activeEvents,
      analytics,
    });
  } catch (error) {
    console.error("Failed to load admin dashboard stats", error);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
