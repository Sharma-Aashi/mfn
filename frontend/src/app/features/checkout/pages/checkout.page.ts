import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Address } from '../../../core/models/address.model';
import { AddressService } from '../../../core/services/address.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { SeoService } from '../../../core/services/seo.service';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, MediaUrlPipe],
  templateUrl: './checkout.page.html',
})
export class CheckoutPage {
  private readonly fb = inject(FormBuilder);
  protected readonly cartService = inject(CartService);
  private readonly addressService = inject(AddressService);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly step = signal(1);
  protected readonly steps = ['Customer Info', 'Shipping', 'Review', 'Payment'];
  protected readonly savedAddresses = signal<Address[]>([]);
  protected readonly submitting = signal(false);

  protected readonly commerce = inject(SiteSettingsService).commerce;

  /** Preview only - the server recomputes shipping from the same settings when the order is placed. */
  protected readonly shipping = computed(() => {
    const { freeShippingThreshold, shippingFee } = this.commerce();
    return this.cartService.cart().subtotal >= freeShippingThreshold ? 0 : shippingFee;
  });
  protected readonly grandTotal = computed(() => this.cartService.cart().subtotal + this.shipping());

  /** Total off list price, repeated here so the saving is visible at the moment of paying. */
  protected readonly savings = computed(() =>
    this.cartService
      .cart()
      .items.reduce((sum, i) => sum + Math.max(0, i.unitMrp - i.unitPrice) * i.quantity, 0),
  );

  protected readonly deliveryDays = computed(() => this.commerce().estimatedDeliveryDays);

  protected readonly customerForm = this.fb.nonNullable.group({
    customerFullName: ['', [Validators.required, Validators.maxLength(150)]],
    customerEmail: ['', [Validators.required, Validators.email]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,20}$/)]],
  });

  protected readonly addressForm = this.fb.nonNullable.group({
    shippingAddressLine1: ['', [Validators.required, Validators.maxLength(255)]],
    shippingAddressLine2: [''],
    shippingCity: ['', Validators.required],
    shippingState: ['', Validators.required],
    shippingPostalCode: ['', Validators.required],
    shippingCountry: ['India'],
    saveAddress: [true],
  });

  protected readonly notesControl = this.fb.nonNullable.control('');

  constructor() {
    inject(SeoService).update('Checkout');
    this.cartService.refresh();

    const user = this.authService.currentUser();
    if (user) {
      this.customerForm.patchValue({ customerFullName: user.fullName, customerEmail: user.email, customerPhone: user.phone ?? '' });
    }
    this.addressService.getAll().subscribe((addresses) => {
      this.savedAddresses.set(addresses);
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (def) this.useAddress(def);
    });
  }

  protected useAddress(a: Address): void {
    this.addressForm.patchValue({
      shippingAddressLine1: a.addressLine1,
      shippingAddressLine2: a.addressLine2 ?? '',
      shippingCity: a.city,
      shippingState: a.state,
      shippingPostalCode: a.postalCode,
      shippingCountry: a.country,
      saveAddress: false,
    });
    this.customerForm.patchValue({ customerFullName: a.fullName, customerPhone: a.phone });
  }

  protected goToStep(target: number): void {
    if (target > this.step()) {
      if (target >= 2 && this.customerForm.invalid) {
        this.customerForm.markAllAsTouched();
        return;
      }
      if (target >= 3 && this.addressForm.invalid) {
        this.addressForm.markAllAsTouched();
        return;
      }
    }
    this.step.set(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected placeOrder(): void {
    if (this.customerForm.invalid || this.addressForm.invalid || this.cartService.cart().items.length === 0) {
      this.toast.error('Please complete all required fields before placing your order.');
      return;
    }
    this.submitting.set(true);
    const request = {
      ...this.customerForm.getRawValue(),
      ...this.addressForm.getRawValue(),
      customerNotes: this.notesControl.value || undefined,
    };
    this.orderService.createOrder(request).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.cartService.refresh(); // server clears the cart on order creation; sync the header badge
        this.router.navigate(['/checkout/confirmation', order.orderNumber]);
      },
      error: () => this.submitting.set(false),
    });
  }
}
