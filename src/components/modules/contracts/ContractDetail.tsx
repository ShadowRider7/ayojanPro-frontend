"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  FileTextIcon,
  StarIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ConfirmDialog,
  CurrencyText,
  DateText,
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useCancelContract,
  useCompleteContract,
  useContract,
  useContractDeliverable,
  useContractPayments,
  useCreateContractReview,
  useGetMe,
  useInitiateFinalPayment,
  useInitiateInitialPayment,
} from "@/hooks";
import type {
  ApiResponse,
  ContractStatus,
  InitiatePaymentResult,
  Payment,
} from "@/types";
import { humanize, toNumber } from "@/utils";
import { type ReviewFormValues, reviewFormSchema } from "@/validation";
import { DeliverableForm } from "./DeliverableForm";

/**
 * The backend splits the agreed amount in two (see `payment.service.ts`):
 * 30% up front to confirm the booking, 70% once the work is delivered.
 */
const INITIAL_PAYMENT_RATIO = 0.3;
const FINAL_PAYMENT_RATIO = 0.7;

/** Contract statuses the backend's cancel endpoint still accepts. */
const CANCELLABLE_STATUSES: ContractStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
];

/** What the bKash callback's `?payment=` param maps to, toast-wise. */
const PAYMENT_OUTCOMES: Record<
  string,
  { title: string; description: string; type: "success" | "error" | "info" }
> = {
  success: {
    title: "Payment successful",
    description:
      "Your bKash payment went through and the contract has been updated.",
    type: "success",
  },
  failure: {
    title: "Payment failed",
    description:
      "bKash could not complete the payment. You can try again below.",
    type: "error",
  },
  cancel: {
    title: "Payment cancelled",
    description: "You cancelled the bKash payment — no charge was made.",
    type: "info",
  },
  error: {
    title: "Payment error",
    description:
      "Something went wrong while processing the payment. Please try again.",
    type: "error",
  },
};

type ContractDetailProps = {
  contractId: string;
};

/**
 * `/dashboard/contracts/[contractId]` — one contract, end to end: the
 * bKash 30/70 payments, the professional's deliverable, cancellation and
 * completion, and (once completed) the client's review.
 *
 * The backend's bKash callback redirects back to this URL with
 * `?payment=success|failure|cancel|error`; the screen reads that param on
 * mount, toasts the outcome, refetches contract/payments and strips the
 * param again. That makes `useSearchParams` a hard dependency, so the page
 * wraps this component in Suspense.
 */
export function ContractDetail({ contractId }: ContractDetailProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handledPaymentResult = useRef(false);

  const { data, isPending, isError, error, refetch } = useContract(contractId);
  const paymentsQuery = useContractPayments(contractId);
  const deliverableQuery = useContractDeliverable(contractId);
  const { data: me } = useGetMe();
  const isProfessional = me?.data?.role === "PROFESSIONAL";
  const [deliverableFormOpen, setDeliverableFormOpen] = useState(false);

  const { mutate: cancel, isPending: isCancelling } = useCancelContract();
  const { mutate: complete, isPending: isCompleting } = useCompleteContract();
  const { mutate: startInitial, isPending: isStartingInitial } =
    useInitiateInitialPayment();
  const { mutate: startFinal, isPending: isStartingFinal } =
    useInitiateFinalPayment();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [completeOpen, setCompleteOpen] = useState(false);

  // The bKash callback lands here; acknowledge the outcome once, then drop
  // the param so a refresh doesn't replay the toast.
  useEffect(() => {
    const result = searchParams.get("payment");

    if (!result || handledPaymentResult.current) {
      return;
    }

    handledPaymentResult.current = true;

    const outcome = PAYMENT_OUTCOMES[result];

    if (outcome) {
      toast.add(outcome);
    }

    // The callback updates the contract, its payment row and (on the final
    // half) the contract's lifecycle, so refresh all three key trees.
    queryClient.invalidateQueries({ queryKey: ["contracts"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });

    router.replace(pathname, { scroll: false });
  }, [searchParams, router, pathname, queryClient]);

  if (isPending) {
    return <ContractDetailSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <ErrorState
        title="Could not load this contract"
        error={error}
        onRetry={refetch}
      />
    );
  }

  const contract = data.data;
  const professional = contract.professional ?? null;
  const event = contract.event ?? null;
  const requirement = contract.eventServiceRequirement ?? null;

  const payments = paymentsQuery.data?.data ?? [];
  // The backend keeps one payment row per contract (the stage flips
  // INITIAL → FINAL as the halves are attempted); take the latest defensively.
  const payment = payments.length > 0 ? payments[payments.length - 1] : null;
  const fullyPaid = payment?.status === "COMPLETED";
  // PARTIALLY_COMPLETED means the 30% initial settled — a failed or
  // cancelled final attempt reverts the row to exactly this state.
  const initialSettled = payment?.status === "PARTIALLY_COMPLETED";
  const initialAttemptInFlight =
    payment?.stage === "INITIAL" && payment?.status === "PENDING";

  const agreedAmount = toNumber(contract.agreedAmount) ?? 0;
  const initialAmount = agreedAmount * INITIAL_PAYMENT_RATIO;
  const finalAmount = agreedAmount * FINAL_PAYMENT_RATIO;

  const isCancellable = CANCELLABLE_STATUSES.includes(contract.status);
  // The backend refuses `complete` until the final payment settled; its 400
  // is surfaced as the error toast, so the button only guards the status.
  const canComplete = contract.status === "DELIVERED";
  const canPayInitial =
    contract.status === "PENDING" && !initialSettled && !fullyPaid;
  const canPayFinal = contract.status === "DELIVERED" && !fullyPaid;
  const isRedirecting = isStartingInitial || isStartingFinal;

  const refreshContractTrees = () => {
    queryClient.invalidateQueries({ queryKey: ["contracts"] });
    // Cancelling/completing flips the requirement, which the event screen shows.
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const handlePay = (stage: "initial" | "final") => {
    const options: {
      onSuccess: (response: ApiResponse<InitiatePaymentResult>) => void;
      onError: (err: Error) => void;
    } = {
      onSuccess: (response) => {
        if (response.data?.paymentUrl) {
          // bKash owns the next screen; its callback redirects back here.
          window.location.href = response.data.paymentUrl;
        }
      },
      onError: (err) => {
        toast.add({
          title: "Could not start the payment",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      },
    };

    if (stage === "initial") {
      startInitial(contractId, options);
    } else {
      startFinal(contractId, options);
    }
  };

  const handleCancel = () => {
    cancel(
      {
        contractId,
        payload: cancelReason.trim() ? { reason: cancelReason.trim() } : {},
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Contract cancelled",
            description:
              "The requirement is open for new proposals again and the professional has been notified.",
            type: "success",
          });
          refreshContractTrees();
          setCancelOpen(false);
          setCancelReason("");
        },
        onError: (err) => {
          toast.add({
            title: "Could not cancel the contract",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
          setCancelOpen(false);
        },
      },
    );
  };

  const handleComplete = () => {
    complete(contractId, {
      onSuccess: () => {
        toast.add({
          title: "Contract completed",
          description:
            "Both parties have been notified — you can now leave a review.",
          type: "success",
        });
        refreshContractTrees();
        setCompleteOpen(false);
      },
      onError: (err) => {
        toast.add({
          title: "Could not complete the contract",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
        setCompleteOpen(false);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={event?.title ?? requirement?.serviceName ?? "Contract"}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {requirement?.serviceName ?? "Service"} ·{" "}
              {isProfessional
                ? `${contract.client?.user?.name ?? "Client"}`
                : `${professional?.name ?? "Professional"}`}
            </span>
            <StatusBadge status={contract.status} />
          </span>
        }
      >
        <Button
          variant="outline"
          render={
            <Link href="/dashboard/contracts">
              <ArrowLeftIcon /> Back to contracts
            </Link>
          }
        />
        {isCancellable ? (
          <Button
            variant="destructive"
            disabled={isCancelling || isCompleting}
            onClick={() => setCancelOpen(true)}
          >
            Cancel contract
          </Button>
        ) : null}
        {canComplete && !isProfessional ? (
          <Button
            disabled={isCancelling || isCompleting}
            onClick={() => setCompleteOpen(true)}
          >
            Mark as completed
          </Button>
        ) : null}
      </PageHeader>

      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Agreed amount">
              <CurrencyText
                value={contract.agreedAmount}
                currency={contract.currency}
                className="font-semibold"
              />
            </DetailRow>
            <DetailRow label="Service schedule">
              <DateText value={contract.serviceStartAt} /> –{" "}
              <DateText value={contract.serviceEndAt} />
            </DetailRow>
            <DetailRow label="Requested">
              Created <DateText value={contract.createdAt} />
            </DetailRow>
            {contract.confirmedAt ? (
              <DetailRow label="Confirmed">
                <DateText value={contract.confirmedAt} mode="datetime" />
              </DetailRow>
            ) : null}
            {contract.completedAt ? (
              <DetailRow label="Completed">
                <DateText value={contract.completedAt} mode="datetime" />
              </DetailRow>
            ) : null}
            {contract.cancelledAt ? (
              <DetailRow label="Cancelled">
                <DateText value={contract.cancelledAt} mode="datetime" />
              </DetailRow>
            ) : null}
            {contract.cancellationReason ? (
              <DetailRow label="Cancellation reason">
                {contract.cancellationReason}
              </DetailRow>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-3">
            <Button
              variant="link"
              size="sm"
              nativeButton={false}
              className="h-auto p-0"
              render={
                <Link href={`/dashboard/events/${contract.eventId}`}>
                  View event
                </Link>
              }
            />
            <Button
              variant="link"
              size="sm"
              nativeButton={false}
              className="h-auto p-0"
              render={
                <Link href={`/professionals/${contract.professionalId}`}>
                  View professional's profile
                </Link>
              }
            />
          </div>
        </CardContent>
      </Card>

      {!isProfessional ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold">Payments</h2>
            <p className="text-sm text-muted-foreground">
              Paid through bKash in two parts: 30% to confirm the booking, 70%
              once the work is delivered.
            </p>
          </div>

          <Card size="sm">
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">Initial (30%)</span>
                    <CurrencyText
                      value={initialAmount}
                      currency={contract.currency}
                      className="font-semibold"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contract.status === "CANCELLED"
                      ? "Cancelled — no longer due on this contract."
                      : initialSettled || fullyPaid
                        ? "Paid — the professional is booked."
                        : "Due to confirm the booking."}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">Final (70%)</span>
                    <CurrencyText
                      value={finalAmount}
                      currency={contract.currency}
                      className="font-semibold"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contract.status === "CANCELLED"
                      ? "Cancelled — no longer due on this contract."
                      : fullyPaid
                        ? "Paid — the contract is settled."
                        : "Due after the work is delivered."}
                  </p>
                </div>
              </div>

              {fullyPaid ? (
                <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CircleCheckIcon className="size-4 shrink-0" />
                  Fully paid — nothing else is due on this contract.
                </p>
              ) : null}

              {canPayInitial ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-3">
                  <p className="text-sm text-muted-foreground">
                    Pay the{" "}
                    <CurrencyText
                      value={initialAmount}
                      currency={contract.currency}
                      className="font-medium text-foreground"
                    />{" "}
                    advance to confirm the booking.
                    {initialAttemptInFlight
                      ? " A previous attempt did not finish — starting again is safe."
                      : ""}
                  </p>
                  <Button
                    disabled={isRedirecting}
                    onClick={() => handlePay("initial")}
                  >
                    {isStartingInitial ? <Spinner /> : <BanknoteIcon />}
                    Pay initial (30%)
                  </Button>
                </div>
              ) : null}

              {canPayFinal ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-3">
                  <p className="text-sm text-muted-foreground">
                    The work is delivered — pay the remaining{" "}
                    <CurrencyText
                      value={finalAmount}
                      currency={contract.currency}
                      className="font-medium text-foreground"
                    />{" "}
                    to complete the contract.
                  </p>
                  <Button
                    disabled={isRedirecting}
                    onClick={() => handlePay("final")}
                  >
                    {isStartingFinal ? <Spinner /> : <BanknoteIcon />}
                    Pay final (70%)
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-sm font-medium">
              Payment history
            </h3>
            {paymentsQuery.isPending ? (
              <Skeleton className="h-16 w-full" />
            ) : paymentsQuery.isError ? (
              <ErrorState
                title="Could not load payments"
                error={paymentsQuery.error}
                onRetry={paymentsQuery.refetch}
                className="py-6"
              />
            ) : payments.length === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                No payments yet — each bKash attempt is listed here.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {payments.map((row) => (
                  <PaymentRow key={row.id} payment={row} />
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">Deliverable</h2>
          <p className="text-sm text-muted-foreground">
            {isProfessional
              ? "Submit the finished work for this contract — usually links to the final deliverables."
              : "What the professional submitted for this contract — usually links to the finished work."}
          </p>
        </div>

        {isProfessional && contract.status !== "CANCELLED" ? (
          <Button
            variant="outline"
            className="w-fit"
            disabled={isCancelling || isCompleting}
            onClick={() => setDeliverableFormOpen(true)}
          >
            <UploadIcon />
            {deliverableQuery.data?.data
              ? "Update deliverable"
              : "Submit deliverable"}
          </Button>
        ) : null}

        {deliverableQuery.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : deliverableQuery.isError ? (
          <ErrorState
            title="Could not load the deliverable"
            error={deliverableQuery.error}
            onRetry={deliverableQuery.refetch}
          />
        ) : deliverableQuery.data?.data ? (
          (() => {
            const deliverable = deliverableQuery.data.data;

            return (
              <Card size="sm">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">
                      {deliverable.title ?? "Submitted work"}
                    </p>
                    <DateText
                      value={deliverable.submittedAt}
                      mode="datetime"
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                  {deliverable.description ? (
                    <p className="text-sm text-muted-foreground">
                      {deliverable.description}
                    </p>
                  ) : null}
                  <ul className="flex flex-col gap-2 border-t pt-3">
                    {deliverable.externalUrl.map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                        >
                          <ExternalLinkIcon className="size-4 shrink-0" />
                          <span className="truncate">{url}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })()
        ) : (
          <EmptyState
            icon={FileTextIcon}
            title="No deliverable yet"
            description={
              contract.status === "CANCELLED"
                ? "The contract was cancelled before anything was delivered."
                : "The professional has not submitted anything yet. You will be notified when they do."
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">Review</h2>
          <p className="text-sm text-muted-foreground">
            {isProfessional
              ? "What the client said about your work — reviews are shown on your public profile."
              : `Once the contract is completed you can rate ${professional?.name ?? "the professional"} — the review shows on their public profile.`}
          </p>
        </div>

        {isProfessional ? (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            Reviews from clients appear here once the contract is completed.
          </p>
        ) : contract.status === "COMPLETED" ? (
          <ReviewForm
            contractId={contractId}
            professionalName={professional?.name ?? "the professional"}
          />
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            Reviews unlock once the contract is completed.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) {
            setCancelReason("");
          }
        }}
        title="Cancel this contract?"
        description="The requirement re-opens for new proposals and the professional is notified. This cannot be undone."
        confirmLabel="Cancel contract"
        variant="destructive"
        loading={isCancelling}
        onConfirm={handleCancel}
      >
        <Field>
          <FieldLabel htmlFor="cancel-reason">Reason (optional)</FieldLabel>
          <Textarea
            id="cancel-reason"
            rows={3}
            maxLength={2000}
            placeholder="e.g. The dates no longer work for us."
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
          <FieldDescription>
            Shared with the professional. 2000 characters max.
          </FieldDescription>
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Mark this contract as completed?"
        description="Both parties are notified. This is only accepted once the final (70%) payment has settled."
        confirmLabel="Mark as completed"
        variant="default"
        loading={isCompleting}
        onConfirm={handleComplete}
      />

      {deliverableQuery.data?.data ? (
        <DeliverableForm
          contractId={contractId}
          deliverable={deliverableQuery.data.data}
          open={deliverableFormOpen}
          onOpenChange={setDeliverableFormOpen}
        />
      ) : (
        <DeliverableForm
          contractId={contractId}
          deliverable={null}
          open={deliverableFormOpen}
          onOpenChange={setDeliverableFormOpen}
        />
      )}
    </div>
  );
}

/** Label/value pair used across the contract summary card. */
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

/** One line of the per-contract payment history. */
function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border bg-card p-3 text-sm ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">
          {payment.stage === "INITIAL" ? "Initial payment" : "Final payment"}
        </span>
        <StatusBadge status={payment.status} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {payment.bkashTransactionId ? (
          <span>TrxID {payment.bkashTransactionId}</span>
        ) : null}
        {payment.failureReason ? <span>{payment.failureReason}</span> : null}
        <span>{humanize(payment.method)}</span>
        <DateText
          value={payment.paidAt ?? payment.transactionTime ?? payment.createdAt}
          mode="datetime"
        />
        <CurrencyText
          value={payment.amount}
          currency={payment.currency}
          className="text-sm font-medium text-foreground"
        />
      </div>
    </li>
  );
}

/**
 * The star-rating + comment form, unlocked at `COMPLETED`. There is no
 * reliable "did I already review this contract?" endpoint (the review list
 * routes are not usable for it), so a duplicate submit simply surfaces the
 * backend's "You Have Already Reviewed This Contract" error as a toast.
 */
function ReviewForm({
  contractId,
  professionalName,
}: {
  contractId: string;
  professionalName: string;
}) {
  const queryClient = useQueryClient();
  const { mutate: submitReview, isPending } = useCreateContractReview();

  const form = useForm({
    defaultValues: { rating: 0, comment: "" } satisfies ReviewFormValues,
    validators: {
      onSubmit: reviewFormSchema,
    },
    onSubmit: ({ value }) => {
      submitReview(
        {
          contractId,
          payload: {
            rating: value.rating,
            ...(value.comment.trim() ? { comment: value.comment } : {}),
          },
        },
        {
          onSuccess: () => {
            toast.add({
              title: "Review submitted",
              description: `Thanks — your rating is now on ${professionalName}'s profile.`,
              type: "success",
            });
            // A client's review feeds the professional's public aggregates.
            queryClient.invalidateQueries({
              queryKey: ["publicProfessionals"],
            });
            queryClient.invalidateQueries({ queryKey: ["publicProfessional"] });
            form.reset();
          },
          onError: (err) => {
            toast.add({
              title: "Could not submit the review",
              description:
                err.message || "Something went wrong. Please try again",
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <Card size="sm">
      <CardContent>
        <form
          id="review-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="rating">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Rating</FieldLabel>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          aria-pressed={star <= field.state.value}
                          aria-label={`${star} star${star === 1 ? "" : "s"}`}
                          className="rounded-md p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                          onClick={() => field.handleChange(star)}
                        >
                          <StarIcon
                            className={
                              star <= field.state.value
                                ? "size-6 fill-amber-400 text-amber-400"
                                : "size-6 text-muted-foreground/40"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                    <FieldDescription>
                      1–5 stars. Your rating becomes part of the professional's
                      public score.
                    </FieldDescription>
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="comment">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Comment (optional)
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      rows={3}
                      placeholder="How did the work go?"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>

        <div className="mt-4 flex justify-end">
          <Button type="submit" form="review-form" disabled={isPending}>
            {isPending ? <Spinner /> : <StarIcon />}
            Submit review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Mirrors the detail screen's structure while the contract loads — also the page's Suspense fallback. */
export function ContractDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
