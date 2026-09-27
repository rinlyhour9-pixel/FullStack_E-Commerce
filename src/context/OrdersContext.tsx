import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";
import type { Order, OrderStatus, PlaceOrderInput } from "../types/order";
interface OrdersContextValue { orders: Order[]; isLoading: boolean; error: string | null; placeOrder: (input: PlaceOrderInput) => Promise<Order>; updateStatus: (id: string, status: OrderStatus) => Promise<void>; getOrdersByEmail: (email: string) => Order[]; getOrderById: (id: string) => Order | undefined; refresh: () => Promise<void> }
const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);
export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const [orders, setOrders] = useState<Order[]>([]); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    setIsLoading(true); setError(null);
    try { setOrders(await api.get<Order[]>(user.role === "admin" ? "/admin/orders" : "/orders")); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load orders"); }
    finally { setIsLoading(false); }
  }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);
  const placeOrder = useCallback(async (input: PlaceOrderInput) => {
    const order = await api.post<Order>("/orders", { customerName: input.customerName, customerEmail: input.customerEmail, shippingAddress: input.shippingAddress });
    setOrders((current) => [order, ...current]); return order;
  }, []);
  const updateStatus = useCallback(async (id: string, status: OrderStatus) => { const order = await api.patch<Order>(`/admin/orders/${id}/status`, { status }); setOrders((current) => current.map((item) => item.id === id ? order : item)); }, []);
  const getOrdersByEmail = useCallback((email: string) => orders.filter((order) => order.customerEmail.toLowerCase() === email.toLowerCase()), [orders]);
  const getOrderById = useCallback((id: string) => orders.find((order) => order.id === id), [orders]);
  const value = useMemo(() => ({ orders, isLoading, error, placeOrder, updateStatus, getOrdersByEmail, getOrderById, refresh }), [orders, isLoading, error, placeOrder, updateStatus, getOrdersByEmail, getOrderById, refresh]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}
export function useOrders() { const context = useContext(OrdersContext); if (!context) throw new Error("useOrders must be used within an OrdersProvider"); return context; }
