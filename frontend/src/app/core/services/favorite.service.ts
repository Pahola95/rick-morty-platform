import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Favorite } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  constructor(private api: ApiService) {}

  getFavorites(): Observable<{ success: boolean; data: Favorite[] }> {
    return this.api.get('/favorites');
  }

  addFavorite(data: Partial<Favorite>): Observable<any> {
    return this.api.post('/favorites', data);
  }

  removeFavorite(id: string): Observable<any> {
    return this.api.delete(`/favorites/${id}`);
  }
}