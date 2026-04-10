
import { adminProcedure, router, publicProcedure } from "../../_core/trpc";
import { refundPaymentSchema, createCheckoutSessionSchema } from "./payment.validators";
import { refundPayment, createCheckoutSession } from "./payment.service";
import { getAllPayments, getAllTributePages } from "../../db";
import { Payment } from "../../drizzle/schema";

export const paymentRouter = router({
  createCheckoutSession: publicProcedure
    .input(createCheckoutSessionSchema)
    .mutation(async ({ input }) => {
      const session = await createCheckoutSession(input.plan, input.tributeId);
      return session;
    }),
  all: adminProcedure.query(async () => {
    const allPayments = await getAllPayments();
    return allPayments;
  }),
  refund: adminProcedure
    .input(refundPaymentSchema)
    .mutation(async ({ input }) => {
      const refund = await refundPayment(input.paymentIntentId);
      return refund;
    }),
  getDashboardAnalytics: adminProcedure.query(async () => {
    const payments = await getAllPayments();
    const pages = await getAllTributePages();

    // Monthly Revenue
    const monthlyRevenue: { [key: string]: number } = {};
    payments.forEach((p) => {
      if (p.status === "completed") {
        const month = new Date(p.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
      }
    });

    // New Customers by Plan
    const newCustomers: { [key: string]: { essential: number, premium: number } } = {};
    pages.forEach((p) => {
        const month = new Date(p.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
        if (!newCustomers[month]) {
          newCustomers[month] = { essential: 0, premium: 0 };
        }
        if (p.planType === "essential") {
          newCustomers[month].essential += 1;
        } else if (p.planType === "premium") {
          newCustomers[month].premium += 1;
        }
    });

    // Payment Status Distribution
    const paymentStatusDistribution: { name: string; value: number; fill: string }[] = [];
    const statusCounts: { [key in Payment['status']]: number } = {
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
    };
    const statusColors: { [key in Payment['status']]: string } = {
      completed: "#22c55e", // green-500
      pending: "#f59e0b",   // amber-500
      failed: "#ef4444",    // red-500
      refunded: "#eab308",   // yellow-500
    };

    payments.forEach(p => {
      statusCounts[p.status]++;
    });

    for (const status in statusCounts) {
      if (statusCounts[status as Payment['status']] > 0) {
        paymentStatusDistribution.push({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: statusCounts[status as Payment['status']],
          fill: statusColors[status as Payment['status']],
        });
      }
    }

    // Chart Data Preparation
    const revenueChartData = Object.entries(monthlyRevenue).map(([name, total]) => ({
      name,
      total,
    }));

    const newCustomersChartData = Object.entries(newCustomers).map(([name, totals]) => ({
      name,
      ...totals,
    }));

    return {
      monthlyRevenue: revenueChartData,
      newCustomers: newCustomersChartData,
      paymentStatus: paymentStatusDistribution,
    };
  }),
});
