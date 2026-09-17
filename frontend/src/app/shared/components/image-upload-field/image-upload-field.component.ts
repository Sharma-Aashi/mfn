import { Component, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';
import { MediaFolder, MediaService } from '../../../core/services/media.service';

/**
 * Image field for admin forms: preview, a paste-a-URL box, and an upload button.
 * Plugs into reactive forms via formControlName.
 */
@Component({
  selector: 'app-image-upload-field',
  standalone: true,
  imports: [MediaUrlPipe],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ImageUploadFieldComponent), multi: true }],
  template: `
    <div>
      <label [for]="fieldId()" class="form-label">{{ label() }}</label>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-charcoal-100 bg-beige-50">
          @if (value()) {
            <img [src]="value() | mediaUrl" [alt]="label() + ' preview'" class="h-full w-full object-contain" />
          } @else {
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8a39a" stroke-width="1.6" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          }
        </div>
        <div class="min-w-0 flex-1 space-y-2">
          <input
            [id]="fieldId()"
            type="text"
            class="form-input"
            [placeholder]="placeholder()"
            [value]="value()"
            (input)="setValue($any($event.target).value)"
            (blur)="onTouched?.()"
          />
          <div class="flex flex-wrap items-center gap-3">
            <label class="cursor-pointer rounded-full border border-charcoal-200 px-4 py-1.5 text-xs font-semibold text-charcoal-700 hover:bg-beige-100">
              {{ uploading() ? 'Uploading…' : 'Upload image' }}
              <input type="file" accept="image/*" class="hidden" [disabled]="uploading()" (change)="onFile($event)" />
            </label>
            @if (value()) {
              <button type="button" (click)="setValue('')" class="text-xs font-semibold text-red-600 hover:underline">Remove</button>
            }
            @if (hint()) {
              <span class="text-xs text-charcoal-400">{{ hint() }}</span>
            }
          </div>
          @if (error()) {
            <p class="form-error">{{ error() }}</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class ImageUploadFieldComponent implements ControlValueAccessor {
  private readonly mediaService = inject(MediaService);

  label = input.required<string>();
  fieldId = input.required<string>();
  folder = input<MediaFolder>('cms');
  placeholder = input('/assets/... or https://...');
  hint = input<string>();

  protected readonly value = signal('');
  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  private onChange?: (value: string) => void;
  protected onTouched?: () => void;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected setValue(value: string): void {
    this.value.set(value);
    this.onChange?.(value);
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);
    this.mediaService.upload(file, this.folder()).subscribe({
      next: (url) => {
        this.setValue(url);
        this.uploading.set(false);
        input.value = '';
      },
      error: () => {
        this.uploading.set(false);
        this.error.set('Upload failed. Use a JPG/PNG/WebP/SVG under 10MB.');
        input.value = '';
      },
    });
  }
}
