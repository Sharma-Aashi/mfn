import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

/** Minimal shape of the response the backend returns for /create. */
export interface CreateGatewayOrderResponse {
  keyId: string;
  gatewayOrderId: string;
  amount: number;      // paise
  currency: string;
  orderNumber: string;
  grandTotal: number;  // rupees
}

/** What the Razorpay widget sends back on a successful capture. */
export interface GatewayCallbackPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/payments`;
  private scriptLoading: Promise<void> | null = null;

  createGatewayOrder(orderId: number): Observable<CreateGatewayOrderResponse> {
    return this.http.post<CreateGatewayOrderResponse>(`${this.base}/orders/${orderId}/create`, {});
  }

  verify(orderId: number, payload: GatewayCallbackPayload): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders/${orderId}/verify`, {
      gatewayOrderId: payload.razorpay_order_id,
      gatewayPaymentId: payload.razorpay_payment_id,
      gatewaySignature: payload.razorpay_signature,
    });
  }

  /**
   * Load Razorpay's hosted checkout bundle on first use. The library hangs the
   * `Razorpay` constructor off the window global rather than exposing a
   * typed export, so there is no package to npm-install — a script tag is
   * the supported path. Repeat callers get the same cached promise.
   */
  loadWidget(): Promise<void> {
    if (this.scriptLoading) return this.scriptLoading;
    this.scriptLoading = new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('No document — SSR context cannot load the payment widget.'));
        return;
      }
      if ((window as any).Razorpay) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        this.scriptLoading = null;
        reject(new Error('Could not load Razorpay checkout.'));
      };
      document.head.appendChild(s);
    });
    return this.scriptLoading;
  }
}
