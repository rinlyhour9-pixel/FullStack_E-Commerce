import { useMemo } from "react";
import { useOrders } from "../../context/OrdersContext";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDate, formatPrice } from "../../utils/format";
import { UsersIcon } from "../../components/ui/icons";

interface CustomerSummary {
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

export function AdminCustomers() {
  const { orders } = useOrders();

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((order) => {
      const key = order.customerEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.total;
        if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
      } else {
        map.set(key, {
          name: order.customerName,
          email: order.customerEmail,
          orderCount: 1,
          totalSpent: order.total,
          lastOrderAt: order.createdAt,
        });
      }
    });
    return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Customers</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Derived from placed demo orders — {customers.length} customer{customers.length === 1 ? "" : "s"}
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-6 w-6" />}
          title="No customers yet"
          description="Customers who place a demo order will appear here automatically."
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-white">
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Orders</th>
                <th className="px-5 py-3 font-semibold">Total spent</th>
                <th className="px-5 py-3 font-semibold">Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.email} className="border-b border-line last:border-none hover:bg-cream/60">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{customer.name}</p>
                    <p className="text-xs text-ink-soft">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3 text-ink">{customer.orderCount}</td>
                  <td className="px-5 py-3 font-semibold text-ink">{formatPrice(customer.totalSpent)}</td>
                  <td className="px-5 py-3 text-ink-soft">{formatDate(customer.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
