import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';
import { SiteSettingsService } from '../../../core/services/site-settings.service';

/**
 * The brand mark, driven by admin site settings.
 *
 * With no uploaded logo it falls back to a typographic wordmark rather than a
 * generic glyph: the last word of the brand name drops to a second line, set
 * small and letterspaced in the accent colour. For "MUSCLE FREAK NUTRITION"
 * that reads as a designed lockup; for a single-word brand it is just the one
 * line, so the rule holds either way.
 */
@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [MediaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (brand().logoUrl) {
      <img
        [src]="brand().logoUrl | mediaUrl"
        [alt]="brand().name + ' logo'"
        class="w-auto object-contain"
        [style.height.px]="size()"
      />
    } @else {
      <span class="flex flex-col justify-center leading-none">
        <span class="font-display font-extrabold tracking-[-0.025em]" [class]="headClass()" [style.font-size.px]="size()">
          {{ head() }}
        </span>
        @if (tail()) {
          <!-- A hair of negative margin: the two lines are different sizes, so
               their left side bearings do not line up on their own. -->
          <span
            class="font-display font-bold"
            [class]="tailClass()"
            [style.font-size.px]="tailSize()"
            [style.letter-spacing.em]="0.345"
            [style.margin-left.px]="-1"
            [style.margin-top.px]="4"
          >
            {{ tail() }}
          </span>
        }
      </span>
    }
  `,
})
export class BrandLogoComponent {
  private readonly siteSettings = inject(SiteSettingsService);

  /** Cap height of the first line, in px. The second line scales off it. */
  size = input(22);
  /** "dark" for light backgrounds (header), "light" for dark ones (footer, admin). */
  variant = input<'dark' | 'light'>('dark');

  protected readonly brand = this.siteSettings.brand;

  private readonly words = computed(() => this.brand().name.trim().split(/\s+/).filter(Boolean));

  protected readonly head = computed(() => {
    const w = this.words();
    return w.length > 1 ? w.slice(0, -1).join(' ') : w.join(' ');
  });

  protected readonly tail = computed(() => {
    const w = this.words();
    return w.length > 1 ? w[w.length - 1] : '';
  });

  protected readonly tailSize = computed(() => Math.max(8, Math.round(this.size() * 0.46)));

  protected readonly headClass = computed(() =>
    this.variant() === 'dark' ? 'text-charcoal-900' : 'text-white',
  );

  protected readonly tailClass = computed(() =>
    this.variant() === 'dark' ? 'text-forest-700' : 'text-forest-300',
  );
}
