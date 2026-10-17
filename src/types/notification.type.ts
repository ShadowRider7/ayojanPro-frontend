import type { ISODateString } from "./common.type";
import type { NotificationType } from "./enums";
import type { User } from "./user.type";

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
