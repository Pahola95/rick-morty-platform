import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { LocationDetailComponent } from './pages/location-detail/location-detail.component';
import { EpisodesComponent } from './pages/episodes/episodes.component';
import { EpisodeDetailComponent } from './pages/episode-detail/episode-detail.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminEpisodesUploadComponent } from './pages/admin-episodes-upload/admin-episodes-upload.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'characters', component: CharactersComponent, canActivate: [AuthGuard] },
  { path: 'characters/:id', component: CharacterDetailComponent, canActivate: [AuthGuard] },
  { path: 'locations', component: LocationsComponent, canActivate: [AuthGuard] },
  { path: 'locations/:id', component: LocationDetailComponent, canActivate: [AuthGuard] },
  { path: 'episodes', component: EpisodesComponent, canActivate: [AuthGuard] },
  { path: 'episodes/:id', component: EpisodeDetailComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'admin/episodes/upload', component: AdminEpisodesUploadComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];