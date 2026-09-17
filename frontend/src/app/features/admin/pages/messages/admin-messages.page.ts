import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ContactMessage } from '../../../../core/models/contact.model';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ContactService } from '../../../../core/services/contact.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [DatePipe, PaginationComponent, EmptyStateComponent],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="font-display text-xl font-semibold text-charcoal-900">Messages</h1>
        <p class="text-sm text-charcoal-500">
          Enquiries submitted through the Contact Us page.
          @if (unreadOnPage() > 0) {
            <span class="font-semibold text-forest-700">{{ unreadOnPage() }} unread on this page.</span>
          }
        </p>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1, 2, 3]; track i) { <div class="h-24 skeleton rounded-2xl"></div> }
        </div>
      } @else if (messages().length === 0) {
        <app-empty-state title="No messages yet" description="When customers use the contact form, their messages will appear here.">
          <svg icon width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>
        </app-empty-state>
      } @else {
        <div class="space-y-3">
          @for (m of messages(); track m.id) {
            <div class="rounded-2xl border bg-white p-5" [class]="m.read ? 'border-charcoal-100' : 'border-forest-300 shadow-soft'">
              <button type="button" (click)="toggle(m)" class="flex w-full flex-wrap items-start justify-between gap-3 text-left" [attr.aria-expanded]="expandedId() === m.id">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    @if (!m.read) {
                      <span class="h-2 w-2 shrink-0 rounded-full bg-forest-600" aria-label="Unread"></span>
                    }
                    <p class="truncate text-sm font-semibold text-charcoal-900">{{ m.subject }}</p>
                  </div>
                  <p class="mt-0.5 truncate text-xs text-charcoal-500">{{ m.name }} · {{ m.email }}@if (m.phone) { · {{ m.phone }} }</p>
                </div>
                <span class="shrink-0 text-xs text-charcoal-400">{{ m.createdAt | date: 'medium' }}</span>
              </button>

              @if (expandedId() === m.id) {
                <p class="mt-4 whitespace-pre-line rounded-xl bg-beige-50 p-4 text-sm leading-relaxed text-charcoal-700">{{ m.message }}</p>
                <div class="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
                  <a [href]="replyHref(m)" class="text-forest-700 hover:underline">Reply by email</a>
                  @if (m.phone) {
                    <a [href]="'tel:' + m.phone" class="text-forest-700 hover:underline">Call</a>
                  }
                  <button type="button" (click)="remove(m)" class="text-red-600 hover:underline">Delete</button>
                </div>
              }
            </div>
          }
        </div>

        <div class="mt-6">
          <app-pagination [page]="page()" [totalPages]="totalPages()" (pageChange)="load($event)" />
        </div>
      }
    </div>
  `,
})
export class AdminMessagesPage {
  private readonly contactService = inject(ContactService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly messages = signal<ContactMessage[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly expandedId = signal<number | null>(null);
  protected readonly unreadOnPage = computed(() => this.messages().filter((m) => !m.read).length);

  constructor() {
    inject(SeoService).update('Messages');
    this.load(0);
  }

  protected load(page: number): void {
    this.loading.set(true);
    this.contactService.getAllForAdmin(page, 15).subscribe({
      next: (res) => {
        this.messages.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected toggle(m: ContactMessage): void {
    const opening = this.expandedId() !== m.id;
    this.expandedId.set(opening ? m.id : null);
    if (opening && !m.read) {
      this.contactService.markRead(m.id).subscribe((updated) =>
        this.messages.update((list) => list.map((x) => (x.id === updated.id ? updated : x))),
      );
    }
  }

  protected replyHref(m: ContactMessage): string {
    return `mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`;
  }

  protected async remove(m: ContactMessage): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete message',
      message: `Delete the message from ${m.name}?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    this.contactService.delete(m.id).subscribe(() => {
      this.toast.success('Message deleted.');
      this.load(this.page());
    });
  }
}
