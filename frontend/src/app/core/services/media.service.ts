import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type MediaFolder = 'cms' | 'brand' | 'banners';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);

  /** Uploads an image for CMS content and returns its public URL path. */
  upload(file: File, folder: MediaFolder = 'cms'): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ url: string }>(`${environment.apiBaseUrl}/admin/media?folder=${folder}`, formData)
      .pipe(map((res) => res.url));
  }
}
