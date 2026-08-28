export interface InventoryItem {
  productId: number;
  productName: string;
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
