import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import type { PosSale } from "../../types/pos";
import { getReceiptFormat, printFrame, receiptDocument, setReceiptFormat, type ReceiptFormat } from "../../utils/receipt";
import { CloseIcon, PrinterIcon } from "../ui/icons";

// Rendered page sizes at 96dpi: 80mm roll and A4 sheet.
const PAGE = { receipt: { width: 302, height: 900 }, invoice: { width: 794, height: 1123 } };

interface ReceiptPreviewProps {
  sale: PosSale;
  cashReceived?: number;
  onClose: () => void;
}

export function ReceiptPreview({ sale, cashReceived, onClose }: ReceiptPreviewProps) {
  const { t, language } = useLanguage();
  const r = t.admin.receipt;
  const km = language === "km";
  const { showToast } = useToast();
  const [format, setFormat] = useState<ReceiptFormat>(getReceiptFormat);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    printButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const choose = (next: ReceiptFormat) => { setFormat(next); setReceiptFormat(next); setContentHeight(null); };
  const page = PAGE[format];
  // A4 is scaled down to fit the dialog; the roll receipt is shown at its real size.
  const scale = format === "invoice" ? 0.62 : 1;
  const height = format === "receipt" ? contentHeight ?? page.height : page.height;

  const measure = () => {
    const doc = frameRef.current?.contentDocument;
    if (format !== "receipt" || !doc) return;
    // Re-measure as web fonts swap in; the roll receipt grows to fit its content.
    const update = () => setContentHeight(Math.ceil(doc.documentElement.getBoundingClientRect().height));
    update();
    void doc.fonts?.ready.then(update);
    new ResizeObserver(update).observe(doc.documentElement);
  };

  const print = () => {
    if (!frameRef.current) return;
    void printFrame(frameRef.current).catch(() => showToast(r.printError, "error"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden" role="dialog" aria-modal="true" aria-label={r.preview}>
      <button type="button" className="absolute inset-0 bg-ink/60" onClick={onClose} aria-label={r.close} tabIndex={-1} />
      <div className={`relative flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-3xl bg-cream shadow-2xl ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
        <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg text-ink">{r.preview}</h2>
            <p className="truncate text-xs text-ink-soft">{sale.receiptNumber}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink" aria-label={r.close}><CloseIcon className="h-5 w-5" /></button>
        </div>

        <div className="border-b border-line bg-white px-5 py-3">
          <div role="tablist" className="grid grid-cols-2 rounded-xl bg-cream p-1">
            {(["receipt", "invoice"] as const).map((option) => (
              <button key={option} type="button" role="tab" aria-selected={format === option} onClick={() => choose(option)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${format === option ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>
                {option === "receipt" ? r.formatReceipt : r.formatInvoice}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-cream-dark/60 px-5 py-6">
          <div className="mx-auto overflow-hidden bg-white shadow-lg ring-1 ring-ink/5" style={{ width: page.width * scale, height: height * scale }}>
            <iframe
              key={format}
              ref={frameRef}
              title={r.preview}
              srcDoc={receiptDocument(sale, { t, language, format, cashReceived })}
              onLoad={measure}
              scrolling="no"
              className="block origin-top-left border-0"
              style={{ width: page.width, height, transform: `scale(${scale})` }}
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-line bg-white px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5">{r.close}</button>
          <button ref={printButtonRef} type="button" onClick={print} className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-dark"><PrinterIcon className="h-4 w-4" />{r.print}</button>
        </div>
      </div>
    </div>
  );
}
