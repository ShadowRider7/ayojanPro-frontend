import type { ISODateString } from "./common.type";
import type { User } from "./user.type";

/** Notification category (`NotificationType` enum). */
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

/** An in-app notification (`Notification` model, db table `notifications`). */
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
