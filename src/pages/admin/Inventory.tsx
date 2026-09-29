import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { ProductArt } from "../../components/product/ProductArt";
import { useProducts } from "../../context/ProductsContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatPrice } from "../../utils/format";
import { getTotalStock, isLowStock } from "../../utils/inventory";
import { SearchIcon } from "../../components/ui/icons";

interface StockEdit { productId: string; variantId: string; value: string }

export function AdminInventory() {
  const { products, refresh } = useProducts();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const km = language === "km";
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [editing, setEditing] = useState<StockEdit | null>(null);
  const [saving, setSaving] = useState(false);

  const visible = useMemo(() => products.filter((product) => {
    const matches = `${product.name} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase());
    return matches && (!lowOnly || isLowStock(product));
  }), [products, query, lowOnly]);
  const lowCount = products.filter(isLowStock).length;
  const units = products.reduce((sum, product) => sum + getTotalStock(product), 0);

  const saveStock = async () => {
    if (!editing) return;
    const next = Number(editing.value);
    if (!Number.isInteger(next) || next < 0) return showToast(t.admin.inventory.invalidStock, "error");
    setSaving(true);
    try {
      await api.patch(`/admin/products/${editing.productId}/variants/${editing.variantId}/stock`, { stock: next });
      setEditing(null);
      await refresh();
      showToast(t.admin.inventory.updateSuccess, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : t.admin.inventory.updateError, "error");
    } finally { setSaving(false); }
  };

  return (
    <div className={`flex flex-col gap-6 ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">{t.admin.inventory.eyebrow}</p><h1 className="mt-1 font-display text-3xl text-ink">{t.admin.inventory.title}</h1><p className="mt-1 text-sm text-ink-soft">{t.admin.inventory.subtitle}</p></div>
        <Link to="/admin/products/new" className="rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark">{t.admin.inventory.addProduct}</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t.admin.inventory.activeProducts}</p><p className="mt-2 font-display text-3xl text-ink">{products.length}</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t.admin.inventory.unitsOnHand}</p><p className="mt-2 font-display text-3xl text-ink">{units}</p></div>
        <button type="button" onClick={() => setLowOnly((value) => !value)} className={`rounded-2xl border p-4 text-left transition ${lowOnly ? "border-clay bg-clay/10" : "border-line bg-white hover:border-clay/50"}`}><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t.admin.inventory.lowStockItems}</p><p className="mt-2 font-display text-3xl text-ink">{lowCount}</p><p className="text-xs text-ink-soft">{lowOnly ? t.admin.inventory.showingLowStock : t.admin.inventory.clickToFilter}</p></button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-line bg-white p-4">
        <label className="relative min-w-56 flex-1"><SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.admin.inventory.searchPlaceholder} className="w-full rounded-xl border border-ink/10 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest" /></label>
        <button type="button" onClick={() => setLowOnly((value) => !value)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${lowOnly ? "border-forest bg-forest text-white" : "border-ink/10 text-ink-soft"}`}>{t.admin.inventory.lowStockOnly}</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1.3fr] gap-4 border-b border-line bg-cream/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-soft md:grid"><span>{t.admin.inventory.colProduct}</span><span>{t.admin.inventory.colVariant}</span><span>{t.admin.inventory.colUnitPrice}</span><span>{t.admin.inventory.colStockOnHand}</span></div>
        {visible.map((product) => product.variants.map((variant, index) => {
          const key = `${product.id}:${variant.id}`;
          const isEditingRow = editing?.productId === product.id && editing.variantId === variant.id;
          const low = variant.stock <= 5;
          return (
            <div key={key} className="grid gap-3 border-b border-line px-4 py-4 last:border-0 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1.3fr] md:items-center md:gap-4 md:px-5">
              {index === 0 ? <div className="flex min-w-0 items-center gap-3"><ProductArt artKey={product.images[0] ?? "jar:forest:0"} label={product.name} className="h-12 w-12 shrink-0 rounded-xl" /><div className="min-w-0"><Link to={`/admin/products/${product.id}/edit`} className="truncate text-sm font-semibold text-ink hover:text-forest">{product.name}</Link><p className="text-xs capitalize text-ink-soft">{product.category}</p></div></div> : <div className="hidden md:block" />}
              <div><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft md:hidden">{t.admin.inventory.colVariant}</p><span className="text-sm text-ink">{variant.label}</span></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft md:hidden">{t.admin.inventory.colUnitPrice}</p><span className="text-sm text-ink">{formatPrice(product.price + variant.priceModifier)}</span></div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft md:hidden">{t.admin.inventory.colStockOnHand}</p>
                {isEditingRow ? <><input type="number" min="0" step="1" value={editing.value} onChange={(event) => setEditing({ ...editing, value: event.target.value })} className="w-24 rounded-lg border border-forest px-2.5 py-1.5 text-sm" aria-label={`${t.admin.inventory.stockAriaPrefix} ${product.name} ${variant.label}`} /><button type="button" disabled={saving} onClick={() => void saveStock()} className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white">{t.admin.inventory.save}</button><button type="button" onClick={() => setEditing(null)} className="text-xs text-ink-soft">{t.admin.inventory.cancel}</button></> : <><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${low ? "bg-clay/10 text-clay-dark" : "bg-sage-light text-forest-dark"}`}>{variant.stock} {low ? t.admin.inventory.low : t.admin.inventory.available}</span><button type="button" onClick={() => setEditing({ productId: product.id, variantId: variant.id, value: String(variant.stock) })} className="ml-auto rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink hover:border-forest">{t.admin.inventory.adjust}</button></>}
              </div>
            </div>
          );
        }))}
        {visible.length === 0 && <p className="p-10 text-center text-sm text-ink-soft">{t.admin.inventory.noItems}</p>}
      </div>
    </div>
  );
}
