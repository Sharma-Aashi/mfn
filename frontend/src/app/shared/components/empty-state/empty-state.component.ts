import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-charcoal-200 bg-white/60 px-6 py-16 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-beige-100 text-forest-600">
        <ng-content select="[icon]" />
      </div>
      <h3 class="font-display text-lg font-semibold text-charcoal-900">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1.5 max-w-sm text-sm text-charcoal-500">{{ description() }}</p>
      }
      <div class="mt-5">
        <ng-content select="[action]" />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  title = input.required<string>();
  description = input<string>();
}
