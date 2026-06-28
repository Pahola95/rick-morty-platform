import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportFormat = 'csv' | 'pdf';

@Injectable({ providedIn: 'root' })
export class ExportService {
  /**
   * Exports an array of flat objects to CSV or PDF.
   * @param data  Array of records to export
   * @param filename  Base filename (without extension)
   * @param format  'csv' | 'pdf'
   * @param title  Optional heading shown in the PDF
   */
  export<T extends Record<string, any>>(
    data: T[],
    filename: string,
    format: ExportFormat,
    title = filename
  ): void {
    if (!data || data.length === 0) return;

    if (format === 'csv') {
      this.exportCsv(data, filename);
    } else {
      this.exportPdf(data, filename, title);
    }
  }

  private exportCsv<T extends Record<string, any>>(data: T[], filename: string): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
  }

  private exportPdf<T extends Record<string, any>>(
    data: T[],
    filename: string,
    title: string
  ): void {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Título
    doc.setFontSize(16);
    doc.text(title, 14, 16);

    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(h => String(item[h] ?? '')));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 22,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 188, 212] }, // info color
    });

    doc.save(`${filename}.pdf`);
  }
}
