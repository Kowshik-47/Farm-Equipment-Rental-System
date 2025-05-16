import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'equipment',
        loadComponent: () => import('./pages/equipment-management/equipment-management.component').then(m => m.EquipmentManagementComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/booking-management/booking-management.component').then(m => m.BookingManagementComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: '/auth/login',
        pathMatch: 'full'
      }
    ]
  }
];