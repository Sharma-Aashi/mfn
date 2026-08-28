import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_NAME = 'VITALORA';
const JSON_LD_ID = 'structured-data';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(pageTitle: string, description?: string): void {
    this.title.setTitle(`${pageTitle} | ${SITE_NAME}`);
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
    this.meta.updateTag({ property: 'og:title', content: `${pageTitle} | ${SITE_NAME}` });
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
