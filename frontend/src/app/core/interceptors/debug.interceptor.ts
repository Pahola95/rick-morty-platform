import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith(environment.apiUrl) || req.url.includes('/api/')) {
      console.log('[DebugInterceptor] API request:', req.url);
      console.log('[DebugInterceptor] Authorization header:', req.headers.get('Authorization'));
    }
    return next.handle(req);
  }
}
