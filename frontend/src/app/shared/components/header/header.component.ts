import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

interface CategoryNode extends Category {
  kids: Category[];
}

/** How many top-level categories sit directly in the nav row. */
const PRIMARY_NAV_COUNT = 5;

/** Sentinel id for the "More" panel, which is not a real category. */
const MORE_MENU = -1;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, BrandLogoComponent],
  template: `
    <header class="sticky top-0 z-40">
      <!-- Utility bar: the promises a marketplace has to repeat, plus the admin's own links. -->
      <div class="hidden bg-charcoal-900 text-white lg:block">
        <div class="container-vitalora flex h-9 items-center justify-between text-xs">
          <span class="font-medium">100% genuine, sourced through authorised channels</span>
          <div class="flex items-center gap-5">
            <span>Free delivery over ₹{{ commerce().freeShippingThreshold }}</span>
            <span>Cash on Delivery</span>
            @for (link of utilityLinks(); track link.path) {
              <a [routerLink]="link.path" class="hover:underline">{{ link.label }}</a>
            }
          </div>
        </div>
      </div>

      <!-- Main bar: search is the primary action, so it is always open and wide. -->
      <div class="border-b border-charcoal-100 bg-cream/95 backdrop-blur">
        <div class="container-vitalora flex h-16 items-center gap-3 sm:gap-5">
          <a routerLink="/" class="flex shrink-0 items-center" [attr.aria-label]="siteSettings.brand().name + ' home'">
            <app-brand-logo [size]="30" />
          </a>

          <form (ngSubmit)="submitSearch()" class="hidden flex-1 md:block">
            <label for="site-search" class="sr-only">Search products and brands</label>
            <div class="flex items-center overflow-hidden rounded-full border border-charcoal-200 bg-white focus-within:border-forest-500">
              <input
                id="site-search"
                type="search"
                name="q"
                [(ngModel)]="searchTerm"
                placeholder="Search for whey protein, creatine, a brand…"
                class="w-full bg-transparent px-5 py-2.5 text-sm text-charcoal-800 outline-none placeholder:text-charcoal-400"
              />
              <button type="submit" class="flex h-10 shrink-0 items-center gap-2 bg-forest-700 px-5 text-sm font-semibold text-white transition hover:bg-forest-800" aria-label="Search">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                </svg>
                <span class="hidden lg:inline">Search</span>
              </button>
            </div>
          </form>

          <div class="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            <a routerLink="/account/wishlist" class="icon-btn hidden sm:inline-flex" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 21s-7.5-4.7-10-9.3C0.4 8.4 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.6 8.4 18 11.7 15.5 16.3 12 21 12 21z" />
              </svg>
            </a>

            <a routerLink="/cart" class="icon-btn inline-flex relative" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              @if (cartService.itemCount() > 0) {
                <span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-deal px-1 text-[11px] font-semibold text-deal-ink">
                  {{ cartService.itemCount() }}
                </span>
              }
            </a>

            @if (authService.isAuthenticated()) {
              <div class="relative hidden sm:block">
                <button type="button" (click)="accountOpen.set(!accountOpen())" class="icon-btn inline-flex" [attr.aria-expanded]="accountOpen()" aria-label="Account menu">
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

            <button type="button" (click)="mobileOpen.set(true)" class="icon-btn inline-flex lg:hidden" aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Narrow screens get their own search row rather than a hidden toggle. -->
        <form (ngSubmit)="submitSearch()" class="container-vitalora pb-3 md:hidden">
          <label for="site-search-mobile" class="sr-only">Search products and brands</label>
          <div class="flex items-center overflow-hidden rounded-full border border-charcoal-200 bg-white">
            <input
              id="site-search-mobile"
              type="search"
              name="q"
              [(ngModel)]="searchTerm"
              placeholder="Search products and brands…"
              class="w-full bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-400"
            />
            <button type="submit" class="px-4 text-charcoal-500" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Category row. A category with children opens a panel; one without is a plain link. -->
      <nav class="hidden border-b border-charcoal-100 bg-white lg:block" aria-label="Product categories">
        <div class="container-vitalora flex items-center gap-1">
          <a
            routerLink="/products"
            routerLinkActive="text-forest-700"
            class="whitespace-nowrap px-3 py-3 text-sm font-semibold text-charcoal-700 transition hover:text-forest-700"
          >
            All Products
          </a>

          @for (c of primaryCategories(); track c.id) {
            @if (c.kids.length > 0) {
              <div class="relative" (mouseenter)="openCategory.set(c.id)" (mouseleave)="openCategory.set(null)">
                <button
                  type="button"
                  (click)="toggleCategory(c.id)"
                  [attr.aria-expanded]="openCategory() === c.id"
                  class="flex items-center gap-1 whitespace-nowrap px-3 py-3 text-sm font-medium text-charcoal-600 transition hover:text-forest-700"
                >
                  {{ c.name }}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                @if (openCategory() === c.id) {
                  <div class="absolute left-0 top-full z-50 w-64 overflow-hidden rounded-b-xl bg-white py-2 shadow-lift ring-1 ring-charcoal-100">
                    <a
                      [routerLink]="['/products']"
                      [queryParams]="{ category: c.slug }"
                      (click)="openCategory.set(null)"
                      class="block px-4 py-2 text-sm font-semibold text-forest-700 hover:bg-beige-50"
                    >
                      All {{ c.name }}
                    </a>
                    @for (kid of c.kids; track kid.id) {
                      <a
                        [routerLink]="['/products']"
                        [queryParams]="{ category: kid.slug }"
                        (click)="openCategory.set(null)"
                        class="flex items-center justify-between px-4 py-2 text-sm text-charcoal-600 hover:bg-beige-50 hover:text-forest-700"
                      >
                        <span>{{ kid.name }}</span>
                        <span class="text-xs text-charcoal-400">{{ kid.productCount }}</span>
                      </a>
                    }
                  </div>
                }
              </div>
            } @else {
              <a
                [routerLink]="['/products']"
                [queryParams]="{ category: c.slug }"
                class="whitespace-nowrap px-3 py-3 text-sm font-medium text-charcoal-600 transition hover:text-forest-700"
              >
                {{ c.name }}
              </a>
            }
          }

          @if (moreCategories().length > 0) {
            <div class="relative" (mouseenter)="openCategory.set(moreMenuId)" (mouseleave)="openCategory.set(null)">
              <button
                type="button"
                (click)="toggleCategory(moreMenuId)"
                [attr.aria-expanded]="openCategory() === moreMenuId"
                class="flex items-center gap-1 whitespace-nowrap px-3 py-3 text-sm font-medium text-charcoal-600 transition hover:text-forest-700"
              >
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              @if (openCategory() === moreMenuId) {
                <div class="absolute left-0 top-full z-50 flex w-[34rem] gap-6 rounded-b-xl bg-white p-5 shadow-lift ring-1 ring-charcoal-100">
                  @for (c of moreCategories(); track c.id) {
                    <div class="min-w-0 flex-1">
                      <a
                        [routerLink]="['/products']"
                        [queryParams]="{ category: c.slug }"
                        (click)="openCategory.set(null)"
                        class="block text-sm font-semibold text-charcoal-900 hover:text-forest-700"
                      >
                        {{ c.name }}
                      </a>
                      <ul class="mt-2 space-y-1.5">
                        @for (kid of c.kids; track kid.id) {
                          <li>
                            <a
                              [routerLink]="['/products']"
                              [queryParams]="{ category: kid.slug }"
                              (click)="openCategory.set(null)"
                              class="block text-[13px] text-charcoal-600 hover:text-forest-700"
                            >
                              {{ kid.name }}
                            </a>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <a
            routerLink="/brands"
            routerLinkActive="text-forest-700"
            class="ml-auto whitespace-nowrap px-3 py-3 text-sm font-medium text-charcoal-600 transition hover:text-forest-700"
          >
            Brands
          </a>
        </div>
      </nav>
    </header>

    @if (mobileOpen()) {
      <div class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-charcoal-900/50" (click)="mobileOpen.set(false)"></div>
        <div class="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-cream shadow-lift">
          <div class="flex items-center justify-between border-b border-charcoal-100 px-5 py-4">
            <span class="font-display text-lg font-semibold text-forest-800">Menu</span>
            <button type="button" (click)="mobileOpen.set(false)" class="icon-btn inline-flex" aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <nav class="flex flex-col gap-0.5 px-3 py-4">
            <a routerLink="/products" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-3 text-[15px] font-semibold text-charcoal-800 hover:bg-beige-100">All Products</a>
            <a routerLink="/brands" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-3 text-[15px] font-semibold text-charcoal-800 hover:bg-beige-100">Brands</a>

            <p class="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal-400">Categories</p>
            @for (c of tree(); track c.id) {
              <a
                [routerLink]="['/products']"
                [queryParams]="{ category: c.slug }"
                (click)="mobileOpen.set(false)"
                class="rounded-lg px-3 py-2.5 text-[15px] font-medium text-charcoal-700 hover:bg-beige-100"
              >
                {{ c.name }}
              </a>
              @for (kid of c.kids; track kid.id) {
                <a
                  [routerLink]="['/products']"
                  [queryParams]="{ category: kid.slug }"
                  (click)="mobileOpen.set(false)"
                  class="rounded-lg py-2 pl-7 pr-3 text-sm text-charcoal-600 hover:bg-beige-100"
                >
                  {{ kid.name }}
                </a>
              }
            }

            <p class="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal-400">More</p>
            @for (link of utilityLinks(); track link.path) {
              <a [routerLink]="link.path" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-[15px] font-medium text-charcoal-700 hover:bg-beige-100">{{ link.label }}</a>
            }
            <a routerLink="/account/wishlist" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-[15px] font-medium text-charcoal-700 hover:bg-beige-100">Wishlist</a>
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
      /*
       * Emulated encapsulation compiles these to .icon-btn[_ngcontent-*],
       * which outranks a Tailwind utility, so "display" is deliberately left
       * out: a rule here would beat lg:hidden / sm:inline-flex on the very
       * buttons that need to appear and disappear with the breakpoint. Each
       * usage carries its own display utility instead.
       */
      .icon-btn {
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
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  protected readonly siteSettings = inject(SiteSettingsService);
  protected readonly commerce = this.siteSettings.commerce;

  protected mobileOpen = signal(false);
  protected accountOpen = signal(false);
  protected openCategory = signal<number | null>(null);
  protected readonly moreMenuId = MORE_MENU;
  protected searchTerm = '';

  private readonly categories = signal<Category[]>([]);

  /**
   * The API returns a flat list with parentId rather than a nested one, so the
   * tree is assembled here. Categories with no children stay plain links.
   */
  protected readonly tree = computed<CategoryNode[]>(() => {
    const all = this.categories();
    return all
      .filter((c) => c.parentId === null)
      .map((c) => ({ ...c, kids: all.filter((k) => k.parentId === c.id) }));
  });

  /**
   * A nav row can hold about five groups before it stops being scannable, so
   * the rest fold into "More". Which five is decided purely by display_order,
   * meaning an admin promotes a category by re-ordering it - no extra flag.
   */
  protected readonly primaryCategories = computed(() => this.tree().slice(0, PRIMARY_NAV_COUNT));
  protected readonly moreCategories = computed(() => this.tree().slice(PRIMARY_NAV_COUNT));

  /** Home and the shop live in the logo and the category row, so they are dropped here. */
  protected readonly utilityLinks = computed(() =>
    this.siteSettings.nav().links.filter((l) => l.path !== '/' && l.path !== '/products'),
  );

  constructor() {
    this.categoryService.getAllActive().subscribe((c) => this.categories.set(c));
  }

  protected toggleCategory(id: number): void {
    this.openCategory.set(this.openCategory() === id ? null : id);
  }

  protected submitSearch(): void {
    const q = this.searchTerm.trim();
    if (!q) return;
    this.router.navigate(['/products'], { queryParams: { q } });
    this.mobileOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
    this.wishlistService.clearLocal();
    this.cartService.refresh();
    this.accountOpen.set(false);
    this.router.navigate(['/']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openCategory.set(null);
    this.accountOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.accountOpen.set(false);
      this.openCategory.set(null);
    }
  }
}
