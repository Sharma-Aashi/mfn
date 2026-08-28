import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Review, ReviewStatus } from '../../../../core/models/review.model';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ReviewService } from '../../../../core/services/review.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

const STATUS_TABS: { value: ReviewStatus | ''; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: '', label: 'All' },
];

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [DatePipe, StarRatingComponent, PaginationComponent, EmptyStateComponent],
  templateUrl: './admin-reviews.page.html',
})
export class AdminReviewsPage {
  private readonly reviewService = inject(ReviewService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly statusTabs = STATUS_TABS;
  protected readonly status = signal<ReviewStatus | ''>('PENDING');
  protected readonly reviews = signal<Review[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);

  constructor() {
    inject(SeoService).update('Manage Reviews');
    this.load(0);
  }

  protected setStatus(status: ReviewStatus | ''): void {
    this.status.set(status);
    this.load(0);
  }

  private load(page: number): void {
    this.loading.set(true);
    this.reviewService.getAllForAdmin(this.status() || undefined, page, 15).subscribe({
      next: (res) => {
        this.reviews.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected goToPage(page: number): void {
    this.load(page);
  }

  protected approve(r: Review): void {
    this.reviewService.approve(r.id).subscribe(() => {
      this.toast.success('Review approved.');
      this.load(this.page());
    });
  }

  protected reject(r: Review): void {
    this.reviewService.reject(r.id).subscribe(() => {
      this.toast.info('Review rejected.');
      this.load(this.page());
    });
  }

  protected toggleFeatured(r: Review): void {
    this.reviewService.setFeatured(r.id, !r.featured).subscribe(() => {
      this.toast.success(r.featured ? 'Removed from featured.' : 'Marked as featured.');
      this.load(this.page());
    });
  }

  protected async remove(r: Review): Promise<void> {
    const confirmed = await this.confirmService.confirm({ title: 'Delete review', message: 'Permanently delete this review?', confirmText: 'Delete', danger: true });
    if (!confirmed) return;
    this.reviewService.delete(r.id).subscribe(() => {
      this.toast.success('Review deleted.');
      this.load(this.page());
    });
  }
}
