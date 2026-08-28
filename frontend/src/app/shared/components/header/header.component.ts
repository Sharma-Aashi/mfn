import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="sticky top-0 z-40 border-b border-charcoal-100 bg-cream/95 backdrop-blur">
      <div class="container-vitalora flex h-16 items-center justify-between gap-3 sm:h-20">
        <a routerLink="/" class="flex shrink-0 items-center gap-2" aria-label="VITALORA home">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#1f3d24" />
            <path d="M20 30c-6-2-9-7-9-13 0-2 .3-4 1-6 3 1 6 3 8 6 2-3 5-5 8-6 .7 2 1 4 1 6 0 6-3 11-9 13z" fill="#e3d3ab" />
            <path d="M20 30V15" stroke="#1f3d24" stroke-width="1.4" />
          </svg>
          <span class="font-display text-xl font-semibold tracking-wide text-forest-800 sm:text-2xl">VITALORA</span>
        </a>

        <nav class="hidden items-center gap-7 lg:flex">
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="text-forest-700"
              [routerLinkActiveOptions]="{ exact: link.path === '/' }"
              class="text-[15px] font-medium text-charcoal-600 transition hover:text-forest-700"
            >
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="flex items-center gap-1 sm:gap-2">
          <div class="relative hidden sm:block" #searchBox>
            @if (searchOpen()) {
              <form (ngSubmit)="submitSearch()" class="flex items-center overflow-hidden rounded-full border border-charcoal-200 bg-white">
                <input
                  #searchInput
                  type="search"
                  name="q"
                  [(ngModel)]="searchTerm"
                  placeholder="Search products…"
                  class="w-48 bg-transparent px-4 py-2 text-sm text-charcoal-800 outline-none placeholder:text-charcoal-400"
                />
                <button type="submit" class="px-3 text-charcoal-500 hover:text-forest-700" aria-label="Search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                  </svg>
                </button>
              </form>
            } @else {
              <button type="button" (click)="openSearch()" class="icon-btn" aria-label="Open search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                </svg>
              </button>
            }
          </div>

          <a routerLink="/account/wishlist" class="icon-btn hidden sm:inline-flex" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 21s-7.5-4.7-10-9.3C0.4 8.4 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.6 8.4 18 11.7 15.5 16.3 12 21 12 21z" />
            </svg>
          </a>

          <a routerLink="/cart" class="icon-btn relative" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            @if (cartService.itemCount() > 0) {
              <span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-forest-700 px-1 text-[11px] font-semibold text-white">
                {{ cartService.itemCount() }}
              </span>
            }
          </a>

          @if (authService.isAuthenticated()) {
            <div class="relative hidden sm:block" #accountBox>
              <button type="button" (click)="accountOpen.set(!accountOpen())" class="icon-btn" aria-label="Account menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>
              </button>
              @if (accountOpen()) {
                <div class="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl bg-white py-1.5 shadow-lift ring-1 ring-charcoal-100">
                  <p class="truncate px-4 py-2 text-xs text-charcoal-400">Signed in as<br /><span class="font-medium text-charcoal-700">{{ authService.currentUser()?.fullName }}</span></p>
                  <a routerLink="/account/orders" (click)="accountOpen.set(false)" class="dropdown-link">My Orders</a>
                  <a routerLink="/account/profile" (click)="accountOpen.set(false)" class="dropdown-link">Profile</a>
                  <a routerLink="/account/addresses" (click)="accountOpen.set(false)" class="dropdown-link">Addresses</a>
                  <button type="button" (click)="logout()" class="dropdown-link w-full text-left text-red-600">Logout</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/account/login" class="hidden rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-800 sm:inline-flex">
              Sign In
            </a>
          }

          <button type="button" (click)="mobileOpen.set(true)" class="icon-btn lg:hidden" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    @if (mobileOpen()) {
      <div class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-charcoal-900/50" (click)="mobileOpen.set(false)"></div>
        <div class="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-cream shadow-lift">
          <div class="flex items-center justify-between border-b border-charcoal-100 px-5 py-4">
            <span class="font-display text-lg font-semibold text-forest-800">Menu</span>
            <button type="button" (click)="mobileOpen.set(false)" class="icon-btn" aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <form (ngSubmit)="submitSearch()" class="mx-5 mt-4 flex items-center overflow-hidden rounded-full border border-charcoal-200 bg-white">
            <input type="search" name="q" [(ngModel)]="searchTerm" placeholder="Search products…" class="w-full bg-transparent px-4 py-2.5 text-sm outline-none" />
            <button type="submit" class="px-3 text-charcoal-500" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg></button>
          </form>

          <nav class="flex flex-col gap-1 px-3 py-5">
            @for (link of navLinks; track link.path) {
              <a [routerLink]="link.path" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-3 text-[15px] font-medium text-charcoal-700 hover:bg-beige-100">{{ link.label }}</a>
            }
            <a routerLink="/account/wishlist" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-3 text-[15px] font-medium text-charcoal-700 hover:bg-beige-100">Wishlist</a>
          </nav>

          <div class="mt-auto border-t border-charcoal-100 p-5">
            @if (authService.isAuthenticated()) {
              <div class="flex flex-col gap-2">
                <a routerLink="/account/orders" (click)="mobileOpen.set(false)" class="rounded-full border border-charcoal-200 px-4 py-2.5 text-center text-sm font-semibold text-charcoal-700">My Account</a>
                <button type="button" (click)="logout(); mobileOpen.set(false)" class="rounded-full bg-charcoal-800 px-4 py-2.5 text-sm font-semibold text-white">Logout</button>
              </div>
            } @else {
              <div class="flex flex-col gap-2">
                <a routerLink="/account/login" (click)="mobileOpen.set(false)" class="rounded-full bg-forest-700 px-4 py-2.5 text-center text-sm font-semibold text-white">Sign In</a>
                <a routerLink="/account/register" (click)="mobileOpen.set(false)" class="rounded-full border border-charcoal-200 px-4 py-2.5 text-center text-sm font-semibold text-charcoal-700">Create Account</a>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .icon-btn {
        display: inline-flex;
        height: 2.5rem;
        width: 2.5rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        color: var(--color-charcoal-600);
        transition: background-color 0.15s, color 0.15s;
      }
      .icon-btn:hover {
        background-color: var(--color-beige-100);
        color: var(--color-forest-700);
      }
      .dropdown-link {
        display: block;
        padding: 0.55rem 1rem;
        font-size: 0.875rem;
        color: var(--color-charcoal-700);
      }
      .dropdown-link:hover {
        background-color: var(--color-beige-100);
      }
    `,
  ],
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ];

  protected mobileOpen = signal(false);
  protected searchOpen = signal(false);
  protected accountOpen = signal(false);
  protected searchTerm = '';

  protected openSearch(): void {
    this.searchOpen.set(true);
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('input[name="q"]')?.focus();
    });
  }

  protected submitSearch(): void {
    const q = this.searchTerm.trim();
    if (!q) return;
    this.router.navigate(['/products'], { queryParams: { q } });
    this.searchOpen.set(false);
    this.mobileOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
    this.wishlistService.clearLocal();
    this.cartService.refresh();
    this.accountOpen.set(false);
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.accountOpen.set(false);
    }
  }
}
