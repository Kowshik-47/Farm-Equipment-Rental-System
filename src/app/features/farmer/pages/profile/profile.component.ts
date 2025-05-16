import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-page fade-in">
      <h2>My Profile</h2>
      
      <div class="card">
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name" class="form-label">Full Name</label>
            <input type="text" id="name" formControlName="name" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" [value]="user?.email" disabled class="form-control">
          </div>
          
          <div class="form-group">
            <label for="phone" class="form-label">Phone Number</label>
            <input type="tel" id="phone" formControlName="phone" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="address" class="form-label">Address</label>
            <textarea id="address" formControlName="address" class="form-control" rows="3"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || isSubmitting">
            {{isSubmitting ? 'Saving...' : 'Save Changes'}}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.pattern('^[0-9]{10}$')],
      address: ['']
    });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        phone: this.user.phone,
        address: this.user.address
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.authService.updateUserProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.isSubmitting = false;
        this.user = updatedUser;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating profile:', error);
      }
    });
  }
}