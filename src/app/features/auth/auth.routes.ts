import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent : () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forget-password/forget-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'verify-passcode',
    loadComponent: () => import('./pages/verify-passcode/verify-passcode.component').then(m => m.VerifyPasscodeComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path :'**',
    redirectTo :'/login',
    pathMatch:'full'
  }
];