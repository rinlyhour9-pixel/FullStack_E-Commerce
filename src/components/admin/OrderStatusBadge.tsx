import type { OrderStatus } from "../../types/order";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-gold/20 text-clay-dark",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-sage-light text-forest-dark",
  delivered: "bg-forest text-cream",
  cancelled: "bg-ink/10 text-ink-soft",
};

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
