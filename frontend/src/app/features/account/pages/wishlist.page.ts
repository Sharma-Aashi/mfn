import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistItem } from '../../../core/models/wishlist.model';
import { CartService } from '../../../core/services/cart.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [MediaUrlPipe, RouterLink, CurrencyPipe, EmptyStateComponent],
  templateUrl: './wishlist.page.html',
})
export class WishlistPage {
  protected readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly toast = inject(ToastService);

  constructor() {
    inject(SeoService).update('My Wishlist');
    this.wishlistService.refresh();
  }

  protected remove(item: WishlistItem): void {
    this.wishlistService.remove(item.productId).subscribe();
  }

  protected addToCart(item: WishlistItem): void {
    this.cartService.addItem(item.productId, 1).subscribe(() => this.toast.success(`${item.productName} added to cart.`));
  }
}
