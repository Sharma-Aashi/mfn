import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '../../core/models/cart.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { QuantityStepperComponent } from '../../shared/components/quantity-stepper/quantity-stepper.component';

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 79;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, QuantityStepperComponent, EmptyStateComponent],
  templateUrl: './cart.page.html',
})
export class CartPage {
  protected readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly shipping = computed(() =>
    this.cartService.cart().subtotal >= FREE_SHIPPING_THRESHOLD || this.cartService.cart().subtotal === 0
      ? 0
      : STANDARD_SHIPPING,
  );
  protected readonly grandTotal = computed(() => this.cartService.cart().subtotal + this.shipping());
  protected readonly amountToFreeShipping = computed(() =>
    Math.max(0, FREE_SHIPPING_THRESHOLD - this.cartService.cart().subtotal),
  );

  constructor() {
    inject(SeoService).update('Shopping Cart');
    this.cartService.refresh();
  }

  protected updateQty(item: CartItem, qty: number): void {
    this.cartService.updateItem(item.productId, qty).subscribe();
  }

  protected remove(item: CartItem): void {
    this.cartService.removeItem(item.productId).subscribe(() => this.toast.info(`${item.productName} removed from cart.`));
  }

  protected moveToWishlist(item: CartItem): void {
    if (!this.authService.isAuthenticated()) {
      this.toast.info('Sign in to save items to your wishlist.');
      return;
    }
    this.wishlistService.add(item.productId).subscribe(() => {
      this.cartService.removeItem(item.productId).subscribe(() => this.toast.success(`${item.productName} moved to wishlist.`));
    });
  }

  protected checkout(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/account/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
