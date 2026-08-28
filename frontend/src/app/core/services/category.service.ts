import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryRequest } from '../models/category.model';
import { MessageResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/categories`;

  getAllActive(): Observable<Category[]> {
    return this.http.get<Category[]>(this.base);
  }

  getAllForAdmin(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/admin`);
  }

  getBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.base}/${slug}`);
  }

  create(request: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.base, request);
  }

  update(id: number, request: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/${id}`);
  }

  updateStatus(id: number, active: boolean): Observable<Category> {
    return this.http.patch<Category>(`${this.base}/${id}/status`, { active });
  }

  uploadImage(id: number, file: File): Observable<Category> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Category>(`${this.base}/${id}/image`, formData);
  }
}
