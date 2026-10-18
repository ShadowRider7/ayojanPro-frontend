import type { Event } from "./event.type";
import type { Professional } from "./professional.type";
import type { Client, User } from "./user.type";

/** User row returned by `GET /admin/users` — User with `client` and `professional` relations. */
export interface AdminUser extends User {
  client: Client | null;
  professional: Professional | null;
}

/** Event row returned by `GET /admin/events` — Event with `client.user` and `serviceRequirements`. */
export interface AdminEvent extends Omit<Event, "client"> {
  client: (Client & { user: User }) | null;
}

/** `PATCH /admin/users/:id/status` body. */
export interface UpdateUserStatusPayload {
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
}

/** `POST /professional/approve-professional` body. */
export interface ApproveProfessionalPayload {
  professionalId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
