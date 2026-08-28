import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { SeoService } from '../../../core/services/seo.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, EmptyStateComponent, PaginationComponent],
  templateUrl: './orders.page.html',
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);

  constructor() {
    inject(SeoService).update('My Orders');
    this.load(0);
  }

  private load(page: number): void {
    this.loading.set(true);
    this.orderService.getOrders(page, 10).subscribe({
      next: (res) => {
        this.orders.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected goToPage(page: number): void {
    this.load(page);
  }

  protected statusClass(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-forest-100 text-forest-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'bg-beige-200 text-beige-900';
      default:
        return 'bg-charcoal-100 text-charcoal-600';
    }
  }
}
