import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse, PageResponse } from '../models/common.model';
import { ContactMessage, ContactMessageRequest } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}`;

  submit(request: ContactMessageRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/contact`, request);
  }

  getAllForAdmin(page = 0, size = 15): Observable<PageResponse<ContactMessage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ContactMessage>>(`${this.base}/admin/contact-messages`, { params });
  }

  markRead(id: number): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.base}/admin/contact-messages/${id}/read`, {});
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/admin/contact-messages/${id}`);
  }
}
