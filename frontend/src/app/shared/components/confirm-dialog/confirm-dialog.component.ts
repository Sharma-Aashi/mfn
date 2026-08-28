import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (confirmService.state(); as state) {
      <div class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-charcoal-900/50" (click)="confirmService.respond(false)"></div>
        <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" role="alertdialog" aria-modal="true">
          <h2 class="font-display text-lg font-semibold text-charcoal-900">{{ state.title }}</h2>
          <p class="mt-2 text-sm text-charcoal-500">{{ state.message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" (click)="confirmService.respond(false)" class="rounded-full border border-charcoal-200 px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-charcoal-50">
              {{ state.cancelText }}
            </button>
            <button
              type="button"
              (click)="confirmService.respond(true)"
              class="rounded-full px-4 py-2 text-sm font-semibold text-white"
              [class]="state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-forest-700 hover:bg-forest-800'"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirmService = inject(ConfirmService);
}
