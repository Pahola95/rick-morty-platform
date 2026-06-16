import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Location } from '../../core/models/location.model';
import { Favorite } from '../../core/models/user.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss']
})
export class LocationDetailComponent implements OnInit {
  location: WritableSignal<Location | null> = signal(null);
  favorites: WritableSignal<Favorite[]> = signal([]);
  loading = signal(true);
  totalResidents = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.locationService.getLocationById(id).subscribe({
      next: (res) => {
        this.location.set(res.data);
        this.totalResidents = res.data.residents?.length || 0;
        this.loading.set(false);
      },
      error: () => this.router.navigate(['/locations'])
    });
    this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
  }

  isFavorite(): boolean {
    return this.favorites().some(f => f.type === 'LOCATION' && f.externalId === this.location()?.id);
  }

  toggleFavorite() {
    const fav = this.favorites().find(f => f.type === 'LOCATION' && f.externalId === this.location()?.id);
    if (fav) {
      this.favoriteService.removeFavorite(fav.id).subscribe(() => {
        this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
      });
    } else if (this.location()) {
      this.favoriteService.addFavorite({
        type: 'LOCATION',
        externalId: this.location()?.id,
        name: this.location()?.name
      }).subscribe(() => {
        this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
      });
    }
  }

  getResidentId(url: string): string {
    return url.split('/').pop() || '';
  }
}