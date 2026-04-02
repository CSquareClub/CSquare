import { redirect } from "next/navigation";

export default function CreateEventRedirectPage() {
  redirect("/admin/events");
}
