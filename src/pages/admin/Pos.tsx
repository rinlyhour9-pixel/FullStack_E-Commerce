import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { ProductArt } from "../../components/product/ProductArt";
import { Button } from "../../components/ui/Button";
import { useProducts } from "../../context/ProductsContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { categoryLabels } from "../../data/products";
import { formatPrice } from "../../utils/format";
import { printReceipt } from "../../utils/receipt";
import type { PosPaymentMethod, PosSale } from "../../types/pos";
import { PrinterIcon, SearchIcon, TrashIcon } from "../../components/ui/icons";

const AUTO_PRINT_KEY = "tamjit:pos-auto-print";
const readAutoPrint = () => { try { return window.localStorage.getItem(AUTO_PRINT_KEY) !== "0"; } catch { return true; } };

interface CartLine { productId: string; variantId: string; quantity: number }

export function AdminPos() {
  const { products, refresh } = useProducts();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const km = language === "km";
  const PAYMENT_LABELS: Record<PosPaymentMethod, string> = t.admin.common.paymentMethods;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [taxRate, setTaxRate] = useState(0.08);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<PosSale | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [completedCash, setCompletedCash] = useState<number | undefined>(undefined);
  const [autoPrint, setAutoPrint] = useState(readAutoPrint);

  useEffect(() => { void api.get<{ taxRate: number }>("/admin/pos/config").then((config) => setTaxRate(config.taxRate)).catch(() => undefined); }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => (category === "all" || product.category === category)
      && (!term || product.name.toLowerCase().includes(term) || product.category.includes(term)));
  }, [products, query, category]);

  const cartDetails = cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return product && variant ? [{ product, variant, quantity: line.quantity, unitPrice: product.price + variant.priceModifier, lineTotal: (product.price + variant.priceModifier) * line.quantity }] : [];
  });
  const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = Math.round((subtotal * taxRate + Number.EPSILON) * 100) / 100;
  const total = subtotal + tax;
  const cashAmount = cashReceived.trim() === "" ? undefined : Number(cashReceived);
  const cashShort = paymentMethod === "cash" && cashAmount !== undefined && (!Number.isFinite(cashAmount) || cashAmount + 0.005 < total);

  const toggleAutoPrint = (value: boolean) => { setAutoPrint(value); try { window.localStorage.setItem(AUTO_PRINT_KEY, value ? "1" : "0"); } catch { /* preference only */ } };
  const print = (sale: PosSale, cash?: number) => printReceipt(sale, { t, language, cashReceived: cash }).catch(() => showToast(t.admin.receipt.printError, "error"));

  const addToCart = (productId: string, variantId: string) => {
    const product = products.find((item) => item.id === productId);
    const variant = product?.variants.find((item) => item.id === variantId);
    if (!product || !variant || variant.stock < 1) return;
    setCompletedSale(null);
    setCart((current) => {
      const currentLine = current.find((line) => line.productId === productId && line.variantId === variantId);
      if (currentLine && currentLine.quantity >= variant.stock) {
        showToast(t.admin.pos.cartAtStock, "info");
        return current;
      }
      return currentLine
        ? current.map((line) => line.productId === productId && line.variantId === variantId ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { productId, variantId, quantity: 1 }];
    });
  };

  const setQuantity = (key: string, quantity: number) => {
    const [productId, variantId] = key.split("::");
    if (quantity < 1) return setCart((current) => current.filter((line) => !(line.productId === productId && line.variantId === variantId)));
    const stock = products.find((item) => item.id === productId)?.variants.find((item) => item.id === variantId)?.stock ?? 0;
    if (quantity > stock) return showToast(t.admin.pos.onlyAvailable.replace("{count}", String(stock)), "info");
    setCart((current) => current.map((line) => line.productId === productId && line.variantId === variantId ? { ...line, quantity } : line));
  };

  const checkout = async () => {
    setError(null);
    if (cashShort) return setError(t.admin.pos.cashShort);
    setIsSubmitting(true);
    try {
      const sale = await api.post<PosSale>("/admin/pos/sales", {
        items: cart.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
        paymentMethod,
        ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
      });
      const cash = paymentMethod === "cash" ? cashAmount : undefined;
      setCompletedSale(sale);
      setCompletedCash(cash);
      setCart([]);
      setCustomerName("");
      setCashReceived("");
      if (autoPrint) void print(sale, cash);
      await refresh();
      showToast(`${t.admin.pos.saleComplete}: ${sale.receiptNumber}`, "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.admin.pos.saleError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">{t.admin.pos.eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">{t.admin.pos.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t.admin.pos.subtitle}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{t.admin.pos.productsAvailable}</p>
          <p className="font-display text-xl text-ink">{products.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.admin.pos.searchPlaceholder} className="w-full rounded-xl border border-ink/10 bg-cream/50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest" />
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest">
              <option value="all">{t.admin.pos.allCategories}</option>
              {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {filteredProducts.length === 0 ? <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-ink-soft">{t.admin.pos.noMatch}</div> : (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const selectedId = selectedVariants[product.id] ?? product.variants[0]?.id ?? "";
                const selected = product.variants.find((variant) => variant.id === selectedId);
                return (
                  <article key={product.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                    <ProductArt artKey={product.images[0] ?? "jar:forest:0"} label={product.name} className="aspect-[5/3] w-full" />
                    <div className="flex flex-col gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{product.name}</p>
                        <p className="mt-0.5 truncate text-xs capitalize text-ink-soft">{categoryLabels[product.category]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={selectedId} onChange={(event) => setSelectedVariants((current) => ({ ...current, [product.id]: event.target.value }))} className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs text-ink" aria-label={`${t.admin.pos.chooseSizeAriaPrefix} ${product.name}`}>
                          {product.variants.map((variant) => <option key={variant.id} value={variant.id} disabled={variant.stock < 1}>{variant.label} · {variant.stock} {t.admin.inventory.available}</option>)}
                        </select>
                        <span className="whitespace-nowrap text-sm font-semibold text-ink">{formatPrice(product.price + (selected?.priceModifier ?? 0))}</span>
                      </div>
                      <Button type="button" size="sm" disabled={!selected || selected.stock < 1} onClick={() => addToCart(product.id, selectedId)}>
                        {selected && selected.stock < 1 ? t.admin.pos.outOfStock : t.admin.pos.addToSale}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="flex h-fit flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm xl:sticky xl:top-5">
          <div className="border-b border-line bg-cream/70 px-5 py-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t.admin.pos.currentTicket}</p><h2 className="mt-1 font-display text-xl text-ink">{t.admin.pos.inStoreSale}</h2></div>
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">{cartDetails.reduce((sum, item) => sum + item.quantity, 0)} {t.admin.pos.itemsSuffix}</span>
            </div>
          </div>

          {completedSale ? (
            <div className="flex flex-col gap-4 p-5">
              <div className="rounded-2xl bg-sage-light/60 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-forest">{t.admin.pos.saleComplete}</p>
                <p className="mt-1 font-display text-2xl text-ink">{completedSale.receiptNumber}</p>
                <p className="mt-2 text-sm text-ink-soft">{completedSale.items.reduce((sum, item) => sum + item.quantity, 0)} {t.admin.pos.itemsSuffix} · {PAYMENT_LABELS[completedSale.paymentMethod]}</p>
                <p className="mt-2 font-display text-3xl text-ink">{formatPrice(completedSale.total)}</p>
                {completedCash !== undefined && completedCash >= completedSale.total && <p className="mt-2 text-sm text-ink">{t.admin.pos.changeDue}: <span className="font-semibold">{formatPrice(completedCash - completedSale.total)}</span></p>}
              </div>
              <Button type="button" variant="secondary" icon={<PrinterIcon className="h-4 w-4" />} onClick={() => void print(completedSale, completedCash)}>{t.admin.pos.printReceipt}</Button>
              <Button type="button" onClick={() => setCompletedSale(null)}>{t.admin.pos.startNextSale}</Button>
              <p className="text-center text-xs text-ink-soft">{t.admin.pos.receiptNote}</p>
            </div>
          ) : (
            <>
              <div className="flex max-h-[38vh] min-h-32 flex-col gap-3 overflow-y-auto px-5 py-4">
                {cartDetails.length === 0 ? <div className="m-auto text-center"><p className="text-sm font-medium text-ink">{t.admin.pos.ticketEmptyTitle}</p><p className="mt-1 text-xs text-ink-soft">{t.admin.pos.ticketEmptyDesc}</p></div> : cartDetails.map(({ product, variant, quantity, unitPrice, lineTotal }) => {
                  const key = `${product.id}::${variant.id}`;
                  return (
                    <div key={key} className="flex gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                      <ProductArt artKey={product.images[0] ?? "jar:forest:0"} label={product.name} className="h-14 w-14 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
                        <p className="text-xs text-ink-soft">{variant.label} · {formatPrice(unitPrice)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button type="button" onClick={() => setQuantity(key, quantity - 1)} className="h-7 w-7 rounded-full border border-ink/10 text-ink" aria-label={`${t.admin.pos.decreaseAriaPrefix} ${product.name}`}>−</button>
                          <span className="min-w-5 text-center text-xs font-semibold">{quantity}</span>
                          <button type="button" onClick={() => setQuantity(key, quantity + 1)} className="h-7 w-7 rounded-full border border-ink/10 text-ink" aria-label={`${t.admin.pos.increaseAriaPrefix} ${product.name}`}>+</button>
                          <button type="button" onClick={() => setQuantity(key, 0)} className="ml-auto rounded-full p-1.5 text-ink-soft hover:bg-clay/10 hover:text-clay-dark" aria-label={`${t.admin.pos.removeAriaPrefix} ${product.name}`}><TrashIcon className="h-4 w-4" /></button>
                          <span className="text-sm font-semibold text-ink">{formatPrice(lineTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-line px-5 py-4">
                <label className="mb-3 block"><span className="mb-1 block text-xs font-medium text-ink-soft">{t.admin.pos.customerNameLabel}</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder={t.admin.pos.customerNamePlaceholder} className="w-full rounded-xl border border-ink/10 px-3 py-2.5 text-sm outline-none focus:border-forest" /></label>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {(Object.keys(PAYMENT_LABELS) as PosPaymentMethod[]).map((method) => <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${paymentMethod === method ? "border-forest bg-forest text-white" : "border-ink/10 text-ink-soft hover:border-forest"}`}>{PAYMENT_LABELS[method]}</button>)}
                </div>
                {paymentMethod === "cash" && (
                  <div className="mb-4">
                    <span className="mb-1 block text-xs font-medium text-ink-soft">{t.admin.pos.cashReceived}</span>
                    <div className="flex gap-2">
                      <input type="number" inputMode="decimal" min="0" step="0.01" value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} placeholder={t.admin.pos.cashReceivedPlaceholder} aria-label={t.admin.pos.cashReceived} className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-forest ${cashShort ? "border-clay" : "border-ink/10"}`} />
                      <button type="button" disabled={!cartDetails.length} onClick={() => setCashReceived(total.toFixed(2))} className="rounded-xl border border-ink/10 px-3 text-xs font-semibold text-ink-soft hover:border-forest disabled:opacity-40">{t.admin.pos.exactAmount}</button>
                    </div>
                    {cashShort ? <p className="mt-1.5 text-xs text-clay-dark">{t.admin.pos.cashShort}</p> : cashAmount !== undefined && cartDetails.length > 0 && <p className="mt-1.5 flex justify-between text-sm text-ink"><span>{t.admin.pos.changeDue}</span><span className="font-semibold">{formatPrice(cashAmount - total)}</span></p>}
                  </div>
                )}
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-ink-soft"><span>{t.admin.pos.subtotal}</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-ink-soft"><span>{t.admin.pos.taxLabel.replace("{pct}", (taxRate * 100).toLocaleString())}</span><span>{formatPrice(tax)}</span></div>
                  <div className="mt-1 flex justify-between border-t border-line pt-3 font-semibold text-ink"><span>{t.admin.pos.totalDue}</span><span className="font-display text-xl">{formatPrice(total)}</span></div>
                </div>
                {error && <p role="alert" className="mt-3 rounded-xl bg-clay/10 px-3 py-2 text-xs text-clay-dark">{error}</p>}
                <Button type="button" size="lg" className="mt-4 w-full" disabled={!cartDetails.length || isSubmitting || cashShort} onClick={() => void checkout()}>{isSubmitting ? t.admin.pos.completingSale : t.admin.pos.completeSale}</Button>
                <label className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={autoPrint} onChange={(event) => toggleAutoPrint(event.target.checked)} className="accent-forest" />{t.admin.pos.autoPrint}</label>
                <button type="button" onClick={() => { setCart([]); setError(null); setCashReceived(""); }} disabled={!cart.length || isSubmitting} className="mt-2 w-full py-2 text-xs font-medium text-ink-soft hover:text-ink disabled:opacity-40">{t.admin.pos.clearTicket}</button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
