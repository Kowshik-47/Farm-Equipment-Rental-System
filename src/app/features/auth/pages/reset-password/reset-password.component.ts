import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3CFxBl8k7Y0VvBSrXGOjqeEGJ52p6kwUneg&s" alt="AgroEquip Logo" class="logo" />
        <h2 class="text-center">AgroEquip</h2>
        <h3 class="text-center">Reset Password</h3>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="newPassword" class="form-label">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              formControlName="newPassword" 
              class="form-control"
              placeholder="Enter new password"
            >
            <div *ngIf="resetPasswordForm.get('newPassword')?.invalid && resetPasswordForm.get('newPassword')?.touched" class="text-error">
              Password is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              class="form-control"
              placeholder="Retype new password"
            >
            <div *ngIf="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched" class="text-error">
              Please confirm your password
            </div>
            <div *ngIf="resetPasswordForm.errors?.['mismatch'] && resetPasswordForm.get('confirmPassword')?.touched" class="text-error">
              Passwords do not match
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            [disabled]="resetPasswordForm.invalid || isLoading"
          >
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
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
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.errorMessage = 'Email is required. Please start over.';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid || this.isLoading || !this.email) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { newPassword } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.email, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }
}