import type { Metadata } from "next";
import { EventBrowseDetail } from "@/components/modules/events/EventBrowseDetail";

export const metadata: Metadata = {
  title: "Event",
  description: "See what services an event needs and send a proposal.",
};

type BrowseEventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function BrowseEventDetailPage({
  params,
}: BrowseEventDetailPageProps) {
  const { eventId } = await params;

  return <EventBrowseDetail eventId={eventId} />;
}
