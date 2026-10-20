import type { Contract } from "./contract.type";
import type { Event } from "./event.type";
import type { Professional } from "./professional.type";
import type { Refund } from "./refund.type";
import type { Client, SettableUserStatus, User } from "./user.type";

export interface AdminUser extends User {
  client: Client | null;
  professional: Professional | null;
}

export interface AdminEvent extends Omit<Event, "client"> {
  client: (Client & { user: User }) | null;
}

export interface AdminRefund extends Refund {
  contract: (Contract & { event: Event }) | null;
  client: (Client & { user: User }) | null;
}

export interface UpdateUserStatusPayload {
  status: SettableUserStatus;
}

export interface ApproveProfessionalPayload {
  professionalId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
