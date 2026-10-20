import type {
  DecimalValue,
  ISODateString,
  JsonObject,
  Nullable,
} from "./common.type";
import type { Contract } from "./contract.type";
import type { Refund } from "./refund.type";
import type { Client } from "./user.type";

export const PAYMENT_STAGES = ["INITIAL", "FINAL"] as const;
export type PaymentStage = (typeof PAYMENT_STAGES)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PARTIALLY_COMPLETED",
  "ESCROWED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["BKASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

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
  releasedAt: Nullable<ISODateString>;
  refundedAt: Nullable<ISODateString>;
  refundAmount: Nullable<DecimalValue>;
  refundReason: Nullable<string>;
  refundReference: Nullable<string>;
  failureReason: Nullable<string>;
  metadata: Nullable<JsonObject>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  contract?: Contract;
  client?: Client;
  refund?: Refund | null;
}

export interface InitiatePaymentResult {
  paymentUrl: string;
}
