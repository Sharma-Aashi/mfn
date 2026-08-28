import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse, PageResponse } from '../models/common.model';
import { Review, ReviewRequest, ReviewSummary } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}`;

  getForProduct(productId: number, page = 0, size = 10): Observable<PageResponse<Review>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Review>>(`${this.base}/products/${productId}/reviews`, { params });
  }

  getSummary(productId: number): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.base}/products/${productId}/reviews/summary`);
  }

  submit(productId: number, request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.base}/products/${productId}/reviews`, request);
  }

  getAllForAdmin(status?: string, page = 0, size = 15): Observable<PageResponse<Review>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<Review>>(`${this.base}/admin/reviews`, { params });
  }

  approve(id: number): Observable<Review> {
    return this.http.patch<Review>(`${this.base}/admin/reviews/${id}/approve`, {});
  }

  reject(id: number): Observable<Review> {
    return this.http.patch<Review>(`${this.base}/admin/reviews/${id}/reject`, {});
  }

  setFeatured(id: number, featured: boolean): Observable<Review> {
    return this.http.patch<Review>(`${this.base}/admin/reviews/${id}/featured`, { active: featured });
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/admin/reviews/${id}`);
  }
}
