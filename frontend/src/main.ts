import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { AuthModule } from '@auth0/auth0-angular';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { routes } from './app/app.routes';
import { DebugInterceptor } from './app/core/interceptors/debug.interceptor';
import { TokenInterceptor } from './app/core/interceptors/token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
     provideHttpClient(withInterceptorsFromDi()), // ← Este es el cambio clave
    { provide: HTTP_INTERCEPTORS, useClass: DebugInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      AuthModule.forRoot({
        domain: environment.auth0.domain,
        clientId: environment.auth0.clientId,
        authorizationParams: {
          redirect_uri: environment.auth0.redirectUri,
          audience: environment.auth0.audience
        },
        httpInterceptor: {
          allowedList: [
            {
              uri: `${environment.apiUrl}/*`,
              tokenOptions: {
                authorizationParams: {
                  audience: environment.auth0.audience
                }
              }
            }
          ]
        }
      })
    )
  ]
}).catch((err) => console.error(err));
