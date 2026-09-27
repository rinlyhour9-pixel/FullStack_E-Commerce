import { useMemo, useState } from "react";
import { useOrders } from "../../context/OrdersContext";
import type { Order, OrderStatus } from "../../types/order";
import { OrderStatusBadge } from "../../components/admin/OrderStatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProductArt } from "../../components/product/ProductArt";
import { formatDate, formatPrice } from "../../utils/format";
import { BagIcon, ChevronDownIcon } from "../../components/ui/icons";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function AdminOrders() {
  const { orders, updateStatus, isLoading, error } = useOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [statusError, setStatusError] = useState<string | null>(null);
  const handleStatusChange = async (id: string, status: OrderStatus) => { setStatusError(null); try { await updateStatus(id, status); } catch (e) { setStatusError(e instanceof Error ? e.message : "Could not update order status"); } };

  const filtered = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter],
  );

  if (isLoading) return <p role="status" className="py-8 text-sm text-ink-soft">Loading orders…</p>;
  if (error) return <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>;
  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <EmptyState
          icon={<BagIcon className="h-6 w-6" />}
          title="No orders yet"
          description="Customer orders will appear here when they check out."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Orders</h1>
          <p className="mt-1 text-sm text-ink-soft">{orders.length} total customer orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === "all" ? "border-forest bg-forest text-cream" : "border-ink/15 text-ink-soft hover:border-ink/30"
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                statusFilter === status ? "border-forest bg-forest text-cream" : "border-ink/15 text-ink-soft hover:border-ink/30"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {statusError && <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{statusError}</p>}
        {filtered.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            isExpanded={expandedId === order.id}
            onToggle={() => setExpandedId((current) => (current === order.id ? null : order.id))}
            onStatusChange={(status) => { void handleStatusChange(order.id, status); }}
          />
        ))}
      </div>
    </div>
  );
}

function OrderRow({
  order,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: OrderStatus) => void;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left sm:flex-nowrap"
        aria-expanded={isExpanded}
      >
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        <div className="min-w-[110px]">
          <p className="font-semibold text-ink">#{order.id}</p>
          <p className="text-xs text-ink-soft">{formatDate(order.createdAt)}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink">{order.customerName}</p>
          <p className="truncate text-xs text-ink-soft">{order.customerEmail}</p>
        </div>
        <p className="shrink-0 text-sm text-ink-soft">{order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
        <p className="shrink-0 font-semibold text-ink">{formatPrice(order.total)}</p>
        <OrderStatusBadge status={order.status} />
      </button>

      {isExpanded && (
        <div className="border-t border-line px-5 py-4">
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
                <ProductArt artKey={item.artKey} label={item.productName} className="h-12 w-12 shrink-0 rounded-lg" />
                <span className="flex-1 text-sm text-ink">
                  {item.productName} <span className="text-ink-soft">× {item.quantity}</span>
                  <span className="block text-xs text-ink-soft">{item.variantLabel}</span>
                </span>
                <span className="text-sm font-semibold text-ink">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="text-sm text-ink-soft">
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-medium text-ink">Status</span>
              <select
                value={order.status}
                onChange={(event) => onStatusChange(event.target.value as OrderStatus)}
                className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm capitalize focus:border-forest focus:outline-none"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
