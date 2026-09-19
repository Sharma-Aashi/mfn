import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';
import { ProductDetail, ProductVariant } from '../models/product.model';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';

const GUEST_CART_KEY = 'vitalora_guest_cart';

/**
 * A guest line. productId is kept alongside variantId so the cart can be
 * rebuilt with one product request per line rather than a variant lookup each.
 */
interface GuestEntry {
  productId: number;
  variantId: number;
  quantity: number;
}

const EMPTY_CART: Cart = { id: null, items: [], itemCount: 0, subtotal: 0 };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly base = `${environment.apiBaseUrl}/cart`;

  readonly cart = signal<Cart>(EMPTY_CART);
  readonly loading = signal(false);
  readonly itemCount = computed(() => this.cart().itemCount);

  refresh(): void {
    this.loading.set(true);
    const source = this.authService.isAuthenticated() ? this.fetchServerCart() : this.fetchGuestCart();
    source.subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addItem(variantId: number, quantity: number, productId?: number): Observable<Cart> {
    if (this.authService.isAuthenticated()) {
      return this.http.post<Cart>(this.base, { variantId, quantity }).pipe(tap((c) => this.cart.set(c)));
    }
    const entries = this.readGuestEntries();
    const existing = entries.find((e) => e.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      // A guest line needs its product to rebuild itself on the next load.
      // Without one we cannot resolve the variant, so drop the add rather
      // than persist a line that would silently vanish.
      if (productId === undefined) {
        return of(this.cart());
      }
      entries.push({ productId, variantId, quantity });
    }
    this.writeGuestEntries(entries);
    return this.fetchGuestCart().pipe(tap((c) => this.cart.set(c)));
  }

  updateItem(variantId: number, quantity: number): Observable<Cart> {
    if (this.authService.isAuthenticated()) {
      const item = this.cart().items.find((i) => i.variantId === variantId);
      if (!item) return of(this.cart());
      return this.http.put<Cart>(`${this.base}/${item.id}`, { quantity }).pipe(tap((c) => this.cart.set(c)));
    }
    const entries = this.readGuestEntries().map((e) => (e.variantId === variantId ? { ...e, quantity } : e));
    this.writeGuestEntries(entries);
    return this.fetchGuestCart().pipe(tap((c) => this.cart.set(c)));
  }

  removeItem(variantId: number): Observable<Cart> {
    if (this.authService.isAuthenticated()) {
      const item = this.cart().items.find((i) => i.variantId === variantId);
      if (!item) return of(this.cart());
      return this.http.delete<Cart>(`${this.base}/${item.id}`).pipe(tap((c) => this.cart.set(c)));
    }
    const entries = this.readGuestEntries().filter((e) => e.variantId !== variantId);
    this.writeGuestEntries(entries);
    return this.fetchGuestCart().pipe(tap((c) => this.cart.set(c)));
  }

  clear(): Observable<Cart> {
    if (this.authService.isAuthenticated()) {
      return this.http.delete<Cart>(this.base).pipe(tap((c) => this.cart.set(c)));
    }
    this.writeGuestEntries([]);
    this.cart.set(EMPTY_CART);
    return of(EMPTY_CART);
  }

  /** Called right after login/register to fold any guest-session cart into the user's server cart. */
  mergeGuestCartIntoServer(): Observable<Cart> {
    const entries = this.readGuestEntries();
    if (entries.length === 0) {
      return this.fetchServerCart().pipe(tap((c) => this.cart.set(c)));
    }
    const items = entries.map((e) => ({ variantId: e.variantId, quantity: e.quantity }));
    return this.http.post<Cart>(`${this.base}/merge`, { items }).pipe(
      tap((c) => {
        this.writeGuestEntries([]);
        this.cart.set(c);
      }),
    );
  }

  private fetchServerCart(): Observable<Cart> {
    return this.http.get<Cart>(this.base);
  }

  private fetchGuestCart(): Observable<Cart> {
    const entries = this.readGuestEntries();
    if (entries.length === 0) {
      return of(EMPTY_CART);
    }

    return forkJoin(
      entries.map((entry) =>
        this.productService.getById(entry.productId).pipe(
          map((product) => this.toGuestItem(product, entry)),
          // A variant that no longer exists (deactivated, deleted) drops out of
          // the cart rather than breaking the whole fetch.
          catchError(() => EMPTY),
        ),
      ),
    ).pipe(
      map((items) => {
        const present = items.filter((i): i is CartItem => i !== null);
        const subtotal = present.reduce((sum, i) => sum + i.lineTotal, 0);
        const itemCount = present.reduce((sum, i) => sum + i.quantity, 0);
        return { id: null, items: present, itemCount, subtotal } satisfies Cart;
      }),
      catchError(() => of(EMPTY_CART)),
    );
  }

  private toGuestItem(product: ProductDetail, entry: GuestEntry): CartItem | null {
    const variant: ProductVariant | undefined = product.variants.find((v) => v.id === entry.variantId);
    if (!variant || !variant.active) {
      return null;
    }
    const image =
      variant.imageUrl ??
      product.images.find((i) => i.primary)?.imageUrl ??
      product.images[0]?.imageUrl ??
      null;
    return {
      // No server row exists yet, so the variant id doubles as the line id.
      id: variant.id,
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: image,
      brandName: product.brand?.name ?? null,
      variantLabel: variant.label,
      sku: variant.sku,
      unitPrice: variant.effectivePrice,
      unitMrp: variant.price,
      quantity: entry.quantity,
      lineTotal: variant.effectivePrice * entry.quantity,
      inStock: product.active && variant.inStock && variant.stockQuantity >= entry.quantity,
      availableStock: variant.stockQuantity,
    };
  }

  private readGuestEntries(): GuestEntry[] {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<GuestEntry>[]) : [];
      // Carts saved before variants existed have no variantId and cannot be
      // resolved, so they are discarded instead of rendering as broken lines.
      return parsed.filter(
        (e): e is GuestEntry =>
          typeof e?.variantId === 'number' && typeof e?.productId === 'number' && typeof e?.quantity === 'number',
      );
    } catch {
      return [];
    }
  }

  private writeGuestEntries(entries: GuestEntry[]): void {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(entries));
    } catch {
      /* localStorage unavailable - guest cart just won't persist across reloads */
    }
  }
}
