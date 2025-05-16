import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3CFxBl8k7Y0VvBSrXGOjqeEGJ52p6kwUneg&s" alt="AgroEquip Logo" class="logo" />
        <br>
        <h2 class="text-center">AgroEquip</h2>
        <h3 class="text-center">Login to Your Account</h3>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              placeholder="Enter your email"
            >
            <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-error">
              Please enter a valid email address
            </div>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              placeholder="Enter your password"
            >
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-error">
              Password is required
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            [disabled]="loginForm.invalid || isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        <div class="mt-3 text-center">
          <p>Don't have an account? <a routerLink="/auth/register">Register now</a></p>
          <p>Forgot your password? <a routerLink="/auth/forgot-password">Forgot Password</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 85vh;
      padding: var(--space-4);
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
    }
    
    .auth-card {
      width: 100%;
      max-width: 450px;
      padding: var(--space-5);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .auth-card img{
      height: 100px;
      width: 100px;
      border-radius: 50%;
    }
    
    h2 {
      color: var(--primary);
      margin-bottom: var(--space-2);
    }
    
    h3 {
      margin-bottom: var(--space-4);
      color: var(--neutral-700);
    }
    
    form {
      margin-top: var(--space-4);
    }
    
    .alert {
      padding: var(--space-3);
      border-radius: 4px;
      margin-bottom: var(--space-3);
    }
    
    .alert-danger {
      background-color: #ffebee;
      color: var(--error);
      border: 1px solid #ffcdd2;
    }
    
    .mt-3 {
      margin-top: var(--space-3);
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  returnUrl: string = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }
  
  onSubmit() {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/farmer/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}