import { Component, OnInit, signal, Signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Location } from '../../core/models/location.model';
import { Favorite } from '../../core/models/user.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';
import { SortBarComponent, SortField, SortState } from '../../shared/components/sort-bar/sort-bar.component';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SpinnerComponent, PaginationComponent, ExportButtonComponent, SortBarComponent],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  locations: WritableSignal<Location[]> = signal([]);
  favorites: WritableSignal<Favorite[]> = signal([]);
  loading = signal(false);
  currentPage = 1;
  totalPages = 1;
  filters = { name: '', type: '', dimension: '' };

  sort = signal<SortState>({ field: '', dir: 'asc' });

  readonly sortFields: SortField[] = [
    { value: 'id',        label: 'ID'         },
    { value: 'name',      label: 'Nombre'     },
    { value: 'type',      label: 'Tipo'       },
    { value: 'dimension', label: 'Dimensión'  },
  ];

  sortedLocations = computed(() => {
    const list = [...this.locations()];
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
    this.sortedLocations().map(l => ({
      ID: l.id,
      Nombre: l.name,
      Tipo: l.type,
      Dimensión: l.dimension,
      Residentes: l.residents?.length ?? 0,
    }))
  );

  constructor(
    private locationService: LocationService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadFavorites();
  }

  loadLocations() {
    this.loading.set(true);
    this.locationService.getLocations(this.currentPage, this.filters).subscribe({
      next: (res) => {
        this.locations.set(res.data.results);
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
    return this.favorites().some(f => f.type === 'LOCATION' && f.externalId === id);
  }

  toggleFavorite(location: Location) {
    const fav = this.favorites().find(f => f.type === 'LOCATION' && f.externalId === location.id);
    if (fav) {
      this.favoriteService.removeFavorite(fav.id).subscribe(() => this.loadFavorites());
    } else {
      this.favoriteService.addFavorite({
        type: 'LOCATION',
        externalId: location.id,
        name: location.name
      }).subscribe(() => this.loadFavorites());
    }
  }

  onSortChange(state: SortState) { this.sort.set(state); }
  applyFilters() { this.currentPage = 1; this.loadLocations(); }
  onPageChange(page: number) { this.currentPage = page; this.loadLocations(); }
  goToDetail(id: number) { this.router.navigate(['/locations', id]); }
}
