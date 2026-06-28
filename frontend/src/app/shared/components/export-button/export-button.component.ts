import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService, ExportFormat } from '../../../core/services/export.service';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-button.component.html',
})
export class ExportButtonComponent {
  /** The data to export (current filtered result set) */
  @Input() data: Record<string, any>[] = [];
  /** Base filename without extension */
  @Input() filename = 'export';
  /** Title shown in the PDF header */
  @Input() title = 'Exportar';

  exporting = signal(false);

  constructor(private exportService: ExportService) {}

  download(format: ExportFormat): void {
    if (!this.data.length) return;
    this.exporting.set(true);
    // Use a microtask so the spinner renders before the (potentially heavy) work
    setTimeout(() => {
      this.exportService.export(this.data, this.filename, format, this.title);
      this.exporting.set(false);
    }, 0);
  }
}
