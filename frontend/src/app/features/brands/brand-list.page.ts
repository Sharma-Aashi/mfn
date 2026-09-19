import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand } from '../../core/models/brand.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { BrandService } from '../../core/services/brand.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [RouterLink, MediaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-vitalora py-10 sm:py-14">
      <header class="mb-8">
        <h1 class="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Shop by brand</h1>
        <p class="mt-2 max-w-2xl text-charcoal-600">
          Every brand we list is sourced through authorised channels, alongside our own label.
        </p>
      </header>

      @if (houseBrands().length > 0) {
        <section class="mb-10">
          <h2 class="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-500">Our own label</h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            @for (b of houseBrands(); track b.id) {
              <a
                [routerLink]="['/brands', b.slug]"
                class="flex flex-col items-center gap-3 rounded-2xl border-2 border-forest-700 bg-white p-5 text-center transition hover:shadow-lift"
              >
                @if (b.logoUrl) {
                  <img [src]="b.logoUrl | mediaUrl" [alt]="b.name" class="h-12 w-auto object-contain" />
                } @else {
                  <span class="font-display text-lg font-semibold text-forest-800">{{ b.name }}</span>
                }
                <span class="text-xs text-charcoal-500">{{ b.productCount }} product{{ b.productCount === 1 ? '' : 's' }}</span>
              </a>
            }
          </div>
        </section>
      }

      <section>
        @if (partnerBrands().length > 0) {
          <h2 class="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-500">All brands</h2>
        }
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (b of partnerBrands(); track b.id) {
            <a
              [routerLink]="['/brands', b.slug]"
              class="flex flex-col items-center gap-3 rounded-2xl border border-charcoal-100 bg-white p-5 text-center transition hover:border-forest-300 hover:shadow-card"
            >
              @if (b.logoUrl) {
                <img [src]="b.logoUrl | mediaUrl" [alt]="b.name" class="h-12 w-auto object-contain" />
              } @else {
                <span class="font-display text-lg font-semibold text-charcoal-800">{{ b.name }}</span>
              }
              <span class="text-xs text-charcoal-500">{{ b.productCount }} product{{ b.productCount === 1 ? '' : 's' }}</span>
            </a>
          } @empty {
            @if (houseBrands().length === 0) {
              <p class="col-span-full rounded-2xl border border-dashed border-charcoal-200 p-8 text-center text-charcoal-500">
                No brands listed yet.
              </p>
            }
          }
        </div>
      </section>
    </div>
  `,
})
export class BrandListPage {
  private readonly brandService = inject(BrandService);

  protected readonly brands = signal<Brand[]>([]);

  protected readonly houseBrands = computed(() => this.brands().filter((b) => b.houseBrand));
  protected readonly partnerBrands = computed(() => this.brands().filter((b) => !b.houseBrand));

  constructor() {
    inject(SeoService).update('Shop by Brand');
    this.brandService.getAllActive().subscribe((b) => this.brands.set(b));
  }
}
