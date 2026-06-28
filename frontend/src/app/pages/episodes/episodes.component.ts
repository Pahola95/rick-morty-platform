import { Component, OnInit, signal, Signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EpisodeService } from '../../core/services/episode.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Episode } from '../../core/models/episode.model';
import { Favorite } from '../../core/models/user.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';
import { SortBarComponent, SortField, SortState } from '../../shared/components/sort-bar/sort-bar.component';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SpinnerComponent, PaginationComponent, ExportButtonComponent, SortBarComponent],
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.scss']
})
export class EpisodesComponent implements OnInit {
  episodes: WritableSignal<Episode[]> = signal([]);
  favorites: WritableSignal<Favorite[]> = signal([]);
  loading = signal(false);
  currentPage = 1;
  totalPages = 1;
  filters = { name: '', episode: '' };

  sort = signal<SortState>({ field: '', dir: 'asc' });

  readonly sortFields: SortField[] = [
    { value: 'id',       label: 'ID'              },
    { value: 'name',     label: 'Nombre'          },
    { value: 'episode',  label: 'Código'          },
    { value: 'air_date', label: 'Fecha de emisión'},
  ];

  sortedEpisodes = computed(() => {
    const list = [...this.episodes()];
    const { field, dir } = this.sort();
    if (!field) return list;
    return list.sort((a, b) => {
      const av = (a as any)[field] ?? '';
      const bv = (b as any)[field] ?? '';
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), 'es', { sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  exportData = computed(() =>
    this.sortedEpisodes().map(e => ({
      ID: e.id,
      Nombre: e.name,
      'Fecha de emisión': e.air_date,
      Episodio: e.episode,
      Personajes: e.characters?.length ?? 0,
    }))
  );

  constructor(
    private episodeService: EpisodeService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEpisodes();
    this.loadFavorites();
  }

  loadEpisodes() {
    this.loading.set(true);
    this.episodeService.getEpisodes(this.currentPage, this.filters).subscribe({
      next: (res) => {
        this.episodes.set(res.data.results);
        this.totalPages = res.data.info.pages;
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  loadFavorites() {
    this.favoriteService.getFavorites().subscribe(res => {
      this.favorites.set(res.data);
    });
  }

  isFavorite(id: number): boolean {
    return this.favorites().some(f => f.type === 'EPISODE' && f.externalId === id);
  }

  toggleFavorite(episode: Episode) {
    const fav = this.favorites().find(f => f.type === 'EPISODE' && f.externalId === episode.id);
    if (fav) {
      this.favoriteService.removeFavorite(fav.id).subscribe(() => this.loadFavorites());
    } else {
      this.favoriteService.addFavorite({
        type: 'EPISODE',
        externalId: episode.id,
        name: episode.name
      }).subscribe(() => this.loadFavorites());
    }
  }

  onSortChange(state: SortState) { this.sort.set(state); }
  applyFilters() { this.currentPage = 1; this.loadEpisodes(); }
  onPageChange(page: number) { this.currentPage = page; this.loadEpisodes(); }
  goToDetail(id: number) { this.router.navigate(['/episodes', id]); }

  getSeasonNumber(episodeCode: string): string {
    return episodeCode ? episodeCode.substring(0, 3) : '';
  }
}
