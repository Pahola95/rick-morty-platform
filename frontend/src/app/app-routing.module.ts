import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { LoginComponent } from './pages/login/login.component';


const routes: Routes = [
{ path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'characters', component: CharactersComponent, canActivate: [AuthGuard] },
  { path: 'characters/:id', component: CharacterDetailComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}