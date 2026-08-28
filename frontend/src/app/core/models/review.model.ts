export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  userId: number;
  customerName: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: ReviewStatus;
  featured: boolean;
  createdAt: string;
}

export interface ReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
}
