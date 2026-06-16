import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<{ success: boolean; data: User }> {
    return this.api.get('/users/profile');
  }

  getAllUsers(): Observable<{ success: boolean; data: User[] }> {
    return this.api.get('/users');
  }

  updateRole(id: string, role: string): Observable<any> {
    return this.api.put(`/users/${id}/role`, { role });
  }

  deleteUser(id: string): Observable<any> {
    return this.api.delete(`/users/${id}`);
  }
}