import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactInfo } from '../../../core/models/cms.model';
import { CmsService } from '../../../core/services/cms.service';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  template: `
    <footer class="border-t border-charcoal-100 bg-white text-charcoal-900">
      <div class="container-vitalora flex flex-col gap-10 pt-12 lg:flex-row lg:gap-10">
        <!--
          Link columns, then a rule, then the socials in their own row. The
          sign-up and the scan code sit in a tinted panel on the right rather
          than as a separate band on the home page, which is where they used
          to interrupt the flow of the page.
        -->
        <div class="flex flex-1 flex-col">
          <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10">
            <div class="flex flex-col gap-3">
              <span class="text-[14.5px] font-bold">Get Help</span>
              @for (l of help; track l.path) {
                <a [routerLink]="l.path" class="text-[13.5px] text-charcoal-500 hover:text-forest-700 hover:underline hover:underline-offset-4">{{ l.label }}</a>
              }
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-[14.5px] font-bold">Shop With Us</span>
              @for (l of shop; track l.label) {
                <a [routerLink]="l.path" [queryParams]="l.query ?? null" class="text-[13.5px] text-charcoal-500 hover:text-forest-700 hover:underline hover:underline-offset-4">{{ l.label }}</a>
              }
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-[14.5px] font-bold">About Us</span>
              @for (l of about; track l.path) {
                <a [routerLink]="l.path" class="text-[13.5px] text-charcoal-500 hover:text-forest-700 hover:underline hover:underline-offset-4">{{ l.label }}</a>
              }
            </div>
          </div>

          <div class="my-8 h-px bg-charcoal-100"></div>

          @if (socials().length > 0) {
            <div class="flex gap-3">
              @for (social of socials(); track social.name) {
                <a
                  [href]="social.href"
                  [attr.aria-label]="social.label"
                  target="_blank"
                  rel="noopener"
                  class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-charcoal-900 text-white transition hover:bg-forest-700"
                >
                  <app-icon [name]="social.name" />
                </a>
              }
            </div>
          }

          <div class="mt-6 flex max-w-xl flex-col gap-1.5 text-[12.5px] leading-relaxed text-charcoal-400">
            <span>{{ settings.brand().name }}@if (contact()?.address) {, {{ contact()!.address }}}</span>
            <span>
              @if (contact()?.email) {
                <a [href]="'mailto:' + contact()!.email" class="text-charcoal-500 hover:text-forest-700">{{ contact()!.email }}</a>
              }
              @if (contact()?.email && contact()?.phone) { <span class="px-1">·</span> }
              @if (contact()?.phone) {
                <a [href]="'tel:' + contact()!.phone" class="text-charcoal-500 hover:text-forest-700">{{ contact()!.phone }}</a>
              }
            </span>
          </div>
        </div>

        <div class="w-full shrink-0 bg-beige-50 p-7 lg:w-[380px]">
          <h2 class="font-display text-xl font-extrabold tracking-tight">STAY CONNECTED</h2>
          <p class="mt-2 text-[13px] leading-relaxed text-charcoal-500">
            Back-in-stock alerts, new flavours and the occasional offer. Twice a month, never more.
          </p>

          <label for="footer-email" class="mt-5 block text-[12.5px] font-semibold">Sign up for email</label>
          <form (ngSubmit)="subscribe()" class="mt-2 flex h-11">
            <input
              id="footer-email"
              type="email"
              name="newsletterEmail"
              [(ngModel)]="email"
              required
              placeholder="Enter email"
              class="h-full w-full min-w-0 border border-r-0 border-charcoal-200 bg-white px-3.5 text-[13.5px] outline-none placeholder:text-charcoal-400"
            />
            <button
              type="submit"
              class="h-full shrink-0 px-5 text-[12.5px] font-bold tracking-wider"
              style="background: var(--btn-bg); color: var(--btn-fg); border: 1.5px solid var(--btn-line)"
            >
              SIGN UP
            </button>
          </form>

          <div class="my-6 h-px bg-charcoal-200/60"></div>

          <h2 class="font-display text-xl font-extrabold tracking-tight">SCAN TO SHOP</h2>
          <p class="mt-2 text-[13px] leading-relaxed text-charcoal-500">
            Point your phone camera at the code to open the store.
          </p>
          <div class="mt-4 flex items-center gap-4">
            <img
              src="assets/brand/qr-site.png"
              alt="QR code linking to the store"
              width="96"
              height="96"
              class="h-24 w-24 shrink-0 border border-charcoal-100 bg-white"
            />
            <div class="flex flex-col gap-1.5">
              <span class="text-[12.5px] font-semibold">musclefreaknutrition.in</span>
              <span class="flex items-center gap-1.5 text-[12px] text-charcoal-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="text-forest-700">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Works on any camera
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="container-vitalora mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-charcoal-100 py-4">
        <div class="flex items-center gap-2">
          <span class="mr-1 text-[11.5px] text-charcoal-400">We accept</span>
          @for (m of payments; track m) {
            <span class="flex h-7 items-center rounded-[3px] border border-charcoal-100 px-2.5 text-[11px] font-bold tracking-wide text-charcoal-500">{{ m }}</span>
          }
        </div>
        <div class="flex flex-wrap items-center gap-5">
          @for (k of trustMarks; track k) {
            <span class="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="text-forest-700">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {{ k }}
            </span>
          }
        </div>
      </div>

      <div class="bg-charcoal-900 py-4 text-[12.5px] text-charcoal-300">
        <div class="container-vitalora flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
          <span>© {{ year }} {{ settings.footer().copyrightName }}. All rights reserved.</span>
          @for (p of policies; track p.path) {
            <span class="text-charcoal-600">|</span>
            <a [routerLink]="p.path" class="hover:text-white hover:underline hover:underline-offset-4">{{ p.label }}</a>
          }
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly toast = inject(ToastService);
  private readonly cms = inject(CmsService);
  protected readonly settings = inject(SiteSettingsService);
  protected readonly year = new Date().getFullYear();
  protected email = '';

  /** Address and phone live on the contact page, so there is one place to edit them. */
  protected readonly contact = signal<ContactInfo | null>(null);

  protected readonly help = [
    { label: 'Track your order', path: '/account/orders' },
    { label: 'Contact us', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Shipping policy', path: '/policies/shipping' },
    { label: 'Returns & refunds', path: '/policies/refund' },
  ];

  protected readonly shop = [
    { label: 'All products', path: '/products', query: null as Record<string, string> | null },
    { label: 'Best sellers', path: '/products', query: { sort: 'popular' } },
    { label: 'New arrivals', path: '/products', query: { sort: 'newest' } },
    { label: 'Brands', path: '/brands', query: null },
    { label: 'Your cart', path: '/cart', query: null },
  ];

  protected readonly about = [
    { label: 'Our story', path: '/about' },
    { label: 'Privacy policy', path: '/policies/privacy' },
    { label: 'Terms & conditions', path: '/policies/terms' },
  ];

  protected readonly payments = ['UPI', 'VISA', 'MASTERCARD', 'RuPay', 'COD'];
  protected readonly trustMarks = ['100% genuine', 'Authorised sourcing', 'Secure checkout'];

  protected readonly policies = [
    { label: 'Privacy Policy', path: '/policies/privacy' },
    { label: 'Terms & Conditions', path: '/policies/terms' },
    { label: 'Shipping Policy', path: '/policies/shipping' },
    { label: 'Returns & Refunds', path: '/policies/refund' },
  ];

  /** Only the networks the admin has actually filled in get an icon. */
  protected readonly socials = computed(() => {
    const s = this.settings.social();
    const all: { name: IconName; label: string; href: string }[] = [
      { name: 'facebook', label: 'Facebook', href: s.facebook },
      { name: 'instagram', label: 'Instagram', href: s.instagram },
      { name: 'youtube', label: 'YouTube', href: s.youtube },
      { name: 'twitter', label: 'X (Twitter)', href: s.twitter },
    ];
    return all.filter((x) => !!x.href?.trim());
  });

  constructor() {
    // A footer must never be the reason a page fails to render, so a CMS
    // hiccup just leaves the contact line out.
    this.cms.getContact().subscribe({
      next: (c) => this.contact.set(c.info),
      error: () => this.contact.set(null),
    });
  }

  protected subscribe(): void {
    const value = this.email.trim();
    if (!value) return;
    this.toast.success('Thanks — we will email you when something lands.');
    this.email = '';
  }
}
