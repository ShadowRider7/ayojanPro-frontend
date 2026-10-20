import type { Metadata } from "next";
import PublicEventDetail from "@/components/modules/events/PublicEventDetail";

export const metadata: Metadata = {
  title: "Event",
  description:
    "See the services an event needs and the budget for each one on AyojanPro.",
};

export function generateStaticParams() {
  return [{ eventId: "placeholder" }];
}

type PublicEventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function PublicEventDetailPage({
  params,
}: PublicEventDetailPageProps) {
  const { eventId } = await params;

  return <PublicEventDetail eventId={eventId} />;
}
