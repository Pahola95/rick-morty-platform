import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SortField {
  value: string;
  label: string;
}

export interface SortState {
  field: string;
  dir: 'asc' | 'desc';
}

@Component({
  selector: 'app-sort-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sort-bar.component.html',
})
export class SortBarComponent implements OnChanges {
  @Input() fields: SortField[] = [];
  @Output() sortChange = new EventEmitter<SortState>();

  field = '';
  dir: 'asc' | 'desc' = 'asc';

  ngOnChanges() {
    // Reset when fields list changes (page switch)
    if (this.fields.length && !this.fields.find(f => f.value === this.field)) {
      this.field = '';
    }
  }

  onFieldChange() {
    if (this.field) this.emit();
    else this.sortChange.emit({ field: '', dir: 'asc' });
  }

  toggleDir() {
    this.dir = this.dir === 'asc' ? 'desc' : 'asc';
    if (this.field) this.emit();
  }

  private emit() {
    this.sortChange.emit({ field: this.field, dir: this.dir });
  }
}
