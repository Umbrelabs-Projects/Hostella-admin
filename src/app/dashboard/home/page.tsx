// src/app/dashboard/home/page.tsx

"use client";

import { useEffect } from "react";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { useAnalyticsApi } from "./_hooks/useAnalyticsApi";
import StatsCard from "./components/StatsCard";
import BookingTrendsChart from "./components/BookingTrendsChart";
import StatusDistributionChart from "./components/StatusDistributionChart";
import RevenueChart from "./components/RevenueChart";
import RoomTypeChart from "./components/RoomTypeChart";
import HostelRevenueTable from "./components/HostelRevenueTable";
import {
  BookOpen,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Users,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { analytics, loading, error } = useAnalyticsStore();
  const { fetchAnalytics } = useAnalyticsApi();

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    void fetchAnalytics();
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { bookingStats, dailyTrends, statusBreakdown, monthlyRevenue, roomTypeDistribution, revenueByHostel } =
    analytics;

  return (
    <div className="p-3 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-600">
            Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bookings"
          value={bookingStats.total}
          icon={BookOpen}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Pending Payment"
          value={bookingStats.pendingPayment}
          icon={Clock}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <StatsCard
          title="Approved"
          value={bookingStats.approved}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Total Revenue"
          value={`GHS ${bookingStats.totalRevenue.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Pending Approval"
          value={bookingStats.pendingApproval}
          icon={Users}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatsCard
          title="Avg. Booking Value"
          value={`GHS ${bookingStats.averageBookingValue.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatsCard
          title="Collection Rate"
          value={`${analytics.paymentStatus.collectionRate.toFixed(1)}%`}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingTrendsChart data={dailyTrends} />
        <StatusDistributionChart data={statusBreakdown} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthlyRevenue} />
        <RoomTypeChart data={roomTypeDistribution} />
      </div>

      {/* Hostel Performance Table */}
      <HostelRevenueTable data={revenueByHostel} />
    </div>
  );
}

