import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { QuickViewService } from '../../../core/services/quick-view.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { QuantityStepperComponent } from '../quantity-stepper/quantity-stepper.component';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [MediaUrlPipe, RouterLink, CurrencyPipe, StarRatingComponent, QuantityStepperComponent],
  template: `
    @if (quickViewService.product(); as product) {
      <div class="fixed inset-0 z-[105] flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="absolute inset-0 bg-charcoal-900/50" (click)="close()"></div>
        <div class="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-lift sm:flex-row sm:rounded-2xl">
          <button type="button" (click)="close()" class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal-600 shadow-soft" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>

          <div class="aspect-square bg-beige-100 sm:w-2/5">
            @if (product.primaryImageUrl) {
              <img [src]="product.primaryImageUrl | mediaUrl" [alt]="product.name" class="h-full w-full object-cover" />
            }
          </div>

          <div class="flex flex-1 flex-col gap-3 p-6">
            <h2 class="font-display text-xl font-semibold text-charcoal-900">{{ product.name }}</h2>
            <app-star-rating [rating]="product.avgRating" [showValue]="true" />
            @if (product.shortDescription) {
              <p class="text-sm leading-relaxed text-charcoal-500">{{ product.shortDescription }}</p>
            }

            <div class="flex items-baseline gap-2">
              <span class="font-display text-2xl font-semibold text-forest-800">{{ product.effectivePrice | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
              @if (product.salePrice) {
                <span class="text-base text-charcoal-400 line-through">{{ product.price | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
              }
            </div>

            @if (product.inStock) {
              <div class="mt-2 flex items-center gap-3">
                <app-quantity-stepper [value]="qty()" (valueChange)="qty.set($event)" />
                <button
                  type="button"
                  (click)="addToCart(product.id, product.name)"
                  class="flex-1 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-800"
                >
                  Add to Cart
                </button>
              </div>
            } @else {
              <p class="mt-2 text-sm font-semibold text-red-600">Currently out of stock</p>
            }

            <div class="mt-1 flex items-center gap-4 text-sm">
              <a [routerLink]="['/products', product.slug]" (click)="close()" class="font-semibold text-forest-700 hover:underline">
                View full details →
              </a>
              <button type="button" (click)="toggleWishlist(product.id)" class="font-semibold text-charcoal-500 hover:text-forest-700">
                Save to wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class QuickViewModalComponent {
  protected readonly quickViewService = inject(QuickViewService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected qty = signal(1);

  protected close(): void {
    this.quickViewService.close();
    this.qty.set(1);
  }

  protected addToCart(productId: number, name: string): void {
    this.cartService.addItem(productId, this.qty()).subscribe(() => {
      this.toast.success(`${name} added to cart.`);
      this.close();
    });
  }

  protected toggleWishlist(productId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.toast.info('Sign in to save items to your wishlist.');
      return;
    }
    this.wishlistService.toggle(productId).subscribe(() => this.toast.success('Wishlist updated.'));
  }
}
