import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { Faq, FaqCategory } from '../../core/models/faq.model';
import { FaqService } from '../../core/services/faq.service';
import { SeoService } from '../../core/services/seo.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

const CATEGORIES: { value: FaqCategory | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PRODUCTS', label: 'Products' },
  { value: 'ORDERS', label: 'Orders' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'RETURNS', label: 'Returns' },
  { value: 'PAYMENTS', label: 'Payments' },
  { value: 'USAGE', label: 'Usage' },
  { value: 'GENERAL', label: 'General' },
];

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [FormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './faq.page.html',
})
export class FaqPage {
  private readonly faqService = inject(FaqService);
  private readonly search$ = new Subject<void>();

  protected readonly categories = CATEGORIES;
  protected readonly faqs = signal<Faq[]>([]);
  protected readonly loading = signal(true);
  protected readonly openIds = signal<Set<number>>(new Set());

  protected category: FaqCategory | '' = '';
  protected search = '';

  constructor() {
    inject(SeoService).update('Frequently Asked Questions', 'Answers to common questions about VITALORA products, orders, shipping, returns and more.');
    this.load();
    this.search$.pipe(debounceTime(350)).subscribe(() => this.load());
  }

  protected onSearchChange(): void {
    this.search$.next();
  }

  protected setCategory(cat: FaqCategory | ''): void {
    this.category = cat;
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.faqService.getActive(this.category || undefined, this.search || undefined).subscribe((f) => {
      this.faqs.set(f);
      this.loading.set(false);
    });
  }

  protected toggle(id: number): void {
    this.openIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected isOpen(id: number): boolean {
    return this.openIds().has(id);
  }
}
