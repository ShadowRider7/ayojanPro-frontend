/**
 * CANCELLATION POLICY
 * ──────────────────────────
 * Keep in sync with `contract.policy.ts` in the backend
 * (C:\projects\AyojanPro\src\app\module\contract\contract.policy.ts).
 *
 * A professional may only cancel a contract while the service is still at
 * least 5 days away. Inside that window they have to raise a dispute, which
 * an admin reviews. The client can cancel at any time while the contract is
 * still cancellable.
 */
export const PROFESSIONAL_CANCEL_NOTICE_HOURS = 120;

export const PROFESSIONAL_CANCEL_NOTICE_DAYS = 5;

const HOUR_IN_MS = 60 * 60 * 1000;

export const PROFESSIONAL_CANCEL_NOTICE_MS =
  PROFESSIONAL_CANCEL_NOTICE_HOURS * HOUR_IN_MS;

/**
 * The last moment a professional is allowed to cancel a contract.
 */
export function getProfessionalCancellationDeadline(
  serviceStartAt: string | number | Date,
) {
  return new Date(
    new Date(serviceStartAt).getTime() - PROFESSIONAL_CANCEL_NOTICE_MS,
  );
}

/**
 * True while the professional still has time to cancel on their own.
 */
export function isProfessionalCancellationWindowOpen(
  serviceStartAt: string | number | Date,
  now: Date = new Date(),
) {
  return (
    now.getTime() <=
    getProfessionalCancellationDeadline(serviceStartAt).getTime()
  );
}

export const PROFESSIONAL_CANCEL_NOTICE_MESSAGE = `You can only cancel a contract at least ${PROFESSIONAL_CANCEL_NOTICE_DAYS} days (${PROFESSIONAL_CANCEL_NOTICE_HOURS} hours) before the service starts. Raise a dispute instead and an admin will review it.`;
