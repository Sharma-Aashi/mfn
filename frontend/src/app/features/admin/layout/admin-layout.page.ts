import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';
import { IconComponent, IconName } from '../../../shared/components/icon/icon.component';

interface AdminNavItem {
  label: string;
  path: string;
  icon: IconName;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, BrandLogoComponent, IconComponent],
  template: `
    <div class="flex min-h-screen bg-beige-50">
      <!-- Desktop sidebar -->
      <aside class="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-charcoal-100 bg-forest-950 lg:flex">
        <div class="px-6 py-6">
          <app-brand-logo [size]="26" variant="light" nameSize="text-lg" />
          <p class="mt-1 pl-0.5 text-[11px] uppercase tracking-wider text-beige-300/70">Admin Panel</p>
        </div>
        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-forest-700 text-white"
              class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-beige-100/80 transition hover:bg-white/5"
            >
              <app-icon [name]="item.icon" [size]="17" />
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="space-y-1 border-t border-white/10 p-3">
          <p class="truncate px-3.5 pb-1 text-xs text-beige-200/60">{{ authService.currentUser()?.email }}</p>
          <a
            routerLink="/admin/account"
            routerLinkActive="bg-forest-700 text-white"
            class="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-beige-100/80 hover:bg-white/5"
          >
            <app-icon name="key" [size]="16" /> Change Password
          </a>
          <button type="button" (click)="logout()" class="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-beige-100/80 hover:bg-white/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Logout
          </button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <!-- Mobile top bar -->
        <header class="flex items-center justify-between border-b border-charcoal-100 bg-white px-4 py-3 lg:hidden">
          <app-brand-logo [size]="22" nameSize="text-base" />
          <button type="button" (click)="mobileNavOpen.set(true)" class="icon-btn" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </header>

        <div class="flex-1 p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </div>
      </div>
    </div>

    @if (mobileNavOpen()) {
      <div class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-charcoal-900/50" (click)="mobileNavOpen.set(false)"></div>
        <div class="absolute left-0 top-0 flex h-full w-72 flex-col bg-forest-950">
          <div class="flex items-center justify-between px-5 py-4">
            <app-brand-logo [size]="22" variant="light" nameSize="text-base" />
            <button type="button" (click)="mobileNavOpen.set(false)" class="text-white" aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-2">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                (click)="mobileNavOpen.set(false)"
                routerLinkActive="bg-forest-700 text-white"
                class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-beige-100/80"
              >
                <app-icon [name]="item.icon" [size]="17" />
                {{ item.label }}
              </a>
            }
            <a
              routerLink="/admin/account"
              (click)="mobileNavOpen.set(false)"
              routerLinkActive="bg-forest-700 text-white"
              class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-beige-100/80"
            >
              <app-icon name="key" [size]="17" /> Change Password
            </a>
          </nav>
          <div class="border-t border-white/10 p-4">
            <button type="button" (click)="logout()" class="text-sm font-medium text-beige-100/80">Logout</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .icon-btn {
        display: inline-flex;
        height: 2.25rem;
        width: 2.25rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        color: var(--color-charcoal-600);
      }
      .icon-btn:hover {
        background-color: var(--color-beige-100);
      }
    `,
  ],
})
export class AdminLayoutPage {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  protected readonly mobileNavOpen = signal(false);

  protected readonly navItems: AdminNavItem[] = [
    { label: 'Products', path: '/admin/products', icon: 'box' },
    { label: 'Categories', path: '/admin/categories', icon: 'grid' },
    { label: 'Inventory', path: '/admin/inventory', icon: 'stack' },
    { label: 'Reviews', path: '/admin/reviews', icon: 'star' },
    { label: 'FAQs', path: '/admin/faqs', icon: 'help' },
    { label: 'Website Content', path: '/admin/content', icon: 'layout' },
    { label: 'Messages', path: '/admin/messages', icon: 'mail' },
    { label: 'Site Settings', path: '/admin/settings', icon: 'settings' },
  ];

  protected logout(): void {
    this.authService.logout();
    this.wishlistService.clearLocal();
    this.cartService.refresh();
    this.router.navigate(['/admin/login']);
  }
}
