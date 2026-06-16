import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Character, CharacterStats } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  constructor(private api: ApiService) {}

  getCharacters(page = 1, filters: any = {}): Observable<any> {
    return this.api.get('/characters', { page, ...filters });
  }

  getCharacterById(id: number): Observable<any> {
    return this.api.get(`/characters/${id}`);
  }

  getCharacterStats(): Observable<{ success: boolean; data: CharacterStats }> {
    return this.api.get('/characters/stats');
  }

  getCharactersByIds(ids: string): Observable<any> {
    return this.api.get(`/characters/multiple/${ids}`);
  }
}