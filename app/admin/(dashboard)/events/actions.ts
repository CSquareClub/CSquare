"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { eventFormSchema, toEventInput, type EventFormInput } from "@/lib/event-schema";
import { deleteEvent as deleteLegacyEvent, listAdminEvents, updateEvent as updateLegacyEvent } from "@/lib/events-store";
import { parseEventSponsors } from "@/lib/event-sponsors";

export type EventActionResult = {
  ok: boolean;
  message: string;
};

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function createEventAction(payload: EventFormInput): Promise<EventActionResult> {
  await ensureAdmin();

  const parsed = eventFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const input = toEventInput(parsed.data);

  try {
    await prisma.event.create({
      data: {
        ...input,
        slug: input.slug || slugify(input.title),
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { ok: true, message: "Event created" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { ok: false, message: "Slug already exists" };
    }
    return { ok: false, message: "Failed to create event" };
  }
}

export async function updateEventAction(id: string, payload: EventFormInput): Promise<EventActionResult> {
  await ensureAdmin();

  const parsed = eventFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const input = toEventInput(parsed.data);

  if (id.startsWith("legacy-")) {
    const legacyId = Number(id.replace("legacy-", ""));
    if (Number.isNaN(legacyId)) {
      return { ok: false, message: "Invalid legacy event id" };
    }

    const parsedSponsors = parseEventSponsors(input.sponsors || null);

    try {
      await updateLegacyEvent(legacyId, {
        title: input.title,
        description: input.description,
        startDate: input.startDateTime.toISOString(),
        endDate: input.endDateTime.toISOString(),
        location: [input.venueName, input.city].filter(Boolean).join(", ") || null,
        category: input.category,
        image: input.bannerImage || null,
        registrationUrl: input.registrationLink,
        isPublished: input.status === "published",
        sponsorTitle: parsedSponsors[0]?.title || null,
        sponsorLogoUrl: parsedSponsors[0]?.logoUrl || parsedSponsors[0]?.logoLightUrl || null,
        sponsorLogoLightUrl: parsedSponsors[0]?.logoLightUrl || parsedSponsors[0]?.logoUrl || null,
        sponsorLogoDarkUrl:
          parsedSponsors[0]?.logoDarkUrl || parsedSponsors[0]?.logoLightUrl || parsedSponsors[0]?.logoUrl || null,
        devfolioApplyLogoLightUrl: parsedSponsors[0]?.devfolioApplyLogoLightUrl || null,
        devfolioApplyLogoDarkUrl:
          parsedSponsors[0]?.devfolioApplyLogoDarkUrl || parsedSponsors[0]?.devfolioApplyLogoLightUrl || null,
        sponsors: parsedSponsors.map((sponsor) => ({
          eventId: legacyId,
          title: sponsor.title,
          logoUrl: sponsor.logoUrl,
          logoLightUrl: sponsor.logoLightUrl,
          logoDarkUrl: sponsor.logoDarkUrl,
          devfolioApplyLogoLightUrl: sponsor.devfolioApplyLogoLightUrl,
          devfolioApplyLogoDarkUrl: sponsor.devfolioApplyLogoDarkUrl,
        })),
      });

      revalidatePath("/admin/events");
      revalidatePath(`/admin/events/${id}`);
      revalidatePath("/events");

      return { ok: true, message: "Event updated" };
    } catch {
      return { ok: false, message: "Failed to update event" };
    }
  }

  try {
    await prisma.event.update({
      where: { id },
      data: {
        ...input,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/events");
    revalidatePath(`/events/${input.slug}`);

    return { ok: true, message: "Event updated" };
  } catch {
    return { ok: false, message: "Failed to update event" };
  }
}

export async function setEventStatusAction(id: string, status: "draft" | "published"): Promise<void> {
  await ensureAdmin();

  if (id.startsWith("legacy-")) {
    const legacyId = Number(id.replace("legacy-", ""));
    if (!Number.isNaN(legacyId)) {
      await updateLegacyEvent(legacyId, { isPublished: status === "published" });

      revalidatePath("/admin/events");
      revalidatePath("/events");
      return;
    }
  }

  await prisma.event.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteEventAction(id: string, slug: string): Promise<EventActionResult> {
  await ensureAdmin();

  try {
    if (id.startsWith("legacy-")) {
      const legacyId = Number(id.replace("legacy-", ""));
      if (Number.isNaN(legacyId)) {
        return { ok: false, message: "Invalid legacy event id" };
      }

      const deletedLegacy = await deleteLegacyEvent(legacyId);
      if (!deletedLegacy) {
        return { ok: false, message: "Event not found" };
      }

      await prisma.event.deleteMany({ where: { slug } });
    } else {
      await prisma.event.delete({ where: { id } });

      // Remove matching legacy rows so sync logic cannot recreate the deleted event.
      const legacyEvents = await listAdminEvents();
      const matchingLegacyIds = legacyEvents
        .filter((event) => normalizeSlug(event.title || "") === slug)
        .map((event) => event.id);

      if (matchingLegacyIds.length > 0) {
        await Promise.all(matchingLegacyIds.map((legacyId) => deleteLegacyEvent(legacyId)));
      }
    }

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/events");
    revalidatePath(`/events/${slug}`);

    return { ok: true, message: "Event deleted" };
  } catch {
    return { ok: false, message: "Failed to delete event" };
  }
}
