import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const p = control.get('newPassword')?.value;
  const c = control.get('confirmNewPassword')?.value;
  return p && c && p !== c ? { mismatch: true } : null;
}

@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-lg">
      <h1 class="mb-1 font-display text-xl font-semibold text-charcoal-900">Change Password</h1>
      <p class="mb-6 text-sm text-charcoal-500">Signed in as {{ authService.currentUser()?.email }}</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 rounded-2xl border border-charcoal-100 bg-white p-6">
        <div>
          <label for="currentPassword" class="form-label">Current Password</label>
          <input id="currentPassword" type="password" formControlName="currentPassword" autocomplete="current-password" class="form-input" />
          @if (form.controls.currentPassword.invalid && form.controls.currentPassword.touched) {
            <p class="form-error">Current password is required.</p>
          }
        </div>
        <div>
          <label for="newPassword" class="form-label">New Password</label>
          <input id="newPassword" type="password" formControlName="newPassword" autocomplete="new-password" class="form-input" />
          @if (form.controls.newPassword.invalid && form.controls.newPassword.touched) {
            <p class="form-error">Password must be at least 8 characters.</p>
          }
        </div>
        <div>
          <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
          <input id="confirmNewPassword" type="password" formControlName="confirmNewPassword" autocomplete="new-password" class="form-input" />
          @if (form.hasError('mismatch') && form.controls.confirmNewPassword.touched) {
            <p class="form-error">Passwords do not match.</p>
          }
        </div>
        <button type="submit" [disabled]="saving()" class="w-full rounded-full bg-forest-700 py-3 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60">
          {{ saving() ? 'Updating…' : 'Update Password' }}
        </button>
      </form>
    </div>
  `,
})
export class AdminAccountPage {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  constructor() {
    inject(SeoService).update('Change Password');
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.toast.success('Password updated. Use the new password next time you sign in.');
      },
      error: () => this.saving.set(false),
    });
  }
}
