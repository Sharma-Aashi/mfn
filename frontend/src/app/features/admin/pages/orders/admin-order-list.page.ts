import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminOrderSummary, ORDER_STATUSES, OrderStatus } from '../../../../core/models/order.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { OrderStatusBadgeComponent } from './order-status-badge.component';

/**
 * The orders table — one row per order, filtered by status or free-text
 * (order number, customer name, email, phone). Clicking a row opens the
 * detail page, where the admin can change the status.
 */
@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    EmptyStateComponent,
    PaginationComponent,
    OrderStatusBadgeComponent,
  ],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="font-display text-xl font-semibold text-charcoal-900">Orders</h1>
        <p class="text-sm text-charcoal-500">
          Every order placed on the storefront. Click a row to view items and update status.
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          [(ngModel)]="searchTerm"
          (keyup.enter)="applyFilters()"
          placeholder="Search order number, name, email, phone"
          class="h-10 min-w-[260px] flex-1 rounded-lg border border-charcoal-200 bg-white px-3 text-sm outline-none focus:border-forest-500"
        />
        <select
          [(ngModel)]="statusFilter"
          (change)="applyFilters()"
          class="h-10 rounded-lg border border-charcoal-200 bg-white px-3 text-sm outline-none focus:border-forest-500"
        >
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        <button type="button" (click)="applyFilters()" class="h-10 rounded-lg bg-forest-700 px-4 text-sm font-semibold text-white hover:bg-forest-800">
          Apply
        </button>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1, 2, 3, 4]; track i) { <div class="h-14 skeleton rounded-xl"></div> }
        </div>
      } @else if (orders().length === 0) {
        <app-empty-state title="No orders match" description="Try clearing the filters or widening the search.">
          <svg icon width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
            <path d="M3 3h2l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          </svg>
        </app-empty-state>
      } @else {
        <div class="overflow-hidden rounded-2xl border border-charcoal-100 bg-white">
          <table class="w-full text-sm">
            <thead class="bg-beige-50 text-left text-xs uppercase tracking-wide text-charcoal-500">
              <tr>
                <th class="px-5 py-3">Order</th>
                <th class="px-5 py-3">Placed</th>
                <th class="px-5 py-3">Customer</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3 text-right">Items</th>
                <th class="px-5 py-3 text-right">Total</th>
                <th class="px-5 py-3">Payment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-charcoal-100">
              @for (o of orders(); track o.id) {
                <tr class="transition hover:bg-beige-50">
                  <td class="px-5 py-3">
                    <a [routerLink]="['/admin/orders', o.id]" class="font-semibold text-forest-700 hover:underline">
                      {{ o.orderNumber }}
                    </a>
                  </td>
                  <td class="px-5 py-3 text-charcoal-500">{{ o.createdAt | date: 'd MMM, h:mm a' }}</td>
                  <td class="px-5 py-3">
                    <p class="font-medium text-charcoal-900">{{ o.customerFullName }}</p>
                    <p class="text-xs text-charcoal-500">{{ o.customerEmail }}</p>
                  </td>
                  <td class="px-5 py-3"><app-order-status-badge [status]="o.status" /></td>
                  <td class="px-5 py-3 text-right text-charcoal-700">{{ o.itemCount }}</td>
                  <td class="px-5 py-3 text-right font-semibold text-charcoal-900">{{ o.grandTotal | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</td>
                  <td class="px-5 py-3 text-xs text-charcoal-500">
                    {{ o.paymentMethod }} · <span [class]="paymentColor(o.paymentStatus)">{{ o.paymentStatus }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-6">
          <app-pagination [page]="page()" [totalPages]="totalPages()" (pageChange)="load($event)" />
        </div>
      }
    </div>
  `,
})
export class AdminOrderListPage {
  private readonly service = inject(AdminOrderService);
  private readonly toast = inject(ToastService);

  protected readonly statuses = ORDER_STATUSES;
  protected searchTerm = '';
  protected statusFilter: OrderStatus | '' = '';

  protected readonly orders = signal<AdminOrderSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);

  constructor() {
    inject(SeoService).update('Admin · Orders');
    this.load(0);
  }

  protected load(page: number): void {
    this.loading.set(true);
    this.service.list(this.searchTerm || undefined, this.statusFilter || undefined, page, 20).subscribe({
      next: (res) => {
        this.orders.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Could not load orders.');
        this.loading.set(false);
      },
    });
  }

  protected applyFilters(): void {
    this.load(0);
  }

  protected paymentColor(status: string): string {
    if (status === 'PAID' || status === 'COMPLETED') return 'text-forest-700 font-semibold';
    if (status === 'FAILED' || status === 'REFUNDED') return 'text-red-600 font-semibold';
    return 'text-charcoal-500';
  }
}
