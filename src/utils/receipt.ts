import { STORE_DETAILS } from "../config/store";
import type { Language, Translations } from "../i18n/translations";
import type { PosSale } from "../types/pos";
import { formatPrice } from "./format";

export type ReceiptFormat = "receipt" | "invoice";

export interface ReceiptOptions {
  t: Translations;
  language: Language;
  format?: ReceiptFormat;
  /** Cash handed over by the customer. Only known at the till, so reprints omit it. */
  cashReceived?: number;
}

const FORMAT_KEY = "tamjit:receipt-format";
export function getReceiptFormat(): ReceiptFormat {
  try { return window.localStorage.getItem(FORMAT_KEY) === "invoice" ? "invoice" : "receipt"; } catch { return "receipt"; }
}
export function setReceiptFormat(format: ReceiptFormat) {
  try { window.localStorage.setItem(FORMAT_KEY, format); } catch { /* preference only */ }
}

const escape = (value: string) => value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

// Code 128 bar/space widths for values 0–105, then the stop pattern.
const CODE128 = "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(" ");

/** Code 128 (set B) barcode as an inline SVG, so receipts can be scanned back up for returns. */
export function code128Svg(text: string, height = 40) {
  const values = [104, ...[...text].map((ch) => Math.min(95, Math.max(0, ch.charCodeAt(0) - 32)))];
  const checksum = values.reduce((sum, value, i) => sum + value * (i === 0 ? 1 : i), 0) % 103;
  const widths = [...values, checksum, 106].map((value) => CODE128[value]).join("");
  let x = 10; // quiet zone
  const bars: string[] = [];
  [...widths].forEach((w, i) => { const width = Number(w); if (i % 2 === 0) bars.push(`<rect x="${x}" y="0" width="${width}" height="${height}"/>`); x += width; });
  return `<svg class="barcode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x + 10} ${height}" preserveAspectRatio="none" role="img" aria-label="${escape(text)}"><g fill="#000">${bars.join("")}</g></svg>`;
}

const LEAF = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14Z"/><path d="M5 19 13 11"/></svg>`;

function details(sale: PosSale, { t, cashReceived }: ReceiptOptions) {
  const date = new Date(sale.createdAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    r: t.admin.receipt,
    date: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    taxPct: sale.subtotal > 0 ? Math.round((sale.tax / sale.subtotal) * 1000) / 10 : 0,
    units: sale.items.reduce((sum, item) => sum + item.quantity, 0),
    method: t.admin.common.paymentMethods[sale.paymentMethod],
    change: sale.paymentMethod === "cash" && cashReceived !== undefined && cashReceived >= sale.total ? { received: cashReceived, change: cashReceived - sale.total } : null,
    contact: [STORE_DETAILS.address, STORE_DETAILS.phone, STORE_DETAILS.website].filter(Boolean) as string[],
  };
}

const fontLink = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap" />`;
// Letter-spacing breaks Khmer glyph shaping, so spaced-out labels are set solid in Khmer.
const khmerLabels = (km: boolean) => (km ? "<style>.title, .items-head, .grand span:first-child, .paid, .label, thead th, .badge { letter-spacing: 0 !important; }</style>" : "");
const bodyFont = (km: boolean) => `${km ? '"Noto Sans Khmer", ' : ""}Inter, system-ui, sans-serif`;

function thermal(sale: PosSale, options: ReceiptOptions) {
  const { r, date, time, taxPct, units, method, change, contact } = details(sale, options);
  const km = options.language === "km";
  const row = (label: string, value: string, cls = "") => `<div class="row ${cls}"><span>${escape(label)}</span><span>${escape(value)}</span></div>`;
  return `<style>
  @page { size: 80mm 200mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  body { width: 80mm; padding: 6mm 5mm 7mm; color: #111; font: 11.5px/1.5 ${bodyFont(km)}; }
  .center { text-align: center; }
  .logo { display: inline-flex; align-items: center; gap: 6px; font: 600 22px/1 Fraunces, Georgia, serif; letter-spacing: 0.14em; }
  .tagline { margin-top: 3px; font-size: 9px; letter-spacing: 0.34em; text-transform: uppercase; color: #444; }
  .contact { margin-top: 6px; font-size: 10.5px; color: #333; }
  .title { margin: 10px 0 8px; padding: 4px 0; border-top: 1.5px solid #111; border-bottom: 1.5px solid #111; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
  .row { display: flex; justify-content: space-between; gap: 10px; }
  .row span:first-child { color: #444; }
  .row span:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  .meta .row span:last-child { font-weight: 500; color: #111; }
  .rule { border: 0; border-top: 1px dashed #777; margin: 8px 0; }
  .items-head { display: grid; grid-template-columns: 1fr 26px 56px; gap: 6px; font-size: 9.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #555; }
  .item { display: grid; grid-template-columns: 1fr 26px 56px; gap: 6px; padding: 4px 0; }
  .item + .item { border-top: 1px dotted #ccc; }
  .item .name { font-weight: 600; color: #111; line-height: 1.3; }
  .item .sub { font-size: 10px; color: #555; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .qty { text-align: center; }
  .totals .row { padding: 1px 0; }
  .grand { margin: 8px 0 6px; padding: 7px 8px; border: 1.5px solid #111; border-radius: 4px; display: flex; justify-content: space-between; align-items: baseline; }
  .grand span:first-child { font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px; }
  .grand span:last-child { font-size: 19px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .paid { display: inline-block; margin-left: 6px; padding: 0 5px; border: 1px solid #111; border-radius: 3px; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .thanks { margin-top: 10px; font-weight: 700; font-size: 12px; }
  .policy { margin-top: 3px; font-size: 10px; color: #444; }
  .barcode { display: block; width: 58mm; height: 11mm; margin: 9px auto 3px; }
  .code { font: 10px/1 ui-monospace, Consolas, monospace; letter-spacing: 0.12em; }
</style>
<div class="center">
  <div class="logo">${LEAF}${escape(STORE_DETAILS.name)}</div>
  ${STORE_DETAILS.tagline ? `<div class="tagline">${escape(STORE_DETAILS.tagline)}</div>` : ""}
  <div class="contact">${contact.map((line) => `<div>${escape(line)}</div>`).join("")}${STORE_DETAILS.taxId ? `<div>VATTIN ${escape(STORE_DETAILS.taxId)}</div>` : ""}</div>
  <div class="title">${escape(r.title)}</div>
</div>
<div class="meta">
  ${row(r.receiptNo, sale.receiptNumber)}
  ${row(r.date, `${date}  ${time}`)}
  ${row(r.cashier, sale.staffName)}
  ${row(r.customer, sale.customerName || r.walkIn)}
</div>
<hr class="rule" />
<div class="items-head"><span>${escape(r.colItem)}</span><span class="qty">${escape(r.colQty)}</span><span class="num">${escape(r.colAmount)}</span></div>
${sale.items.map((item) => `<div class="item"><div><div class="name">${escape(item.productName)}</div><div class="sub">${escape(item.variantLabel)} · ${formatPrice(item.unitPrice)}</div></div><div class="qty">${item.quantity}</div><div class="num">${formatPrice(item.lineTotal)}</div></div>`).join("")}
<hr class="rule" />
<div class="totals">
  ${row(r.itemsCount, String(units))}
  ${row(r.subtotal, formatPrice(sale.subtotal))}
  ${row(r.tax.replace("{pct}", String(taxPct)), formatPrice(sale.tax))}
</div>
<div class="grand"><span>${escape(r.total)}</span><span>${formatPrice(sale.total)}</span></div>
<div class="totals">
  <div class="row"><span>${escape(r.payment)}</span><span>${escape(method)}<span class="paid">${escape(r.paid)}</span></span></div>
  ${change ? row(r.cashReceived, formatPrice(change.received)) + row(r.change, formatPrice(change.change)) : ""}
</div>
<hr class="rule" />
<div class="center">
  <div class="thanks">${escape(r.thankYou)}</div>
  <div class="policy">${escape(r.policy)}</div>
  ${code128Svg(sale.receiptNumber)}
  <div class="code">${escape(sale.receiptNumber)}</div>
</div>
<script>
  // Size the page to the receipt so "Save as PDF" and roll printers don't produce a full sheet.
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    var mm = Math.ceil(document.body.scrollHeight * 25.4 / 96) + 2;
    var style = document.createElement("style");
    style.textContent = "@page { size: 80mm " + mm + "mm; margin: 0; }";
    document.body.appendChild(style);
    document.documentElement.dataset.ready = "1";
  });
</script>`;
}

function invoice(sale: PosSale, options: ReceiptOptions) {
  const { r, date, time, taxPct, units, method, change, contact } = details(sale, options);
  const km = options.language === "km";
  return `<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  body { width: 210mm; min-height: 297mm; padding: 16mm 16mm 14mm; color: #211e1c; font: 12.5px/1.55 ${bodyFont(km)}; display: flex; flex-direction: column; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 18px; border-bottom: 2px solid #2b4339; }
  .brand { display: flex; align-items: center; gap: 8px; color: #2b4339; font: 600 28px/1 Fraunces, Georgia, serif; letter-spacing: 0.1em; }
  .brand svg { width: 26px; height: 26px; color: #aebba0; }
  .tagline { margin-top: 4px; font-size: 10px; letter-spacing: 0.34em; text-transform: uppercase; color: #6b6560; }
  .contact { margin-top: 10px; color: #4a4541; font-size: 11.5px; }
  .doc { text-align: right; }
  .doc h1 { font: 500 34px/1 Fraunces, Georgia, serif; color: #211e1c; letter-spacing: 0.02em; }
  .doc dl { margin-top: 12px; display: grid; grid-template-columns: auto auto; gap: 3px 14px; justify-content: end; font-size: 11.5px; }
  .doc dt { color: #6b6560; }
  .doc dd { font-weight: 600; font-variant-numeric: tabular-nums; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0 22px; }
  .card { padding: 12px 14px; border-radius: 10px; background: #f6f1e8; }
  .label { font-size: 9.5px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #6b6560; }
  .card p:last-child { margin-top: 4px; font-weight: 600; font-size: 13px; }
  .badge { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 999px; background: #2b4339; color: #fbf7f1; font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; vertical-align: 2px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 9px 10px; background: #2b4339; color: #fbf7f1; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; text-align: left; }
  thead th:first-child { border-radius: 8px 0 0 8px; } thead th:last-child { border-radius: 0 8px 8px 0; }
  tbody td { padding: 11px 10px; border-bottom: 1px solid #e5ddcd; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #fbf7f1; }
  .n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .c { text-align: center; }
  .name { font-weight: 600; } .sub { font-size: 11px; color: #6b6560; }
  .summary { display: flex; justify-content: space-between; gap: 32px; margin-top: 22px; }
  .notes { max-width: 90mm; font-size: 11.5px; color: #4a4541; }
  .notes .label { margin-bottom: 4px; }
  .totals { width: 78mm; }
  .totals .row { display: flex; justify-content: space-between; padding: 5px 0; color: #4a4541; }
  .totals .row span:last-child { font-variant-numeric: tabular-nums; color: #211e1c; }
  .grand { margin-top: 6px; padding: 12px 14px; border-radius: 10px; background: #2b4339; color: #fbf7f1; display: flex; justify-content: space-between; align-items: baseline; }
  .grand span:first-child { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
  .grand span:last-child { font: 600 24px/1 Fraunces, Georgia, serif; }
  .foot { margin-top: auto; padding-top: 18px; border-top: 1px solid #e5ddcd; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
  .thanks { font: 500 18px/1.3 Fraunces, Georgia, serif; color: #2b4339; }
  .foot small { display: block; margin-top: 4px; color: #6b6560; font-size: 10.5px; }
  .barcode { display: block; width: 62mm; height: 12mm; }
  .code { margin-top: 3px; text-align: center; font: 10px/1 ui-monospace, Consolas, monospace; letter-spacing: 0.12em; }
</style>
<div class="top">
  <div>
    <div class="brand">${LEAF}${escape(STORE_DETAILS.name)}</div>
    ${STORE_DETAILS.tagline ? `<div class="tagline">${escape(STORE_DETAILS.tagline)}</div>` : ""}
    <div class="contact">${contact.map((line) => `<div>${escape(line)}</div>`).join("")}${STORE_DETAILS.taxId ? `<div>VATTIN ${escape(STORE_DETAILS.taxId)}</div>` : ""}</div>
  </div>
  <div class="doc">
    <h1>${escape(r.invoiceTitle)}</h1>
    <dl><dt>${escape(r.invoiceNo)}</dt><dd>${escape(sale.receiptNumber)}</dd><dt>${escape(r.date)}</dt><dd>${date} · ${time}</dd></dl>
  </div>
</div>
<div class="cards">
  <div class="card"><p class="label">${escape(r.billTo)}</p><p>${escape(sale.customerName || r.walkIn)}</p></div>
  <div class="card"><p class="label">${escape(r.payment)}</p><p>${escape(method)}<span class="badge">${escape(r.paid)}</span></p></div>
  <div class="card"><p class="label">${escape(r.issuedBy)}</p><p>${escape(sale.staffName)}</p></div>
</div>
<table>
  <thead><tr><th style="width:36px">#</th><th>${escape(r.colItem)}</th><th class="c" style="width:60px">${escape(r.colQty)}</th><th class="n" style="width:100px">${escape(r.colPrice)}</th><th class="n" style="width:110px">${escape(r.colAmount)}</th></tr></thead>
  <tbody>${sale.items.map((item, i) => `<tr><td>${i + 1}</td><td><div class="name">${escape(item.productName)}</div><div class="sub">${escape(item.variantLabel)}</div></td><td class="c">${item.quantity}</td><td class="n">${formatPrice(item.unitPrice)}</td><td class="n">${formatPrice(item.lineTotal)}</td></tr>`).join("")}</tbody>
</table>
<div class="summary">
  <div class="notes"><p class="label">${escape(r.notes)}</p><p>${escape(r.policy)}</p></div>
  <div class="totals">
    <div class="row"><span>${escape(r.itemsCount)}</span><span>${units}</span></div>
    <div class="row"><span>${escape(r.subtotal)}</span><span>${formatPrice(sale.subtotal)}</span></div>
    <div class="row"><span>${escape(r.tax.replace("{pct}", String(taxPct)))}</span><span>${formatPrice(sale.tax)}</span></div>
    <div class="grand"><span>${escape(r.amountDue)}</span><span>${formatPrice(sale.total)}</span></div>
    ${change ? `<div class="row"><span>${escape(r.cashReceived)}</span><span>${formatPrice(change.received)}</span></div><div class="row"><span>${escape(r.change)}</span><span>${formatPrice(change.change)}</span></div>` : ""}
  </div>
</div>
<div class="foot">
  <div><p class="thanks">${escape(r.thankYou)}</p><small>${escape(STORE_DETAILS.name)}${contact[0] ? ` · ${escape(contact[0])}` : ""}</small></div>
  <div>${code128Svg(sale.receiptNumber)}<div class="code">${escape(sale.receiptNumber)}</div></div>
</div>
<script>(document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { document.documentElement.dataset.ready = "1"; });</script>`;
}

/** A complete, self-contained HTML document for the sale in the chosen format. */
export function receiptDocument(sale: PosSale, options: ReceiptOptions) {
  const format = options.format ?? "receipt";
  return `<!doctype html><html lang="${options.language}"><head><meta charset="utf-8" /><title>${escape(sale.receiptNumber)}</title>${fontLink}</head><body>${format === "invoice" ? invoice(sale, options) : thermal(sale, options)}${khmerLabels(options.language === "km")}</body></html>`;
}

/** Prints the document from a frame once its fonts and page size are ready. */
export function printFrame(frame: HTMLIFrameElement) {
  const win = frame.contentWindow;
  if (!win) return Promise.reject(new Error("print frame unavailable"));
  return new Promise<void>((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (win.document.documentElement.dataset.ready === "1" || Date.now() - started > 2500) { win.focus(); win.print(); resolve(); }
      else setTimeout(tick, 50);
    };
    tick();
  });
}

/** Prints straight away through a hidden frame, so the admin page itself is untouched. */
export function printReceipt(sale: PosSale, options: ReceiptOptions): Promise<void> {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0", visibility: "hidden" });
  const done = new Promise<void>((resolve, reject) => {
    frame.onload = () => {
      frame.contentWindow?.addEventListener("afterprint", () => setTimeout(() => frame.remove(), 100), { once: true });
      printFrame(frame).then(resolve, (error) => { frame.remove(); reject(error); });
    };
  });
  frame.srcdoc = receiptDocument(sale, { ...options, format: options.format ?? getReceiptFormat() });
  document.body.appendChild(frame);
  return done;
}
