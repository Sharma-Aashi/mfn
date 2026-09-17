import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContactInfo } from '../../core/models/cms.model';
import { CmsService } from '../../core/services/cms.service';
import { ContactService } from '../../core/services/contact.service';
import { SeoService } from '../../core/services/seo.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';

/** Only Google Maps embeds may be framed - the URL comes from admin-editable content. */
const ALLOWED_MAP_PREFIXES = ['https://www.google.com/maps/embed', 'https://maps.google.com/maps'];

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './contact.page.html',
})
export class ContactPage {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly cmsService = inject(CmsService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly siteSettings = inject(SiteSettingsService);

  protected readonly info = signal<ContactInfo | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly mapUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.info()?.mapEmbedUrl?.trim();
    if (!url || !ALLOWED_MAP_PREFIXES.some((p) => url.startsWith(p))) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly socials = computed(() => {
    const s = this.siteSettings.social();
    const all: { name: IconName; label: string; href: string }[] = [
      { name: 'instagram', label: 'Instagram', href: s.instagram },
      { name: 'facebook', label: 'Facebook', href: s.facebook },
      { name: 'twitter', label: 'X (Twitter)', href: s.twitter },
      { name: 'youtube', label: 'YouTube', href: s.youtube },
    ];
    return all.filter((x) => !!x.href?.trim());
  });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', [Validators.required, Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  constructor() {
    inject(SeoService).update('Contact Us', 'Get in touch with our team for questions about products, orders or partnerships.');
    this.cmsService.getContact().subscribe((c) => this.info.set(c.info));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.contactService.submit(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.form.reset();
      },
      error: () => this.submitting.set(false),
    });
  }
}
