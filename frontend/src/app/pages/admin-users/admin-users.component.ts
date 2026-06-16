import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { SpinnerComponent } from "../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: WritableSignal<User[]> = signal([]);
  loading = signal(true);

  constructor(private userService: UserService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (res) => { this.users.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  changeRole(user: User) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.userService.updateRole(user.id, newRole).subscribe(() => this.loadUsers());
  }

  deleteUser(id: string) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}