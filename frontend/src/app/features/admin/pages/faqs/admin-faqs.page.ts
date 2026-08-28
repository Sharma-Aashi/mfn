import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Faq, FaqCategory } from '../../../../core/models/faq.model';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { FaqService } from '../../../../core/services/faq.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';

const CATEGORY_OPTIONS: FaqCategory[] = ['PRODUCTS', 'ORDERS', 'SHIPPING', 'RETURNS', 'PAYMENTS', 'USAGE', 'GENERAL'];

@Component({
  selector: 'app-admin-faqs',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-faqs.page.html',
})
export class AdminFaqsPage {
  private readonly fb = inject(FormBuilder);
  private readonly faqService = inject(FaqService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly faqs = signal<Faq[]>([]);
  protected readonly loading = signal(true);
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    question: ['', Validators.required],
    answer: ['', Validators.required],
    category: ['GENERAL' as FaqCategory, Validators.required],
    active: [true],
  });

  constructor() {
    inject(SeoService).update('Manage FAQs');
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.faqService.getAllForAdmin().subscribe((f) => {
      this.faqs.set(f);
      this.loading.set(false);
    });
  }

  protected openNew(): void {
    this.editingId.set(null);
    this.form.reset({ category: 'GENERAL', active: true });
    this.formOpen.set(true);
  }

  protected openEdit(f: Faq): void {
    this.editingId.set(f.id);
    this.form.reset({ question: f.question, answer: f.answer, category: f.category, active: f.active });
    this.formOpen.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const obs = id ? this.faqService.update(id, this.form.getRawValue()) : this.faqService.create(this.form.getRawValue());
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(id ? 'FAQ updated.' : 'FAQ created.');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected toggleStatus(f: Faq): void {
    this.faqService.updateStatus(f.id, !f.active).subscribe(() => {
      this.load();
    });
  }

  protected moveUp(index: number): void {
    if (index === 0) return;
    const list = [...this.faqs()];
    [list[index - 1], list[index]] = [list[index], list[index - 1]];
    this.faqs.set(list);
    this.faqService.reorder(list.map((f) => f.id)).subscribe();
  }

  protected moveDown(index: number): void {
    const list = [...this.faqs()];
    if (index === list.length - 1) return;
    [list[index + 1], list[index]] = [list[index], list[index + 1]];
    this.faqs.set(list);
    this.faqService.reorder(list.map((f) => f.id)).subscribe();
  }

  protected async remove(f: Faq): Promise<void> {
    const confirmed = await this.confirmService.confirm({ title: 'Delete FAQ', message: 'Delete this FAQ entry?', confirmText: 'Delete', danger: true });
    if (!confirmed) return;
    this.faqService.delete(f.id).subscribe(() => {
      this.toast.success('FAQ deleted.');
      this.load();
    });
  }
}
