import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <div class="container footer-container">
        <div class="footer-logo">
          <span class="logo-icon">🚜</span>
          <span class="logo-text">AgroEquip</span>
        </div>
        <div class="links">
          <a href="#">Terms of Use | </a><a href="#">Policy | </a><a href="#">License</a>
        </div>
        <div class="footer-text">
          &copy; {{ currentYear }} Farm Equipment Rental System. All rights reserved.
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: var(--neutral-800);
      color: white;
      padding: var(--space-4) 0;
      margin-top: auto;
    }
    
    .footer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      text-align: center;
    }
    
    .footer-logo {
      display: flex;
      align-items: center;
      font-size: 18px;
    }
    
    .logo-icon {
      font-size: 24px;
      margin-right: var(--space-2);
    }
    
    .logo-text {
      font-weight: 600;
    }
    
    .footer-text {
      opacity: 0.8;
      font-size: 14px;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}