import type { Metadata } from "next";
import { EventBrowse } from "@/components/modules/events/EventBrowse";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Find published events that need your services and send proposals.",
};

export default function BrowseEventsPage() {
  return <EventBrowse />;
}
