import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LocationStats } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private api: ApiService) {}

  getLocations(page = 1, filters: any = {}): Observable<any> {
    return this.api.get('/locations', { page, ...filters });
  }

  getLocationById(id: number): Observable<any> {
    return this.api.get(`/locations/${id}`);
  }

  getLocationStats(): Observable<{ success: boolean; data: LocationStats }> {
    return this.api.get('/locations/stats');
  }
}