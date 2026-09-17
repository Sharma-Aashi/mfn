import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';
import { SiteSettingsService } from '../../../core/services/site-settings.service';

/**
 * The brand mark + name, driven by admin site settings. Falls back to the
 * built-in leaf mark when no logo has been uploaded.
 */
@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [MediaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="flex shrink-0 items-center gap-2">
      @if (brand().logoUrl) {
        <img
          [src]="brand().logoUrl | mediaUrl"
          [alt]="brand().name + ' logo'"
          class="w-auto object-contain"
          [style.height.px]="size()"
        />
      } @else {
        <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="20" [attr.fill]="circleFill()" />
          <path d="M20 30c-6-2-9-7-9-13 0-2 .3-4 1-6 3 1 6 3 8 6 2-3 5-5 8-6 .7 2 1 4 1 6 0 6-3 11-9 13z" [attr.fill]="leafFill()" />
        </svg>
      }
      @if (showName()) {
        <span class="font-display font-semibold tracking-wide" [class]="nameClass()">{{ brand().name }}</span>
      }
    </span>
  `,
})
export class BrandLogoComponent {
  private readonly siteSettings = inject(SiteSettingsService);

  size = input(30);
  showName = input(true);
  /** "dark" for light backgrounds (header), "light" for dark backgrounds (footer, admin). */
  variant = input<'dark' | 'light'>('dark');
  nameSize = input('text-xl sm:text-2xl');

  protected readonly brand = this.siteSettings.brand;
  protected readonly circleFill = computed(() => (this.variant() === 'dark' ? '#1f3d24' : '#e3d3ab'));
  protected readonly leafFill = computed(() => (this.variant() === 'dark' ? '#e3d3ab' : '#1f3d24'));
  protected readonly nameClass = computed(
    () => `${this.nameSize()} ${this.variant() === 'dark' ? 'text-forest-800' : 'text-white'}`,
  );
}
