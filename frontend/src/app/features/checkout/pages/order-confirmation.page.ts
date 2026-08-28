import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-confirmation.page.html',
})
export class OrderConfirmationPage {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);

  protected readonly order = signal<Order | null>(null);
  protected readonly notFound = signal(false);

  constructor() {
    inject(SeoService).update('Order Confirmed');
    const orderNumber = this.route.snapshot.paramMap.get('orderNumber');
    if (orderNumber) {
      this.orderService.getOrderByNumber(orderNumber).subscribe({
        next: (o) => this.order.set(o),
        error: () => this.notFound.set(true),
      });
    }
  }
}
