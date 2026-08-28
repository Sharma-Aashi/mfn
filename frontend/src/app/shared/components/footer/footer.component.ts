import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <footer class="border-t border-charcoal-100 bg-forest-950 text-beige-100">
      <div class="container-vitalora grid grid-cols-2 gap-10 py-14 sm:grid-cols-2 md:grid-cols-5">
        <div class="col-span-2">
          <div class="mb-3 flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#e3d3ab" />
              <path d="M20 30c-6-2-9-7-9-13 0-2 .3-4 1-6 3 1 6 3 8 6 2-3 5-5 8-6 .7 2 1 4 1 6 0 6-3 11-9 13z" fill="#1f3d24" />
            </svg>
            <span class="font-display text-xl font-semibold text-white">VITALORA</span>
          </div>
          <p class="max-w-xs text-sm leading-relaxed text-beige-200/80">
            Better Health. Better Every Day. Premium, science-backed supplements for modern wellness routines.
          </p>
          <div class="mt-5 flex gap-3">
            @for (social of socials; track social.name) {
              <a [href]="social.href" [attr.aria-label]="social.name" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20" target="_blank" rel="noopener">
                <span [innerHTML]="social.icon"></span>
              </a>
            }
          </div>
        </div>

        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-beige-300">Shop</h3>
          <ul class="space-y-2 text-sm text-beige-200/80">
            <li><a routerLink="/products" class="hover:text-white">All Products</a></li>
            <li><a routerLink="/products" [queryParams]="{ sort: 'popular' }" class="hover:text-white">Best Sellers</a></li>
            <li><a routerLink="/products" [queryParams]="{ sort: 'newest' }" class="hover:text-white">New Arrivals</a></li>
            <li><a routerLink="/cart" class="hover:text-white">Cart</a></li>
          </ul>
        </div>

        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-beige-300">Company</h3>
          <ul class="space-y-2 text-sm text-beige-200/80">
            <li><a routerLink="/about" class="hover:text-white">About Us</a></li>
            <li><a routerLink="/contact" class="hover:text-white">Contact</a></li>
            <li><a routerLink="/faq" class="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-beige-300">Policies</h3>
          <ul class="space-y-2 text-sm text-beige-200/80">
            <li><a routerLink="/policies/privacy" class="hover:text-white">Privacy Policy</a></li>
            <li><a routerLink="/policies/terms" class="hover:text-white">Terms &amp; Conditions</a></li>
            <li><a routerLink="/policies/shipping" class="hover:text-white">Shipping Policy</a></li>
            <li><a routerLink="/policies/refund" class="hover:text-white">Returns &amp; Refunds</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10">
        <div class="container-vitalora flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <form (ngSubmit)="subscribe()" class="flex w-full max-w-sm items-center overflow-hidden rounded-full bg-white/10 sm:w-auto">
            <input
              type="email"
              name="newsletterEmail"
              [(ngModel)]="email"
              required
              placeholder="Your email for wellness tips"
              class="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-beige-200/60 outline-none sm:w-56"
            />
            <button type="submit" class="shrink-0 rounded-full bg-beige-500 px-4 py-2 text-sm font-semibold text-charcoal-900 m-1 transition hover:bg-beige-400">
              Subscribe
            </button>
          </form>
          <p class="text-xs text-beige-200/60">© {{ year }} VITALORA Wellness Pvt. Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly toast = inject(ToastService);
  protected readonly year = new Date().getFullYear();
  protected email = '';

  protected readonly socials = [
    { name: 'Instagram', href: 'https://instagram.com', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>' },
    { name: 'Facebook', href: 'https://facebook.com', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M14 9h3V5h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 011-1z"/></svg>' },
    { name: 'Twitter', href: 'https://twitter.com', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M23 4.5c-.8.4-1.7.6-2.6.8a4.5 4.5 0 002-2.5c-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 00-7.7 4.1A12.8 12.8 0 012 3.9a4.5 4.5 0 001.4 6 4.4 4.4 0 01-2-.6v.1a4.5 4.5 0 003.6 4.4c-.6.2-1.3.2-1.9.1a4.5 4.5 0 004.2 3.1A9 9 0 012 19a12.7 12.7 0 006.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.3-2.1z"/></svg>' },
  ];

  protected subscribe(): void {
    const value = this.email.trim();
    if (!value) return;
    this.toast.success('Thanks for subscribing! Watch your inbox for wellness tips.');
    this.email = '';
  }
}
