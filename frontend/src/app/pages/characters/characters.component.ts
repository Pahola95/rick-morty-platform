import { Component, OnInit, signal, Signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CharacterService } from '../../core/services/character.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Character } from '../../core/models/character.model';
import { Favorite } from '../../core/models/user.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';
import { SortBarComponent, SortField, SortState } from '../../shared/components/sort-bar/sort-bar.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, PaginationComponent, SpinnerComponent, ExportButtonComponent, SortBarComponent],
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements OnInit {
  characters: WritableSignal<Character[]> = signal([]);
  favorites: WritableSignal<Favorite[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  currentPage = 1;
  totalPages = 1;
  filters = { name: '', status: '', species: '' };

  sort = signal<SortState>({ field: '', dir: 'asc' });

  readonly sortFields: SortField[] = [
    { value: 'id',      label: 'ID'       },
    { value: 'name',    label: 'Nombre'   },
    { value: 'status',  label: 'Estado'   },
    { value: 'species', label: 'Especie'  },
    { value: 'gender',  label: 'Género'   },
  ];

  /** Sorted view of the current page */
  sortedCharacters = computed(() => {
    const list = [...this.characters()];
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

  /** Flattened data ready for CSV / PDF export (respects current sort) */
  exportData = computed(() =>
    this.sortedCharacters().map(c => ({
      ID: c.id,
      Nombre: c.name,
      Estado: c.status,
      Especie: c.species,
      Tipo: c.type,
      Género: c.gender,
      Origen: c.origin?.name ?? '',
      Locación: c.location?.name ?? '',
    }))
  );

  constructor(
    private characterService: CharacterService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCharacters();
    this.loadFavorites();
  }

  loadCharacters() {
    this.loading.set(true);
    this.characterService.getCharacters(this.currentPage, this.filters).subscribe({
      next: (res) => {
        this.characters.set(res.data.results);
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
    return this.favorites().some(f => f.type === 'CHARACTER' && f.externalId === id);
  }

  toggleFavorite(character: Character) {
    const fav = this.favorites().find(f => f.type === 'CHARACTER' && f.externalId === character.id);
    if (fav) {
      this.favoriteService.removeFavorite(fav.id).subscribe(() => this.loadFavorites());
    } else {
      this.favoriteService.addFavorite({
        type: 'CHARACTER', externalId: character.id,
        name: character.name, image: character.image
      }).subscribe(() => this.loadFavorites());
    }
  }

  onSortChange(state: SortState) { this.sort.set(state); }
  applyFilters() { this.currentPage = 1; this.loadCharacters(); }
  onPageChange(page: number) { this.currentPage = page; this.loadCharacters(); }
  goToDetail(id: number) { this.router.navigate(['/characters', id]); }

  getStatusBadge(status: string): string {
    return status === 'Alive' ? 'bg-success' : status === 'Dead' ? 'bg-danger' : 'bg-secondary';
  }
}
