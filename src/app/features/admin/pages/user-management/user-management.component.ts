import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-management fade-in">
      <h2>User Management</h2>
      
      <div class="user-list">
        @for (user of users; track user._id) {
          <div class="user-card card">
            <div class="user-header">
              <h4>{{user.name}}</h4>
              <span class="badge" [ngClass]="user.role === 'admin' ? 'badge-success' : 'badge-primary'">
                {{user.role}}
              </span>
            </div>
            
            <div class="user-details">
              <p><strong>Email:</strong> {{user.email}}</p>
              @if (user.phone) {
                <p><strong>Phone:</strong> {{user.phone}}</p>
              }
              @if (user.address) {
                <p><strong>Address:</strong> {{user.address}}</p>
              }
            </div>
            
            <div class="user-actions">
              @if (user.role === 'farmer') {
                <button class="btn btn-primary" (click)="promoteToAdmin(user._id)">
                  Promote to Admin
                </button>
              }
              @if (user.role === 'admin') {
                <button class="btn btn-warning" (click)="demoteToFarmer(user._id)">
                  Demote to Farmer
                </button>
              }
              <button class="btn btn-error" (click)="deleteUser(user._id)">
                Delete User
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <p>No users found</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .user-management {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .user-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }
    
    .user-card {
      height: 100%;
    }
    
    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .user-details {
      margin-bottom: var(--space-3);
    }
    
    .user-details p {
      margin-bottom: var(--space-2);
    }
    
    .user-actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  promoteToAdmin(userId: string) {
    if (confirm('Are you sure you want to promote this user to admin?')) {
      this.userService.promoteToAdmin(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error promoting user:', error);
        }
      });
    }
  }

  demoteToFarmer(userId: string) {
    if (confirm('Are you sure you want to demote this user to farmer?')) {
      this.userService.demoteFromAdmin(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error demoting user:', error);
        }
      });
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }
}