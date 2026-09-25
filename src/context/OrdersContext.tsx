import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Order, OrderStatus, PlaceOrderInput } from "../types/order";

interface OrdersContextValue {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  getOrdersByEmail: (email: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

function generateOrderId() {
  return `TMJ-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useLocalStorage<Order[]>("tamjit:orders", []);

  const placeOrder = useCallback(
    (input: PlaceOrderInput): Order => {
      const order: Order = {
        ...input,
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      setOrders((current) => [order, ...current]);
      return order;
    },
    [setOrders],
  );

  const updateStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    },
    [setOrders],
  );

  const getOrdersByEmail = useCallback(
    (email: string) => orders.filter((order) => order.customerEmail.toLowerCase() === email.toLowerCase()),
    [orders],
  );

  const getOrderById = useCallback((orderId: string) => orders.find((order) => order.id === orderId), [orders]);

  const value = useMemo(
    () => ({ orders, placeOrder, updateStatus, getOrdersByEmail, getOrderById }),
    [orders, placeOrder, updateStatus, getOrdersByEmail, getOrderById],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used within an OrdersProvider");
  return context;
}
