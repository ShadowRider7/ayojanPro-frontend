import type { Event } from "./event.type";
import type { Professional } from "./professional.type";
import type { Client, User } from "./user.type";

export interface AdminUser extends User {
  client: Client | null;
  professional: Professional | null;
}

export interface AdminEvent extends Omit<Event, "client"> {
  client: (Client & { user: User }) | null;
}

export interface UpdateUserStatusPayload {
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
}

export interface ApproveProfessionalPayload {
  professionalId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
