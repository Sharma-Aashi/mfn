import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';

const GUEST_CART_KEY = 'vitalora_guest_cart';

interface GuestEntry {
  productId: number;
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

  addItem(productId: number, quantity: number): Observable<Cart> {
    if (this.authService.isAuthenticated()) {
      return this.http.post<Cart>(this.base, { productId, quantity }).pipe(tap((c) => this.cart.set(c)));
    }
    const entries = this.readGuestEntries();
    const existing = entries.find((e) => e.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      entries.push({ productId, quantity });
    }
    this.writeGuestEntries(entries);
    return this.fetchGuestCart().pipe(tap((c) => this.cart.set(c)));
  }

  updateItem(productId: number, quantity: number): Observable<Cart> {
    if (this.authService.isAuthenticated()) {
      const item = this.cart().items.find((i) => i.productId === productId);
      if (!item) return of(this.cart());
      return this.http.put<Cart>(`${this.base}/${item.id}`, { quantity }).pipe(tap((c) => this.cart.set(c)));
    }
    const entries = this.readGuestEntries().map((e) => (e.productId === productId ? { ...e, quantity } : e));
    this.writeGuestEntries(entries);
    return this.fetchGuestCart().pipe(tap((c) => this.cart.set(c)));
  }

  removeItem(productId: number): Observable<Cart> {
    if (this.authService.isAuthenticated()) {
      const item = this.cart().items.find((i) => i.productId === productId);
      if (!item) return of(this.cart());
      return this.http.delete<Cart>(`${this.base}/${item.id}`).pipe(tap((c) => this.cart.set(c)));
    }
    const entries = this.readGuestEntries().filter((e) => e.productId !== productId);
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
    return this.http.post<Cart>(`${this.base}/merge`, { items: entries }).pipe(
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
          map((product): CartItem => ({
            id: product.id,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.images.find((i) => i.primary)?.imageUrl ?? product.images[0]?.imageUrl ?? null,
            unitPrice: product.effectivePrice,
            quantity: entry.quantity,
            lineTotal: product.effectivePrice * entry.quantity,
            inStock: product.inStock && product.stockQuantity >= entry.quantity,
            availableStock: product.stockQuantity,
          })),
          catchError(() => EMPTY),
        ),
      ),
    ).pipe(
      map((items) => {
        const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        return { id: null, items, itemCount, subtotal } satisfies Cart;
      }),
      catchError(() => of(EMPTY_CART)),
    );
  }

  private readGuestEntries(): GuestEntry[] {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      return raw ? (JSON.parse(raw) as GuestEntry[]) : [];
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
