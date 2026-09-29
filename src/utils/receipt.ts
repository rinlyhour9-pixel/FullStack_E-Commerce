import { STORE_DETAILS } from "../config/store";
import type { Language, Translations } from "../i18n/translations";
import type { PosSale } from "../types/pos";
import { formatPrice } from "./format";

interface ReceiptOptions {
  t: Translations;
  language: Language;
  /** Cash handed over by the customer. Only known at the till, so reprints omit it. */
  cashReceived?: number;
}

const escape = (value: string) => value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export function receiptHtml(sale: PosSale, { t, language, cashReceived }: ReceiptOptions) {
  const r = t.admin.receipt;
  const km = language === "km";
  const date = new Date(sale.createdAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const when = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const taxPct = sale.subtotal > 0 ? Math.round((sale.tax / sale.subtotal) * 1000) / 10 : 0;
  const units = sale.items.reduce((sum, item) => sum + item.quantity, 0);
  const row = (label: string, value: string, cls = "") => `<div class="row ${cls}"><span>${escape(label)}</span><span>${escape(value)}</span></div>`;
  const contact = [STORE_DETAILS.address, STORE_DETAILS.phone, STORE_DETAILS.taxId && `VATTIN ${STORE_DETAILS.taxId}`].filter(Boolean).map((line) => `<div>${escape(line as string)}</div>`).join("");
  const showChange = sale.paymentMethod === "cash" && cashReceived !== undefined && cashReceived >= sale.total;

  return `<!doctype html>
<html lang="${language}"><head><meta charset="utf-8" /><title>${escape(sale.receiptNumber)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Khmer:wght@400;600;700&display=swap" />
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 80mm; padding: 5mm 4mm 8mm; color: #000; background: #fff; font: 12px/1.45 ${km ? '"Noto Sans Khmer",' : ""} Inter, system-ui, sans-serif; }
  .center { text-align: center; }
  .brand { font-size: 22px; font-weight: 700; letter-spacing: 0.18em; }
  .tagline { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 4px; }
  .muted { font-size: 11px; }
  .title { margin: 8px 0 6px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; }
  hr { border: 0; border-top: 1px dashed #000; margin: 7px 0; }
  .row { display: flex; justify-content: space-between; gap: 8px; }
  .row span:last-child { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .item { margin-bottom: 5px; }
  .item-name { font-weight: 600; }
  .item .row { font-size: 11px; }
  .total { font-size: 16px; font-weight: 700; margin: 4px 0; }
  .receipt-no { font-family: ui-monospace, Consolas, monospace; font-size: 13px; letter-spacing: 0.06em; margin-top: 4px; }
  .footer { margin-top: 8px; font-size: 11px; }
</style></head>
<body>
  <div class="center">
    <div class="brand">${escape(STORE_DETAILS.name)}</div>
    ${STORE_DETAILS.tagline ? `<div class="tagline">${escape(STORE_DETAILS.tagline)}</div>` : ""}
    <div class="muted">${contact}</div>
    <div class="title">${escape(r.title)}</div>
  </div>
  ${row(r.receiptNo, sale.receiptNumber)}
  ${row(r.date, when)}
  ${row(r.cashier, sale.staffName)}
  ${row(r.customer, sale.customerName || r.walkIn)}
  <hr />
  ${sale.items.map((item) => `<div class="item"><div class="item-name">${escape(item.productName)}</div>${row(`${item.variantLabel} · ${item.quantity} × ${formatPrice(item.unitPrice)}`, formatPrice(item.lineTotal))}</div>`).join("")}
  <hr />
  ${row(r.itemsCount, String(units))}
  ${row(r.subtotal, formatPrice(sale.subtotal))}
  ${row(r.tax.replace("{pct}", String(taxPct)), formatPrice(sale.tax))}
  <hr />
  ${row(r.total, formatPrice(sale.total), "total")}
  ${row(r.payment, t.admin.common.paymentMethods[sale.paymentMethod])}
  ${showChange ? row(r.cashReceived, formatPrice(cashReceived!)) + row(r.change, formatPrice(cashReceived! - sale.total)) : ""}
  <hr />
  <div class="center footer">
    <div><strong>${escape(r.thankYou)}</strong></div>
    <div>${escape(r.policy)}</div>
    ${STORE_DETAILS.website ? `<div>${escape(STORE_DETAILS.website)}</div>` : ""}
    <div class="receipt-no">*${escape(sale.receiptNumber)}*</div>
  </div>
</body></html>`;
}

/** Prints an 80mm thermal-style receipt through a hidden iframe, so the admin page itself is untouched. */
export function printReceipt(sale: PosSale, options: ReceiptOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0", visibility: "hidden" });
    frame.srcdoc = receiptHtml(sale, options);
    frame.onload = async () => {
      const win = frame.contentWindow;
      if (!win) { frame.remove(); return reject(new Error("print frame unavailable")); }
      // Wait for fonts (Khmer glyphs in particular) so the first print is not in a fallback face.
      await Promise.race([win.document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
      win.addEventListener("afterprint", () => setTimeout(() => frame.remove(), 100), { once: true });
      win.focus();
      win.print();
      resolve();
    };
    document.body.appendChild(frame);
  });
}
