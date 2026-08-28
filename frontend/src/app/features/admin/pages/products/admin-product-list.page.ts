import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { ProductDetail } from '../../../../core/models/product.model';
import { CategoryService } from '../../../../core/services/category.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ProductService } from '../../../../core/services/product.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, PaginationComponent, EmptyStateComponent],
  templateUrl: './admin-product-list.page.html',
})
export class AdminProductListPage {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly search$ = new Subject<void>();

  protected readonly products = signal<ProductDetail[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly selected = signal<Set<number>>(new Set());

  protected q = '';
  protected category = '';
  protected active: string = '';

  constructor() {
    inject(SeoService).update('Manage Products');
    this.categoryService.getAllForAdmin().subscribe((c) => this.categories.set(c));
    this.load(0);
    this.search$.pipe(debounceTime(350)).subscribe(() => this.load(0));
  }

  protected onFilterChange(): void {
    this.search$.next();
  }

  private load(page: number): void {
    this.loading.set(true);
    this.productService
      .searchForAdmin({
        q: this.q || undefined,
        category: this.category || undefined,
        active: this.active === '' ? undefined : this.active === 'true',
        page,
        size: 10,
        sort: 'newest',
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.content);
          this.page.set(res.page);
          this.totalPages.set(res.totalPages);
          this.totalElements.set(res.totalElements);
          this.loading.set(false);
          this.selected.set(new Set());
        },
        error: () => this.loading.set(false),
      });
  }

  protected goToPage(page: number): void {
    this.load(page);
  }

  protected toggleSelect(id: number): void {
    this.selected.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected toggleSelectAll(): void {
    const all = this.products().map((p) => p.id);
    this.selected.set(this.selected().size === all.length ? new Set() : new Set(all));
  }

  protected toggleStatus(product: ProductDetail): void {
    this.productService.updateStatus(product.id, !product.active).subscribe(() => {
      this.toast.success(`${product.name} is now ${!product.active ? 'active' : 'inactive'}.`);
      this.load(this.page());
    });
  }

  protected bulkSetStatus(active: boolean): void {
    const ids = Array.from(this.selected());
    if (ids.length === 0) return;
    this.productService.bulkUpdateStatus(ids, active).subscribe(() => {
      this.toast.success(`Updated ${ids.length} product(s).`);
      this.load(this.page());
    });
  }

  protected async remove(product: ProductDetail): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete product',
      message: `Permanently delete "${product.name}"? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    this.productService.delete(product.id).subscribe(() => {
      this.toast.success('Product deleted.');
      this.load(this.page());
    });
  }
}
