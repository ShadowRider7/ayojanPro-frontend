/** Payloads for `GET /analytics/{client,professional,admin}-analytics`. */

/** `GET /analytics/client-analytics`. */
export interface ClientAnalytics {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  cancelledContracts: number;
  totalAmountSpent: number;
  totalRefunded: number;
  totalDisputesRaised: number;
  totalReviewsGiven: number;
}

/** `GET /analytics/professional-analytics`. */
export interface ProfessionalAnalytics {
  totalServices: number;
  activeServices: number;
  totalProposals: number;
  acceptedProposalItems: number;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  cancelledContracts: number;
  totalEarnings: number;
  totalRefunded: number;
  averageRating: number;
  totalReviews: number;
  totalDisputesRaised: number;
}

/** `GET /analytics/admin-analytics`. */
export interface AdminAnalytics {
  totalClients: number;
  totalProfessionals: number;
  totalPendingProfessionalApplications: number;
  totalApprovedProfessionals: number;
  totalRejectedProfessionals: number;
  totalEvents: number;
  totalContracts: number;
  totalCompletedContracts: number;
  totalCancelledContracts: number;
  totalDisputes: number;
  totalOpenDisputes: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
}
