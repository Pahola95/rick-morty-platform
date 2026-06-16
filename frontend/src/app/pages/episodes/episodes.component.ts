import { Component, OnInit, signal, WritableSignal } from '@angular/core';
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

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SpinnerComponent, PaginationComponent],
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

  applyFilters() { this.currentPage = 1; this.loadEpisodes(); }
  onPageChange(page: number) { this.currentPage = page; this.loadEpisodes(); }
  goToDetail(id: number) { this.router.navigate(['/episodes', id]); }

  getSeasonNumber(episodeCode: string): string {
    return episodeCode ? episodeCode.substring(0, 3) : '';
  }
}