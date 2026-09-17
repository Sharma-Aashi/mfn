import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [MediaUrlPipe, ReactiveFormsModule],
  templateUrl: './admin-category-list.page.html',
})
export class AdminCategoryListPage {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploadingImageId = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: [''],
    description: [''],
    displayOrder: [0],
    active: [true],
  });

  constructor() {
    inject(SeoService).update('Manage Categories');
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.categoryService.getAllForAdmin().subscribe((c) => {
      this.categories.set(c);
      this.loading.set(false);
    });
  }

  protected openNew(): void {
    this.editingId.set(null);
    this.form.reset({ displayOrder: 0, active: true });
    this.formOpen.set(true);
  }

  protected openEdit(c: Category): void {
    this.editingId.set(c.id);
    this.form.reset({ name: c.name, slug: c.slug, description: c.description ?? '', displayOrder: c.displayOrder, active: c.active });
    this.formOpen.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = this.form.getRawValue();
    const obs = id ? this.categoryService.update(id, request) : this.categoryService.create(request);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(id ? 'Category updated.' : 'Category created.');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected toggleStatus(c: Category): void {
    this.categoryService.updateStatus(c.id, !c.active).subscribe(() => {
      this.toast.success(`${c.name} is now ${!c.active ? 'active' : 'inactive'}.`);
      this.load();
    });
  }

  protected onImageSelected(event: Event, category: Category): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingImageId.set(category.id);
    this.categoryService.uploadImage(category.id, file).subscribe({
      next: () => {
        this.uploadingImageId.set(null);
        input.value = '';
        this.load();
      },
      error: () => this.uploadingImageId.set(null),
    });
  }

  protected async remove(c: Category): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete category',
      message: `Delete "${c.name}"? Categories with assigned products cannot be deleted.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    this.categoryService.delete(c.id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.load();
      },
    });
  }
}
