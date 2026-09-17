import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { SeoService } from '../../../core/services/seo.service';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

const TRACK_STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [MediaUrlPipe, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.page.html',
})
export class OrderDetailPage {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);

  protected readonly order = signal<Order | null>(null);
  protected readonly notFound = signal(false);
  protected readonly trackSteps = TRACK_STEPS;

  constructor() {
    inject(SeoService).update('Order Details');
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.orderService.getOrder(id).subscribe({
        next: (o) => this.order.set(o),
        error: () => this.notFound.set(true),
      });
    }
  }

  protected stepIndex(status: string): number {
    return TRACK_STEPS.indexOf(status as OrderStatus);
  }

  protected isCancelled(status: string): boolean {
    return status === 'CANCELLED';
  }
}
