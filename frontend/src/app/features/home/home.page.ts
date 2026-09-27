import { Component, computed, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Brand } from '../../core/models/brand.model';
import { Category } from '../../core/models/category.model';
import { ProductSummary } from '../../core/models/product.model';
import { HomeContent } from '../../core/models/cms.model';
import { BrandService } from '../../core/services/brand.service';
import { CategoryService } from '../../core/services/category.service';
import { CmsService } from '../../core/services/cms.service';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

/**
 * Line icons for the Shop by goal row, keyed on the goal category's slug.
 * A goal with no entry falls back to the heart, so adding a category in the
 * admin never leaves a hole in the row.
 */
const GOAL_ICONS: Record<string, string> = {
  'fitness-recovery': 'M8 20v8M14 15v18M40 20v8M34 15v18M14 24h20',
  'weight-management': 'M24 42c8 0 13-5.6 13-12.5C37 20 24 6 24 6S11 20 11 29.5C11 36.4 16 42 24 42z',
  energy: 'M6 25h9l4-11 6 22 5-13 3 6h9',
  immunity: 'M24 4l15 6v11c0 10-6.4 16.4-15 19-8.6-2.6-15-9-15-19V10z',
  'daily-wellness': 'M24 41S8 31 8 19.5A8.5 8.5 0 0124 14a8.5 8.5 0 0116 5.5C40 31 24 41 24 41z',
  'sleep-relaxation': 'M32 6a16 16 0 10 10 26A18 18 0 0132 6z',
  digestion: 'M24 6c-7 0-12 5-12 11 0 9 12 19 12 19s12-10 12-19c0-6-5-11-12-11z',
};

const FALLBACK_GOAL_ICON = 'M24 41S8 31 8 19.5A8.5 8.5 0 0124 14a8.5 8.5 0 0116 5.5C40 31 24 41 24 41z';

/** Shipped with the build, so a redeploy can never wipe them. */
const DEFAULT_HERO = 'assets/brand/banner-barbell.png';
const DEFAULT_MID_BANNER = 'assets/brand/banner-dumbbells.png';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MediaUrlPipe, RouterLink, UpperCasePipe, ProductCardComponent],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly cmsService = inject(CmsService);
  private readonly seo = inject(SeoService);

  protected readonly content = signal<HomeContent | null>(null);
  protected readonly categories = signal<Category[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly featured = signal<ProductSummary[]>([]);
  protected readonly bestSellers = signal<ProductSummary[]>([]);
  protected readonly loading = signal(true);

  /**
   * Top-level product groups only, as buttons. "Shop by Goal" is left out
   * because it is a different axis and gets its own row further down.
   */
  protected readonly topCategories = computed(() =>
    this.categories()
      .filter((c) => c.parentId === null && c.slug !== 'shop-by-goal')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 8),
  );

  /** The children of "Shop by Goal", which is the goal row's whole content. */
  protected readonly goalCategories = computed(() => {
    const all = this.categories();
    const parent = all.find((c) => c.slug === 'shop-by-goal');
    if (!parent) return [];
    return all
      .filter((c) => c.parentId === parent.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 5);
  });

  /** Four to a row, and a short row reads as unfinished rather than curated. */
  protected readonly hotProducts = computed(() => this.featured().slice(0, 4));
  protected readonly topSellers = computed(() => this.bestSellers().slice(0, 4));

  protected readonly heroImage = computed(() => this.content()?.hero?.image?.trim() || DEFAULT_HERO);
  protected readonly midBannerImage = DEFAULT_MID_BANNER;

  constructor() {
    this.seo.update(
      '',
      'Genuine sports nutrition in India. Whey protein, pre-workout, creatine and daily essentials, sourced through authorised channels.',
    );
    this.load();
  }

  protected goalIcon(slug: string): string {
    return GOAL_ICONS[slug] ?? FALLBACK_GOAL_ICON;
  }

  private load(): void {
    this.cmsService.getHome().subscribe((c) => this.content.set(c));
    this.categoryService.getAllActive().subscribe((c) => this.categories.set(c));
    // Featured brands only - the full list has its own page, and a wall of
    // every logo tells a shopper nothing.
    this.brandService.getFeatured().subscribe((b) => this.brands.set(b));
    this.productService.getFeatured().subscribe((p) => this.featured.set(p));
    this.productService.getBestSellers().subscribe({
      next: (p) => {
        this.bestSellers.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
