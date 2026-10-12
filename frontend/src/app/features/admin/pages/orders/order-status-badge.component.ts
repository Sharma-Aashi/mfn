import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OrderStatus } from '../../../../core/models/order.model';

/**
 * A coloured pill for the status. Six states, picked so the colour tells the
 * story at a glance: amber for still-to-do, green when it reaches the
 * customer, red when it is cancelled.
 */
@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
      [class]="styleFor(status())"
    >
      {{ status() }}
    </span>
  `,
})
export class OrderStatusBadgeComponent {
  readonly status = input.required<OrderStatus>();

  protected styleFor(s: OrderStatus): string {
    switch (s) {
      case 'PENDING':    return 'bg-amber-100 text-amber-800';
      case 'CONFIRMED':  return 'bg-sky-100 text-sky-800';
      case 'PROCESSING': return 'bg-indigo-100 text-indigo-800';
      case 'SHIPPED':    return 'bg-violet-100 text-violet-800';
      case 'DELIVERED':  return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':  return 'bg-red-100 text-red-800';
    }
  }
}
