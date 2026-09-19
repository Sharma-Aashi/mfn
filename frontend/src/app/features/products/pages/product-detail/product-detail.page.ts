import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductDetail, ProductVariant } from '../../../../core/models/product.model';
import { Review, ReviewSummary } from '../../../../core/models/review.model';
import { ProductSummary } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { ProductService } from '../../../../core/services/product.service';
import { ReviewService } from '../../../../core/services/review.service';
import { SeoService } from '../../../../core/services/seo.service';
import { SiteSettingsService } from '../../../../core/services/site-settings.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MediaUrlPipe, resolveMediaUrl } from '../../../../core/pipes/media-url.pipe';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { QuantityStepperComponent } from '../../../../shared/components/quantity-stepper/quantity-stepper.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

type TabKey = 'description' | 'benefits' | 'ingredients' | 'nutrition' | 'usage' | 'warnings' | 'shipping';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, CurrencyPipe, StarRatingComponent, QuantityStepperComponent, ProductCardComponent, MediaUrlPipe],
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
  protected readonly commerce = inject(SiteSettingsService).commerce;

  protected readonly product = signal<ProductDetail | null>(null);
  protected readonly notFound = signal(false);
  protected readonly activeImage = signal(0);
  protected readonly qty = signal(1);
  protected readonly selectedVariantId = signal<number | null>(null);
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

  /** Active variants in display order; the only ones a customer may pick. */
  protected readonly variants = computed<ProductVariant[]>(() =>
    (this.product()?.variants ?? []).filter((v) => v.active),
  );

  protected readonly selectedVariant = computed<ProductVariant | null>(() => {
    const id = this.selectedVariantId();
    const list = this.variants();
    return list.find((v) => v.id === id) ?? list[0] ?? null;
  });

  /** Distinct flavours, in variant order. Empty when the product has no flavour axis. */
  protected readonly flavourOptions = computed<string[]>(() =>
    [...new Set(this.variants().map((v) => v.flavour).filter((f): f is string => !!f))],
  );

  /** Distinct size labels, in variant order. Empty when the product has no size axis. */
  protected readonly sizeOptions = computed<string[]>(() =>
    [...new Set(this.variants().map((v) => v.sizeLabel).filter((s): s is string => !!s))],
  );

  /** True once the product varies on something a customer must choose. */
  protected readonly hasChoices = computed(
    () => this.flavourOptions().length > 1 || this.sizeOptions().length > 1,
  );

  /**
   * A variant can carry its own photo (a flavour tub looks different), so it
   * leads the gallery rather than hiding behind the product shots. Falls back
   * to the product images when the variant has none.
   */
  protected readonly galleryImages = computed<{ url: string; alt: string }[]>(() => {
    const p = this.product();
    if (!p) return [];
    const shots = p.images.map((i) => ({ url: i.imageUrl, alt: i.altText || p.name }));
    const variant = this.selectedVariant();
    if (!variant?.imageUrl) return shots;
    const alt = variant.label ? `${p.name} - ${variant.label}` : p.name;
    return [{ url: variant.imageUrl, alt }, ...shots.filter((s) => s.url !== variant.imageUrl)];
  });

  /**
   * The first few benefit lines, surfaced above the fold. Benefits are stored
   * as one claim per line, which is already the shape a scannable strip needs -
   * a real spec strip (protein per serve, servings) would need structured
   * fields the catalogue does not have.
   */
  protected readonly keyBenefits = computed<string[]>(() =>
    (this.product()?.benefits ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 4),
  );

  protected readonly selectedFlavour = computed(() => this.selectedVariant()?.flavour ?? null);
  protected readonly selectedSize = computed(() => this.selectedVariant()?.sizeLabel ?? null);

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
    this.selectedVariantId.set(null);
    this.showReviewForm.set(false);

    this.productService.getBySlug(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        // Open on the flagged default, falling back to the first active variant.
        const initial = p.variants.find((v) => v.id === p.defaultVariantId && v.active)
          ?? p.variants.find((v) => v.active);
        this.selectedVariantId.set(initial?.id ?? null);
        this.seo.update(p.name, p.shortDescription ?? undefined);
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.shortDescription ?? p.description ?? undefined,
          sku: p.sku,
          image: p.images.map((i) => {
            const url = resolveMediaUrl(i.imageUrl);
            return url.startsWith('http') ? url : window.location.origin + url;
          }),
          aggregateRating: p.reviewCount > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: p.avgRating,
            reviewCount: p.reviewCount,
          } : undefined,
          // Several variants means several prices, so the listing advertises a
          // range rather than pretending there is one price.
          offers: p.variants.filter((v) => v.active).length > 1
            ? {
                '@type': 'AggregateOffer',
                priceCurrency: p.currency,
                lowPrice: p.fromPrice,
                highPrice: Math.max(...p.variants.filter((v) => v.active).map((v) => v.effectivePrice)),
                offerCount: p.variants.filter((v) => v.active).length,
                availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              }
            : {
                '@type': 'Offer',
                priceCurrency: p.currency,
                price: p.fromPrice,
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

  /** Picking a flavour keeps the current size when that pairing exists, else falls to its first. */
  protected selectFlavour(flavour: string): void {
    const size = this.selectedSize();
    const match =
      this.variants().find((v) => v.flavour === flavour && v.sizeLabel === size) ??
      this.variants().find((v) => v.flavour === flavour);
    if (match) this.selectVariant(match.id);
  }

  protected selectSize(sizeLabel: string): void {
    const flavour = this.selectedFlavour();
    const match =
      this.variants().find((v) => v.sizeLabel === sizeLabel && v.flavour === flavour) ??
      this.variants().find((v) => v.sizeLabel === sizeLabel);
    if (match) this.selectVariant(match.id);
  }

  private selectVariant(id: number): void {
    this.selectedVariantId.set(id);
    // Bring whatever photo now leads the gallery into view.
    this.activeImage.set(0);
  }

  /**
   * A combination that no variant covers is unbuyable, so the pill is shown
   * struck through rather than hidden - a missing option reads as a bug.
   */
  protected flavourAvailable(flavour: string): boolean {
    return this.variants().some((v) => v.flavour === flavour && v.inStock);
  }

  protected sizeAvailable(sizeLabel: string): boolean {
    const flavour = this.selectedFlavour();
    const forPair = this.variants().filter((v) => v.sizeLabel === sizeLabel && v.flavour === flavour);
    const candidates = forPair.length > 0 ? forPair : this.variants().filter((v) => v.sizeLabel === sizeLabel);
    return candidates.some((v) => v.inStock);
  }

  protected variantDiscountPercent(): number {
    const v = this.selectedVariant();
    if (!v?.salePrice || v.price <= 0) return 0;
    return Math.round(((v.price - v.salePrice) / v.price) * 100);
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
    const v = this.selectedVariant();
    if (!p || !v) return;
    const name = v.label ? `${p.name} (${v.label})` : p.name;
    this.cartService.addItem(v.id, this.qty(), p.id).subscribe(() => this.toast.success(`${name} added to cart.`));
  }

  protected buyNow(): void {
    const p = this.product();
    const v = this.selectedVariant();
    if (!p || !v) return;
    this.cartService.addItem(v.id, this.qty(), p.id).subscribe(() => this.router.navigate(['/checkout']));
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
