import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { Client } from "./user.type";

export const REFUND_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export interface Refund {
  id: string;
  contractId: string;
  paymentId: string;
  clientId: string;
  amount: DecimalValue;
  currency: string;
  reason: string;
  status: RefundStatus;
  reference: Nullable<string>;
  note: Nullable<string>;
  settledAt: Nullable<ISODateString>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  contract?: Contract | null;
  client?: Client | null;
}

export interface SettleRefundPayload {
  status: "COMPLETED" | "FAILED";
  note?: string;
  reference?: string;
}
