import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-6">
      @for (t of toastService.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-lift ring-1 transition-all"
          [class]="containerClass(t.type)"
          role="status"
        >
          <span class="mt-0.5 shrink-0">
            @switch (t.type) {
              @case ('success') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
              }
              @case ('error') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>
              }
              @default {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8h.01M12 11v5"/></svg>
              }
            }
          </span>
          <p class="flex-1 text-sm font-medium">{{ t.message }}</p>
          <button type="button" (click)="toastService.dismiss(t.id)" class="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected containerClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-forest-800 text-white ring-forest-900';
      case 'error':
        return 'bg-red-600 text-white ring-red-700';
      default:
        return 'bg-charcoal-800 text-white ring-charcoal-900';
    }
  }
}
