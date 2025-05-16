import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>Admin Portal</h3>
        <div class="admin-info">
          <div class="admin-name">{{ authService.getCurrentUser()?.name }}</div>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/admin/dashboard" routerLinkActive="active">
              <span class="icon">📊</span>
              <span class="text">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/equipment" routerLinkActive="active">
              <span class="icon">🚜</span>
              <span class="text">Equipment</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/bookings" routerLinkActive="active">
              <span class="icon">📆</span>
              <span class="text">Bookings</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/users" routerLinkActive="active">
              <span class="icon">👥</span>
              <span class="text">Users</span>
            </a>
          </li>
          <li>
            <a (click)="logout()" class="logout">
              <span class="icon">🚪</span>
              <span class="text">Logout</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background-color: white;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      height: 100%;
      transition: all 0.3s ease;
    }
    
    .sidebar-header {
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .admin-info {
      margin-top: var(--space-2);
    }
    
    .admin-name {
      font-weight: 500;
      color: var(--primary);
    }
    
    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      color: var(--neutral-700);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .sidebar-nav a:hover {
      background-color: var(--primary-light);
      color: white;
    }
    
    .sidebar-nav a.active {
      background-color: var(--primary);
      color: white;
    }
    
    .icon {
      margin-right: var(--space-3);
      font-size: 18px;
    }
    
    a.logout {
      color: var(--error);
    }
    
    a.logout:hover {
      background-color: var(--error);
      color: white;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
      }
      
      .sidebar-nav ul {
        display: flex;
        overflow-x: auto;
      }
      
      .sidebar-nav a {
        padding: var(--space-2);
        flex-direction: column;
        text-align: center;
      }
      
      .icon {
        margin-right: 0;
        margin-bottom: var(--space-1);
      }
    }
  `]
})
export class AdminSidebarComponent {
  constructor(public authService: AuthService) {}
  
  logout() {
    this.authService.logout();
  }
}