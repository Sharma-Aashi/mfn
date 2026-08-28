import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../../../core/models/address.model';
import { AddressService } from '../../../core/services/address.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './addresses.page.html',
})
export class AddressesPage {
  private readonly fb = inject(FormBuilder);
  private readonly addressService = inject(AddressService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly addresses = signal<Address[]>([]);
  protected readonly loading = signal(true);
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['India'],
    isDefault: [false],
  });

  constructor() {
    inject(SeoService).update('Saved Addresses');
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.addressService.getAll().subscribe((a) => {
      this.addresses.set(a);
      this.loading.set(false);
    });
  }

  protected openNew(): void {
    this.editingId.set(null);
    this.form.reset({ country: 'India', isDefault: false });
    this.formOpen.set(true);
  }

  protected openEdit(a: Address): void {
    this.editingId.set(a.id);
    this.form.reset({ ...a, addressLine2: a.addressLine2 ?? '' });
    this.formOpen.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const request = this.form.getRawValue();
    const id = this.editingId();
    const obs = id ? this.addressService.update(id, request) : this.addressService.create(request);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(id ? 'Address updated.' : 'Address added.');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected async remove(a: Address): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Remove address',
      message: `Remove the address at ${a.city}?`,
      confirmText: 'Remove',
      danger: true,
    });
    if (!confirmed) return;
    this.addressService.delete(a.id).subscribe(() => {
      this.toast.success('Address removed.');
      this.load();
    });
  }

  protected setDefault(a: Address): void {
    this.addressService.setDefault(a.id).subscribe(() => {
      this.toast.success('Default address updated.');
      this.load();
    });
  }
}
