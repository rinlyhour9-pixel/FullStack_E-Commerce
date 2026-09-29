export type ReportPeriod = "day" | "month" | "year";

export interface ReportSummary {
  revenue: number;
  netSales: number;
  tax: number;
  shipping: number;
  transactions: number;
  averageTicket: number;
  itemsSold: number;
  unitsPerTransaction: number;
  onlineRevenue: number;
  posRevenue: number;
  onlineCount: number;
  posCount: number;
  cancelledCount: number;
  cancelledValue: number;
  newCustomers: number;
}

export interface SalesReport {
  period: ReportPeriod;
  date: string;
  range: { start: string; end: string };
  previousRange: { start: string; end: string };
  summary: ReportSummary;
  previous: ReportSummary;
  change: Record<"revenue" | "transactions" | "averageTicket" | "itemsSold" | "newCustomers", number | null>;
  series: { index: number; online: number; pos: number; total: number; transactions: number }[];
  peak: { index: number; total: number } | null;
  payments: { method: string; count: number; total: number }[];
  orderStatus: { status: string; count: number; total: number }[];
  topProducts: { productId: string; name: string; quantity: number; revenue: number; online: number; pos: number }[];
  staff: { name: string; count: number; total: number }[];
}
