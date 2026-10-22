import type { Metadata } from "next";
import { EventDetail } from "@/components/modules/events/EventDetail";

export const metadata: Metadata = {
  title: "Event",
  description: "Manage an event and the professional services it needs.",
};

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { eventId } = await params;

  return <EventDetail eventId={eventId} />;
}
