export type PosPaymentMethod = "cash" | "card" | "qr";

export interface PosSaleItem {
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  imagePath: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PosSale {
  id: string;
  receiptNumber: string;
  paymentMethod: PosPaymentMethod;
  customerName: string | null;
  staffName: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  total: number;
  items: PosSaleItem[];
}
