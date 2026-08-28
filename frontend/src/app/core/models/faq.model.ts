export type FaqCategory = 'PRODUCTS' | 'ORDERS' | 'SHIPPING' | 'RETURNS' | 'PAYMENTS' | 'USAGE' | 'GENERAL';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: FaqCategory;
  displayOrder: number;
  active: boolean;
}

export interface FaqRequest {
  question: string;
  answer: string;
  category: FaqCategory;
  displayOrder?: number;
  active?: boolean;
}
