import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav *ngIf="totalPages > 1">
      <ul class="pagination justify-content-center">
        <li class="page-item" [class.disabled]="currentPage === 1">
          <button class="page-link" (click)="changePage(currentPage - 1)">‹</button>
        </li>
        <li class="page-item" *ngFor="let p of getPages()"
            [class.active]="p === currentPage">
          <button class="page-link" (click)="changePage(p)">{{ p }}</button>
        </li>
        <li class="page-item" [class.disabled]="currentPage === totalPages">
          <button class="page-link" (click)="changePage(currentPage + 1)">›</button>
        </li>
      </ul>
    </nav>
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  getPages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}