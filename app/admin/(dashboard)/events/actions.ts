"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { eventFormSchema, toEventInput, type EventFormInput } from "@/lib/event-schema";
import { updateEvent as updateLegacyEvent } from "@/lib/events-store";

export type EventActionResult = {
  ok: boolean;
  message: string;
};

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
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
