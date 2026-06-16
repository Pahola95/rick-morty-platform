import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EpisodeService } from '../../core/services/episode.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Episode } from '../../core/models/episode.model';
import { Favorite } from '../../core/models/user.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-episode-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './episode-detail.component.html',
  styleUrls: ['./episode-detail.component.scss']
})
export class EpisodeDetailComponent implements OnInit {
  episode: WritableSignal<Episode | null> = signal(null);
  favorites: WritableSignal<Favorite[]> = signal([]);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private episodeService: EpisodeService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.episodeService.getEpisodeById(id).subscribe({
      next: (res) => {
        this.episode.set(res.data);
        this.loading.set(false);
      },
      error: () => this.router.navigate(['/episodes'])
    });
    this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
  }

  isFavorite(): boolean {
    return this.favorites().some(f => f.type === 'EPISODE' && f.externalId === this.episode()?.id);
  }

  toggleFavorite() {
    const fav = this.favorites().find(f => f.type === 'EPISODE' && f.externalId === this.episode()?.id);
    if (fav) {
      this.favoriteService.removeFavorite(fav.id).subscribe(() => {
        this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
      });
    } else if (this.episode) {
      this.favoriteService.addFavorite({
        type: 'EPISODE',
        externalId: this.episode()?.id,
        name: this.episode()?.name
      }).subscribe(() => {
        this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
      });
    }
  }

  getCharacterId(url: string): string {
    return url.split('/').pop() || '';
  }

  getSeasonInfo(episodeCode: string): string {
    if (!episodeCode) return '';
    const season = episodeCode.substring(1, 3);
    const episode = episodeCode.substring(4, 6);
    return `Temporada ${parseInt(season)} — Episodio ${parseInt(episode)}`;
  }
}