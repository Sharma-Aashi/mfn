import { Injectable, signal } from '@angular/core';
import { ProductSummary } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class QuickViewService {
  readonly product = signal<ProductSummary | null>(null);

  open(product: ProductSummary): void {
    this.product.set(product);
  }

  close(): void {
    this.product.set(null);
  }
}
