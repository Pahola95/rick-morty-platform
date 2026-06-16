import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`.main-content { padding-top: 70px; }`]
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.isLoading$.pipe(
      filter(loading => !loading),
      take(1)
    ).subscribe(() => {
      this.auth.isAuthenticated$.pipe(take(1)).subscribe(isAuth => {
        if (!isAuth) {
          this.router.navigate(['/login']);
        }
      });
    });
  }
}