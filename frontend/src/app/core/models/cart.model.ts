export interface CartItem {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  brandName: string | null;
  /** "Chocolate - 1 kg", or null for a single-SKU product. */
  variantLabel: string | null;
  sku: string;
  unitPrice: number;
  /** List price before discount, so the cart can show what was saved. */
  unitMrp: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
  availableStock: number;
}

export interface Cart {
  id: number | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface AddCartItemRequest {
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
