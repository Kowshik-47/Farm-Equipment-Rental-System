import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: calc(100vh - 120px);
    }
    
    .content-area {
      flex: 1;
      padding: var(--space-4);
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .admin-layout {
        flex-direction: column;
      }
      
      .content-area {
        width: 100%;
      }
    }
  `]
})
export class AdminLayoutComponent {}