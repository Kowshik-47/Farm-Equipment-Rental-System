import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }
  
  // Redirect to farmer dashboard if they're authenticated but not admin
  if (authService.isAuthenticated()) {
    router.navigate(['/farmer/dashboard']);
  } else {
    router.navigate(['/auth/login']);
  }
  
  return false;
};