import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../models/site-settings.model';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/cms/site`;

  /** Starts on defaults so the shell renders immediately, then swaps in saved values. */
  readonly settings = signal<SiteSettings>(DEFAULT_SITE_SETTINGS);

  readonly brand = computed(() => this.settings().brand);
  readonly footer = computed(() => this.settings().footer);
  readonly social = computed(() => this.settings().social);
  readonly nav = computed(() => this.settings().nav);
  readonly commerce = computed(() => this.settings().commerce);

  load(): void {
    this.http.get<Partial<SiteSettings>>(this.url).subscribe({
      next: (saved) => this.settings.set(this.merge(saved)),
      error: () => {
        /* keep defaults - a CMS hiccup should never blank the header/footer */
      },
    });
  }

  update(sections: Partial<SiteSettings>): Observable<SiteSettings> {
    return this.http.put<Partial<SiteSettings>>(this.url, sections).pipe(
      map((saved) => this.merge(saved)),
      tap((merged) => this.settings.set(merged)),
    );
  }

  private merge(saved: Partial<SiteSettings> | null): SiteSettings {
    const d = DEFAULT_SITE_SETTINGS;
    const s = saved ?? {};
    return {
      brand: { ...d.brand, ...s.brand },
      footer: { ...d.footer, ...s.footer },
      social: { ...d.social, ...s.social },
      nav: { links: s.nav?.links?.length ? s.nav.links : d.nav.links },
      commerce: { ...d.commerce, ...s.commerce },
    };
  }
}
