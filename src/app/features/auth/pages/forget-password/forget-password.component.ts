import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3CFxBl8k7Y0VvBSrXGOjqeEGJ52p6kwUneg&s" alt="AgroEquip Logo" class="logo" />
        <h2 class="text-center">AgroEquip</h2>
        <h3 class="text-center">Forgot Password</h3>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              placeholder="Enter your email"
            >
            <div *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched" class="text-error">
              Please enter a valid email address
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            [disabled]="forgotPasswordForm.invalid || isLoading"
          >
            {{ isLoading ? 'Sending...' : 'Send Passcode' }}
          </button>
        </form>
        
        <div class="mt-3 text-center">
          <p>Back to <a routerLink="/auth/login">Login</a></p>
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

    .auth-card img {
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
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email } = this.forgotPasswordForm.value;

    this.authService.requestPasscode(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Passcode sent to your email', 'Close', { duration: 3000 });
        this.router.navigate(['/auth/verify-passcode'], { queryParams: { email } });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to send passcode. Please try again.';
      }
    });
  }
}