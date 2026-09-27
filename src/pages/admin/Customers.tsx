import { useEffect, useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDate, formatPrice } from "../../utils/format";
import { UsersIcon } from "../../components/ui/icons";
import { api } from "../../api/client";

interface CustomerSummary { id: string; name: string; email: string; orderCount: number; totalSpent: number; lastOrderAt: string | null }
export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void api.get<CustomerSummary[]>("/admin/customers").then(setCustomers).catch((e) => setError(e instanceof Error ? e.message : "Could not load customers")).finally(() => setLoading(false)); }, []);
  return <div className="flex flex-col gap-6">
    <div><h1 className="font-display text-3xl text-ink">Customers</h1><p className="mt-1 text-sm text-ink-soft">{customers.length} registered customer{customers.length === 1 ? "" : "s"}</p></div>
    {error ? <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p> : loading ? <p role="status" className="py-8 text-sm text-ink-soft">Loading customers…</p> : customers.length === 0 ? <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No customers yet" description="Registered customer accounts will appear here." /> :
      <div className="overflow-x-auto rounded-3xl border border-line bg-white"><table className="w-full min-w-150 text-left text-sm"><thead><tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft"><th className="px-5 py-3 font-semibold">Customer</th><th className="px-5 py-3 font-semibold">Orders</th><th className="px-5 py-3 font-semibold">Total spent</th><th className="px-5 py-3 font-semibold">Last order</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id} className="border-b border-line last:border-none hover:bg-cream/60"><td className="px-5 py-3"><p className="font-medium text-ink">{customer.name}</p><p className="text-xs text-ink-soft">{customer.email}</p></td><td className="px-5 py-3 text-ink">{customer.orderCount}</td><td className="px-5 py-3 font-semibold text-ink">{formatPrice(customer.totalSpent)}</td><td className="px-5 py-3 text-ink-soft">{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"}</td></tr>)}</tbody></table></div>}
  </div>;
}
