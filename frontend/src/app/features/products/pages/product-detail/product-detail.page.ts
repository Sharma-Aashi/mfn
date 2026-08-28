import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductDetail } from '../../../../core/models/product.model';
import { Review, ReviewSummary } from '../../../../core/models/review.model';
import { ProductSummary } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { ProductService } from '../../../../core/services/product.service';
import { ReviewService } from '../../../../core/services/review.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { QuantityStepperComponent } from '../../../../shared/components/quantity-stepper/quantity-stepper.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

type TabKey = 'description' | 'benefits' | 'ingredients' | 'nutrition' | 'usage' | 'warnings' | 'shipping';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, StarRatingComponent, QuantityStepperComponent, ProductCardComponent],
  templateUrl: './product-detail.page.html',
})
export class ProductDetailPage {
  private readonly productService = inject(ProductService);
  private readonly reviewService = inject(ReviewService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly product = signal<ProductDetail | null>(null);
  protected readonly notFound = signal(false);
  protected readonly activeImage = signal(0);
  protected readonly qty = signal(1);
  protected readonly activeTab = signal<TabKey>('description');
  protected readonly related = signal<ProductSummary[]>([]);

  protected readonly reviews = signal<Review[]>([]);
  protected readonly reviewSummary = signal<ReviewSummary | null>(null);
  protected readonly reviewsPage = signal(0);
  protected readonly reviewsTotalPages = signal(0);

  protected readonly showReviewForm = signal(false);
  protected reviewRating = 5;
  protected reviewTitle = '';
  protected reviewComment = '';
  protected readonly submittingReview = signal(false);

  protected readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'benefits', label: 'Benefits' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'usage', label: 'How to Use' },
    { key: 'warnings', label: 'Warnings' },
    { key: 'shipping', label: 'Shipping & Returns' },
  ];

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) this.load(slug);
    });
  }

  private load(slug: string): void {
    this.notFound.set(false);
    this.activeImage.set(0);
    this.qty.set(1);
    this.showReviewForm.set(false);

    this.productService.getBySlug(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.seo.update(p.name, p.shortDescription ?? undefined);
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.shortDescription ?? p.description ?? undefined,
          sku: p.sku,
          image: p.images.map((i) => i.imageUrl),
          aggregateRating: p.reviewCount > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: p.avgRating,
            reviewCount: p.reviewCount,
          } : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: p.currency,
            price: p.effectivePrice,
            availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        });
        this.loadReviews(p.id);
        this.productService.getRelated(slug).subscribe((r) => this.related.set(r));
      },
      error: () => this.notFound.set(true),
    });
  }

  private loadReviews(productId: number, page = 0): void {
    this.reviewService.getSummary(productId).subscribe((s) => this.reviewSummary.set(s));
    this.reviewService.getForProduct(productId, page, 5).subscribe((res) => {
      this.reviews.set(res.content);
      this.reviewsPage.set(res.page);
      this.reviewsTotalPages.set(res.totalPages);
    });
  }

  protected reviewPageNumbers(): number[] {
    return Array.from({ length: this.reviewsTotalPages() }, (_, i) => i);
  }

  protected changeReviewPage(page: number): void {
    const p = this.product();
    if (p) this.loadReviews(p.id, page);
  }

  protected addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addItem(p.id, this.qty()).subscribe(() => this.toast.success(`${p.name} added to cart.`));
  }

  protected buyNow(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addItem(p.id, this.qty()).subscribe(() => this.router.navigate(['/checkout']));
  }

  protected toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    if (!this.authService.isAuthenticated()) {
      this.toast.info('Sign in to save items to your wishlist.');
      return;
    }
    this.wishlistService.toggle(p.id).subscribe(() => this.toast.success('Wishlist updated.'));
  }

  protected inWishlist(): boolean {
    const p = this.product();
    return p ? this.wishlistService.productIds().has(p.id) : false;
  }

  protected scrollToReviews(): void {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected submitReview(): void {
    const p = this.product();
    if (!p) return;
    this.submittingReview.set(true);
    this.reviewService
      .submit(p.id, { rating: this.reviewRating, title: this.reviewTitle || undefined, comment: this.reviewComment || undefined })
      .subscribe({
        next: () => {
          this.submittingReview.set(false);
          this.showReviewForm.set(false);
          this.reviewTitle = '';
          this.reviewComment = '';
          this.reviewRating = 5;
          this.toast.success('Thanks! Your review has been submitted and is awaiting approval.');
        },
        error: () => this.submittingReview.set(false),
      });
  }
}
