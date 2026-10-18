import type { Metadata } from "next";
import { EventList } from "@/components/modules/events/EventList";

export const metadata: Metadata = {
  title: "Events",
  description: "Create and manage the events you need professionals for.",
};

export default function EventsPage() {
  return <EventList />;
}
