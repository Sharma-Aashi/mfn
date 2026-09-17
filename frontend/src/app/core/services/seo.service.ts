import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SiteSettingsService } from './site-settings.service';

const JSON_LD_ID = 'structured-data';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly brand = inject(SiteSettingsService).brand;
  private readonly pageTitle = signal<string | null>(null);

  constructor() {
    // Pages set their title before site settings finish loading, so re-apply
    // the "Page | Brand" suffix once the real brand name arrives.
    effect(() => {
      const page = this.pageTitle();
      if (page === null) return;
      const { name, tagline } = this.brand();
      const full = page ? `${page} | ${name}` : [name, tagline].filter(Boolean).join(' | ');
      this.title.setTitle(full);
      this.meta.updateTag({ property: 'og:title', content: full });
    });
  }

  /** Pass an empty pageTitle for the homepage to get "Brand | Tagline". */
  update(pageTitle: string, description?: string): void {
    this.pageTitle.set(pageTitle);
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
    this.clearJsonLd();
  }

  /** Injects (or replaces) a single JSON-LD structured-data script tag for the current page. */
  setJsonLd(data: Record<string, unknown>): void {
    this.clearJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSON_LD_ID;
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private clearJsonLd(): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
  }
}
