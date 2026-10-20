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
  totalInEscrow: number;
  totalPendingRefunds: number;
  totalDisputesRaised: number;
  totalReviewsGiven: number;
}

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
  totalPendingPayout: number;
  totalPendingRefunds: number;
  averageRating: number;
  totalReviews: number;
  totalDisputesRaised: number;
}

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
  totalEscrowed: number;
  totalPendingRefunds: number;
  netRevenue: number;
}
