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

export async function listAdminEventsFromDb(): Promise<EventRecord[]> {
  return prisma.event.findMany({
    orderBy: { startDateTime: "desc" },
  });
}

export async function listPublishedEventsFromDb(): Promise<EventRecord[]> {
  return prisma.event.findMany({
    where: { status: "published" },
    orderBy: { startDateTime: "asc" },
  });
}

export async function getAdminEventById(id: string): Promise<EventRecord | null> {
  return prisma.event.findUnique({ where: { id } });
}

export async function getPublishedEventBySlug(slug: string): Promise<EventRecord | null> {
  return prisma.event.findFirst({
    where: { slug, status: "published" },
  });
}
