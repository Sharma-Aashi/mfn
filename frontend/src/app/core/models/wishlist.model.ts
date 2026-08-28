export interface WishlistItem {
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  inStock: boolean;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
}
