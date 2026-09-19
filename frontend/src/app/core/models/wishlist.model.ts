export interface WishlistItem {
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  brandName: string | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  /** Null when nothing is buyable; lets a single-variant item be added straight to the cart. */
  defaultVariantId: number | null;
  multipleVariants: boolean;
  inStock: boolean;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
}
