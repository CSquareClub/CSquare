import prisma from "@/lib/db";

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string;
  category: string;
  eventType: string;
  tags: string[];
  startDateTime: Date;
  endDateTime: Date;
  venueName: string | null;
  city: string | null;
  onlineLink: string | null;
  organizerName: string;
  contactEmail: string;
  registrationLink: string;
  registrationDeadline: Date | null;
  bannerImage: string | null;
  prizes: string | null;
  rules: string | null;
  schedule: string | null;
  sponsors: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function isMissingEventTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: string; meta?: { modelName?: string } };
  return maybeError.code === "P2021" && maybeError.meta?.modelName === "Event";
}

export async function listAdminEventsFromDb(): Promise<EventRecord[]> {
  try {
    return await prisma.event.findMany({
      orderBy: { startDateTime: "desc" },
    });
  } catch (error) {
    if (isMissingEventTableError(error)) return [];
    throw error;
  }
}

export async function listPublishedEventsFromDb(): Promise<EventRecord[]> {
  try {
    return await prisma.event.findMany({
      where: { status: "published" },
      orderBy: { startDateTime: "asc" },
    });
  } catch (error) {
    if (isMissingEventTableError(error)) return [];
    throw error;
  }
}

export async function getAdminEventById(id: string): Promise<EventRecord | null> {
  try {
    return await prisma.event.findUnique({ where: { id } });
  } catch (error) {
    if (isMissingEventTableError(error)) return null;
    throw error;
  }
}

export async function getPublishedEventBySlug(slug: string): Promise<EventRecord | null> {
  try {
    return await prisma.event.findFirst({
      where: { slug, status: "published" },
    });
  } catch (error) {
    if (isMissingEventTableError(error)) return null;
    throw error;
  }
}
