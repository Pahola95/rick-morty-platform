import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CharacterService } from '../../core/services/character.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { Character } from '../../core/models/character.model';
import { Favorite } from '../../core/models/user.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss']
})
export class CharacterDetailComponent implements OnInit {
  character: WritableSignal<Character | null> = signal(null);
  favorites: WritableSignal<Favorite[]> = signal([]);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.characterService.getCharacterById(id).subscribe({
      next: (res) => { this.character.set(res.data); this.loading.set(false); },
      error: () => this.router.navigate(['/characters'])
    });
    this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
  }

  isFavorite(): boolean {
    return this.favorites().some(f => f.type === 'CHARACTER' && f.externalId === this.character()?.id);
  }

  toggleFavorite() {
    const fav = this.favorites().find(f => f.type === 'CHARACTER' && f.externalId === this.character()?.id);
    if (fav) {
      this.favoriteService.removeFavorite(fav.id).subscribe(() => {
        this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
      });
    } else if (this.character()) {
      this.favoriteService.addFavorite({
        type: 'CHARACTER', externalId: this.character()?.id,
        name: this.character()?.name, image: this.character()?.image
      }).subscribe(() => {
        this.favoriteService.getFavorites().subscribe(res => this.favorites.set(res.data));
      });
    }
  }

  getEpisodeNumber(url: string): string {
    return url.split('/').pop() || '';
  }
}