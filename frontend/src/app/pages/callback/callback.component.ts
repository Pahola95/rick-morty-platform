import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="callback-container">
      <app-spinner *ngIf="!error"></app-spinner>
      <div *ngIf="error" class="alert alert-danger">
        <h4>Error en autenticación</h4>
        <p>{{ error }}</p>
        <a href="/login" class="btn btn-primary">Volver al login</a>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .alert {
      padding: 20px;
      border-radius: 4px;
      max-width: 500px;
    }
  `]
})
export class CallbackComponent implements OnInit {
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check for errors in URL query params
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        console.error('[CallbackComponent] Auth0 error:', params['error']);
        console.error('[CallbackComponent] Error description:', params['error_description']);
        this.error = params['error_description'] || params['error'] || 'Unknown error';
        return;
      }

      // Wait for Auth0 to process the callback
      console.log('[CallbackComponent] Processing Auth0 callback');
      this.auth.isAuthenticated$.subscribe(isAuth => {
        console.log('[CallbackComponent] isAuthenticated:', isAuth);
        if (isAuth) {
          console.log('[CallbackComponent] User authenticated, redirecting to dashboard');
          setTimeout(() => this.router.navigate(['/dashboard']), 500);
        }
      });
    });
  }
}