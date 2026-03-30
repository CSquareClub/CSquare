import { EventForm } from "@/app/admin/(dashboard)/events/_components/event-form";
import { createEventAction } from "@/app/admin/(dashboard)/events/actions";
import type { EventFormInput } from "@/lib/event-schema";

const defaults: EventFormInput = {
  title: "",
  tagline: "",
  description: "",
  category: "Workshop",
  eventType: "Offline",
  tagsInput: "",
  startDateTime: "",
  endDateTime: "",
  venueName: "",
  city: "",
  onlineLink: "",
  organizerName: "",
  contactEmail: "",
  registrationLink: "",
  registrationDeadline: "",
  bannerImage: "",
  prizes: "",
  rules: "",
  schedule: "",
  sponsors: "",
  status: "draft",
  slug: "",
};

export default function CreateEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a new event with external registration link.</p>
      </div>
      <EventForm mode="create" defaultValues={defaults} submitAction={createEventAction} />
    </div>
  );
}
