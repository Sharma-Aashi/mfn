export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  displayOrder: number;
  productCount: number;
  /** Null for a top-level category. Nesting drives the header mega menu. */
  parentId: number | null;
  parentName: string | null;
  children: Category[];
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
  active?: boolean;
  displayOrder?: number;
}
