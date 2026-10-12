import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/common.model';
import { AdminOrderSummary, Order, OrderStatus } from '../models/order.model';

/**
 * Admin orders — list, open, change status. The customer-facing
 * {@link OrderService} is scoped to the signed-in user; this one is not, and
 * calls under {@code /api/admin/**} are gated to ROLE_ADMIN by the backend.
 */
@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/admin/orders`;

  list(q: string | undefined, status: OrderStatus | '' | undefined, page = 0, size = 20): Observable<PageResponse<AdminOrderSummary>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<AdminOrderSummary>>(this.base, { params });
  }

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { status });
  }
}
