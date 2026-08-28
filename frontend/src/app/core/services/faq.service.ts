import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse } from '../models/common.model';
import { Faq, FaqRequest } from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}`;

  getActive(category?: string, search?: string): Observable<Faq[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);
    return this.http.get<Faq[]>(`${this.base}/faqs`, { params });
  }

  getAllForAdmin(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.base}/admin/faqs`);
  }

  create(request: FaqRequest): Observable<Faq> {
    return this.http.post<Faq>(`${this.base}/admin/faqs`, request);
  }

  update(id: number, request: FaqRequest): Observable<Faq> {
    return this.http.put<Faq>(`${this.base}/admin/faqs/${id}`, request);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/admin/faqs/${id}`);
  }

  updateStatus(id: number, active: boolean): Observable<Faq> {
    return this.http.patch<Faq>(`${this.base}/admin/faqs/${id}/status`, { active });
  }

  reorder(faqIds: number[]): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.base}/admin/faqs/reorder`, { faqIds });
  }
}
