import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, BrandRequest } from '../models/brand.model';
import { MessageResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/brands`;

  getAllActive(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.base);
  }

  getFeatured(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.base}/featured`);
  }

  getAllForAdmin(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.base}/admin`);
  }

  getBySlug(slug: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.base}/${slug}`);
  }

  create(request: BrandRequest): Observable<Brand> {
    return this.http.post<Brand>(this.base, request);
  }

  update(id: number, request: BrandRequest): Observable<Brand> {
    return this.http.put<Brand>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/${id}`);
  }

  updateStatus(id: number, active: boolean): Observable<Brand> {
    return this.http.patch<Brand>(`${this.base}/${id}/status`, { active });
  }

  uploadLogo(id: number, file: File): Observable<Brand> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Brand>(`${this.base}/${id}/logo`, formData);
  }
}
