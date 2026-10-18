import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  Contract,
  CreateProposalPayload,
  Proposal,
  ProposalItem,
} from "@/types";

/**
 * `POST /proposal/events/:eventId` — submit one proposal covering one or
 * more of the event's service requirements (professional only). The backend
 * rejects requirements that are not `OPEN`/`PARTIALLY_FILLED`, requirements
 * or services that are not the caller's own, and a repeat bid on a
 * requirement where this professional already has an active item (409).
 * Returns the created `Proposal` with its items.
 */
export function createProposal(payload: CreateProposalPayload) {
  return apiClient<ApiResponse<Proposal>>(
    `/proposal/events/${payload.eventId}`,
    {
      method: "POST",
      body: { message: payload.message, items: payload.items },
    },
  );
}

/**
 * `GET /proposal/me` — every proposal the signed-in professional submitted,
 * newest first, each with its event and items (each item with its requirement
 * and the professional's service). The endpoint does not paginate: `data` is
 * a plain array.
 */
export function getMyProposals() {
  return apiClient<ApiResponse<Proposal[]>>("/proposal/me");
}

/**
 * `PATCH /proposal/:proposalId/withdraw` — withdraw one own proposal
 * (professional only): every still-`PENDING` item becomes `WITHDRAWN` and
 * the client is notified; responded items are left untouched. Fails with a
 * 400 when nothing is pending. Returns the updated `ProposalItem`, or an
 * array when several items were pending.
 */
export function withdrawProposal(proposalId: string) {
  return apiClient<ApiResponse<ProposalItem | ProposalItem[]>>(
    `/proposal/${proposalId}/withdraw`,
    { method: "PATCH" },
  );
}

/**
 * `GET /proposal/requirements/:requirementId` — every proposal that bid on
 * one service requirement (client/admin only). The backend does not paginate:
 * `data` is a plain array, and each proposal's `items` are pre-filtered to
 * just the requested requirement (one item per proposal — the same
 * requirement cannot be bid twice in one proposal).
 */
export function getRequirementProposals(requirementId: string) {
  return apiClient<ApiResponse<Proposal[]>>(
    `/proposal/requirements/${requirementId}`,
  );
}

/**
 * `GET /proposal/:id` — one proposal with its professional, event and **all**
 * of its items (each with its requirement, the professional's service and the
 * contract created from it, if any). A proposal can span several
 * requirements of the same event, so this is the only view that shows the
 * full blast radius of an accept. 404 for unknown ids.
 */
export function getProposal(proposalId: string) {
  return apiClient<ApiResponse<Proposal>>(`/proposal/${proposalId}`);
}

/**
 * `PATCH /proposal/:proposalId/accept` — accept the whole proposal (client
 * only). Every pending item becomes a contract at its proposed amount and
 * schedule, its requirement flips to `FILLED`, and competing pending items
 * for those requirements are auto-rejected. Returns the created `Contract`,
 * or an array when several items were accepted. Fails with 400/409 when a
 * requirement was just filled by someone else.
 */
export function acceptProposal(proposalId: string) {
  return apiClient<ApiResponse<Contract | Contract[]>>(
    `/proposal/${proposalId}/accept`,
    { method: "PATCH" },
  );
}

/**
 * `PATCH /proposal/:proposalId/reject` — reject the whole proposal (client
 * only): every pending item is marked `REJECTED`. Returns the updated
 * `ProposalItem`, or an array when several items were pending.
 */
export function rejectProposal(proposalId: string) {
  return apiClient<ApiResponse<ProposalItem | ProposalItem[]>>(
    `/proposal/${proposalId}/reject`,
    { method: "PATCH" },
  );
}
