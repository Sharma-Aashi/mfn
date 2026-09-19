import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brand } from '../../../../core/models/brand.model';
import { MediaUrlPipe } from '../../../../core/pipes/media-url.pipe';
import { BrandService } from '../../../../core/services/brand.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-brand-list',
  standalone: true,
  imports: [MediaUrlPipe, ReactiveFormsModule],
  templateUrl: './admin-brand-list.page.html',
})
export class AdminBrandListPage {
  private readonly fb = inject(FormBuilder);
  private readonly brandService = inject(BrandService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(true);
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploadingLogoId = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: [''],
    description: [''],
    countryOfOrigin: [''],
    websiteUrl: [''],
    houseBrand: [false],
    authorizedReseller: [false],
    displayOrder: [0],
    featured: [false],
    active: [true],
  });

  constructor() {
    inject(SeoService).update('Manage Brands');
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.brandService.getAllForAdmin().subscribe({
      next: (b) => {
        this.brands.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openNew(): void {
    this.editingId.set(null);
    this.form.reset({ displayOrder: 0, active: true, featured: false, houseBrand: false, authorizedReseller: false });
    this.formOpen.set(true);
  }

  protected openEdit(b: Brand): void {
    this.editingId.set(b.id);
    this.form.reset({
      name: b.name,
      slug: b.slug,
      description: b.description ?? '',
      countryOfOrigin: b.countryOfOrigin ?? '',
      websiteUrl: b.websiteUrl ?? '',
      houseBrand: b.houseBrand,
      authorizedReseller: b.authorizedReseller,
      displayOrder: b.displayOrder,
      featured: b.featured,
      active: b.active,
    });
    this.formOpen.set(true);
  }

  protected close(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const request = this.form.getRawValue();
    const id = this.editingId();
    const obs = id ? this.brandService.update(id, request) : this.brandService.create(request);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id ? 'Brand updated.' : 'Brand created.');
        this.close();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected toggleStatus(b: Brand): void {
    this.brandService.updateStatus(b.id, !b.active).subscribe(() => this.load());
  }

  protected async remove(b: Brand): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete brand',
      message: `Delete "${b.name}"? This only works when no products are left on it.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    this.brandService.delete(b.id).subscribe(() => {
      this.toast.success('Brand deleted.');
      this.load();
    });
  }

  protected onLogoSelected(event: Event, b: Brand): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingLogoId.set(b.id);
    this.brandService.uploadLogo(b.id, file).subscribe({
      next: () => {
        this.uploadingLogoId.set(null);
        input.value = '';
        this.load();
      },
      error: () => this.uploadingLogoId.set(null),
    });
  }
}
