import type {
  DecimalValue,
  ISODateString,
  JsonObject,
  Nullable,
} from "./common.type";
import type { Contract } from "./contract.type";
import type { Client } from "./user.type";

/** Which half of a contract a payment settles (`PaymentStage` enum). */
export const PAYMENT_STAGES = ["INITIAL", "FINAL"] as const;
export type PaymentStage = (typeof PAYMENT_STAGES)[number];

/** Payment lifecycle (`PaymentStatus` enum). */
export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PARTIALLY_COMPLETED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Supported payment providers (`PaymentMethod` enum). */
export const PAYMENT_METHODS = ["BKASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** A bkash payment for a contract (`Payment` model). */
export interface Payment {
  id: string;
  contractId: string;
  clientId: string;
  stage: PaymentStage;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: DecimalValue;
  currency: string;
  bkashPaymentId: Nullable<string>;
  bkashTransactionId: Nullable<string>;
  payerReference: Nullable<string>;
  merchantInvoiceNumber: Nullable<string>;
  transactionTime: Nullable<ISODateString>;
  paidAt: Nullable<ISODateString>;
  failureReason: Nullable<string>;
  metadata: Nullable<JsonObject>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  contract?: Contract;
  client?: Client;
}

/** `POST /payment/contracts/:id/{initial,final}` — redirect target. */
export interface InitiatePaymentResult {
  paymentUrl: string;
}
