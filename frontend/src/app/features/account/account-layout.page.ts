import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

interface AccountNavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container-vitalora py-8 sm:py-12">
      <div class="flex flex-col gap-8 lg:flex-row">
        <aside class="lg:w-64 lg:shrink-0">
          <div class="mb-4 rounded-2xl border border-charcoal-100 bg-white p-5">
            <p class="text-xs text-charcoal-400">Signed in as</p>
            <p class="truncate font-display text-base font-semibold text-charcoal-900">{{ authService.currentUser()?.fullName }}</p>
            <p class="truncate text-xs text-charcoal-500">{{ authService.currentUser()?.email }}</p>
          </div>
          <nav class="scrollbar-none flex gap-1.5 overflow-x-auto rounded-2xl border border-charcoal-100 bg-white p-2 lg:flex-col lg:overflow-visible">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-forest-700 text-white"
                class="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-charcoal-600 transition hover:bg-beige-100"
              >
                <span [innerHTML]="item.icon"></span>
                {{ item.label }}
              </a>
            }
            <button
              type="button"
              (click)="logout()"
              class="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Logout
            </button>
          </nav>
        </aside>

        <div class="flex-1">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AccountLayoutPage {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  protected readonly navItems: AccountNavItem[] = [
    { label: 'My Orders', path: '/account/orders', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h2l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>' },
    { label: 'Wishlist', path: '/account/wishlist', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.7-10-9.3C0.4 8.4 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.6 8.4 18 11.7 15.5 16.3 12 21 12 21z"/></svg>' },
    { label: 'Addresses', path: '/account/addresses', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
    { label: 'Profile', path: '/account/profile', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>' },
  ];

  protected logout(): void {
    this.authService.logout();
    this.wishlistService.clearLocal();
    this.cartService.refresh();
    this.router.navigate(['/']);
  }
}
