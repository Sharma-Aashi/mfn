import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductSummary } from '../../../core/models/product.model';
import { QuickViewService } from '../../../core/services/quick-view.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MediaUrlPipe, RouterLink, CurrencyPipe, StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-ivory shadow-soft ring-1 ring-charcoal-100/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div class="relative aspect-square overflow-hidden bg-beige-100">
        <a [routerLink]="['/products', product().slug]" class="block h-full w-full">
          @if (product().primaryImageUrl) {
            <img
              [src]="product().primaryImageUrl | mediaUrl"
              [alt]="product().name"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          } @else {
            <div class="flex h-full w-full items-center justify-center text-charcoal-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 2h6l1 3h3a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a1 1 0 011-1h3l1-3z" />
              </svg>
            </div>
          }
        </a>

        <div class="absolute left-3 top-3 flex flex-col gap-1.5">
          @if (product().bestSeller) {
            <span class="rounded-full bg-forest-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Bestseller</span>
          }
          @if (product().newArrival) {
            <span class="rounded-full bg-beige-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal-900">New</span>
          }
          @if (discountPercent() > 0) {
            <span class="rounded-full bg-charcoal-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              {{ discountPercent() }}% off
            </span>
          }
        </div>

        <button
          type="button"
          (click)="onToggleWishlist($event)"
          class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal-600 shadow-soft backdrop-blur transition hover:bg-white hover:text-forest-600"
          [attr.aria-label]="'Add ' + product().name + ' to wishlist'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="inWishlist() ? '#3d6941' : 'none'" stroke="currentColor" stroke-width="1.8">
            <path d="M12 21s-7.5-4.7-10-9.3C0.4 8.4 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.6 8.4 18 11.7 15.5 16.3 12 21 12 21z" />
          </svg>
        </button>

        <button
          type="button"
          (click)="onQuickView($event)"
          class="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-white/95 py-2 text-sm font-semibold text-charcoal-800 opacity-0 shadow-soft backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick View
        </button>

        @if (!product().inStock) {
          <div class="absolute inset-0 flex items-center justify-center bg-charcoal-900/40">
            <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-charcoal-800">Out of Stock</span>
          </div>
        }
      </div>

      <div class="flex flex-1 flex-col gap-2 p-4">
        @if (product().brand; as brand) {
          <a
            [routerLink]="['/brands', brand.slug]"
            class="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 hover:text-forest-700"
          >
            {{ brand.name }}
          </a>
        }

        <a [routerLink]="['/products', product().slug]" class="font-display text-base font-semibold leading-snug text-charcoal-900 hover:text-forest-700">
          {{ product().name }}
        </a>

        @if (product().multipleVariants) {
          <span class="w-fit rounded-full bg-beige-100 px-2 py-0.5 text-[11px] font-medium text-charcoal-600">
            {{ product().variantCount }} options
          </span>
        }

        <app-star-rating [rating]="product().avgRating" [size]="14" [showValue]="true" />

        <div class="mt-auto flex items-center justify-between gap-2 pt-2">
          <div class="flex items-baseline gap-2">
            @if (product().multipleVariants) {
              <span class="text-xs text-charcoal-500">from</span>
            }
            <span class="font-display text-lg font-semibold text-forest-800">
              {{ displayPrice() | currency: 'INR' : 'symbol' : '1.0-0' }}
            </span>
            @if (!product().multipleVariants && product().salePrice) {
              <span class="text-sm text-charcoal-400 line-through">{{ product().price | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
            }
          </div>

          @if (product().multipleVariants) {
            <!-- Flavour and size have to be chosen before anything can go in the cart. -->
            <a
              [routerLink]="['/products', product().slug]"
              class="rounded-full bg-forest-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-forest-800"
            >
              Choose
            </a>
          } @else {
            <button
              type="button"
              (click)="onAddToCart($event)"
              [disabled]="!canQuickAdd() || adding()"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-forest-700 text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:bg-charcoal-200"
              [attr.aria-label]="'Add ' + product().name + ' to cart'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
            </button>
          }
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly quickViewService = inject(QuickViewService);

  product = input.required<ProductSummary>();

  /** Multi-variant cards quote the cheapest option instead of a base price. */
  protected readonly displayPrice = computed(() =>
    this.product().multipleVariants ? this.product().fromPrice : this.product().effectivePrice,
  );

  protected readonly canQuickAdd = computed(
    () => this.product().inStock && this.product().defaultVariantId !== null,
  );

  protected adding = () => this._adding;
  private _adding = false;

  protected onQuickView(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickViewService.open(this.product());
  }

  protected inWishlist(): boolean {
    return this.wishlistService.productIds().has(this.product().id);
  }

  /**
   * Only meaningful for a single-variant product: with several variants the
   * product's own sale price says nothing about what each option costs.
   */
  protected discountPercent(): number {
    const p = this.product();
    if (p.multipleVariants || !p.salePrice) return 0;
    return Math.round(((p.price - p.salePrice) / p.price) * 100);
  }

  protected onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const variantId = this.product().defaultVariantId;
    if (variantId === null) {
      return;
    }
    this._adding = true;
    this.cartService.addItem(variantId, 1, this.product().id).subscribe({
      next: () => {
        this._adding = false;
        this.toast.success(`${this.product().name} added to cart.`);
      },
      error: () => (this._adding = false),
    });
  }

  protected onToggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) {
      this.toast.info('Sign in to save items to your wishlist.');
      return;
    }
    this.wishlistService.toggle(this.product().id).subscribe();
  }
}
