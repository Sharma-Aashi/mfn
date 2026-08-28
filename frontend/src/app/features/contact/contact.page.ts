import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactInfo } from '../../core/models/cms.model';
import { CmsService } from '../../core/services/cms.service';
import { ContactService } from '../../core/services/contact.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact.page.html',
})
export class ContactPage {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly cmsService = inject(CmsService);

  protected readonly info = signal<ContactInfo | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', [Validators.required, Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  constructor() {
    inject(SeoService).update('Contact Us', 'Get in touch with the VITALORA team for questions about products, orders or partnerships.');
    this.cmsService.getContact().subscribe((c) => this.info.set(c.info));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.contactService.submit(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.form.reset();
      },
      error: () => this.submitting.set(false),
    });
  }
}
