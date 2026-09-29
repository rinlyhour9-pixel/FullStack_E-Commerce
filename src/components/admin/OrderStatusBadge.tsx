import type { OrderStatus } from "../../types/order";
import { useLanguage } from "../../context/LanguageContext";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-gold/20 text-clay-dark",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-sage-light text-forest-dark",
  delivered: "bg-forest text-cream",
  cancelled: "bg-ink/10 text-ink-soft",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t, language } = useLanguage();
  const km = language === "km";
  return (
    <span
      lang={km ? "km" : undefined}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]} ${km ? "font-khmer" : ""}`}
    >
      {t.admin.common.orderStatus[status]}
    </span>
  );
}
