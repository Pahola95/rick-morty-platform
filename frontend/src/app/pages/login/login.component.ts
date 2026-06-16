import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  bubbles = Array.from({ length: 10 });
  loginError: string | null = null;
  isLoading = false;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isAuth => {
      console.log('[LoginComponent] isAuthenticated:', isAuth);
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  login() {
    console.log('[LOGIN] Iniciando redirect...');
    this.isLoading = true;

    this.auth.loginWithRedirect({
      authorizationParams: {
        redirect_uri: environment.auth0.redirectUri
      }
    }).subscribe({
      next: () => console.log('[LOGIN] Redirect iniciado'),
      error: (err) => {
        console.error('[LOGIN] Error:', err);
        this.loginError = err.message;
        this.isLoading = false;
      }
    });
  }
}