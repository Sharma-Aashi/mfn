import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductSummary } from '../../../core/models/product.model';
import { QuickViewService } from '../../../core/services/quick-view.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MediaUrlPipe, RouterLink, CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card-lift group relative flex h-full flex-col overflow-hidden rounded-[10px] border border-charcoal-100 bg-white">
      <!--
        White, not a tint. The packs are photographed on white, so any fill
        here draws a second rectangle around the product. object-contain, not
        cover: a tub cropped to a square loses its lid.
      -->
      <div class="relative flex aspect-square items-center justify-center overflow-hidden border-b border-charcoal-50 bg-white p-4">
        <a [routerLink]="['/products', product().slug]" class="flex h-full w-full items-center justify-center">
          @if (product().primaryImageUrl) {
            <img
              [src]="product().primaryImageUrl | mediaUrl"
              [alt]="product().name"
              loading="lazy"
              class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            />
          } @else {
            <div class="flex flex-col items-center gap-2 text-charcoal-300">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-6 6" />
              </svg>
              <span class="text-[11px]">Photo needed</span>
            </div>
          }
        </a>

        <div class="absolute left-3 top-3 flex flex-col gap-1.5">
          @if (discountPercent() > 0) {
            <span class="rounded-[3px] bg-deal px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-deal-ink">
              {{ discountPercent() }}% off
            </span>
          }
          @if (product().bestSeller) {
            <span class="rounded-[3px] bg-charcoal-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Bestseller</span>
          }
          @if (product().newArrival) {
            <span class="rounded-[3px] bg-beige-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-800">New</span>
          }
        </div>

        <button
          type="button"
          (click)="onToggleWishlist($event)"
          class="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-charcoal-100 bg-white text-charcoal-500 transition hover:border-charcoal-300 hover:text-forest-700"
          [attr.aria-label]="(inWishlist() ? 'Remove ' : 'Add ') + product().name + ' to wishlist'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" [attr.fill]="inWishlist() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8">
            <path d="M12 21s-7.5-4.7-10-9.3C0.4 8.4 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.6 8.4 18 11.7 15.5 16.3 12 21 12 21z" />
          </svg>
        </button>

        <button
          type="button"
          (click)="onQuickView($event)"
          class="absolute inset-x-3 bottom-3 translate-y-2 rounded-[3px] bg-white/95 py-2 text-xs font-semibold text-charcoal-800 opacity-0 shadow-soft backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick view
        </button>

        @if (!product().inStock) {
          <div class="absolute inset-0 flex items-center justify-center bg-white/70">
            <span class="rounded-[3px] bg-charcoal-900 px-3 py-1 text-xs font-semibold text-white">Out of stock</span>
          </div>
        }
      </div>

      <div class="flex flex-1 flex-col gap-1.5 p-4">
        @if (product().brand; as brand) {
          <a
            [routerLink]="['/brands', brand.slug]"
            class="text-[10.5px] font-bold uppercase tracking-[0.13em] text-charcoal-400 hover:text-forest-700"
          >
            {{ brand.name }}
          </a>
        }

        <a
          [routerLink]="['/products', product().slug]"
          class="line-clamp-2 min-h-[2.4rem] text-[14.5px] font-semibold leading-snug text-charcoal-900 hover:text-forest-700"
        >
          {{ product().name }}
        </a>

        <!--
          A rating chip only claims a number when there is one. A product with
          no reviews says so rather than showing an empty row of stars.
        -->
        <div class="flex items-center gap-2">
          @if (product().reviewCount > 0) {
            <span class="rating-chip inline-flex">
              {{ product().avgRating | number: '1.1-1' }}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3 6.5 7 .9-5 4.8 1.2 7L12 17.8 5.8 21.2 7 14.2 2 9.4l7-.9z" />
              </svg>
            </span>
            <span class="text-[11.5px] text-charcoal-400">
              {{ product().reviewCount }} {{ product().reviewCount === 1 ? 'rating' : 'ratings' }}
            </span>
          } @else {
            <span class="rating-chip rating-chip--none inline-flex">New</span>
            <span class="text-[11.5px] text-charcoal-400">no reviews yet</span>
          }
        </div>

        <div class="mt-1 flex items-baseline gap-2">
          @if (product().multipleVariants) {
            <span class="text-[11.5px] text-charcoal-400">from</span>
          }
          <span class="font-display text-[19px] font-extrabold text-charcoal-900">
            {{ displayPrice() | currency: 'INR' : 'symbol' : '1.0-0' }}
          </span>
          @if (!product().multipleVariants && product().salePrice) {
            <span class="text-[12.5px] text-charcoal-400 line-through">
              {{ product().price | currency: 'INR' : 'symbol' : '1.0-0' }}
            </span>
          }
        </div>

        <!-- Stacked, not side by side: at four across there is no room for two
             buttons on one line without the labels wrapping. -->
        <div class="mt-auto flex flex-col gap-2 pt-3">
          @if (product().multipleVariants) {
            <a [routerLink]="['/products', product().slug]" class="btn-primary inline-flex w-full">
              Choose options
            </a>
            <button type="button" (click)="onQuickView($event)" class="btn-secondary inline-flex w-full">
              Quick view
            </button>
          } @else {
            <button
              type="button"
              (click)="onAddToCart($event)"
              [disabled]="!canQuickAdd() || busy()"
              class="btn-primary inline-flex w-full"
            >
              {{ busy() ? 'Adding…' : 'Add to cart' }}
            </button>
            <button
              type="button"
              (click)="onBuyNow($event)"
              [disabled]="!canQuickAdd() || busy()"
              class="btn-secondary inline-flex w-full"
            >
              Buy now
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
  private readonly router = inject(Router);

  product = input.required<ProductSummary>();

  /** Multi-variant cards quote the cheapest option instead of a base price. */
  protected readonly displayPrice = computed(() =>
    this.product().multipleVariants ? this.product().fromPrice : this.product().effectivePrice,
  );

  protected readonly canQuickAdd = computed(
    () => this.product().inStock && this.product().defaultVariantId !== null,
  );

  protected readonly busy = signal(false);

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
    if (p.multipleVariants || !p.salePrice || p.price <= 0) return 0;
    return Math.round(((p.price - p.salePrice) / p.price) * 100);
  }

  protected onAddToCart(event: Event): void {
    this.addThen(event, () => this.toast.success(`${this.product().name} added to cart.`));
  }

  /** The same add, then straight to checkout instead of staying on the page. */
  protected onBuyNow(event: Event): void {
    this.addThen(event, () => void this.router.navigate(['/checkout']));
  }

  private addThen(event: Event, done: () => void): void {
    event.preventDefault();
    event.stopPropagation();
    const variantId = this.product().defaultVariantId;
    if (variantId === null || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.cartService.addItem(variantId, 1, this.product().id).subscribe({
      next: () => {
        this.busy.set(false);
        done();
      },
      error: () => this.busy.set(false),
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
