import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/common.model';
import { InventoryItem, StockUpdateRequest } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/admin/inventory`;

  search(q: string | undefined, lowStockOnly: boolean, page = 0, size = 20): Observable<PageResponse<InventoryItem>> {
    let params = new HttpParams().set('lowStockOnly', lowStockOnly).set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get<PageResponse<InventoryItem>>(this.base, { params });
  }

  updateStock(variantId: number, request: StockUpdateRequest): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.base}/${variantId}`, request);
  }
}
