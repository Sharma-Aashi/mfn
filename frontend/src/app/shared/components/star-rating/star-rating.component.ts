import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-0.5" [attr.aria-label]="rating() + ' out of 5 stars'">
      @for (star of stars(); track $index) {
        <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 20 20" class="shrink-0">
          <defs>
            <linearGradient [attr.id]="'star-grad-' + gradId + '-' + $index">
              <stop [attr.offset]="star * 100 + '%'" stop-color="var(--color-beige-500)" />
              <stop [attr.offset]="star * 100 + '%'" stop-color="#e5e0d5" />
            </linearGradient>
          </defs>
          <path
            [attr.fill]="'url(#star-grad-' + gradId + '-' + $index + ')'"
            d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.77l-5.18 2.68.99-5.77-4.19-4.09 5.79-.84L10 1.5z"
          />
        </svg>
      }
      @if (showValue()) {
        <span class="ml-1 text-sm font-medium text-charcoal-600">{{ rating().toFixed(1) }}</span>
      }
    </span>
  `,
})
export class StarRatingComponent {
  rating = input(0);
  size = input(16);
  showValue = input(false);
  protected gradId = Math.random().toString(36).slice(2, 8);

  protected stars = computed(() => {
    const r = Math.max(0, Math.min(5, this.rating()));
    return Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, r - i)));
  });
}
