/**
 * Hierarchical query-key factory (plan T4).
 *
 * Every key is an `as const` tuple rooted at a domain, so whole domains (or
 * sub-domains) can be invalidated cheaply:
 *
 * ```ts
 * queryClient.invalidateQueries({ queryKey: queryKeys.events.all });   // domain
 * queryClient.invalidateQueries({ queryKey: queryKeys.events.mine() }); // list
 * ```
 *
 * Keys mirror the verified backend endpoints in plan §2.
 */

import type { IQuery } from "@/types";

/** Params bags become part of the key so pagination/filter changes refetch. */
type ListParams = IQuery | undefined;

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
  },

  professionals: {
    all: ["professionals"] as const,
    /** Public directory: `GET /professional/public/all-Professionals`. */
    publicList: (params?: ListParams) =>
      [...queryKeys.professionals.all, "public", params ?? {}] as const,
    /** Public profile: `GET /professional/public/:id` (also holds own skills/experience, see plan 2.2). */
    publicDetail: (professionalId: string) =>
      [...queryKeys.professionals.all, "public", professionalId] as const,
    /** Admin review queue: `GET /professional/all-professionals`. */
    adminList: (params?: ListParams) =>
      [...queryKeys.professionals.all, "admin", params ?? {}] as const,
    /** `GET /professional/me/services` */
    myServices: () =>
      [...queryKeys.professionals.all, "me", "services"] as const,
    /** `GET /professional/me/portfolio` */
    myPortfolio: () =>
      [...queryKeys.professionals.all, "me", "portfolio"] as const,
  },

  events: {
    all: ["events"] as const,
    /** Client's own events: `GET /event/my-events` (plan 2.1). */
    mine: () => [...queryKeys.events.all, "mine"] as const,
    /** Published catalogue for professionals: `GET /event/all-events`. */
    published: (params?: ListParams) =>
      [...queryKeys.events.all, "published", params ?? {}] as const,
    /** Admin list: `GET /event/all-events` / `GET /admin/events`. */
    adminList: (params?: ListParams) =>
      [...queryKeys.events.all, "admin", params ?? {}] as const,
    detail: (eventId: string) =>
      [...queryKeys.events.all, "detail", eventId] as const,
    /** `GET /event/:eventId/required-services` */
    requirements: (eventId: string) =>
      [...queryKeys.events.all, "detail", eventId, "requirements"] as const,
    /** Proposals for one requirement: `GET /proposal/requirements/:requirementId`. */
    requirementProposals: (requirementId: string) =>
      [
        ...queryKeys.events.all,
        "requirement",
        requirementId,
        "proposals",
      ] as const,
  },

  proposals: {
    all: ["proposals"] as const,
    /** Professional's own proposals: `GET /proposal/me` (plan 2.1). */
    mine: () => [...queryKeys.proposals.all, "mine"] as const,
    detail: (proposalId: string) =>
      [...queryKeys.proposals.all, "detail", proposalId] as const,
  },

  contracts: {
    all: ["contracts"] as const,
    /** `GET /contract` (client & professional scoped). */
    mine: () => [...queryKeys.contracts.all, "mine"] as const,
    detail: (contractId: string) =>
      [...queryKeys.contracts.all, "detail", contractId] as const,
    /** `GET /contract/:id/deliverable` */
    deliverable: (contractId: string) =>
      [
        ...queryKeys.contracts.all,
        "detail",
        contractId,
        "deliverable",
      ] as const,
    /** `GET /payment/contracts/:id` (payment history for a contract). */
    payments: (contractId: string) =>
      [...queryKeys.contracts.all, "detail", contractId, "payments"] as const,
  },

  payments: {
    all: ["payments"] as const,
    adminList: (params?: ListParams) =>
      [...queryKeys.payments.all, "admin", params ?? {}] as const,
  },

  reviews: {
    all: ["reviews"] as const,
    professionals: () => [...queryKeys.reviews.all, "professionals"] as const,
    clients: () => [...queryKeys.reviews.all, "clients"] as const,
  },

  disputes: {
    all: ["disputes"] as const,
    /** Admin list: `GET /dispute`. */
    list: (params?: ListParams) =>
      [...queryKeys.disputes.all, "list", params ?? {}] as const,
    /** Party + admin detail: `GET /dispute/:id`. */
    detail: (disputeId: string) =>
      [...queryKeys.disputes.all, "detail", disputeId] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    /** `GET /notification` (+ optional `isRead`). */
    list: (params?: ListParams) =>
      [...queryKeys.notifications.all, "list", params ?? {}] as const,
  },

  admin: {
    all: ["admin"] as const,
    users: (params?: ListParams) =>
      [...queryKeys.admin.all, "users", params ?? {}] as const,
    events: (params?: ListParams) =>
      [...queryKeys.admin.all, "events", params ?? {}] as const,
    contracts: (params?: ListParams) =>
      [...queryKeys.admin.all, "contracts", params ?? {}] as const,
    payments: (params?: ListParams) =>
      [...queryKeys.admin.all, "payments", params ?? {}] as const,
  },

  analytics: {
    all: ["analytics"] as const,
    client: () => [...queryKeys.analytics.all, "client"] as const,
    professional: () => [...queryKeys.analytics.all, "professional"] as const,
    admin: () => [...queryKeys.analytics.all, "admin"] as const,
  },
} as const;
