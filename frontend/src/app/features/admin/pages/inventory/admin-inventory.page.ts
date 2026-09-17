import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { InventoryItem } from '../../../../core/models/inventory.model';
import { InventoryService } from '../../../../core/services/inventory.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { MediaUrlPipe } from '../../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [MediaUrlPipe, FormsModule, PaginationComponent],
  templateUrl: './admin-inventory.page.html',
})
export class AdminInventoryPage {
  private readonly inventoryService = inject(InventoryService);
  private readonly toast = inject(ToastService);
  private readonly search$ = new Subject<void>();

  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly editingId = signal<number | null>(null);
  protected editStock = 0;
  protected editThreshold = 0;

  protected q = '';
  protected lowStockOnly = false;

  constructor() {
    inject(SeoService).update('Inventory Management');
    this.load(0);
    this.search$.pipe(debounceTime(350)).subscribe(() => this.load(0));
  }

  protected onFilterChange(): void {
    this.search$.next();
  }

  private load(page: number): void {
    this.loading.set(true);
    this.inventoryService.search(this.q || undefined, this.lowStockOnly, page, 20).subscribe({
      next: (res) => {
        this.items.set(res.content);
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

  protected startEdit(item: InventoryItem): void {
    this.editingId.set(item.productId);
    this.editStock = item.stockQuantity;
    this.editThreshold = item.lowStockThreshold;
  }

  protected saveEdit(productId: number): void {
    this.inventoryService.updateStock(productId, { stockQuantity: this.editStock, lowStockThreshold: this.editThreshold }).subscribe(() => {
      this.editingId.set(null);
      this.toast.success('Stock updated.');
      this.load(this.page());
    });
  }
}
