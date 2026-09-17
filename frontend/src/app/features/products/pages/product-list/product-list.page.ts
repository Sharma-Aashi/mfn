import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { ProductSummary } from '../../../../core/models/product.model';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductService } from '../../../../core/services/product.service';
import { SeoService } from '../../../../core/services/seo.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, PaginationComponent, EmptyStateComponent],
  templateUrl: './product-list.page.html',
})
export class ProductListPage {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly searchInput$ = new Subject<string>();

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly categories = signal<Category[]>([]);
  protected readonly products = signal<ProductSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly totalElements = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly mobileFiltersOpen = signal(false);

  protected q = '';
  protected category = '';
  protected minPrice: number | null = null;
  protected maxPrice: number | null = null;
  protected minRating: number | null = null;
  protected sort = 'popular';
  protected page = 0;

  constructor() {
    this.seo.update('Shop All Supplements', 'Browse our full range of premium, science-backed health and wellness supplements.');
    this.categoryService.getAllActive().subscribe((c) => this.categories.set(c));

    this.route.queryParamMap.subscribe((params) => {
      this.q = params.get('q') ?? '';
      this.category = params.get('category') ?? '';
      this.minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : null;
      this.maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : null;
      this.minRating = params.get('minRating') ? Number(params.get('minRating')) : null;
      this.sort = params.get('sort') ?? 'popular';
      this.page = params.get('page') ? Number(params.get('page')) : 0;
      this.fetch();
    });

    this.searchInput$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((q) => {
      this.q = q;
      this.page = 0;
      this.syncUrl();
    });
  }

  protected onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  private fetch(): void {
    this.loading.set(true);
    this.productService
      .search({
        q: this.q || undefined,
        category: this.category || undefined,
        minPrice: this.minPrice ?? undefined,
        maxPrice: this.maxPrice ?? undefined,
        minRating: this.minRating ?? undefined,
        sort: this.sort as never,
        page: this.page,
        size: 12,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.content);
          this.totalElements.set(res.totalElements);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected setCategory(slug: string): void {
    this.category = this.category === slug ? '' : slug;
    this.page = 0;
    this.syncUrl();
  }

  protected setSort(sort: string): void {
    this.sort = sort;
    this.syncUrl();
  }

  protected applyPriceFilter(): void {
    this.page = 0;
    this.syncUrl();
  }

  protected setMinRating(rating: number): void {
    this.minRating = this.minRating === rating ? null : rating;
    this.page = 0;
    this.syncUrl();
  }

  protected clearFilters(): void {
    this.q = '';
    this.category = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = null;
    this.sort = 'popular';
    this.page = 0;
    this.syncUrl();
  }

  protected goToPage(page: number): void {
    this.page = page;
    this.syncUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected get hasActiveFilters(): boolean {
    return !!(this.category || this.minPrice || this.maxPrice || this.minRating || this.q);
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.q || null,
        category: this.category || null,
        minPrice: this.minPrice || null,
        maxPrice: this.maxPrice || null,
        minRating: this.minRating || null,
        sort: this.sort !== 'popular' ? this.sort : null,
        page: this.page || null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
