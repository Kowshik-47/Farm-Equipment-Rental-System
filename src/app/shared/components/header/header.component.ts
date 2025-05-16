import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header">
      <div class="container header-container">
        <div class="logo">
          <a routerLink="/">
            <span class="logo-icon">🚜</span>
            <span class="logo-text">AgroEquip</span>
          </a>
        </div>
        
        <nav class="header-nav">
          <ng-container *ngIf="authService.isAuthenticated()">
            <a *ngIf="authService.isAdmin()" routerLink="/admin/dashboard" class="nav-link">Admin Dashboard</a>
            <a *ngIf="!authService.isAdmin()" routerLink="/farmer/dashboard" class="nav-link">Dashboard</a>
            <a *ngIf="!authService.isAdmin()" routerLink="/farmer/equipment" class="nav-link">Equipment</a>
            <a *ngIf="!authService.isAdmin()" routerLink="/farmer/bookings" class="nav-link">My Bookings</a>
          </ng-container>
        </nav>
        
        <div class="header-actions">
          <div *ngIf="authService.isAuthenticated()" class="user-menu">
            <div class="user-info">
              <span class="user-name">{{ getUserName() }}</span>
              <span class="user-role">{{ getUserRole() }}</span>
            </div>
            <button (click)="logout()" class="btn btn-outline logout-btn">Logout</button>
          </div>
          
          <ng-container *ngIf="!authService.isAuthenticated()">
            <a routerLink="/auth/login" class="btn btn-outline">Login</a>
            <a routerLink="/auth/register" class="btn btn-primary">Sign Up</a>
          </ng-container>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background-color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
    }
    
    .logo a {
      display: flex;
      align-items: center;
      color: var(--neutral-900);
      font-weight: 600;
      font-size: 20px;
      text-decoration: none;
    }
    
    .logo-icon {
      font-size: 24px;
      margin-right: var(--space-2);
    }
    
    .logo-text {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
    }
    
    .header-nav {
      display: flex;
      gap: var(--space-4);
    }
    
    .nav-link {
      color: var(--neutral-700);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .nav-link:hover {
      color: var(--primary);
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    
    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    
    .user-info {
      text-align: right;
    }
    
    .user-name {
      display: block;
      font-weight: 500;
      color: var(--neutral-800);
    }
    
    .user-role {
      display: block;
      font-size: 12px;
      color: var(--neutral-600);
      text-transform: capitalize;
    }
    
    .logout-btn {
      padding: var(--space-1) var(--space-2);
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .header-nav {
        display: none;
      }
      
      .user-info {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}
  
  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.name : '';
  }
  
  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.role : '';
  }
  
  logout() {
    this.authService.logout();
  }
}