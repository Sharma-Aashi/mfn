import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Wishlist } from '../models/wishlist.model';
import { AuthService } from './auth.service';

const EMPTY_WISHLIST: Wishlist = { items: [] };

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly base = `${environment.apiBaseUrl}/wishlist`;

  readonly wishlist = signal<Wishlist>(EMPTY_WISHLIST);
  readonly productIds = computed(() => new Set(this.wishlist().items.map((i) => i.productId)));

  refresh(): void {
    if (!this.authService.isAuthenticated()) {
      this.wishlist.set(EMPTY_WISHLIST);
      return;
    }
    this.http.get<Wishlist>(this.base).subscribe((w) => this.wishlist.set(w));
  }

  toggle(productId: number) {
    return this.productIds().has(productId) ? this.remove(productId) : this.add(productId);
  }

  add(productId: number) {
    return this.http.post<Wishlist>(`${this.base}/${productId}`, {}).pipe(tap((w) => this.wishlist.set(w)));
  }

  remove(productId: number) {
    return this.http.delete<Wishlist>(`${this.base}/${productId}`).pipe(tap((w) => this.wishlist.set(w)));
  }

  clearLocal(): void {
    this.wishlist.set(EMPTY_WISHLIST);
  }
}
