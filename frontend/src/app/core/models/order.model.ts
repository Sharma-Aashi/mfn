export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: number | null;
  productSlug: string | null;
  productName: string;
  /** Snapshot at order time; a later brand rename does not rewrite history. */
  brandName: string | null;
  /** Which option was bought. Null for a single-SKU product. */
  variantLabel: string | null;
  productImage: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  customerFullName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDeliveryDate: string | null;
  customerNotes: string | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  customerFullName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry?: string;
  customerNotes?: string;
  saveAddress?: boolean;
  /** "COD" (default) or "ONLINE". ONLINE orders stay PENDING until the gateway verifies. */
  paymentMethod?: 'COD' | 'ONLINE';
}

/** The compact row the admin orders list shows — kept flat so the table
 *  renders quickly at a hundred rows a page. */
export interface AdminOrderSummary {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  customerFullName: string;
  customerEmail: string;
  customerPhone: string;
  grandTotal: number;
  itemCount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];
