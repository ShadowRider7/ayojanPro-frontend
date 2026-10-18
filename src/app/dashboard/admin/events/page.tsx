import type { Metadata } from "next";
import { AdminEvents } from "@/components/modules/admin/AdminEvents";

export const metadata: Metadata = {
  title: "Events",
  description:
    "All events on the platform — view their status, schedules, and requirements.",
};

export default function AdminEventsPage() {
  return <AdminEvents />;
}
