import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <h2 class="text-center">Farm Equipment Rental</h2>
        <h3 class="text-center">Create an Account</h3>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name" class="form-label">Full Name</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              class="form-control"
              placeholder="Enter your full name"
            >
            <div *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" class="text-error">
              Full name is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              placeholder="Enter your email"
            >
            <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-error">
              Please enter a valid email address
            </div>
          </div>
          
          <div class="form-group">
            <label for="phone" class="form-label">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              formControlName="phone" 
              class="form-control"
              placeholder="Enter your phone number"
            >
            <div *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched" class="text-error">
              Please enter a valid phone number
            </div>
          </div>
          
          <div class="form-group">
            <label for="address" class="form-label">Address</label>
            <textarea
              id="address" 
              formControlName="address" 
              class="form-control"
              placeholder="Enter your address"
              rows="2"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              placeholder="Create a password"
            >
            <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-error">
              Password must be at least 6 characters
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              class="form-control"
              placeholder="Confirm your password"
            >
            <div *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched" class="text-error">
              Passwords do not match
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            [disabled]="registerForm.invalid || isLoading"
          >
            {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>
        
        <div class="mt-3 text-center">
          <p>Already have an account? <a routerLink="/auth/login">Login here</a></p>
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
      max-width: 500px;
      padding: var(--space-5);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^[0-9]{10}$')],
      address: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  onSubmit() {
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const { confirmPassword, ...userData } = this.registerForm.value;
    userData.role = 'farmer'; // Default role for sign up
    
    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/auth/login'], { 
          queryParams: { registered: 'success' } 
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}