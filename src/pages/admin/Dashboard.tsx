import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useOrders } from "../../context/OrdersContext";
import { useProducts } from "../../context/ProductsContext";
import { useLanguage } from "../../context/LanguageContext";
import { StatCard } from "../../components/admin/StatCard";
import { OrderStatusBadge } from "../../components/admin/OrderStatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatPrice } from "../../utils/format";
import { getTotalStock, isLowStock } from "../../utils/inventory";
import { BagIcon, ChartBarIcon, DollarIcon, GridIcon } from "../../components/ui/icons";

export function AdminDashboard() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { t, language } = useLanguage();
  const km = language === "km";
  const [stats, setStats] = useState<{ revenue: number; orders: number; products: number; customers: number; averageTicket?: number; posSales?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  useEffect(() => { void api.get<typeof stats extends infer T ? Exclude<T, null> : never>("/admin/stats").then(setStats).catch((e) => { setHasError(true); setError(e instanceof Error ? e.message : null); }); }, []);

  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const totalRevenue = stats?.revenue ?? 0;
  const avgOrderValue = stats?.averageTicket ?? (activeOrders.length ? activeOrders.reduce((sum, order) => sum + order.total, 0) / activeOrders.length : 0);

  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productSales.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.lineTotal;
      } else {
        productSales.set(item.productId, { name: item.productName, quantity: item.quantity, revenue: item.lineTotal });
      }
    });
  });
  const topProducts = [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const lowStockProducts = products.filter(isLowStock).sort((a, b) => getTotalStock(a) - getTotalStock(b));
  const recentOrders = orders.slice(0, 5);

  return (
    <div className={`flex flex-col gap-8 ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
      <div>
        <h1 className="font-display text-3xl text-ink">{t.admin.dashboard.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t.admin.dashboard.subtitle}</p>
      </div>
      {hasError && <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error ?? t.admin.dashboard.loadError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.admin.dashboard.statRevenue} value={formatPrice(totalRevenue)} icon={<DollarIcon className="h-5 w-5" />} />
        <StatCard label={t.admin.dashboard.statTransactions} value={String(stats?.orders ?? activeOrders.length)} icon={<BagIcon className="h-5 w-5" />} />
        <StatCard
          label={t.admin.dashboard.statAvgOrder}
          value={formatPrice(avgOrderValue)}
          icon={<ChartBarIcon className="h-5 w-5" />}
        />
        <StatCard label={t.admin.dashboard.statProducts} value={String(stats?.products ?? products.length)} icon={<GridIcon className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">{t.admin.dashboard.recentOrders}</h2>
            <Link to="/admin/orders" className="text-xs font-semibold uppercase tracking-wide text-clay-dark hover:text-clay">
              {t.admin.dashboard.viewAll}
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={<BagIcon className="h-6 w-6" />}
              title={t.admin.dashboard.noOrdersTitle}
              description={t.admin.dashboard.noOrdersDesc}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">#{order.id}</p>
                    <p className="truncate text-xs text-ink-soft">{order.customerEmail}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-ink">{formatPrice(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">{t.admin.dashboard.topProducts}</h2>
          {topProducts.length === 0 ? (
            <EmptyState
              icon={<ChartBarIcon className="h-6 w-6" />}
              title={t.admin.dashboard.noSalesTitle}
              description={t.admin.dashboard.noSalesDesc}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {topProducts.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="truncate font-medium text-ink">{entry.name}</span>
                  <span className="shrink-0 text-ink-soft">{entry.quantity} {t.admin.dashboard.soldSuffix}</span>
                  <span className="shrink-0 font-semibold text-ink">{formatPrice(entry.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-white p-6">
        <h2 className="mb-4 font-display text-lg text-ink">{t.admin.dashboard.lowStock}</h2>
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-ink-soft">{t.admin.dashboard.allStocked}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {lowStockProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <Link to={`/admin/products/${product.id}/edit`} className="truncate font-medium text-ink hover:text-clay-dark">
                  {product.name}
                </Link>
                <span className="shrink-0 rounded-full bg-clay/10 px-2.5 py-1 text-xs font-semibold text-clay-dark">
                  {getTotalStock(product)} {t.admin.dashboard.leftSuffix}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
