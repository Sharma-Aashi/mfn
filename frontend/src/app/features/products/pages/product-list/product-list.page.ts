import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { ProductFacets, ProductSummary } from '../../../../core/models/product.model';
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
  protected readonly facets = signal<ProductFacets | null>(null);

  /**
   * The category list as a two-level tree. The API hands back a flat list, and
   * rendering it flat would put forty-odd sibling rows in the sidebar.
   */
  protected readonly categoryTree = computed(() => {
    const all = this.categories();
    return all
      .filter((c) => c.parentId === null)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((parent) => ({
        parent,
        kids: all.filter((k) => k.parentId === parent.id).sort((a, b) => a.displayOrder - b.displayOrder),
      }));
  });

  protected q = '';
  protected category = '';
  protected brands: string[] = [];
  protected flavours: string[] = [];
  protected sizes: string[] = [];
  protected inStockOnly = false;
  protected minPrice: number | null = null;
  protected maxPrice: number | null = null;
  protected minRating: number | null = null;
  protected sort = 'popular';
  protected page = 0;

  constructor() {
    this.seo.update('Shop All Supplements', 'Browse our full range of premium, science-backed health and wellness supplements.');
    this.categoryService.getAllActive().subscribe((c) => this.categories.set(c));
    this.productService.getFacets().subscribe((f) => this.facets.set(f));

    this.route.queryParamMap.subscribe((params) => {
      this.q = params.get('q') ?? '';
      this.category = params.get('category') ?? '';
      this.brands = params.getAll('brands');
      this.flavours = params.getAll('flavours');
      this.sizes = params.getAll('sizes');
      this.inStockOnly = params.get('inStockOnly') === 'true';
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
        brands: this.brands.length ? this.brands : undefined,
        flavours: this.flavours.length ? this.flavours : undefined,
        sizes: this.sizes.length ? this.sizes : undefined,
        inStockOnly: this.inStockOnly || undefined,
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

  /** Facet pills are multi-select: clicking a chosen one removes it. */
  protected toggleBrand(slug: string): void {
    this.brands = this.brands.includes(slug) ? this.brands.filter((b) => b !== slug) : [...this.brands, slug];
    this.page = 0;
    this.syncUrl();
  }

  protected toggleFlavour(flavour: string): void {
    this.flavours = this.flavours.includes(flavour)
      ? this.flavours.filter((f) => f !== flavour)
      : [...this.flavours, flavour];
    this.page = 0;
    this.syncUrl();
  }

  protected toggleSize(size: string): void {
    this.sizes = this.sizes.includes(size) ? this.sizes.filter((s) => s !== size) : [...this.sizes, size];
    this.page = 0;
    this.syncUrl();
  }

  protected toggleInStockOnly(): void {
    this.inStockOnly = !this.inStockOnly;
    this.page = 0;
    this.syncUrl();
  }

  protected isBrandSelected(slug: string): boolean {
    return this.brands.includes(slug);
  }

  protected isFlavourSelected(flavour: string): boolean {
    return this.flavours.includes(flavour);
  }

  protected isSizeSelected(size: string): boolean {
    return this.sizes.includes(size);
  }

  /**
   * The filters currently in force, as removable chips. Without these a shopper
   * who scrolled past the sidebar cannot tell why the results are so thin.
   */
  protected activeChips(): { label: string; clear: () => void }[] {
    const chips: { label: string; clear: () => void }[] = [];
    if (this.q) {
      const term = this.q;
      chips.push({ label: `"${term}"`, clear: () => { this.q = ''; this.page = 0; this.syncUrl(); } });
    }
    if (this.category) {
      const slug = this.category;
      const name = this.categories().find((c) => c.slug === slug)?.name ?? slug;
      chips.push({ label: name, clear: () => this.setCategory(slug) });
    }
    for (const slug of this.brands) {
      const name = this.facets()?.brands.find((b) => b.slug === slug)?.name ?? slug;
      chips.push({ label: name, clear: () => this.toggleBrand(slug) });
    }
    for (const f of this.flavours) {
      chips.push({ label: f, clear: () => this.toggleFlavour(f) });
    }
    for (const size of this.sizes) {
      chips.push({ label: size, clear: () => this.toggleSize(size) });
    }
    if (this.inStockOnly) {
      chips.push({ label: 'In stock', clear: () => this.toggleInStockOnly() });
    }
    const rating = this.minRating;
    if (rating) {
      chips.push({ label: `${rating} stars & up`, clear: () => this.setMinRating(rating) });
    }
    if (this.minPrice !== null || this.maxPrice !== null) {
      const lo = this.minPrice !== null ? String(this.minPrice) : '0';
      const hi = this.maxPrice !== null ? String(this.maxPrice) : 'any';
      chips.push({
        label: `Rs ${lo} - ${hi}`,
        clear: () => { this.minPrice = null; this.maxPrice = null; this.page = 0; this.syncUrl(); },
      });
    }
    return chips;
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
    this.brands = [];
    this.flavours = [];
    this.sizes = [];
    this.inStockOnly = false;
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
    return !!(
      this.category ||
      this.minPrice ||
      this.maxPrice ||
      this.minRating ||
      this.q ||
      this.inStockOnly ||
      this.brands.length ||
      this.flavours.length ||
      this.sizes.length
    );
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.q || null,
        category: this.category || null,
        brands: this.brands.length ? this.brands : null,
        flavours: this.flavours.length ? this.flavours : null,
        sizes: this.sizes.length ? this.sizes : null,
        inStockOnly: this.inStockOnly ? 'true' : null,
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
