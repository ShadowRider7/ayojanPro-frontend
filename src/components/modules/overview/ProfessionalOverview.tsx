"use client";

import {
  BriefcaseIcon,
  FileSignatureIcon,
  FileTextIcon,
  StarIcon,
  TriangleAlertIcon,
  WalletIcon,
} from "lucide-react";
import { CurrencyText } from "@/components/shared";
import { useProfessionalAnalytics } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";
import { MetricBars } from "./MetricBars";
import { OverviewView } from "./OverviewView";
import { RecentActivity } from "./RecentActivity";
import { StatCard } from "./StatCard";

export function ProfessionalOverview() {
  const { data, isPending, isError, error, refetch } =
    useProfessionalAnalytics();
  const analytics = data?.data;

  return (
    <OverviewView
      description="Your services, proposals, contracts and earnings at a glance."
      isPending={isPending}
      isError={isError || !analytics}
      error={error}
      onRetry={refetch}
    >
      {analytics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total services"
              value={analytics.totalServices}
              icon={BriefcaseIcon}
              hint={`${analytics.activeServices} active`}
            />
            <StatCard
              label="Total proposals"
              value={analytics.totalProposals}
              icon={FileTextIcon}
              hint={`${analytics.acceptedProposalItems} accepted items`}
            />
            <StatCard
              label="Average rating"
              value={analytics.averageRating.toFixed(1)}
              icon={StarIcon}
              hint={
                analytics.totalReviews > 0
                  ? `Based on ${analytics.totalReviews} ${
                      analytics.totalReviews === 1 ? "review" : "reviews"
                    }`
                  : "No reviews yet"
              }
            />
            <StatCard
              label="Total earnings"
              icon={WalletIcon}
              value={<CurrencyText value={analytics.totalEarnings} />}
              hint={
                analytics.totalPendingPayout > 0
                  ? `${formatCurrency(analytics.totalPendingPayout)} pending payout`
                  : analytics.totalRefunded > 0
                    ? `${formatCurrency(analytics.totalRefunded)} refunded`
                    : undefined
              }
            />
            <StatCard
              label="Active contracts"
              value={analytics.activeContracts}
              icon={FileSignatureIcon}
            />
            <StatCard
              label="Disputes raised"
              value={analytics.totalDisputesRaised}
              icon={TriangleAlertIcon}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricBars
              title="Proposals"
              description="Submitted proposals and accepted items."
              data={[
                {
                  label: "Total",
                  value: analytics.totalProposals,
                  tone: "neutral",
                },
                {
                  label: "Accepted items",
                  value: analytics.acceptedProposalItems,
                  tone: "success",
                },
              ]}
            />
            <MetricBars
              title="Contracts"
              description="Your contract lifecycle at a glance."
              data={[
                {
                  label: "Total",
                  value: analytics.totalContracts,
                  tone: "neutral",
                },
                {
                  label: "Active",
                  value: analytics.activeContracts,
                  tone: "info",
                },
                {
                  label: "Completed",
                  value: analytics.completedContracts,
                  tone: "success",
                },
                {
                  label: "Cancelled",
                  value: analytics.cancelledContracts,
                  tone: "destructive",
                },
              ]}
            />
            <MetricBars
              title="Payments"
              description="Released, pending, refunded and pending payments on your contracts."
              data={[
                {
                  label: "Earned",
                  value: analytics.totalEarnings,
                  format: (value) => formatCurrency(value),
                },
                {
                  label: "Pending payout",
                  value: analytics.totalPendingPayout,
                  tone: "info",
                  format: (value) => formatCurrency(value),
                },
                {
                  label: "Refunded",
                  value: analytics.totalRefunded,
                  tone: "neutral",
                  format: (value) => formatCurrency(value),
                },
                {
                  label: "Refund pending",
                  value: analytics.totalPendingRefunds,
                  tone: "warning",
                  format: (value) => formatCurrency(value),
                },
              ]}
            />
            <RecentActivity />
          </div>
        </>
      ) : null}
    </OverviewView>
  );
}
