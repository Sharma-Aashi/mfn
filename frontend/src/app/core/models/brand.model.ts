/** The brand as it appears on a product card or in a filter list. */
export interface BrandSummary {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  /** Our own label rather than one we resell. */
  houseBrand: boolean;
  /** Only these may carry the genuineness badge. */
  authorizedReseller: boolean;
}

export interface Brand extends BrandSummary {
  description: string | null;
  bannerUrl: string | null;
  countryOfOrigin: string | null;
  websiteUrl: string | null;
  active: boolean;
  featured: boolean;
  displayOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandRequest {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  countryOfOrigin?: string;
  websiteUrl?: string;
  houseBrand?: boolean;
  authorizedReseller?: boolean;
  active?: boolean;
  featured?: boolean;
  displayOrder?: number;
}
