import { Component, effect, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeoService } from '../../../../core/services/seo.service';
import { SiteSettingsService } from '../../../../core/services/site-settings.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ImageUploadFieldComponent } from '../../../../shared/components/image-upload-field/image-upload-field.component';

type NavLinkGroup = FormGroup<{ label: FormControl<string>; path: FormControl<string> }>;

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [ReactiveFormsModule, ImageUploadFieldComponent],
  templateUrl: './admin-settings.page.html',
})
export class AdminSettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly siteSettings = inject(SiteSettingsService);
  private readonly toast = inject(ToastService);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    brand: this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      tagline: [''],
      logoUrl: [''],
    }),
    footer: this.fb.nonNullable.group({
      about: [''],
      copyrightName: ['', Validators.required],
    }),
    social: this.fb.nonNullable.group({
      instagram: [''],
      facebook: [''],
      twitter: [''],
      youtube: [''],
    }),
    navLinks: new FormArray<NavLinkGroup>([]),
    commerce: this.fb.nonNullable.group({
      freeShippingThreshold: [999, [Validators.required, Validators.min(0)]],
      shippingFee: [79, [Validators.required, Validators.min(0)]],
      estimatedDeliveryDays: [5, [Validators.required, Validators.min(1), Validators.max(60)]],
    }),
  });

  protected get navLinks(): FormArray<NavLinkGroup> {
    return this.form.controls.navLinks;
  }

  constructor() {
    inject(SeoService).update('Site Settings');
    this.siteSettings.load();

    // Re-sync the form whenever saved settings arrive, unless the admin has
    // already started editing (don't clobber in-progress changes).
    effect(() => {
      const s = this.siteSettings.settings();
      if (this.form.dirty) return;
      this.form.patchValue({ brand: s.brand, footer: s.footer, social: s.social, commerce: s.commerce }, { emitEvent: false });
      this.navLinks.clear({ emitEvent: false });
      s.nav.links.forEach((l) => this.navLinks.push(this.navLinkGroup(l.label, l.path), { emitEvent: false }));
      this.form.markAsPristine();
    });
  }

  private navLinkGroup(label = '', path = ''): NavLinkGroup {
    return this.fb.nonNullable.group({
      label: [label, Validators.required],
      path: [path, Validators.required],
    });
  }

  protected addNavLink(): void {
    this.navLinks.push(this.navLinkGroup());
    this.form.markAsDirty();
  }

  protected removeNavLink(index: number): void {
    this.navLinks.removeAt(index);
    this.form.markAsDirty();
  }

  protected moveNavLink(index: number, delta: -1 | 1): void {
    const target = index + delta;
    if (target < 0 || target >= this.navLinks.length) return;
    const control = this.navLinks.at(index);
    this.navLinks.removeAt(index);
    this.navLinks.insert(target, control);
    this.form.markAsDirty();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields.');
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.siteSettings
      .update({
        brand: v.brand,
        footer: v.footer,
        social: v.social,
        nav: { links: v.navLinks },
        commerce: v.commerce,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.markAsPristine();
          this.toast.success('Site settings saved. Changes are live on the storefront.');
        },
        error: () => this.saving.set(false),
      });
  }
}
