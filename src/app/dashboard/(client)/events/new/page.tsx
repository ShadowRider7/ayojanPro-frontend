import type { Metadata } from "next";
import { EventForm } from "@/components/modules/events/EventForm";

export const metadata: Metadata = {
  title: "New event",
  description: "Create an event and list the professional services you need.",
};

export default function NewEventPage() {
  return <EventForm />;
}
