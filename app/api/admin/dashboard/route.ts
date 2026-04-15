import { getDashboardAnalyticsSummary } from "@/lib/analytics-store";
import {
  deleteAmbassador,
  deleteAmbassadorsByRegistrationId,
  listAmbassadors,
} from "@/lib/algolympia-ambassador-store";
import {
  deleteCommunityPartnerEntry,
  listCommunityPartners,
} from "@/lib/algolympia-community-partner-store";
import {
  deleteAlgolympiaRegistration,
  listAlgolympiaRegistrations,
} from "@/lib/algolympia-registrations-store";
import {
  deleteStallRegistration,
  listStallRegistrations,
} from "@/lib/algolympia-stalls-store";
import { authOptions } from "@/lib/authOptions";
import { countActiveEvents } from "@/lib/events-store";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type DashboardEntity = "registration" | "stall" | "ambassador" | "community";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }

  return session;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const [count2026, count2027, activeEvents, analytics] = await Promise.all([
      prisma.cusocRegistration2026.count(),
      prisma.cusocRegistration2027.count(),
      countActiveEvents(),
      getDashboardAnalyticsSummary(),
    ]);

    const [algolympiaRegistrations, stalls, ambassadors, communityPartners] = await Promise.all([
      listAlgolympiaRegistrations(),
      listStallRegistrations(),
      listAmbassadors(),
      listCommunityPartners(),
    ]);

    return NextResponse.json({
      totalRegistrations: count2026 + count2027,
      activeEvents,
      analytics,
      algolympia: {
        registrations: algolympiaRegistrations,
        stalls,
        ambassadors,
        communityPartners,
      },
    });
  } catch (error) {
    console.error("Failed to load admin dashboard stats", error);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const entity = body?.entity as DashboardEntity | undefined;
    const id = Number(body?.id);

    if (!entity || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid delete request" }, { status: 400 });
    }

    let deleted = false;

    if (entity === "registration") {
      await deleteAmbassadorsByRegistrationId(id);
      deleted = await deleteAlgolympiaRegistration(id);
    } else if (entity === "stall") {
      deleted = await deleteStallRegistration(id);
    } else if (entity === "ambassador") {
      deleted = await deleteAmbassador(id);
    } else if (entity === "community") {
      deleted = await deleteCommunityPartnerEntry(id);
    } else {
      return NextResponse.json({ error: "Unsupported entity type" }, { status: 400 });
    }

    if (!deleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, entity, id });
  } catch (error) {
    console.error("Failed to delete dashboard entry", error);
    return NextResponse.json({ error: "Failed to delete dashboard entry" }, { status: 500 });
  }
}
