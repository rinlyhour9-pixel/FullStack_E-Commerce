export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  artKey: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: "cash_on_delivery";
}

export interface PlaceOrderInput {
  customerName: string;
  customerEmail?: string;
  shippingAddress: OrderAddress;
}
