import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoriteService } from '../../core/services/favorite.service';
import { Favorite } from '../../core/models/user.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: Favorite[] = [];
  loading = signal(false);

  constructor(private favoriteService: FavoriteService, private router: Router) {}

  ngOnInit() { this.loadFavorites(); }

  loadFavorites() {
    this.loading.set(true);
    this.favoriteService.getFavorites().subscribe({
      next: (res) => { this.favorites = res.data; this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  remove(id: string) {
    this.favoriteService.removeFavorite(id).subscribe(() => this.loadFavorites());
  }

  goToDetail(fav: Favorite) {
    const routes: any = { CHARACTER: 'characters', LOCATION: 'locations', EPISODE: 'episodes' };
    this.router.navigate([`/${routes[fav.type]}`, fav.externalId]);
  }
}