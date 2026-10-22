import type { Metadata } from "next";
import { EventForm } from "@/components/modules/events/EventForm";

export const metadata: Metadata = {
  title: "Edit event",
  description: "Update an event's details, schedule and location.",
};

type EditEventPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;

  return <EventForm eventId={eventId} />;
}
