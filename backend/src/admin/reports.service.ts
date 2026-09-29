import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './reports.dto';

type Period = 'day' | 'month' | 'year';
interface Range { start: Date; end: Date }

function round(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
function pctChange(current: number, previous: number) { return previous === 0 ? (current === 0 ? 0 : null) : round(((current - previous) / previous) * 100); }

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /** Local calendar boundaries converted to UTC. `tz` follows Date#getTimezoneOffset (UTC minus local, in minutes). */
  private range(period: Period, date: string, tz: number, shift = 0): Range {
    const [y, m, d] = date.split('-').map(Number);
    const localStart = period === 'day' ? Date.UTC(y, m - 1, d + shift) : period === 'month' ? Date.UTC(y, m - 1 + shift, 1) : Date.UTC(y + shift, 0, 1);
    const localEnd = period === 'day' ? Date.UTC(y, m - 1, d + shift + 1) : period === 'month' ? Date.UTC(y, m + shift, 1) : Date.UTC(y + shift + 1, 0, 1);
    if (Number.isNaN(localStart)) throw new BadRequestException('Invalid report date.');
    return { start: new Date(localStart + tz * 60_000), end: new Date(localEnd + tz * 60_000) };
  }

  private async load({ start, end }: Range) {
    const createdAt = { gte: start, lt: end };
    const [orders, sales, newCustomers] = await Promise.all([
      this.prisma.order.findMany({ where: { createdAt }, include: { items: true } }),
      this.prisma.posSale.findMany({ where: { createdAt }, include: { items: true, staff: { select: { id: true, name: true } } } }),
      this.prisma.user.count({ where: { role: 'customer', createdAt } }),
    ]);
    return { orders, sales, newCustomers };
  }

  private summarize(data: Awaited<ReturnType<ReportsService['load']>>) {
    const live = data.orders.filter((order) => order.status !== 'cancelled');
    const cancelled = data.orders.filter((order) => order.status === 'cancelled');
    const sum = <T>(rows: T[], pick: (row: T) => unknown) => round(rows.reduce((total, row) => total + Number(pick(row)), 0));
    const onlineRevenue = sum(live, (o) => o.total);
    const posRevenue = sum(data.sales, (s) => s.total);
    const revenue = round(onlineRevenue + posRevenue);
    const transactions = live.length + data.sales.length;
    const itemsSold = live.reduce((n, o) => n + o.items.reduce((c, i) => c + i.quantity, 0), 0) + data.sales.reduce((n, s) => n + s.items.reduce((c, i) => c + i.quantity, 0), 0);
    return {
      revenue,
      netSales: round(sum(live, (o) => o.subtotal) + sum(data.sales, (s) => s.subtotal)),
      tax: round(sum(live, (o) => o.tax) + sum(data.sales, (s) => s.tax)),
      shipping: sum(live, (o) => o.shipping),
      transactions,
      averageTicket: transactions ? round(revenue / transactions) : 0,
      itemsSold,
      unitsPerTransaction: transactions ? round(itemsSold / transactions) : 0,
      onlineRevenue,
      posRevenue,
      onlineCount: live.length,
      posCount: data.sales.length,
      cancelledCount: cancelled.length,
      cancelledValue: sum(cancelled, (o) => o.total),
      newCustomers: data.newCustomers,
    };
  }

  async report(query: ReportQueryDto) {
    const period = query.period as Period;
    const tz = query.tz ?? 0;
    const current = this.range(period, query.date, tz);
    const previous = this.range(period, query.date, tz, -1);
    const [data, prevData] = await Promise.all([this.load(current), this.load(previous)]);
    const summary = this.summarize(data);
    const prev = this.summarize(prevData);

    // Trend buckets in the viewer's local time: hours of the day, days of the month, or months of the year.
    const local = (date: Date) => new Date(date.getTime() - tz * 60_000);
    const bucketCount = period === 'day' ? 24 : period === 'month' ? Math.round((current.end.getTime() - current.start.getTime()) / 86_400_000) : 12;
    const bucketOf = (date: Date) => { const l = local(date); return period === 'day' ? l.getUTCHours() : period === 'month' ? l.getUTCDate() - 1 : l.getUTCMonth(); };
    const series = Array.from({ length: bucketCount }, (_, index) => ({ index, online: 0, pos: 0, transactions: 0 }));

    const products = new Map<string, { productId: string; name: string; quantity: number; revenue: number; online: number; pos: number }>();
    const addProduct = (item: { productId: string; productName: string; quantity: number; lineTotal: unknown }, channel: 'online' | 'pos') => {
      const row = products.get(item.productId) ?? { productId: item.productId, name: item.productName, quantity: 0, revenue: 0, online: 0, pos: 0 };
      row.quantity += item.quantity;
      row.revenue += Number(item.lineTotal);
      row[channel] += item.quantity;
      products.set(item.productId, row);
    };
    const payments = new Map<string, { method: string; count: number; total: number }>();
    const addPayment = (method: string, total: number) => { const row = payments.get(method) ?? { method, count: 0, total: 0 }; row.count += 1; row.total += total; payments.set(method, row); };
    const statuses = new Map<string, { status: string; count: number; total: number }>();

    for (const order of data.orders) {
      const status = statuses.get(order.status) ?? { status: order.status, count: 0, total: 0 };
      status.count += 1; status.total += Number(order.total); statuses.set(order.status, status);
      if (order.status === 'cancelled') continue;
      const bucket = series[bucketOf(order.createdAt)];
      if (bucket) { bucket.online += Number(order.total); bucket.transactions += 1; }
      order.items.forEach((item) => addProduct(item, 'online'));
      addPayment(order.paymentMethod, Number(order.total));
    }

    const staff = new Map<string, { name: string; count: number; total: number }>();
    for (const sale of data.sales) {
      const bucket = series[bucketOf(sale.createdAt)];
      if (bucket) { bucket.pos += Number(sale.total); bucket.transactions += 1; }
      sale.items.forEach((item) => addProduct(item, 'pos'));
      addPayment(sale.paymentMethod, Number(sale.total));
      const row = staff.get(sale.staff.id) ?? { name: sale.staff.name, count: 0, total: 0 };
      row.count += 1; row.total += Number(sale.total); staff.set(sale.staff.id, row);
    }

    const peak = series.reduce((best, row) => (row.online + row.pos > best.online + best.pos ? row : best), series[0]);
    const byRevenue = <T extends { total: number }>(rows: Iterable<T>) => [...rows].map((row) => ({ ...row, total: round(row.total) })).sort((a, b) => b.total - a.total);

    return {
      period,
      date: query.date,
      range: { start: current.start.toISOString(), end: current.end.toISOString() },
      previousRange: { start: previous.start.toISOString(), end: previous.end.toISOString() },
      summary,
      previous: prev,
      change: {
        revenue: pctChange(summary.revenue, prev.revenue),
        transactions: pctChange(summary.transactions, prev.transactions),
        averageTicket: pctChange(summary.averageTicket, prev.averageTicket),
        itemsSold: pctChange(summary.itemsSold, prev.itemsSold),
        newCustomers: pctChange(summary.newCustomers, prev.newCustomers),
      },
      series: series.map((row) => ({ ...row, online: round(row.online), pos: round(row.pos), total: round(row.online + row.pos) })),
      peak: peak && peak.online + peak.pos > 0 ? { index: peak.index, total: round(peak.online + peak.pos) } : null,
      payments: byRevenue(payments.values()),
      orderStatus: [...statuses.values()].map((row) => ({ ...row, total: round(row.total) })),
      topProducts: [...products.values()].map((row) => ({ ...row, revenue: round(row.revenue) })).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      staff: byRevenue(staff.values()),
    };
  }
}
