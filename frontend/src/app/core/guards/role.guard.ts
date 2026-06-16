import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.userService.getProfile().pipe(
      map(res => {
        if (res.data.role === 'ADMIN') return true;
        this.router.navigate(['/dashboard']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }
}