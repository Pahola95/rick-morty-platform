import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { filter, switchMap, of } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Esperar a que Auth0 termine de cargar antes de decidir
  return auth.isLoading$.pipe(
    filter(isLoading => !isLoading),  // ← Esperar que termine de cargar
    switchMap(() => auth.isAuthenticated$),
    switchMap(isAuthenticated => {
      if (isAuthenticated) return of(true);
      router.navigate(['/login']);
      return of(false);
    })
  );
};