import type { Metadata } from "next";
import PublicEventDetail from "@/components/modules/events/PublicEventDetail";
import { staticExportParams } from "@/lib/static-params";

export const metadata: Metadata = {
  title: "Event",
  description:
    "See the services an event needs and the budget for each one on AyojanPro.",
};

export function generateStaticParams() {
  return staticExportParams("eventId");
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
