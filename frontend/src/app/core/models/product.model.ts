import { BrandSummary } from './brand.model';
import { Category } from './category.model';

/** The sellable unit: one flavour/size of a product, with its own SKU, price and stock. */
export interface ProductVariant {
  id: number;
  sku: string;
  flavour: string | null;
  sizeLabel: string | null;
  sizeValue: number | null;
  sizeUnit: string | null;
  /** "Chocolate · 1 kg" — what the selector button reads. Null when unnamed. */
  label: string | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  imageUrl: string | null;
  active: boolean;
  defaultVariant: boolean;
  displayOrder: number;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
}

/** One at-a-glance fact, e.g. "Protein per serve" / "25 g". */
export interface ProductSpec {
  id: number;
  label: string;
  value: string;
  displayOrder: number;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  /** Cheapest active variant — show "from ₹X" when multipleVariants is true. */
  fromPrice: number;
  multipleVariants: boolean;
  variantCount: number;
  /** Lets a card add a single-variant product straight to the cart. */
  defaultVariantId: number | null;
  currency: string;
  primaryImageUrl: string | null;
  brand: BrandSummary | null;
  avgRating: number;
  reviewCount: number;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  primary: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  benefits: string | null;
  ingredients: string | null;
  nutritionalInfo: string | null;
  usageInstructions: string | null;
  warnings: string | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  fromPrice: number;
  currency: string;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  avgRating: number;
  reviewCount: number;
  tags: string | null;
  /** Summed across every variant; per-variant stock lives on each variant. */
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  brand: BrandSummary | null;
  variants: ProductVariant[];
  specs: ProductSpec[];
  defaultVariantId: number | null;
  images: ProductImage[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantRequest {
  /** Null for a new variant; set when editing an existing one. */
  id?: number | null;
  sku: string;
  flavour?: string | null;
  sizeLabel?: string | null;
  sizeValue?: number | null;
  sizeUnit?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  active?: boolean;
  defaultVariant?: boolean;
  displayOrder?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
}

export interface ProductSpecRequest {
  label: string;
  value: string;
  displayOrder?: number;
}

export interface ProductRequest {
  name: string;
  slug?: string;
  sku: string;
  brandId: number;
  shortDescription?: string;
  description?: string;
  benefits?: string;
  ingredients?: string;
  nutritionalInfo?: string;
  usageInstructions?: string;
  warnings?: string;
  price: number;
  salePrice?: number | null;
  active?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  tags?: string;
  categoryIds?: number[];
  /** Leave empty for a single-SKU product; the API then keeps one default variant in step. */
  variants?: ProductVariantRequest[];
  /** At-a-glance facts. An empty array clears them; omitting leaves them alone. */
  specs?: ProductSpecRequest[];
  stockQuantity: number;
  lowStockThreshold?: number;
}

export interface ProductFilterParams {
  q?: string;
  category?: string;
  brands?: string[];
  flavours?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sort?: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating';
  page?: number;
  size?: number;
}

/** The choices the listing sidebar offers, derived from what is actually on sale. */
export interface ProductFacets {
  brands: BrandSummary[];
  flavours: string[];
  sizes: string[];
  minPrice: number | null;
  maxPrice: number | null;
}
