import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Category } from '../../core/models/category.model';
import { ProductSummary } from '../../core/models/product.model';
import { Banner, HomeContent } from '../../core/models/cms.model';
import { CategoryService } from '../../core/services/category.service';
import { CmsService } from '../../core/services/cms.service';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';

interface Testimonial {
  customerName: string;
  rating: number;
  comment: string | null;
  productName: string;
}

const USP_ICONS: Record<string, string> = {
  'shield-check': 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z M9 12l2 2 4-4',
  leaf: 'M20 4C10 4 4 10 4 18c0 1 1 2 2 2 8 0 14-6 14-16zM6 20L18 6',
  flask: 'M9 2h6M10 2v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V2',
  ban: 'M12 2a10 10 0 100 20 10 10 0 000-20zM5 5l14 14',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent, StarRatingComponent],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cmsService = inject(CmsService);
  private readonly reviewService = inject(ReviewService);
  private readonly toast = inject(ToastService);
  private readonly seo = inject(SeoService);

  protected readonly content = signal<HomeContent | null>(null);
  protected readonly categories = signal<Category[]>([]);
  protected readonly featured = signal<ProductSummary[]>([]);
  protected readonly bestSellers = signal<ProductSummary[]>([]);
  protected readonly banners = signal<Banner[]>([]);
  protected readonly testimonials = signal<Testimonial[]>([]);
  protected readonly newsletterEmail = signal('');
  protected readonly loading = signal(true);

  constructor() {
    this.seo.update(
      'Better Health. Better Every Day.',
      'Premium, thoughtfully formulated supplements designed to support your energy, immunity, wellness and active lifestyle.',
    );
    this.load();
  }

  protected uspIconPath(key: string): string {
    return USP_ICONS[key] ?? USP_ICONS['leaf'];
  }

  private load(): void {
    this.cmsService.getHome().subscribe((c) => this.content.set(c));
    this.categoryService.getAllActive().subscribe((c) => this.categories.set(c));
    this.productService.getFeatured().subscribe((p) => this.featured.set(p));
    this.productService.getBestSellers().subscribe((p) => {
      this.bestSellers.set(p);
      this.loading.set(false);
      this.loadTestimonials(p);
    });
    this.cmsService.getActiveBanners().subscribe((b) => this.banners.set(b));
  }

  private loadTestimonials(products: ProductSummary[]): void {
    const sample = products.slice(0, 4);
    if (sample.length === 0) return;
    Promise.all(
      sample.map((p) =>
        new Promise<Testimonial[]>((resolve) => {
          this.reviewService.getForProduct(p.id, 0, 3).subscribe({
            next: (page) =>
              resolve(
                page.content
                  .filter((r) => r.featured)
                  .map((r) => ({ customerName: r.customerName, rating: r.rating, comment: r.comment, productName: p.name })),
              ),
            error: () => resolve([]),
          });
        }),
      ),
    ).then((groups) => this.testimonials.set(groups.flat().slice(0, 6)));
  }

  protected subscribeNewsletter(): void {
    if (!this.newsletterEmail().trim()) return;
    this.toast.success('Thanks for subscribing! Watch your inbox for wellness tips.');
    this.newsletterEmail.set('');
  }
}
