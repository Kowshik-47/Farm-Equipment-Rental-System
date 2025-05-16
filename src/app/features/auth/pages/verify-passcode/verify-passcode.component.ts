import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-passcode',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3CFxBl8k7Y0VvBSrXGOjqeEGJ52p6kwUneg&s" alt="AgroEquip Logo" class="logo" />
        <h2 class="text-center">AgroEquip</h2>
        <h3 class="text-center">Verify Passcode</h3>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="verifyPasscodeForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="passcode" class="form-label">Passcode</label>
            <input 
              type="text" 
              id="passcode" 
              formControlName="passcode" 
              class="form-control"
              placeholder="Enter the passcode"
            >
            <div *ngIf="verifyPasscodeForm.get('passcode')?.invalid && verifyPasscodeForm.get('passcode')?.touched" class="text-error">
              Passcode is required
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            [disabled]="verifyPasscodeForm.invalid || isLoading"
          >
            {{ isLoading ? 'Verifying...' : 'Verify Passcode' }}
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
export class VerifyPasscodeComponent {
  verifyPasscodeForm: FormGroup;
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
    this.verifyPasscodeForm = this.fb.group({
      passcode: ['', Validators.required]
    });

    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.errorMessage = 'Email is required. Please start over.';
    }
  }

  onSubmit() {
    if (this.verifyPasscodeForm.invalid || this.isLoading || !this.email) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { passcode } = this.verifyPasscodeForm.value;

    this.authService.verifyPasscode(this.email, passcode).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Passcode verified', 'Close', { duration: 3000 });
        this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid passcode. Please try again.';
      }
    });
  }
}