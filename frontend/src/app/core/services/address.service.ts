import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address, AddressRequest } from '../models/address.model';
import { MessageResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/addresses`;

  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(this.base);
  }

  create(request: AddressRequest): Observable<Address> {
    return this.http.post<Address>(this.base, request);
  }

  update(id: number, request: AddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/${id}`);
  }

  setDefault(id: number): Observable<Address> {
    return this.http.patch<Address>(`${this.base}/${id}/default`, {});
  }
}
