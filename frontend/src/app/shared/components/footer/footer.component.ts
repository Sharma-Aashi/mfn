import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule, BrandLogoComponent, IconComponent],
  template: `
    <footer class="border-t border-charcoal-100 bg-forest-950 text-beige-100">
      <div class="container-vitalora grid grid-cols-2 gap-10 py-14 sm:grid-cols-2 md:grid-cols-5">
        <div class="col-span-2">
          <div class="mb-3">
            <app-brand-logo [size]="28" variant="light" nameSize="text-xl" />
          </div>
          <p class="max-w-xs text-sm leading-relaxed text-beige-200/80">{{ settings.footer().about }}</p>
          @if (socials().length > 0) {
            <div class="mt-5 flex gap-3">
              @for (social of socials(); track social.name) {
                <a
                  [href]="social.href"
                  [attr.aria-label]="social.label"
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  target="_blank"
                  rel="noopener"
                >
                  <app-icon [name]="social.name" />
                </a>
              }
            </div>
          }
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
              aria-label="Email address"
              placeholder="Your email for wellness tips"
              class="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-beige-200/60 outline-none sm:w-56"
            />
            <button type="submit" class="m-1 shrink-0 rounded-full bg-beige-500 px-4 py-2 text-sm font-semibold text-charcoal-900 transition hover:bg-beige-400">
              Subscribe
            </button>
          </form>
          <p class="text-xs text-beige-200/60">© {{ year }} {{ settings.footer().copyrightName }}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly toast = inject(ToastService);
  protected readonly settings = inject(SiteSettingsService);
  protected readonly year = new Date().getFullYear();
  protected email = '';

  /** Only the networks the admin has actually filled in get an icon. */
  protected readonly socials = computed(() => {
    const s = this.settings.social();
    const all: { name: IconName; label: string; href: string }[] = [
      { name: 'instagram', label: 'Instagram', href: s.instagram },
      { name: 'facebook', label: 'Facebook', href: s.facebook },
      { name: 'twitter', label: 'X (Twitter)', href: s.twitter },
      { name: 'youtube', label: 'YouTube', href: s.youtube },
    ];
    return all.filter((x) => !!x.href?.trim());
  });

  protected subscribe(): void {
    const value = this.email.trim();
    if (!value) return;
    this.toast.success('Thanks for subscribing! Watch your inbox for wellness tips.');
    this.email = '';
  }
}
