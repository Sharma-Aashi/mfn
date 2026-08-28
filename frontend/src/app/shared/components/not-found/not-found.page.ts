import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container-vitalora flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span class="font-display text-7xl font-semibold text-forest-700">404</span>
      <h1 class="mt-4 font-display text-2xl font-semibold text-charcoal-900">Page not found</h1>
      <p class="mt-2 max-w-sm text-charcoal-500">
        The page you are looking for may have been moved or no longer exists.
      </p>
      <a routerLink="/" class="mt-6 rounded-full bg-forest-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-800">
        Back to Home
      </a>
    </div>
  `,
})
export class NotFoundPage {
  constructor() {
    inject(SeoService).update('Page Not Found');
  }
}
