import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Brand } from '../../core/models/brand.model';
import { ProductSummary } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { BrandService } from '../../core/services/brand.service';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-brand-detail',
  standalone: true,
  imports: [RouterLink, MediaUrlPipe, ProductCardComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (notFound()) {
      <div class="container-vitalora py-20 text-center">
        <h1 class="font-display text-2xl font-semibold text-charcoal-900">Brand not found</h1>
        <a routerLink="/brands" class="mt-4 inline-block font-semibold text-forest-700 hover:underline">
          Browse all brands
        </a>
      </div>
    } @else if (brand(); as b) {
      <div class="container-vitalora py-10 sm:py-14">
        <nav class="mb-6 text-sm text-charcoal-500">
          <a routerLink="/brands" class="hover:text-forest-700">Brands</a>
          <span class="mx-2">/</span>
          <span class="text-charcoal-800">{{ b.name }}</span>
        </nav>

        <header class="mb-8 flex flex-col gap-4 rounded-2xl border border-charcoal-100 bg-white p-6 sm:flex-row sm:items-center sm:gap-6">
          @if (b.logoUrl) {
            <img [src]="b.logoUrl | mediaUrl" [alt]="b.name" class="h-16 w-auto shrink-0 object-contain" />
          }
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="font-display text-2xl font-semibold text-charcoal-900">{{ b.name }}</h1>
              @if (b.houseBrand) {
                <span class="rounded-full bg-forest-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Our label
                </span>
              } @else if (b.authorizedReseller) {
                <span class="rounded-full bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
                  Authorised seller
                </span>
              }
            </div>
            @if (b.description) {
              <p class="mt-2 max-w-2xl leading-relaxed text-charcoal-600">{{ b.description }}</p>
            }
            <p class="mt-2 text-sm text-charcoal-500">
              {{ b.productCount }} product{{ b.productCount === 1 ? '' : 's' }}
              @if (b.countryOfOrigin) {
                <span class="mx-1.5 text-charcoal-300">•</span>{{ b.countryOfOrigin }}
              }
            </p>
          </div>
        </header>

        @if (products().length > 0) {
          <div class="grid grid-cols-2 gap-5 lg:grid-cols-4">
            @for (p of products(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
          @if (totalPages() > 1) {
            <div class="mt-10">
              <app-pagination [page]="page()" [totalPages]="totalPages()" (pageChange)="goToPage($event)" />
            </div>
          }
        } @else {
          <p class="rounded-2xl border border-dashed border-charcoal-200 p-10 text-center text-charcoal-500">
            Nothing from this brand is in the catalogue yet.
          </p>
        }
      </div>
    }
  `,
})
export class BrandDetailPage {
  private readonly brandService = inject(BrandService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly brand = signal<Brand | null>(null);
  protected readonly products = signal<ProductSummary[]>([]);
  protected readonly notFound = signal(false);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);

  private slug = '';

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;
      this.slug = slug;
      this.notFound.set(false);
      this.page.set(0);

      this.brandService.getBySlug(slug).subscribe({
        next: (b) => {
          this.brand.set(b);
          this.seo.update(b.name, b.description ?? undefined);
          this.loadProducts(0);
        },
        error: () => this.notFound.set(true),
      });
    });
  }

  protected goToPage(page: number): void {
    this.loadProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadProducts(page: number): void {
    this.productService.search({ brands: [this.slug], page, size: 12 }).subscribe((res) => {
      this.products.set(res.content);
      this.page.set(res.page);
      this.totalPages.set(res.totalPages);
    });
  }
}
