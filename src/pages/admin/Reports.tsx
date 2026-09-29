import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api } from "../../api/client";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/format";
import type { ReportPeriod, SalesReport } from "../../types/report";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, PrinterIcon, RefreshIcon } from "../../components/ui/icons";

// Series colors, validated for colour-vision deficiency separation against the white card surface.
const ONLINE = "#3a6ea5";
const IN_STORE = "#c1764f";

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const fill = (template: string, vars: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));

function shiftDate(iso: string, period: ReportPeriod, step: number) {
  const d = parseIso(iso);
  if (period === "day") d.setDate(d.getDate() + step);
  else if (period === "month") { d.setDate(1); d.setMonth(d.getMonth() + step); }
  else { d.setMonth(0, 1); d.setFullYear(d.getFullYear() + step); }
  return toIso(d);
}

/** The first day of the period that contains `iso` — used to tell whether "next" would land in the future. */
function periodStart(iso: string, period: ReportPeriod) {
  const d = parseIso(iso);
  if (period !== "day") d.setDate(1);
  if (period === "year") d.setMonth(0);
  return toIso(d);
}

function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 1.25, 1.5, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) ?? 10;
  return step * magnitude * 4;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Bar path with 4px rounded top corners and a square base sitting on the baseline. */
function barPath(x: number, y: number, w: number, h: number, round: boolean) {
  if (h <= 0) return "";
  const r = round ? Math.min(4, w / 2, h) : 0;
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function Section({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`break-inside-avoid rounded-3xl border border-line bg-white p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Delta({ value, label, none }: { value: number | null; label: string; none: string }) {
  if (value === null) return <span className="text-xs text-ink-soft">{none}</span>;
  const up = value > 0;
  const flat = value === 0;
  const tone = flat ? "bg-ink/5 text-ink-soft" : up ? "bg-sage-light text-forest-dark" : "bg-clay/10 text-clay-dark";
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
      <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${tone}`}>
        <span aria-hidden="true">{flat ? "●" : up ? "▲" : "▼"}</span>
        {Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%
      </span>
      {label}
    </span>
  );
}

export function AdminReports() {
  const { t, language } = useLanguage();
  const r = t.admin.reports;
  const km = language === "km";
  const locale = km ? "km-KH" : "en-US";
  const { showToast } = useToast();
  const today = toIso(new Date());
  const [period, setPeriod] = useState<ReportPeriod>("day");
  const [date, setDate] = useState(today);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendView, setTrendView] = useState<"chart" | "table">("chart");
  const [generatedAt, setGeneratedAt] = useState(new Date());

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    void api.get<SalesReport>(`/admin/reports?period=${period}&date=${date}&tz=${parseIso(date).getTimezoneOffset()}`)
      .then((data) => { setReport(data); setGeneratedAt(new Date()); })
      .catch((e) => { const message = e instanceof Error ? e.message : r.loadError; setError(message); showToast(message, "error"); })
      .finally(() => setLoading(false));
  }, [period, date, r.loadError, showToast]);
  useEffect(load, [load]);

  const canGoNext = periodStart(shiftDate(date, period, 1), period) <= today;

  const formatPeriod = useCallback((iso: string, p: ReportPeriod) => {
    const d = parseIso(iso);
    if (p === "day") return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
    if (p === "month") return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d);
    return String(d.getFullYear());
  }, [locale]);

  const bucketLabel = useCallback((index: number, long = false) => {
    if (period === "day") return `${pad(index)}:00${long ? `–${pad(index)}:59` : ""}`;
    if (period === "month") {
      const d = parseIso(date); d.setDate(index + 1);
      return long ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(d) : String(index + 1);
    }
    return new Intl.DateTimeFormat(locale, { month: long ? "long" : "short" }).format(new Date(2000, index, 1));
  }, [period, date, locale]);

  const methodLabel = (method: string) => method === "cash_on_delivery" ? r.cashOnDelivery : (t.admin.common.paymentMethods as Record<string, string>)[method] ?? method;
  const statusLabel = (status: string) => (t.admin.common.orderStatus as Record<string, string>)[status] ?? status;
  const percent = useCallback((value: number) => `${value.toLocaleString(locale, { maximumFractionDigits: 1 })}%`, [locale]);
  const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

  const insights = useMemo(() => {
    if (!report || report.summary.transactions === 0) return [];
    const { summary, change, peak, topProducts } = report;
    const lines: string[] = [];
    if (change.revenue === null) lines.push(r.insightNew);
    else if (change.revenue === 0) lines.push(r.insightFlat);
    else lines.push(fill(change.revenue > 0 ? r.insightUp : r.insightDown, { pct: percent(Math.abs(change.revenue)) }));
    if (peak) {
      const bucket = period === "day" ? r.hourSuffix : period === "month" ? r.periodDay.toLowerCase() : r.periodMonth.toLowerCase();
      lines.push(fill(r.insightPeak, { bucket, label: bucketLabel(peak.index, true), amount: formatPrice(peak.total) }));
    }
    if (topProducts[0]) lines.push(fill(r.insightTopProduct, { name: topProducts[0].name, units: topProducts[0].quantity, amount: formatPrice(topProducts[0].revenue) }));
    const onlineLeads = summary.onlineRevenue >= summary.posRevenue;
    lines.push(fill(r.insightChannel, { channel: onlineLeads ? r.online : r.inStore, pct: percent(share(onlineLeads ? summary.onlineRevenue : summary.posRevenue, summary.revenue)) }));
    if (summary.cancelledCount > 0) lines.push(fill(r.insightCancelled, { count: summary.cancelledCount, amount: formatPrice(summary.cancelledValue) }));
    return lines;
  }, [report, r, period, bucketLabel, percent]);

  const exportCsv = () => {
    if (!report) return;
    const { summary } = report;
    const rows: (string | number)[][] = [
      [r.title, formatPeriod(date, period)],
      [r.generated, generatedAt.toLocaleString(locale)],
      [],
      [r.financialTitle],
      [r.kpiRevenue, summary.revenue], [r.netSales, summary.netSales], [r.tax, summary.tax], [r.shipping, summary.shipping],
      [r.kpiTransactions, summary.transactions], [r.kpiAvgTicket, summary.averageTicket], [r.kpiItems, summary.itemsSold],
      [r.kpiNewCustomers, summary.newCustomers], [r.cancelledOrders, summary.cancelledCount, summary.cancelledValue],
      [],
      [r.colPeriod, r.online, r.inStore, r.colTotal, r.colTransactions],
      ...report.series.map((row) => [bucketLabel(row.index, true), row.online, row.pos, row.total, row.transactions]),
      [],
      [r.colProduct, r.colUnits, r.online, r.inStore, r.colRevenue],
      ...report.topProducts.map((row) => [row.name, row.quantity, row.online, row.pos, row.revenue]),
      [],
      [r.paymentsTitle, r.colTransactions, r.colTotal],
      ...report.payments.map((row) => [methodLabel(row.method), row.count, row.total]),
      [],
      [r.colCashier, r.colSales, r.colTotal],
      ...report.staff.map((row) => [row.name, row.count, row.total]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `tamjit-report-${period}-${period === "day" ? date : period === "month" ? date.slice(0, 7) : date.slice(0, 4)}.csv` });
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary;
  const empty = !!report && report.summary.transactions === 0 && report.summary.cancelledCount === 0;
  const trendTitle = period === "day" ? r.trendDay : period === "month" ? r.trendMonth : r.trendYear;
  const controlButton = "flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 bg-white text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40";
  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className={`flex flex-col gap-6 ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">{r.eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">{r.title}</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">{r.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={load} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"><RefreshIcon className="h-4 w-4" /> {r.refresh}</button>
          <button type="button" onClick={exportCsv} disabled={!report} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream disabled:opacity-40"><DownloadIcon className="h-4 w-4" /> {r.exportCsv}</button>
          <button type="button" onClick={() => window.print()} disabled={!report} className="flex items-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-40"><PrinterIcon className="h-4 w-4" /> {r.print}</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3 print:hidden">
        <div role="tablist" aria-label={r.reportPeriod} className="flex rounded-xl bg-cream p-1">
          {(["day", "month", "year"] as const).map((p) => (
            <button key={p} type="button" role="tab" aria-selected={period === p} onClick={() => setPeriod(p)} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${period === p ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>
              {p === "day" ? r.periodDay : p === "month" ? r.periodMonth : r.periodYear}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={controlButton} onClick={() => setDate(shiftDate(date, period, -1))} aria-label={r.previous}><ChevronLeftIcon className="h-4 w-4" /></button>
          {period === "day" && <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-10 rounded-xl border border-ink/10 bg-white px-3 text-sm" aria-label={r.reportPeriod} />}
          {period === "month" && <input type="month" value={date.slice(0, 7)} max={today.slice(0, 7)} onChange={(e) => e.target.value && setDate(`${e.target.value}-01`)} className="h-10 rounded-xl border border-ink/10 bg-white px-3 text-sm" aria-label={r.reportPeriod} />}
          {period === "year" && <select value={date.slice(0, 4)} onChange={(e) => setDate(`${e.target.value}-01-01`)} className="h-10 rounded-xl border border-ink/10 bg-white px-3 text-sm" aria-label={r.reportPeriod}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>}
          <button type="button" className={controlButton} onClick={() => setDate(shiftDate(date, period, 1))} disabled={!canGoNext} aria-label={r.next}><ChevronRightIcon className="h-4 w-4" /></button>
        </div>
        <button type="button" onClick={() => setDate(today)} disabled={periodStart(date, period) === periodStart(today, period)} className="rounded-xl px-3 py-2 text-sm font-medium text-clay-dark hover:bg-clay/10 disabled:text-ink-soft/50 disabled:hover:bg-transparent">{r.current}</button>
      </div>

      {/* Report header — also serves as the printed cover line. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-4 text-cream">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/60">{r.reportPeriod}</p>
          <p className="mt-0.5 font-display text-xl">{formatPeriod(date, period)}</p>
        </div>
        <div className="text-right text-xs text-cream/70">
          <p>{r.comparedWith}: <span className="text-cream">{formatPeriod(shiftDate(date, period, -1), period)}</span></p>
          <p className="mt-0.5">{r.generated}: {generatedAt.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
      </div>

      {error && !report && <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>}
      {loading && !report && <p className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-ink-soft">{r.loading}</p>}

      {report && summary && (
        <div className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {([
              [r.kpiRevenue, formatPrice(summary.revenue), report.change.revenue, formatPrice(report.previous.revenue)],
              [r.kpiTransactions, summary.transactions.toLocaleString(locale), report.change.transactions, report.previous.transactions.toLocaleString(locale)],
              [r.kpiAvgTicket, formatPrice(summary.averageTicket), report.change.averageTicket, formatPrice(report.previous.averageTicket)],
              [r.kpiItems, summary.itemsSold.toLocaleString(locale), report.change.itemsSold, report.previous.itemsSold.toLocaleString(locale)],
              [r.kpiNewCustomers, summary.newCustomers.toLocaleString(locale), report.change.newCustomers, report.previous.newCustomers.toLocaleString(locale)],
            ] as const).map(([label, value, change, previous], i) => (
              <div key={label} className={`break-inside-avoid rounded-2xl border border-line bg-white p-4 ${i === 0 ? "col-span-2 lg:col-span-1" : ""}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
                <p className="mt-2 font-display text-2xl text-ink sm:text-3xl">{value}</p>
                <div className="mt-2"><Delta value={change} label={`${r.vsPrevious} (${previous})`} none={r.noComparison} /></div>
              </div>
            ))}
          </div>

          {empty ? (
            <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
              <p className="font-display text-lg text-ink">{r.emptyTitle}</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{r.emptyDesc}</p>
            </div>
          ) : (
            <>
              {insights.length > 0 && (
                <Section title={r.insightsTitle}>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {insights.map((line) => <li key={line} className="flex gap-2.5 rounded-xl bg-cream/60 px-3 py-2.5 text-sm text-ink"><span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />{line}</li>)}
                  </ul>
                </Section>
              )}

              <Section
                title={trendTitle}
                action={
                  <div className="flex items-center gap-4">
                    <Legend items={[[r.online, ONLINE], [r.inStore, IN_STORE]]} />
                    <div className="flex rounded-lg bg-cream p-0.5 text-xs print:hidden">
                      {(["chart", "table"] as const).map((v) => <button key={v} type="button" aria-pressed={trendView === v} onClick={() => setTrendView(v)} className={`rounded-md px-2.5 py-1 font-medium ${trendView === v ? "bg-white text-ink shadow-sm" : "text-ink-soft"}`}>{v === "chart" ? r.viewChart : r.viewTable}</button>)}
                    </div>
                  </div>
                }
              >
                {trendView === "chart" ? (
                  <TrendChart report={report} label={bucketLabel} labels={{ online: r.online, inStore: r.inStore, total: r.colTotal, transactions: r.colTransactions, peak: r.peak }} />
                ) : (
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white text-left text-[11px] uppercase tracking-wide text-ink-soft"><tr className="border-b border-line"><th className="py-2 font-semibold">{r.colPeriod}</th><th className="py-2 text-right font-semibold">{r.online}</th><th className="py-2 text-right font-semibold">{r.inStore}</th><th className="py-2 text-right font-semibold">{r.colTotal}</th><th className="py-2 text-right font-semibold">{r.colTransactions}</th></tr></thead>
                      <tbody>{report.series.map((row) => <tr key={row.index} className={`border-b border-line/60 last:border-0 ${row.total === 0 ? "text-ink-soft/60" : "text-ink"}`}><td className="py-2">{bucketLabel(row.index, true)}</td><td className="py-2 text-right tabular-nums">{formatPrice(row.online)}</td><td className="py-2 text-right tabular-nums">{formatPrice(row.pos)}</td><td className="py-2 text-right font-semibold tabular-nums">{formatPrice(row.total)}</td><td className="py-2 text-right tabular-nums">{row.transactions}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}
              </Section>

              <div className="grid gap-6 lg:grid-cols-2">
                <Section title={r.channelTitle}>
                  <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-cream" role="img" aria-label={`${r.online} ${percent(share(summary.onlineRevenue, summary.revenue))}, ${r.inStore} ${percent(share(summary.posRevenue, summary.revenue))}`}>
                    <div style={{ width: `${share(summary.onlineRevenue, summary.revenue)}%`, background: ONLINE }} />
                    <div style={{ width: `${share(summary.posRevenue, summary.revenue)}%`, background: IN_STORE }} />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    {([[r.online, ONLINE, summary.onlineRevenue, summary.onlineCount], [r.inStore, IN_STORE, summary.posRevenue, summary.posCount]] as const).map(([label, color, revenue, count]) => (
                      <div key={label} className="rounded-2xl bg-cream/60 p-4">
                        <p className="flex items-center gap-2 text-sm text-ink-soft"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />{label}</p>
                        <p className="mt-2 font-display text-2xl text-ink">{formatPrice(revenue)}</p>
                        <p className="mt-1 text-xs text-ink-soft">{percent(share(revenue, summary.revenue))} · {count} {r.colTransactions.toLowerCase()}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title={r.financialTitle}>
                  <dl className="divide-y divide-line text-sm">
                    {([
                      [r.netSales, formatPrice(summary.netSales)],
                      [r.tax, formatPrice(summary.tax)],
                      [r.shipping, formatPrice(summary.shipping)],
                      [r.unitsPerTransaction, summary.unitsPerTransaction.toLocaleString(locale)],
                      [r.cancelledOrders, `${summary.cancelledCount} · ${formatPrice(summary.cancelledValue)}`],
                    ] as const).map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-2.5"><dt className="text-ink-soft">{label}</dt><dd className="font-medium tabular-nums text-ink">{value}</dd></div>)}
                    <div className="flex justify-between gap-4 pt-3"><dt className="font-semibold text-ink">{r.grossRevenue}</dt><dd className="font-display text-xl tabular-nums text-ink">{formatPrice(summary.revenue)}</dd></div>
                  </dl>
                </Section>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <Section title={r.topProductsTitle}>
                  {report.topProducts.length === 0 ? <p className="text-sm text-ink-soft">{r.emptySection}</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[420px] text-sm">
                        <thead className="text-left text-[11px] uppercase tracking-wide text-ink-soft"><tr className="border-b border-line"><th className="w-8 py-2 font-semibold">#</th><th className="py-2 font-semibold">{r.colProduct}</th><th className="py-2 text-right font-semibold">{r.colUnits}</th><th className="py-2 text-right font-semibold">{r.colRevenue}</th><th className="w-28 py-2 pl-4 font-semibold">{r.colShare}</th></tr></thead>
                        <tbody>
                          {report.topProducts.map((row, i) => {
                            const pct = share(row.revenue, summary.revenue);
                            return (
                              <tr key={row.productId} className="border-b border-line/60 last:border-0">
                                <td className="py-2.5 text-ink-soft tabular-nums">{i + 1}</td>
                                <td className="py-2.5"><p className="font-medium text-ink">{row.name}</p><p className="text-xs text-ink-soft">{r.online} {row.online} · {r.inStore} {row.pos}</p></td>
                                <td className="py-2.5 text-right tabular-nums text-ink">{row.quantity}</td>
                                <td className="py-2.5 text-right font-semibold tabular-nums text-ink">{formatPrice(row.revenue)}</td>
                                <td className="py-2.5 pl-4"><div className="flex items-center gap-2"><div className="h-1.5 flex-1 rounded-full bg-cream"><div className="h-full rounded-full bg-forest" style={{ width: `${pct}%` }} /></div><span className="w-10 text-right text-xs tabular-nums text-ink-soft">{percent(pct)}</span></div></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>

                <div className="flex flex-col gap-6">
                  <Section title={r.paymentsTitle}>
                    <BarList rows={report.payments.map((row) => ({ key: row.method, label: methodLabel(row.method), value: row.total, detail: `${row.count} · ${formatPrice(row.total)}` }))} total={summary.revenue} empty={r.emptySection} />
                  </Section>
                  <Section title={r.statusTitle}>
                    <BarList rows={report.orderStatus.map((row) => ({ key: row.status, label: statusLabel(row.status), value: row.count, detail: `${row.count} · ${formatPrice(row.total)}` }))} total={report.orderStatus.reduce((n, row) => n + row.count, 0)} empty={r.emptySection} />
                  </Section>
                </div>
              </div>

              <Section title={r.staffTitle}>
                {report.staff.length === 0 ? <p className="text-sm text-ink-soft">{r.emptySection}</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[360px] text-sm">
                      <thead className="text-left text-[11px] uppercase tracking-wide text-ink-soft"><tr className="border-b border-line"><th className="py-2 font-semibold">{r.colCashier}</th><th className="py-2 text-right font-semibold">{r.colSales}</th><th className="py-2 text-right font-semibold">{r.kpiAvgTicket}</th><th className="py-2 text-right font-semibold">{r.colTotal}</th><th className="py-2 text-right font-semibold">{r.colShare}</th></tr></thead>
                      <tbody>{report.staff.map((row) => <tr key={row.name} className="border-b border-line/60 last:border-0"><td className="py-2.5 font-medium text-ink">{row.name}</td><td className="py-2.5 text-right tabular-nums">{row.count}</td><td className="py-2.5 text-right tabular-nums">{formatPrice(row.count ? row.total / row.count : 0)}</td><td className="py-2.5 text-right font-semibold tabular-nums">{formatPrice(row.total)}</td><td className="py-2.5 text-right tabular-nums text-ink-soft">{percent(share(row.total, summary.posRevenue))}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <ul className="flex items-center gap-3 text-xs text-ink-soft">
      {items.map(([label, color]) => <li key={label} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />{label}</li>)}
    </ul>
  );
}

function BarList({ rows, total, empty }: { rows: { key: string; label: string; value: number; detail: string }[]; total: number; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-ink-soft">{empty}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex justify-between gap-3 text-sm"><span className="text-ink">{row.label}</span><span className="tabular-nums text-ink-soft">{row.detail}</span></div>
          <div className="mt-1.5 h-1.5 rounded-full bg-cream"><div className="h-full rounded-full bg-forest-light" style={{ width: `${total > 0 ? (row.value / total) * 100 : 0}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

function TrendChart({ report, label, labels }: { report: SalesReport; label: (index: number, long?: boolean) => string; labels: { online: string; inStore: string; total: string; transactions: string; peak: string } }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 260;
  const margin = { top: 16, right: 8, bottom: 28, left: 56 };
  const plotW = Math.max(0, width - margin.left - margin.right);
  const plotH = height - margin.top - margin.bottom;
  const max = niceMax(Math.max(...report.series.map((row) => row.total)));
  const count = report.series.length;
  const slot = count ? plotW / count : 0;
  const barW = Math.max(2, Math.min(28, slot * 0.64));
  const y = (value: number) => margin.top + plotH - (value / max) * plotH;
  const labelEvery = Math.ceil(count / Math.max(1, Math.floor(plotW / 44)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const active = hover === null ? null : report.series[hover];

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={report.series.map((row) => `${label(row.index, true)}: ${formatPrice(row.total)}`).join("; ")}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="#e5ddcd" strokeDasharray={tick === 0 ? undefined : "3 4"} />
              <text x={margin.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" fontSize="11" fill="#4a4541">{tick >= 1000 ? `$${(tick / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k` : `$${Math.round(tick)}`}</text>
            </g>
          ))}
          {report.series.map((row, i) => {
            const x = margin.left + i * slot + (slot - barW) / 2;
            const onlineH = (row.online / max) * plotH;
            const posH = (row.pos / max) * plotH;
            const gap = onlineH > 0 && posH > 0 ? 2 : 0;
            const base = margin.top + plotH;
            const dim = hover !== null && hover !== i;
            return (
              <g key={row.index} opacity={dim ? 0.45 : 1}>
                <path d={barPath(x, base - onlineH, barW, onlineH, posH === 0)} fill={ONLINE} />
                <path d={barPath(x, base - onlineH - gap - posH, barW, posH, true)} fill={IN_STORE} />
                {i % labelEvery === 0 && <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#4a4541">{label(row.index)}</text>}
                {report.peak?.index === row.index && <text x={x + barW / 2} y={y(row.total) - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#211e1c">{labels.peak}</text>}
                <rect x={margin.left + i * slot} y={margin.top} width={slot} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} />
              </g>
            );
          })}
        </svg>
      )}
      {active && (
        <div className="pointer-events-none absolute top-2 z-10 w-48 rounded-xl border border-line bg-white p-3 text-xs shadow-lg" style={{ left: Math.min(Math.max(0, margin.left + (hover! + 0.5) * slot - 96), Math.max(0, width - 192)) }}>
          <p className="font-semibold text-ink">{label(active.index, true)}</p>
          <p className="mt-2 flex justify-between"><span className="flex items-center gap-1.5 text-ink-soft"><span className="h-2 w-2 rounded-sm" style={{ background: ONLINE }} />{labels.online}</span><span className="tabular-nums text-ink">{formatPrice(active.online)}</span></p>
          <p className="mt-1 flex justify-between"><span className="flex items-center gap-1.5 text-ink-soft"><span className="h-2 w-2 rounded-sm" style={{ background: IN_STORE }} />{labels.inStore}</span><span className="tabular-nums text-ink">{formatPrice(active.pos)}</span></p>
          <p className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink"><span>{labels.total}</span><span className="tabular-nums">{formatPrice(active.total)}</span></p>
          <p className="mt-1 flex justify-between text-ink-soft"><span>{labels.transactions}</span><span className="tabular-nums">{active.transactions}</span></p>
        </div>
      )}
    </div>
  );
}
