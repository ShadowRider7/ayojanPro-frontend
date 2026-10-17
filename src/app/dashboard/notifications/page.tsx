import type { Metadata } from "next";
import { NotificationList } from "@/components/modules/notifications/NotificationList";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "Updates about your AyojanPro events, proposals, contracts and payments.",
};

export default function NotificationsPage() {
  return <NotificationList />;
}
