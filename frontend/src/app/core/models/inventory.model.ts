export interface InventoryItem {
  variantId: number;
  productId: number;
  productName: string;
  brandName: string | null;
  /** "Chocolate - 1 kg", or null for a single-SKU product. */
  variantLabel: string | null;
  sku: string;
  primaryImageUrl: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
  outOfStock: boolean;
  productActive: boolean;
}

export interface StockUpdateRequest {
  stockQuantity: number;
  lowStockThreshold?: number;
}
