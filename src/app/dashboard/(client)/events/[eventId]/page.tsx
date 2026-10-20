import type { Metadata } from "next";
import { EventDetail } from "@/components/modules/events/EventDetail";

export const metadata: Metadata = {
  title: "Event",
  description: "Manage an event and the professional services it needs.",
};

/**
 * A static export has no server to render the route on demand, and Next.js
 * rejects a `generateStaticParams()` that returns an empty array:
 * "With `output: export`, at least one route must be generated."
 *
 * The placeholder gives the route one path to be exported under. The real
 * event id arrives on the client, so the page renders for any id.
 */
export function generateStaticParams() {
  return [{ eventId: "placeholder" }];
}

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { eventId } = await params;

  return <EventDetail eventId={eventId} />;
}
