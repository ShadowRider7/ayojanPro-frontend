"use client";

import {
  CalendarIcon,
  FileSignatureIcon,
  TriangleAlertIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { CurrencyText, ErrorState } from "@/components/shared";
import { useAdminAnalytics } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";
import { MetricBars } from "./MetricBars";
import { OverviewHeader } from "./OverviewHeader";
import { OverviewSkeleton } from "./OverviewSkeleton";
import { RecentActivity } from "./RecentActivity";
import { StatCard } from "./StatCard";

/**
 * `/dashboard/admin` — platform-wide totals from `GET /analytics/admin-analytics`:
 * users, applications, contracts, disputes and revenue.
 */
export function AdminOverview() {
  const { data, isPending, isError, error, refetch } = useAdminAnalytics();
  const analytics = data?.data;

  return (
    <div className="flex flex-col gap-6">
      <OverviewHeader description="Platform-wide activity across users, events, contracts and revenue." />

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
              label="Total clients"
              value={analytics.totalClients}
              icon={UserIcon}
            />
            <StatCard
              label="Total professionals"
              value={analytics.totalProfessionals}
              icon={UsersIcon}
            />
            <StatCard
              label="Total events"
              value={analytics.totalEvents}
              icon={CalendarIcon}
            />
            <StatCard
              label="Total contracts"
              value={analytics.totalContracts}
              icon={FileSignatureIcon}
            />
            <StatCard
              label="Disputes"
              value={analytics.totalDisputes}
              icon={TriangleAlertIcon}
              hint={
                analytics.totalOpenDisputes > 0
                  ? `${analytics.totalOpenDisputes} open`
                  : "None open"
              }
            />
            <StatCard
              label="Net revenue"
              icon={WalletIcon}
              value={<CurrencyText value={analytics.netRevenue} />}
              hint={
                analytics.totalRefunded > 0
                  ? `${formatCurrency(analytics.totalRefunded)} refunded`
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricBars
              title="Professional applications"
              description="Applications by review decision."
              data={[
                {
                  label: "Pending",
                  value: analytics.totalPendingProfessionalApplications,
                  tone: "warning",
                },
                {
                  label: "Approved",
                  value: analytics.totalApprovedProfessionals,
                  tone: "success",
                },
                {
                  label: "Rejected",
                  value: analytics.totalRejectedProfessionals,
                  tone: "destructive",
                },
              ]}
            />
            <MetricBars
              title="Contracts"
              description="Platform contract outcomes."
              data={[
                {
                  label: "Total",
                  value: analytics.totalContracts,
                  tone: "neutral",
                },
                {
                  label: "Completed",
                  value: analytics.totalCompletedContracts,
                  tone: "success",
                },
                {
                  label: "Cancelled",
                  value: analytics.totalCancelledContracts,
                  tone: "destructive",
                },
              ]}
            />
            <MetricBars
              title="Revenue"
              description="Completed payments across the platform."
              data={[
                {
                  label: "Gross",
                  value: analytics.totalRevenue,
                  format: (value) => formatCurrency(value),
                },
                {
                  label: "Refunded",
                  value: analytics.totalRefunded,
                  tone: "neutral",
                  format: (value) => formatCurrency(value),
                },
                {
                  label: "Net",
                  value: analytics.netRevenue,
                  tone: "success",
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
