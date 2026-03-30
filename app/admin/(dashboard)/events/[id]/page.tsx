import { notFound } from "next/navigation";

import { EventForm } from "@/app/admin/(dashboard)/events/_components/event-form";
import { updateEventAction } from "@/app/admin/(dashboard)/events/actions";
import { getAdminEventById } from "@/lib/event-service";
import type { EventFormInput } from "@/lib/event-schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

const ALLOWED_CATEGORIES: EventFormInput["category"][] = ["Hackathon", "Workshop", "Fest", "Meetup"];
const ALLOWED_EVENT_TYPES: EventFormInput["eventType"][] = ["Online", "Offline", "Hybrid"];

function toInputDateValue(value: Date): string {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function normalizeCategory(value: string): EventFormInput["category"] {
  return ALLOWED_CATEGORIES.includes(value as EventFormInput["category"])
    ? (value as EventFormInput["category"])
    : "Workshop";
}

function normalizeEventType(value: string): EventFormInput["eventType"] {
  return ALLOWED_EVENT_TYPES.includes(value as EventFormInput["eventType"])
    ? (value as EventFormInput["eventType"])
    : "Offline";
}

function normalizeRegistrationLink(value: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return value;
    }
  } catch {
    // Fall through to default.
  }

  return "https://csquare.club/events";
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getAdminEventById(id);

  if (!event) {
    notFound();
  }

  const defaults: EventFormInput = {
    title: event.title,
    tagline: event.tagline || "",
    description: event.description,
    category: normalizeCategory(event.category),
    eventType: normalizeEventType(event.eventType),
    tagsInput: event.tags.join(", "),
    startDateTime: toInputDateValue(event.startDateTime),
    endDateTime: toInputDateValue(event.endDateTime),
    venueName: event.venueName || "",
    city: event.city || "",
    onlineLink: event.onlineLink || "",
    organizerName: event.organizerName,
    contactEmail: event.contactEmail,
    registrationLink: normalizeRegistrationLink(event.registrationLink),
    registrationDeadline: event.registrationDeadline ? toInputDateValue(event.registrationDeadline) : "",
    bannerImage: event.bannerImage || "",
    prizes: event.prizes || "",
    rules: event.rules || "",
    schedule: event.schedule || "",
    sponsors: event.sponsors || "",
    status: event.status === "published" ? "published" : "draft",
    slug: event.slug,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update event content and publish state.</p>
      </div>
      <EventForm mode="edit" defaultValues={defaults} submitAction={updateEventAction.bind(null, event.id)} />
    </div>
  );
}
