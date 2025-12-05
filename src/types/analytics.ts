// src/types/analytics.ts

export interface BookingStats {
  total: number;
  pendingPayment: number;
  pendingApproval: number;
  approved: number;
  totalRevenue: number;
  averageBookingValue: number;
}

export interface DailyBookingTrend {
  date: string; // YYYY-MM-DD format
  bookings: number;
  revenue: number;
  approved: number;
  pending: number;
}

export interface RoomTypeDistribution {
  roomType: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueByHostel {
  hostelName: string;
  revenue: number;
  bookings: number;
  occupancyRate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export interface PaymentStatus {
  paid: number;
  pending: number;
  totalExpected: number;
  collectionRate: number;
}

export interface DashboardAnalytics {
  bookingStats: BookingStats;
  dailyTrends: DailyBookingTrend[];
  roomTypeDistribution: RoomTypeDistribution[];
  genderDistribution: GenderDistribution[];
  statusBreakdown: StatusBreakdown[];
  revenueByHostel: RevenueByHostel[];
  monthlyRevenue: MonthlyRevenue[];
  paymentStatus: PaymentStatus;
  lastUpdated: string;
}
