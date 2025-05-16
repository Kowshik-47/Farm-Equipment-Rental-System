import { Routes } from '@angular/router';
import { FarmerLayoutComponent } from './components/farmer-layout/farmer-layout.component';

export const FARMER_ROUTES: Routes = [
  {
    path: '',
    component: FarmerLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'equipment',
        loadComponent: () => import('./pages/equipment-list/equipment-list.component').then(m => m.EquipmentListComponent)
      },
      {
        path: 'equipment/:id',
        loadComponent: () => import('./pages/equipment-detail/equipment-detail.component').then(m => m.EquipmentDetailComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/booking-list/booking-list.component').then(m => m.BookingListComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];