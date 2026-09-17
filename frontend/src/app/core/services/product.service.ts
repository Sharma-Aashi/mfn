import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse, PageResponse } from '../models/common.model';
import { ProductDetail, ProductFilterParams, ProductRequest, ProductSummary } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/products`;

  search(filters: ProductFilterParams): Observable<PageResponse<ProductSummary>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PageResponse<ProductSummary>>(this.base, { params });
  }

  searchForAdmin(params: {
    q?: string; active?: boolean; category?: string; page?: number; size?: number; sort?: string;
  }): Observable<PageResponse<ProductDetail>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<PageResponse<ProductDetail>>(`${this.base}/admin`, { params: httpParams });
  }

  getFeatured(): Observable<ProductSummary[]> {
    return this.http.get<ProductSummary[]>(`${this.base}/featured`);
  }

  getBestSellers(): Observable<ProductSummary[]> {
    return this.http.get<ProductSummary[]>(`${this.base}/best-sellers`);
  }

  getNewArrivals(): Observable<ProductSummary[]> {
    return this.http.get<ProductSummary[]>(`${this.base}/new-arrivals`);
  }

  getBySlug(slug: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.base}/${slug}`);
  }

  getById(id: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.base}/id/${id}`);
  }

  getRelated(slug: string): Observable<ProductSummary[]> {
    return this.http.get<ProductSummary[]>(`${this.base}/${slug}/related`);
  }

  create(request: ProductRequest): Observable<ProductDetail> {
    return this.http.post<ProductDetail>(this.base, request);
  }

  update(id: number, request: ProductRequest): Observable<ProductDetail> {
    return this.http.put<ProductDetail>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/${id}`);
  }

  updateStatus(id: number, active: boolean): Observable<ProductDetail> {
    return this.http.patch<ProductDetail>(`${this.base}/${id}/status`, { active });
  }

  bulkUpdateStatus(ids: number[], active: boolean): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.base}/bulk-status`, { ids, active });
  }

  addImage(productId: number, file: File, primary: boolean): Observable<ProductDetail> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ProductDetail>(`${this.base}/${productId}/images?primary=${primary}`, formData);
  }

  deleteImage(productId: number, imageId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/${productId}/images/${imageId}`);
  }

  updateImage(productId: number, imageId: number, changes: { altText?: string; primary?: boolean }): Observable<ProductDetail> {
    return this.http.patch<ProductDetail>(`${this.base}/${productId}/images/${imageId}`, changes);
  }

  reorderImages(productId: number, imageIds: number[]): Observable<ProductDetail> {
    return this.http.put<ProductDetail>(`${this.base}/${productId}/images/order`, { imageIds });
  }
}
