import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';

interface AccountNavItem {
  label: string;
  path: string;
  icon: IconName;
}

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
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
                <app-icon [name]="item.icon" />
                {{ item.label }}
              </a>
            }
            <button
              type="button"
              (click)="logout()"
              class="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
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
    { label: 'My Orders', path: '/account/orders', icon: 'orders' },
    { label: 'Wishlist', path: '/account/wishlist', icon: 'heart' },
    { label: 'Addresses', path: '/account/addresses', icon: 'pin' },
    { label: 'Profile', path: '/account/profile', icon: 'user' },
  ];

  protected logout(): void {
    this.authService.logout();
    this.wishlistService.clearLocal();
    this.cartService.refresh();
    this.router.navigate(['/']);
  }
}
