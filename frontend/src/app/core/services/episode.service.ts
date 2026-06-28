import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EpisodeStats } from '../models/episode.model';

@Injectable({ providedIn: 'root' })
export class EpisodeService {
  constructor(private api: ApiService) {}

  getEpisodes(page = 1, filters: any = {}): Observable<any> {
    return this.api.get('/episodes', { page, ...filters });
  }

  getEpisodeById(id: number | string): Observable<any> {
    return this.api.get(`/episodes/${id}`);
  }

  getEpisodeStats(): Observable<{ success: boolean; data: EpisodeStats }> {
    return this.api.get('/episodes/stats');
  }

  getLocalEpisodes(): Observable<any> {
    return this.api.get('/episodes/local');
  }

  deleteLocalEpisode(id: string): Observable<any> {
    return this.api.delete(`/episodes/local/${id}`);
  }

  deleteAllLocalEpisodes(): Observable<any> {
    return this.api.delete('/episodes/local/all');
  }

  uploadEpisodesCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postForm('/episodes/upload-csv', formData);
  }
}