import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ORDER_STATUSES, Order, OrderStatus } from '../../../../core/models/order.model';
import { OrderStatusBadgeComponent } from './order-status-badge.component';

/**
 * Admin view of a single order. Three cards — customer, address, items —
 * plus the status switcher. Status is the only thing an admin changes here;
 * everything else is a snapshot taken when the order was placed.
 */
@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, OrderStatusBadgeComponent],
  template: `
    <div>
      <a routerLink="/admin/orders" class="mb-3 inline-flex items-center gap-1 text-sm text-charcoal-500 hover:text-forest-700">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        Back to all orders
      </a>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3]; track i) { <div class="h-32 skeleton rounded-2xl"></div> }
        </div>
      } @else if (!order()) {
        <p class="text-sm text-charcoal-500">Order not found.</p>
      } @else {
        <!-- Header -->
        <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="font-display text-xl font-semibold text-charcoal-900">{{ order()!.orderNumber }}</h1>
            <p class="mt-1 text-sm text-charcoal-500">Placed {{ order()!.createdAt | date: 'medium' }}</p>
          </div>
          <div class="flex items-center gap-3">
            <app-order-status-badge [status]="order()!.status" />
          </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-3">
          <!-- Left: customer + address -->
          <div class="space-y-5 lg:col-span-1">
            <div class="rounded-2xl border border-charcoal-100 bg-white p-5">
              <p class="text-xs font-bold uppercase tracking-wide text-charcoal-400">Customer</p>
              <p class="mt-2 font-semibold text-charcoal-900">{{ order()!.customerFullName }}</p>
              <p class="text-sm text-charcoal-600"><a [href]="'mailto:' + order()!.customerEmail" class="hover:underline">{{ order()!.customerEmail }}</a></p>
              <p class="text-sm text-charcoal-600"><a [href]="'tel:' + order()!.customerPhone" class="hover:underline">{{ order()!.customerPhone }}</a></p>
            </div>

            <div class="rounded-2xl border border-charcoal-100 bg-white p-5">
              <p class="text-xs font-bold uppercase tracking-wide text-charcoal-400">Shipping address</p>
              <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-charcoal-700">
                {{ order()!.shippingAddressLine1 }}@if (order()!.shippingAddressLine2) {<br/>{{ order()!.shippingAddressLine2 }}}<br/>
                {{ order()!.shippingCity }}, {{ order()!.shippingState }} {{ order()!.shippingPostalCode }}<br/>
                {{ order()!.shippingCountry }}
              </p>
              @if (order()!.customerNotes) {
                <p class="mt-3 rounded-lg bg-beige-50 p-3 text-xs italic text-charcoal-600">"{{ order()!.customerNotes }}"</p>
              }
            </div>

            <div class="rounded-2xl border border-charcoal-100 bg-white p-5">
              <p class="text-xs font-bold uppercase tracking-wide text-charcoal-400">Payment</p>
              <p class="mt-2 text-sm text-charcoal-700">
                <span class="font-semibold">{{ order()!.paymentMethod }}</span> ·
                <span [class]="order()!.paymentStatus === 'PAID' ? 'text-forest-700 font-semibold' : 'text-charcoal-500'">
                  {{ order()!.paymentStatus }}
                </span>
              </p>
            </div>

            <!-- Status update -->
            <div class="rounded-2xl border border-forest-200 bg-forest-50/40 p-5">
              <p class="text-xs font-bold uppercase tracking-wide text-forest-700">Change status</p>
              <select
                [(ngModel)]="nextStatus"
                class="mt-3 h-10 w-full rounded-lg border border-charcoal-200 bg-white px-3 text-sm outline-none focus:border-forest-500"
              >
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
              <button
                type="button"
                (click)="saveStatus()"
                [disabled]="saving() || nextStatus === order()!.status"
                class="mt-3 h-10 w-full rounded-lg bg-forest-700 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ saving() ? 'Saving…' : 'Update status' }}
              </button>
            </div>
          </div>

          <!-- Right: items + totals -->
          <div class="space-y-5 lg:col-span-2">
            <div class="rounded-2xl border border-charcoal-100 bg-white">
              <div class="border-b border-charcoal-100 px-5 py-3 text-xs font-bold uppercase tracking-wide text-charcoal-400">
                Items ({{ order()!.items.length }})
              </div>
              <table class="w-full text-sm">
                <tbody class="divide-y divide-charcoal-100">
                  @for (it of order()!.items; track it.sku) {
                    <tr>
                      <td class="w-16 px-5 py-3">
                        @if (it.productImage) {
                          <img [src]="it.productImage" alt="" class="h-12 w-12 rounded-lg object-cover" />
                        } @else {
                          <div class="h-12 w-12 rounded-lg bg-beige-100"></div>
                        }
                      </td>
                      <td class="px-5 py-3">
                        <p class="font-medium text-charcoal-900">{{ it.productName }}</p>
                        <p class="text-xs text-charcoal-500">
                          @if (it.brandName) { {{ it.brandName }} · }
                          @if (it.variantLabel) { {{ it.variantLabel }} · }
                          SKU {{ it.sku }}
                        </p>
                      </td>
                      <td class="px-5 py-3 text-right text-charcoal-600">× {{ it.quantity }}</td>
                      <td class="px-5 py-3 text-right text-charcoal-500">{{ it.unitPrice | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</td>
                      <td class="px-5 py-3 pr-5 text-right font-semibold text-charcoal-900">{{ it.lineTotal | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="rounded-2xl border border-charcoal-100 bg-white p-5">
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between"><dt class="text-charcoal-500">Subtotal</dt>              <dd class="text-charcoal-800">{{ order()!.subtotal       | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</dd></div>
                <div class="flex justify-between"><dt class="text-charcoal-500">Discount</dt>              <dd class="text-charcoal-800">− {{ order()!.discountAmount | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</dd></div>
                <div class="flex justify-between"><dt class="text-charcoal-500">Shipping</dt>              <dd class="text-charcoal-800">{{ order()!.shippingAmount  | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</dd></div>
                <div class="flex justify-between"><dt class="text-charcoal-500">Tax</dt>                   <dd class="text-charcoal-800">{{ order()!.taxAmount       | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</dd></div>
                <div class="mt-3 flex justify-between border-t border-charcoal-100 pt-3 text-base">
                  <dt class="font-semibold text-charcoal-900">Grand total</dt>
                  <dd class="font-bold text-charcoal-900">{{ order()!.grandTotal | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminOrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AdminOrderService);
  private readonly toast = inject(ToastService);

  protected readonly statuses = ORDER_STATUSES;
  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected nextStatus: OrderStatus = 'PENDING';

  constructor() {
    inject(SeoService).update('Admin · Order');
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loading.set(false);
      return;
    }
    this.service.get(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.nextStatus = o.status;
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Could not load the order.');
        this.loading.set(false);
      },
    });
  }

  protected saveStatus(): void {
    const o = this.order();
    if (!o || this.nextStatus === o.status) return;
    this.saving.set(true);
    this.service.updateStatus(o.id, this.nextStatus).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.saving.set(false);
        this.toast.success(`Status updated to ${updated.status}.`);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Could not update the status.');
      },
    });
  }
}
