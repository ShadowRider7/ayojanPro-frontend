import type { ISODateString } from "./common.type";
import type { User } from "./user.type";

export const NOTIFICATION_TYPES = [
  "APPLICATION",
  "PROPOSAL",
  "CONTRACT",
  "PAYMENT",
  "SERVICE",
  "REVIEW",
  "DISPUTE",
  "SYSTEM",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: string;
  userId: string;
  title: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: ISODateString;
  user?: User;
}

export interface MarkAllNotificationsReadResult {
  updatedCount: number;
}
