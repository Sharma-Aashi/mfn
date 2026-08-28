import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category } from '../../../../core/models/category.model';
import { ProductDetail } from '../../../../core/models/product.model';
import { CategoryService } from '../../../../core/services/category.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ProductService } from '../../../../core/services/product.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-form.page.html',
})
export class AdminProductFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly categories = signal<Category[]>([]);
  protected readonly productId = signal<number | null>(null);
  protected readonly product = signal<ProductDetail | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploadingImage = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    slug: [''],
    sku: ['', [Validators.required, Validators.maxLength(60)]],
    shortDescription: ['', Validators.maxLength(500)],
    description: [''],
    benefits: [''],
    ingredients: [''],
    nutritionalInfo: [''],
    usageInstructions: [''],
    warnings: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    salePrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [15, Validators.min(0)],
    tags: [''],
    active: [true],
    featured: [false],
    bestSeller: [false],
    newArrival: [false],
    categoryIds: [[] as number[]],
  });

  protected get isEdit(): boolean {
    return this.productId() !== null;
  }

  constructor() {
    this.categoryService.getAllForAdmin().subscribe((c) => this.categories.set(c));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.productId.set(id);
      inject(SeoService).update('Edit Product');
      this.productService.getById(id).subscribe((p) => {
        this.product.set(p);
        this.form.patchValue({
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          shortDescription: p.shortDescription ?? '',
          description: p.description ?? '',
          benefits: p.benefits ?? '',
          ingredients: p.ingredients ?? '',
          nutritionalInfo: p.nutritionalInfo ?? '',
          usageInstructions: p.usageInstructions ?? '',
          warnings: p.warnings ?? '',
          price: p.price,
          salePrice: p.salePrice,
          stockQuantity: p.stockQuantity,
          lowStockThreshold: p.lowStockThreshold,
          tags: p.tags ?? '',
          active: p.active,
          featured: p.featured,
          bestSeller: p.bestSeller,
          newArrival: p.newArrival,
          categoryIds: p.categories.map((c) => c.id),
        });
      });
    } else {
      inject(SeoService).update('New Product');
    }
  }

  protected toggleCategory(id: number): void {
    const current = this.form.value.categoryIds ?? [];
    this.form.patchValue({
      categoryIds: current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    });
  }

  protected isCategorySelected(id: number): boolean {
    return (this.form.value.categoryIds ?? []).includes(id);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields.');
      return;
    }
    this.saving.set(true);
    const request = this.form.getRawValue();
    const id = this.productId();
    const obs = id ? this.productService.update(id, request) : this.productService.create(request);
    obs.subscribe({
      next: (p) => {
        this.saving.set(false);
        this.toast.success(id ? 'Product updated.' : 'Product created.');
        if (!id) {
          this.router.navigate(['/admin/products', p.id, 'edit']);
        } else {
          this.product.set(p);
        }
      },
      error: () => this.saving.set(false),
    });
  }

  protected onImageSelected(event: Event, primary = false): void {
    const id = this.productId();
    if (!id) {
      this.toast.info('Save the product first, then add images.');
      return;
    }
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingImage.set(true);
    this.productService.addImage(id, file, primary).subscribe({
      next: (p) => {
        this.product.set(p);
        this.uploadingImage.set(false);
        input.value = '';
      },
      error: () => this.uploadingImage.set(false),
    });
  }

  protected async removeImage(imageId: number): Promise<void> {
    const id = this.productId();
    if (!id) return;
    const confirmed = await this.confirmService.confirm({ title: 'Remove image', message: 'Remove this product image?', confirmText: 'Remove', danger: true });
    if (!confirmed) return;
    this.productService.deleteImage(id, imageId).subscribe(() => {
      this.productService.getById(id).subscribe((p) => this.product.set(p));
    });
  }
}
