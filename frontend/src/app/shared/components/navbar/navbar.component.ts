import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: WritableSignal<User | null> = signal(null);
  isAuthenticated$!: Observable<boolean>;

  constructor(public auth: AuthService, private userService: UserService) {
    this.isAuthenticated$ = auth.isAuthenticated$;
  }

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.userService.getProfile().subscribe(res => {
          this.user.set(res.data);
        });
      }
    });
  }

  login() { this.auth.loginWithRedirect(); }
  logout() {
  this.auth.logout({
    logoutParams: {
      returnTo: 'http://localhost:4200/login'  // ← Cambiar a /login
    }
  });
}
}