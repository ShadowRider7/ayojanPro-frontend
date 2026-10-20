"use client";

import {
  ActivityIcon,
  CalendarIcon,
  FileSignatureIcon,
  StarIcon,
  TriangleAlertIcon,
  WalletIcon,
} from "lucide-react";
import { CurrencyText, ErrorState } from "@/components/shared";
import { useClientAnalytics } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";
import { MetricBars } from "./MetricBars";
import { OverviewHeader } from "./OverviewHeader";
import { OverviewSkeleton } from "./OverviewSkeleton";
import { RecentActivity } from "./RecentActivity";
import { StatCard } from "./StatCard";

export function ClientOverview() {
  const { data, isPending, isError, error, refetch } = useClientAnalytics();
  const analytics = data?.data;

  return (
    <div className="flex flex-col gap-6">
      <OverviewHeader description="Your events, contracts and spending at a glance." />

      {isPending ? (
        <OverviewSkeleton />
      ) : isError || !analytics ? (
        <ErrorState
          title="Could not load your dashboard"
          error={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total events"
              value={analytics.totalEvents}
              icon={CalendarIcon}
            />
            <StatCard
              label="Active events"
              value={analytics.activeEvents}
              icon={ActivityIcon}
            />
            <StatCard
              label="Total contracts"
              value={analytics.totalContracts}
              icon={FileSignatureIcon}
            />
            <StatCard
              label="Amount spent"
              icon={WalletIcon}
              value={<CurrencyText value={analytics.totalAmountSpent} />}
              hint={
                analytics.totalInEscrow > 0
                  ? `${formatCurrency(analytics.totalInEscrow)} held by the platform`
                  : analytics.totalRefunded > 0
                    ? `${formatCurrency(analytics.totalRefunded)} refunded`
                    : undefined
              }
            />
            <StatCard
              label="Disputes raised"
              value={analytics.totalDisputesRaised}
              icon={TriangleAlertIcon}
            />
            <StatCard
              label="Reviews given"
              value={analytics.totalReviewsGiven}
              icon={StarIcon}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricBars
              title="Events"
              description="All the events you have created, by status."
              data={[
                {
                  label: "Total",
                  value: analytics.totalEvents,
                  tone: "neutral",
                },
                {
                  label: "Active",
                  value: analytics.activeEvents,
                  tone: "info",
                },
                {
                  label: "Completed",
                  value: analytics.completedEvents,
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
              description="Completed, escrowed, refunded and pending payments."
              data={[
                {
                  label: "Amount spent",
                  value: analytics.totalAmountSpent,
                  format: (value) => formatCurrency(value),
                },
                {
                  label: "Held by the platform",
                  value: analytics.totalInEscrow,
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
      )}
    </div>
  );
}
