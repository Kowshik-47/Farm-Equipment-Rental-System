import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FarmerSidebarComponent } from '../farmer-sidebar/farmer-sidebar.component';

@Component({
  selector: 'app-farmer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FarmerSidebarComponent],
  template: `
    <div class="farmer-layout">
      <app-farmer-sidebar></app-farmer-sidebar>
      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .farmer-layout {
      display: flex;
      min-height: calc(100vh - 120px);
    }
    
    .content-area {
      flex: 1;
      padding: var(--space-4);
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .farmer-layout {
        flex-direction: column;
      }
      
      .content-area {
        width: 100%;
      }
    }
  `]
})
export class FarmerLayoutComponent {}