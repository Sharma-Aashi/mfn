import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-flex items-center rounded-full border border-charcoal-200 bg-white">
      <button
        type="button"
        (click)="dec()"
        [disabled]="value() <= min()"
        class="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-600 transition hover:bg-beige-100 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14" /></svg>
      </button>
      <span class="w-8 text-center text-sm font-semibold text-charcoal-900" aria-live="polite">{{ value() }}</span>
      <button
        type="button"
        (click)="inc()"
        [disabled]="value() >= max()"
        class="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-600 transition hover:bg-beige-100 disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  `,
})
export class QuantityStepperComponent {
  value = input.required<number>();
  min = input(1);
  max = input(99);
  valueChange = output<number>();

  protected inc(): void {
    if (this.value() < this.max()) this.valueChange.emit(this.value() + 1);
  }

  protected dec(): void {
    if (this.value() > this.min()) this.valueChange.emit(this.value() - 1);
  }
}
