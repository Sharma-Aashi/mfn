import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-forest-950 px-4">
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-beige-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1f3d24" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <h1 class="font-display text-xl font-semibold text-white">VITALORA Admin</h1>
          <p class="mt-1 text-sm text-beige-200/70">Sign in to manage the storefront</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-2xl bg-white p-6 sm:p-8">
          @if (errorMessage()) {
            <div class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{{ errorMessage() }}</div>
          }
          <div class="mb-4">
            <label for="email" class="form-label">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" class="form-input" />
          </div>
          <div class="mb-2">
            <label for="password" class="form-label">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password" class="form-input" />
          </div>
          <button type="submit" [disabled]="loading()" class="mt-6 w-full rounded-full bg-forest-700 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60">
            {{ loading() ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AdminLoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    inject(SeoService).update('Admin Sign In');
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.authService.adminLogin(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
      },
    });
  }
}
