import { Category } from './category.model';

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  currency: string;
  primaryImageUrl: string | null;
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
  currency: string;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  avgRating: number;
  reviewCount: number;
  tags: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  images: ProductImage[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  slug?: string;
  sku: string;
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
  stockQuantity: number;
  lowStockThreshold?: number;
}

export interface ProductFilterParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating';
  page?: number;
  size?: number;
}
