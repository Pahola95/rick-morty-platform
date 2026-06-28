import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EpisodeService } from '../../core/services/episode.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

interface UploadResult {
  inserted: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

@Component({
  selector: 'app-admin-episodes-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './admin-episodes-upload.component.html',
  styleUrls: ['./admin-episodes-upload.component.scss'],
})
export class AdminEpisodesUploadComponent {
  selectedFile: WritableSignal<File | null> = signal(null);
  loading = signal(false);
  result: WritableSignal<UploadResult | null> = signal(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showDeleteModal = signal(false);
  deleteModalMessage = signal<string>('');

  constructor(private episodeService: EpisodeService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.setFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0] ?? null;
    this.setFile(file);
  }

  private setFile(file: File | null): void {
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      this.errorMessage.set('Solo se permiten archivos .csv');
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);
    this.result.set(null);
    this.successMessage.set(null);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.result.set(null);
    this.successMessage.set(null);

    this.episodeService.uploadEpisodesCSV(file).subscribe({
      next: (res: any) => {
        this.result.set(res.data);
        this.successMessage.set(res.message);
        this.loading.set(false);
        this.selectedFile.set(null);
        // Reset the file input visually
        const input = document.getElementById('csvFileInput') as HTMLInputElement;
        if (input) input.value = '';
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message ?? 'Ocurrió un error al cargar el archivo'
        );
        this.loading.set(false);
      },
    });
  }

  deleteAllEpisodes(): void {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los episodios cargados desde CSV?\nEsta acción no se puede deshacer.')) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.episodeService.deleteAllLocalEpisodes().subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.deleteModalMessage.set(res.data?.message ?? 'Episodios eliminados correctamente');
        this.showDeleteModal.set(true);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message ?? 'Ocurrió un error al eliminar los episodios'
        );
        this.loading.set(false);
      },
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.result.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const input = document.getElementById('csvFileInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
