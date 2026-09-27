import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { ProductArt } from "../../components/product/ProductArt";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/format";
import type { PosSale, PosPaymentMethod } from "../../types/pos";
import { RefreshIcon } from "../../components/ui/icons";

const METHOD_LABEL: Record<PosPaymentMethod, string> = { cash: "Cash", card: "Card", qr: "QR transfer" };

export function AdminSales() {
  const [sales, setSales] = useState<PosSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<"today" | "all">("today");
  const { showToast } = useToast();
  const loadSales = () => { setLoading(true); void api.get<PosSale[]>("/admin/pos/sales").then(setSales).catch((error) => showToast(error instanceof Error ? error.message : "Sales could not be loaded.", "error")).finally(() => setLoading(false)); };
  useEffect(loadSales, []);

  const today = new Date().toLocaleDateString();
  const visible = useMemo(() => period === "all" ? sales : sales.filter((sale) => new Date(sale.createdAt).toLocaleDateString() === today), [sales, period, today]);
  const revenue = visible.reduce((sum, sale) => sum + sale.total, 0);
  const itemCount = visible.reduce((sum, sale) => sum + sale.items.reduce((count, item) => count + item.quantity, 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Manager view</p><h1 className="mt-1 font-display text-3xl text-ink">Sales</h1><p className="mt-1 text-sm text-ink-soft">In-store receipts and payment summaries.</p></div>
        <div className="flex gap-2"><select value={period} onChange={(event) => setPeriod(event.target.value as "today" | "all")} className="rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm"><option value="today">Today</option><option value="all">Last 200 sales</option></select><button type="button" onClick={loadSales} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink"><RefreshIcon className="h-4 w-4" /> Refresh</button></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Receipts</p><p className="mt-2 font-display text-3xl text-ink">{visible.length}</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Items sold</p><p className="mt-2 font-display text-3xl text-ink">{itemCount}</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Gross sales</p><p className="mt-2 font-display text-3xl text-ink">{formatPrice(revenue)}</p></div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-3 border-b border-line bg-cream/70 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-soft sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] sm:px-5"><span>Receipt</span><span>Customer</span><span>Payment</span><span className="hidden sm:block">Cashier</span><span className="text-right">Total</span></div>
        {loading ? <p className="p-8 text-center text-sm text-ink-soft">Loading sales…</p> : visible.length === 0 ? <p className="p-10 text-center text-sm text-ink-soft">No in-store sales for this period yet.</p> : visible.map((sale) => (
          <div key={sale.id} className="border-b border-line last:border-0">
            <button type="button" onClick={() => setSelectedId(selectedId === sale.id ? null : sale.id)} className="grid w-full grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-3 px-4 py-4 text-left hover:bg-cream/40 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] sm:px-5">
              <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{sale.receiptNumber}</span><span className="text-xs text-ink-soft">{new Date(sale.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></span>
              <span className="truncate text-sm text-ink">{sale.customerName || "Walk-in"}</span><span className="text-sm text-ink-soft">{METHOD_LABEL[sale.paymentMethod]}</span><span className="hidden truncate text-sm text-ink-soft sm:block">{sale.staffName}</span><span className="text-right text-sm font-semibold text-ink">{formatPrice(sale.total)}</span>
            </button>
            {selectedId === sale.id && <div className="border-t border-line bg-cream/30 px-4 py-4 sm:px-5"><div className="flex flex-col gap-3">{sale.items.map((item) => <div key={`${item.variantId}-${item.productName}`} className="flex items-center gap-3"><ProductArt artKey={item.imagePath || "jar:forest:0"} label={item.productName} className="h-11 w-11 rounded-xl" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{item.productName}</p><p className="text-xs text-ink-soft">{item.variantLabel} · {item.quantity} × {formatPrice(item.unitPrice)}</p></div><span className="text-sm font-semibold text-ink">{formatPrice(item.lineTotal)}</span></div>)}</div><div className="ml-auto mt-4 max-w-xs border-t border-line pt-3 text-sm"><div className="flex justify-between text-ink-soft"><span>Subtotal</span><span>{formatPrice(sale.subtotal)}</span></div><div className="mt-1 flex justify-between text-ink-soft"><span>Tax</span><span>{formatPrice(sale.tax)}</span></div><div className="mt-2 flex justify-between font-semibold text-ink"><span>Total</span><span>{formatPrice(sale.total)}</span></div></div></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
