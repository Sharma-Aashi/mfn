import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AboutContent, Banner, BannerRequest, ContactContent, HomeContent, PolicyContent } from '../models/cms.model';
import { MessageResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class CmsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}`;

  getHome(): Observable<HomeContent> {
    return this.http.get<HomeContent>(`${this.base}/cms/home`);
  }

  updateHome(sections: Partial<HomeContent>): Observable<HomeContent> {
    return this.http.put<HomeContent>(`${this.base}/cms/home`, sections);
  }

  getAbout(): Observable<AboutContent> {
    return this.http.get<AboutContent>(`${this.base}/cms/about`);
  }

  updateAbout(sections: Partial<AboutContent>): Observable<AboutContent> {
    return this.http.put<AboutContent>(`${this.base}/cms/about`, sections);
  }

  getContact(): Observable<ContactContent> {
    return this.http.get<ContactContent>(`${this.base}/cms/contact`);
  }

  updateContact(sections: Partial<ContactContent>): Observable<ContactContent> {
    return this.http.put<ContactContent>(`${this.base}/cms/contact`, sections);
  }

  getPolicies(): Observable<PolicyContent> {
    return this.http.get<PolicyContent>(`${this.base}/cms/policies`);
  }

  updatePolicies(sections: Partial<PolicyContent>): Observable<PolicyContent> {
    return this.http.put<PolicyContent>(`${this.base}/cms/policies`, sections);
  }

  getActiveBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.base}/cms/banners`);
  }

  getAllBannersForAdmin(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.base}/admin/banners`);
  }

  createBanner(request: BannerRequest): Observable<Banner> {
    return this.http.post<Banner>(`${this.base}/admin/banners`, request);
  }

  updateBanner(id: number, request: BannerRequest): Observable<Banner> {
    return this.http.put<Banner>(`${this.base}/admin/banners/${id}`, request);
  }

  deleteBanner(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/admin/banners/${id}`);
  }

  updateBannerStatus(id: number, active: boolean): Observable<Banner> {
    return this.http.patch<Banner>(`${this.base}/admin/banners/${id}/status`, { active });
  }
}
