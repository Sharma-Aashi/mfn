import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex min-h-screen bg-beige-50">
      <!-- Desktop sidebar -->
      <aside class="hidden w-64 shrink-0 flex-col border-r border-charcoal-100 bg-forest-950 lg:flex">
        <div class="flex items-center gap-2 px-6 py-6">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#e3d3ab" /><path d="M20 30c-6-2-9-7-9-13 0-2 .3-4 1-6 3 1 6 3 8 6 2-3 5-5 8-6 .7 2 1 4 1 6 0 6-3 11-9 13z" fill="#1f3d24" /></svg>
          <div>
            <p class="font-display text-lg font-semibold text-white leading-none">VITALORA</p>
            <p class="text-[11px] uppercase tracking-wider text-beige-300/70">Admin Panel</p>
          </div>
        </div>
        <nav class="flex-1 space-y-1 px-3 py-4">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-forest-700 text-white"
              class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-beige-100/80 transition hover:bg-white/5"
            >
              <span [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="border-t border-white/10 p-4">
          <p class="truncate text-xs text-beige-200/60">{{ authService.currentUser()?.email }}</p>
          <button type="button" (click)="logout()" class="mt-2 flex items-center gap-2 text-sm font-medium text-beige-100/80 hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Logout
          </button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <!-- Mobile top bar -->
        <header class="flex items-center justify-between border-b border-charcoal-100 bg-white px-4 py-3 lg:hidden">
          <div class="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#1f3d24" /><path d="M20 30c-6-2-9-7-9-13 0-2 .3-4 1-6 3 1 6 3 8 6 2-3 5-5 8-6 .7 2 1 4 1 6 0 6-3 11-9 13z" fill="#e3d3ab" /></svg>
            <span class="font-display text-base font-semibold text-forest-800">Admin</span>
          </div>
          <button type="button" (click)="mobileNavOpen.set(true)" class="icon-btn" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>

    @if (mobileNavOpen()) {
      <div class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-charcoal-900/50" (click)="mobileNavOpen.set(false)"></div>
        <div class="absolute left-0 top-0 flex h-full w-72 flex-col bg-forest-950">
          <div class="flex items-center justify-between px-5 py-4">
            <span class="font-display text-lg font-semibold text-white">Menu</span>
            <button type="button" (click)="mobileNavOpen.set(false)" class="text-white" aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <nav class="flex-1 space-y-1 px-3 py-2">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                (click)="mobileNavOpen.set(false)"
                routerLinkActive="bg-forest-700 text-white"
                class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-beige-100/80"
              >
                <span [innerHTML]="item.icon"></span>
                {{ item.label }}
              </a>
            }
          </nav>
          <div class="border-t border-white/10 p-4">
            <button type="button" (click)="logout()" class="flex items-center gap-2 text-sm font-medium text-beige-100/80">Logout</button>
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
    { label: 'Products', path: '/admin/products', icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2h6l1 3h3a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a1 1 0 011-1h3l1-3z"/></svg>' },
    { label: 'Categories', path: '/admin/categories', icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
    { label: 'Inventory', path: '/admin/inventory', icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>' },
    { label: 'Reviews', path: '/admin/reviews', icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 17.3L5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6 1.6 7.1z"/></svg>' },
    { label: 'FAQs', path: '/admin/faqs', icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4M12 17h.01"/></svg>' },
    { label: 'Website Content', path: '/admin/content', icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/></svg>' },
  ];

  protected logout(): void {
    this.authService.logout();
    this.wishlistService.clearLocal();
    this.cartService.refresh();
    this.router.navigate(['/admin/login']);
  }
}
