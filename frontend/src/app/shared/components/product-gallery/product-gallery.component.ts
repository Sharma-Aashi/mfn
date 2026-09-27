import { ChangeDetectionStrategy, Component, HostListener, computed, effect, input, signal } from '@angular/core';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

export interface GalleryImage {
  url: string;
  alt: string;
}

/** How far the hover lens and the lightbox magnify. */
const HOVER_ZOOM = 2.4;
const LIGHTBOX_ZOOM = 2.6;

/**
 * Product gallery with the two zoom gestures shoppers expect: hover to
 * magnify in place on a mouse, tap to open a full-screen viewer on a phone.
 *
 * <p>Both zoom the same file. The catalogue's photographs are around 1000px,
 * which is enough to fill the frame but not enough to reward a hard zoom, so
 * this is built to look right the day bigger originals arrive rather than to
 * disguise that they have not.
 */
@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [MediaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <!--
        object-contain, not cover: a tub cropped to a square loses its lid,
        and on a product page that is the thing being sold.
      -->
      <button
        type="button"
        (click)="openLightbox()"
        (mousemove)="onHoverMove($event)"
        (mouseenter)="hovering.set(true)"
        (mouseleave)="hovering.set(false)"
        class="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl border border-charcoal-100 bg-white"
        [attr.aria-label]="'Open ' + active().alt + ' full screen'"
      >
        <img
          [src]="active().url | mediaUrl"
          [alt]="active().alt"
          class="h-full w-full object-contain p-4 transition-transform duration-150 ease-out"
          [style.transform]="hovering() ? 'scale(' + HOVER_ZOOM + ')' : 'scale(1)'"
          [style.transform-origin]="origin()"
        />

        <span
          class="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11.5px] font-semibold text-charcoal-600 opacity-0 shadow-soft transition group-hover:opacity-100"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
          </svg>
          Tap to zoom
        </span>

        <ng-content select="[gallery-badge]" />
      </button>

      @if (images().length > 1) {
        <div class="scrollbar-none flex gap-3 overflow-x-auto">
          @for (img of images(); track img.url; let i = $index) {
            <button
              type="button"
              (click)="select(i)"
              [attr.aria-label]="'View image ' + (i + 1) + ' of ' + images().length"
              [attr.aria-current]="index() === i"
              class="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition"
              [class]="index() === i ? 'border-forest-700' : 'border-charcoal-100 opacity-70 hover:opacity-100'"
            >
              <img [src]="img.url | mediaUrl" [alt]="img.alt" class="h-full w-full object-contain p-1" />
            </button>
          }
        </div>
      }
    </div>

    @if (lightboxOpen()) {
      <div
        class="fixed inset-0 z-[60] flex flex-col bg-charcoal-950/95"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="active().alt"
      >
        <div class="flex items-center justify-between px-4 py-3 text-white sm:px-6">
          <span class="text-sm text-charcoal-300">{{ index() + 1 }} / {{ images().length }}</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="toggleLightboxZoom($event)"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              [attr.aria-label]="zoomed() ? 'Zoom out' : 'Zoom in'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M8 11h6" />
                @if (!zoomed()) {
                  <path d="M11 8v6" />
                }
              </svg>
            </button>
            <button
              type="button"
              (click)="closeLightbox()"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>

        <div
          class="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6"
          (click)="toggleLightboxZoom($event)"
          (mousemove)="onLightboxMove($event)"
        >
          <img
            [src]="active().url | mediaUrl"
            [alt]="active().alt"
            class="max-h-full max-w-full select-none object-contain transition-transform duration-200 ease-out"
            [class]="zoomed() ? 'cursor-zoom-out' : 'cursor-zoom-in'"
            [style.transform]="zoomed() ? 'scale(' + LIGHTBOX_ZOOM + ')' : 'scale(1)'"
            [style.transform-origin]="origin()"
            draggable="false"
          />

          @if (images().length > 1) {
            <button
              type="button"
              (click)="step(-1, $event)"
              class="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              (click)="step(1, $event)"
              class="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class ProductGalleryComponent {
  images = input.required<GalleryImage[]>();

  protected readonly HOVER_ZOOM = HOVER_ZOOM;
  protected readonly LIGHTBOX_ZOOM = LIGHTBOX_ZOOM;

  protected readonly index = signal(0);
  protected readonly hovering = signal(false);
  protected readonly lightboxOpen = signal(false);
  protected readonly zoomed = signal(false);

  /** Where the pointer last was, as a transform-origin. Drives both zooms. */
  protected readonly origin = signal('50% 50%');

  protected readonly active = computed(
    () => this.images()[Math.min(this.index(), this.images().length - 1)] ?? { url: '', alt: '' },
  );

  constructor() {
    // Picking a different flavour hands this component a different list, and
    // the shopper expects to be looking at that flavour - not at whichever
    // slot they happened to have open.
    effect(() => {
      this.images();
      this.index.set(0);
      this.resetZoom();
    });
  }

  protected select(i: number): void {
    this.index.set(i);
    this.resetZoom();
  }

  protected openLightbox(): void {
    this.hovering.set(false);
    this.lightboxOpen.set(true);
    this.resetZoom();
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
    this.resetZoom();
  }

  protected step(delta: 1 | -1, event?: Event): void {
    event?.stopPropagation();
    const n = this.images().length;
    if (n < 2) return;
    this.index.set((this.index() + delta + n) % n);
    this.resetZoom();
  }

  protected toggleLightboxZoom(event: MouseEvent): void {
    event.stopPropagation();
    // Zoom towards what was clicked, so the detail you aimed at is the detail
    // you get rather than the middle of the frame.
    this.setOriginFrom(event);
    this.zoomed.set(!this.zoomed());
  }

  protected onHoverMove(event: MouseEvent): void {
    this.setOriginFrom(event);
  }

  protected onLightboxMove(event: MouseEvent): void {
    if (this.zoomed()) {
      this.setOriginFrom(event);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.step(1);
    } else if (event.key === 'ArrowLeft') {
      this.step(-1);
    }
  }

  private setOriginFrom(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const x = Math.min(100, Math.max(0, ((event.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - r.top) / r.height) * 100));
    this.origin.set(`${x}% ${y}%`);
  }

  private resetZoom(): void {
    this.zoomed.set(false);
    this.origin.set('50% 50%');
  }
}
