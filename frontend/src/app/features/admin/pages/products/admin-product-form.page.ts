import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { ProductDetail, ProductSpecRequest, ProductVariantRequest } from '../../../../core/models/product.model';
import { BrandService } from '../../../../core/services/brand.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ProductService } from '../../../../core/services/product.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [MediaUrlPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-form.page.html',
})
export class AdminProductFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly categories = signal<Category[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly productId = signal<number | null>(null);
  protected readonly product = signal<ProductDetail | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploadingImage = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    slug: [''],
    sku: ['', [Validators.required, Validators.maxLength(60)]],
    brandId: [null as number | null, Validators.required],
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
    /**
     * Off keeps the product single-SKU and the price/stock fields above
     * authoritative; on hands control to the variants array below.
     */
    hasVariants: [false],
    variants: this.fb.array([] as FormGroup[]),
    specs: this.fb.array([] as FormGroup[]),
  });

  protected get variants(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  protected get specs(): FormArray {
    return this.form.get('specs') as FormArray;
  }

  protected get isEdit(): boolean {
    return this.productId() !== null;
  }

  constructor() {
    this.categoryService.getAllForAdmin().subscribe((c) => this.categories.set(c));
    this.brandService.getAllForAdmin().subscribe((b) => this.brands.set(b));

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
          brandId: p.brand?.id ?? null,
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
          hasVariants: p.variants.length > 1,
        });
        this.variants.clear();
        p.variants.forEach((v) => this.variants.push(this.variantGroup(v)));
        this.specs.clear();
        p.specs.forEach((sp) => this.specs.push(this.specGroup(sp.label, sp.value)));
      });
    } else {
      inject(SeoService).update('New Product');
    }
  }

  private variantGroup(v?: Partial<ProductVariantRequest> & { label?: string | null }): FormGroup {
    return this.fb.nonNullable.group({
      id: [v?.id ?? null as number | null],
      sku: [v?.sku ?? '', [Validators.required, Validators.maxLength(60)]],
      flavour: [v?.flavour ?? ''],
      sizeLabel: [v?.sizeLabel ?? ''],
      sizeValue: [v?.sizeValue ?? null as number | null],
      sizeUnit: [v?.sizeUnit ?? ''],
      price: [v?.price ?? 0, [Validators.required, Validators.min(0)]],
      salePrice: [v?.salePrice ?? null as number | null],
      stockQuantity: [v?.stockQuantity ?? 0, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [v?.lowStockThreshold ?? 15, Validators.min(0)],
      active: [v?.active ?? true],
      defaultVariant: [v?.defaultVariant ?? false],
    });
  }

  private specGroup(label = '', value = ''): FormGroup {
    return this.fb.nonNullable.group({ label: [label], value: [value] });
  }

  protected addSpec(): void {
    this.specs.push(this.specGroup());
  }

  protected removeSpec(index: number): void {
    this.specs.removeAt(index);
  }

  protected addVariant(): void {
    // Seed a new row from the product's own price so the common case is one edit.
    const base = this.form.getRawValue();
    this.variants.push(
      this.variantGroup({
        sku: `${base.sku}-${this.variants.length + 1}`,
        price: base.price,
        stockQuantity: 0,
        defaultVariant: this.variants.length === 0,
      }),
    );
    this.form.patchValue({ hasVariants: true });
  }

  protected removeVariant(index: number): void {
    const wasDefault = this.variants.at(index).getRawValue().defaultVariant;
    this.variants.removeAt(index);
    // Never leave the product without a preselected option.
    if (wasDefault && this.variants.length > 0) {
      this.setDefaultVariant(0);
    }
  }

  /** Exactly one row may be the default, so selecting one clears the rest. */
  protected setDefaultVariant(index: number): void {
    this.variants.controls.forEach((ctrl, i) => ctrl.patchValue({ defaultVariant: i === index }));
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
    const { hasVariants, variants, specs, ...base } = this.form.getRawValue();
    const request = {
      ...base,
      brandId: base.brandId as number,
      // An empty list tells the API to keep one default variant in step with
      // the product's own price and stock.
      variants: hasVariants
        ? (variants as ProductVariantRequest[]).map((v, i) => ({ ...v, displayOrder: i }))
        : [],
      specs: (specs as ProductSpecRequest[])
        .filter((sp) => sp.label?.trim() && sp.value?.trim())
        .map((sp, i) => ({ ...sp, displayOrder: i })),
    };
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

  protected moveImage(index: number, delta: -1 | 1): void {
    const id = this.productId();
    const images = this.product()?.images;
    if (!id || !images) return;
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const ids = images.map((img) => img.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    this.productService.reorderImages(id, ids).subscribe((p) => this.product.set(p));
  }

  protected makePrimary(imageId: number): void {
    const id = this.productId();
    if (!id) return;
    this.productService.updateImage(id, imageId, { primary: true }).subscribe((p) => {
      this.product.set(p);
      this.toast.success('Main image updated.');
    });
  }

  protected saveAltText(imageId: number, altText: string, current: string | null): void {
    const id = this.productId();
    if (!id || altText.trim() === (current ?? '').trim()) return;
    this.productService.updateImage(id, imageId, { altText }).subscribe((p) => {
      this.product.set(p);
      this.toast.success('Image description saved.');
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
