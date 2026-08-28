import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-1.5" aria-label="Pagination">
        <button type="button" [disabled]="page() === 0" (click)="pageChange.emit(page() - 1)" class="nav-btn" aria-label="Previous page">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        @for (p of visiblePages(); track p) {
          @if (p === -1) {
            <span class="px-1 text-charcoal-400">…</span>
          } @else {
            <button
              type="button"
              (click)="pageChange.emit(p)"
              class="page-btn"
              [class.page-btn-active]="p === page()"
            >
              {{ p + 1 }}
            </button>
          }
        }

        <button type="button" [disabled]="page() >= totalPages() - 1" (click)="pageChange.emit(page() + 1)" class="nav-btn" aria-label="Next page">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </nav>
    }
  `,
  styles: [
    `
      .nav-btn, .page-btn {
        display: inline-flex;
        height: 2.25rem;
        min-width: 2.25rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-charcoal-600);
        transition: background-color 0.15s, color 0.15s;
      }
      .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .nav-btn:not(:disabled):hover, .page-btn:hover { background-color: var(--color-beige-100); }
      .page-btn-active { background-color: var(--color-forest-700); color: white; }
      .page-btn-active:hover { background-color: var(--color-forest-800); }
    `,
  ],
})
export class PaginationComponent {
  page = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  protected visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages: number[] = [];
    const window = 1;

    for (let i = 0; i < total; i++) {
      if (i === 0 || i === total - 1 || Math.abs(i - current) <= window) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  });
}
