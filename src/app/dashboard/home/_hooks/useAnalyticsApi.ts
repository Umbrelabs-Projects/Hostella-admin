// src/app/dashboard/home/_hooks/useAnalyticsApi.ts

import { useCallback } from "react";
import { StudentBooking } from "@/types/booking";
import {
  DashboardAnalytics,
  BookingStats,
  DailyBookingTrend,
  RoomTypeDistribution,
  GenderDistribution,
  StatusBreakdown,
  RevenueByHostel,
  MonthlyRevenue,
  PaymentStatus,
} from "@/types/analytics";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { useBookingsStore } from "@/stores/useBookingsStore";

export function useAnalyticsApi() {
  const { setAnalytics, setLoading, setError } = useAnalyticsStore();
  const bookings = useBookingsStore((state) => state.bookings);

  // Compute booking statistics
  const computeBookingStats = useCallback((data: StudentBooking[]): BookingStats => {
    const pendingPayment = data.filter((b) => b.status === "pending payment").length;
    const pendingApproval = data.filter((b) => b.status === "pending approval").length;
    const approved = data.filter((b) => b.status === "approved").length;

    const totalRevenue = data.reduce((sum, b) => {
      if (b.status === "approved" || b.status === "pending approval") {
        return sum + parseFloat(b.price || "0");
      }
      return sum;
    }, 0);

    const averageBookingValue =
      data.length > 0 ? data.reduce((sum, b) => sum + parseFloat(b.price || "0"), 0) / data.length : 0;

    return {
      total: data.length,
      pendingPayment,
      pendingApproval,
      approved,
      totalRevenue,
      averageBookingValue,
    };
  }, []);

  // Compute daily trends for the last 30 days
  const computeDailyTrends = useCallback((data: StudentBooking[]): DailyBookingTrend[] => {
    const trends = new Map<string, DailyBookingTrend>();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split("T")[0];
    });

    // Initialize all dates
    last30Days.forEach((date) => {
      trends.set(date, {
        date,
        bookings: 0,
        revenue: 0,
        approved: 0,
        pending: 0,
      });
    });

    // Aggregate data by date
    data.forEach((booking) => {
      const bookingDate = booking.date || new Date().toISOString().split("T")[0];
      if (trends.has(bookingDate)) {
        const trend = trends.get(bookingDate)!;
        trend.bookings += 1;
        trend.revenue += parseFloat(booking.price || "0");
        if (booking.status === "approved") trend.approved += 1;
        else trend.pending += 1;
      }
    });

    return Array.from(trends.values());
  }, []);

  // Compute room type distribution
  const computeRoomTypeDistribution = useCallback((data: StudentBooking[]): RoomTypeDistribution[] => {
    const distribution = new Map<string, { count: number; revenue: number }>();

    data.forEach((booking) => {
      const roomType = booking.roomTitle;
      const current = distribution.get(roomType) || { count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += parseFloat(booking.price || "0");
      distribution.set(roomType, current);
    });

    const total = data.length;
    return Array.from(distribution.entries()).map(([roomType, stats]) => ({
      roomType,
      count: stats.count,
      revenue: stats.revenue,
      percentage: total > 0 ? (stats.count / total) * 100 : 0,
    }));
  }, []);

  // Compute gender distribution
  const computeGenderDistribution = useCallback((data: StudentBooking[]): GenderDistribution[] => {
    const distribution = new Map<string, number>();

    data.forEach((booking) => {
      const gender = booking.gender.charAt(0).toUpperCase() + booking.gender.slice(1);
      distribution.set(gender, (distribution.get(gender) || 0) + 1);
    });

    const total = data.length;
    return Array.from(distribution.entries()).map(([gender, count]) => ({
      gender,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, []);

  // Compute status breakdown
  const computeStatusBreakdown = useCallback((data: StudentBooking[]): StatusBreakdown[] => {
    const breakdown = new Map<string, number>();

    data.forEach((booking) => {
      const status =
        booking.status === "pending payment"
          ? "Pending Payment"
          : booking.status === "pending approval"
          ? "Pending Approval"
          : "Approved";
      breakdown.set(status, (breakdown.get(status) || 0) + 1);
    });

    const total = data.length;
    return Array.from(breakdown.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, []);

  // Compute revenue by hostel
  const computeRevenueByHostel = useCallback((data: StudentBooking[]): RevenueByHostel[] => {
    const hostelMap = new Map<string, { revenue: number; bookings: number }>();

    data.forEach((booking) => {
      const hostel = booking.hostelName;
      const current = hostelMap.get(hostel) || { revenue: 0, bookings: 0 };
      current.revenue += parseFloat(booking.price || "0");
      current.bookings += 1;
      hostelMap.set(hostel, current);
    });

    // Assume each hostel has 100 capacity for occupancy calculation
    const hostelCapacity = 100;
    return Array.from(hostelMap.entries()).map(([hostelName, stats]) => ({
      hostelName,
      revenue: stats.revenue,
      bookings: stats.bookings,
      occupancyRate: (stats.bookings / hostelCapacity) * 100,
    }));
  }, []);

  // Compute monthly revenue (last 6 months)
  const computeMonthlyRevenue = useCallback((data: StudentBooking[]): MonthlyRevenue[] => {
    const monthlyMap = new Map<string, { revenue: number; bookings: number }>();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toISOString().slice(0, 7); // YYYY-MM format
    });

    last6Months.forEach((month) => {
      monthlyMap.set(month, { revenue: 0, bookings: 0 });
    });

    data.forEach((booking) => {
      const bookingMonth = (booking.date || new Date().toISOString()).slice(0, 7);
      if (monthlyMap.has(bookingMonth)) {
        const current = monthlyMap.get(bookingMonth)!;
        current.revenue += parseFloat(booking.price || "0");
        current.bookings += 1;
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, stats]) => {
      const [year, monthNum] = month.split("-");
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      return {
        month: monthName,
        revenue: stats.revenue,
        bookings: stats.bookings,
      };
    });
  }, []);

  // Compute payment status
  const computePaymentStatus = useCallback((data: StudentBooking[]): PaymentStatus => {
    const paid = data.filter((b) => b.status === "approved" || b.status === "pending approval").length;
    const pending = data.filter((b) => b.status === "pending payment").length;
    const totalExpected = data.reduce((sum, b) => sum + parseFloat(b.price || "0"), 0);
    const paidAmount = data
      .filter((b) => b.status === "approved" || b.status === "pending approval")
      .reduce((sum, b) => sum + parseFloat(b.price || "0"), 0);

    return {
      paid,
      pending,
      totalExpected,
      collectionRate: totalExpected > 0 ? (paidAmount / totalExpected) * 100 : 0,
    };
  }, []);

  // Fetch and compute analytics
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use all bookings for comprehensive analytics
      const analytics: DashboardAnalytics = {
        bookingStats: computeBookingStats(bookings), // Use all bookings for stats
        dailyTrends: computeDailyTrends(bookings),
        roomTypeDistribution: computeRoomTypeDistribution(bookings),
        genderDistribution: computeGenderDistribution(bookings),
        statusBreakdown: computeStatusBreakdown(bookings),
        revenueByHostel: computeRevenueByHostel(bookings),
        monthlyRevenue: computeMonthlyRevenue(bookings),
        paymentStatus: computePaymentStatus(bookings),
        lastUpdated: new Date().toISOString(),
      };

      setAnalytics(analytics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    bookings,
    setLoading,
    setError,
    setAnalytics,
    computeBookingStats,
    computeDailyTrends,
    computeRoomTypeDistribution,
    computeGenderDistribution,
    computeStatusBreakdown,
    computeRevenueByHostel,
    computeMonthlyRevenue,
    computePaymentStatus,
  ]);

  return { fetchAnalytics };
}
