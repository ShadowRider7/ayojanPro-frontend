import type {
  DecimalValue,
  ISODateString,
  JsonObject,
  Nullable,
} from "./common.type";
import type { Contract } from "./contract.type";
import type { PaymentMethod, PaymentStage, PaymentStatus } from "./enums";
import type { Client } from "./user.type";

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
