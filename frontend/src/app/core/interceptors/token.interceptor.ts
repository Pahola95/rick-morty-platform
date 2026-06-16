import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const requestUrl = req.url;
    const apiPath = '/api';
    const isApiRequest =
      requestUrl.startsWith(environment.apiUrl) ||
      requestUrl.startsWith(apiPath) ||
      requestUrl.includes(`${apiPath}/`) ||
      requestUrl.includes(`://${window.location.hostname}${apiPath}`);

    console.log('[TokenInterceptor] requestUrl:', requestUrl);
    console.log('[TokenInterceptor] environment.apiUrl:', environment.apiUrl);
    console.log('[TokenInterceptor] isApiRequest:', isApiRequest);

    if (!isApiRequest) {
      return next.handle(req);
    }

    console.log('[TokenInterceptor] requesting token for audience:', environment.auth0.audience);

    return this.auth.getAccessTokenSilently({ authorizationParams: { audience: environment.auth0.audience } as any }).pipe(
      switchMap(token => {
        console.log('[TokenInterceptor] token acquired:', !!token);
        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(authReq);
      }),
      catchError(error => {
        console.error('[TokenInterceptor] Token retrieval error:', error);
        return throwError(() => error);
      })
    );
  }
}