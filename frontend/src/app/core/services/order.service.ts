import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/common.model';
import { CreateOrderRequest, Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/orders`;

  getOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Order>>(this.base, { params });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/number/${orderNumber}`);
  }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.base, request);
  }
}
