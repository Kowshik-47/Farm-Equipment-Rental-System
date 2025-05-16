import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipmentService } from '../../../../core/services/equipment.service';
import { BookingService } from '../../../../core/services/booking.service';
import { Equipment } from '../../../../core/models/equipment.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './equipment-detail.component.html',
  styles: [`
    .equipment-detail-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .back-link {
      display: inline-block;
      margin-bottom: var(--space-4);
      color: var(--neutral-700);
      transition: color 0.3s ease;
    }
    
    .back-link:hover {
      color: var(--primary);
    }
    
    .equipment-detail-content {
      display: grid;
      grid-template-columns: 3fr 1fr;
      gap: var(--space-4);
    }
    
    .equipment-main-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    
    .equipment-images {
      overflow: hidden;
    }
    
    .primary-image {
      position: relative;
      height: 400px;
      overflow: hidden;
    }
    
    .primary-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .maintenance-badge {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      background-color: var(--error);
      color: white;
      padding: var(--space-2) var(--space-3);
      border-radius: 4px;
      font-weight: 500;
    }
    
    .thumbnail-images {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
      overflow-x: auto;
      padding-bottom: var(--space-2);
    }
    
    .thumbnail {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.3s ease;
    }
    
    .thumbnail:hover {
      border-color: var(--primary);
    }
    
    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .equipment-info {
      padding: var(--space-4);
    }
    
    .equipment-category {
      color: var(--neutral-600);
      margin-bottom: var(--space-3);
    }
    
    .equipment-rate {
      margin-bottom: var(--space-4);
      padding: var(--space-3);
      background-color: var(--primary-light);
      color: white;
      border-radius: 4px;
    }
    
    .rate-amount {
      font-size: 24px;
      font-weight: 600;
    }
    
    .rate-period {
      font-size: 16px;
    }
    
    .equipment-description,
    .equipment-features,
    .equipment-specifications {
      margin-bottom: var(--space-4);
    }
    
    .equipment-description p {
      line-height: 1.6;
    }
    
    .equipment-features ul {
      list-style: disc;
      padding-left: var(--space-4);
    }
    
    .equipment-features li {
      margin-bottom: var(--space-2);
    }
    
    .specifications-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }
    
    .specification-item {
      border-bottom: 1px solid var(--neutral-200);
      padding-bottom: var(--space-2);
    }
    
    .spec-label {
      font-size: 14px;
      color: var(--neutral-600);
      margin-bottom: 4px;
    }
    
    .spec-value {
      font-weight: 500;
    }
    
    .booking-card {
      padding: var(--space-4);
      height: fit-content;
      position: sticky;
      top: var(--space-4);
    }
    
    .maintenance-notice {
      background-color: var(--error);
      color: white;
      padding: var(--space-3);
      border-radius: 4px;
      margin: var(--space-3) 0;
    }
    
    .booking-summary {
      margin: var(--space-4) 0;
      padding: var(--space-3);
      background-color: var(--neutral-100);
      border-radius: 4px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }
    
    .summary-item.total {
      border-top: 1px solid var(--neutral-300);
      padding-top: var(--space-2);
      font-weight: 600;
      font-size: 18px;
    }
    
    .loading-state,
    .error-state {
      padding: var(--space-5);
      text-align: center;
    }
    
    @media (max-width: 992px) {
      .equipment-detail-content {
        grid-template-columns: 1fr;
      }
      
      .booking-card {
        position: static;
        margin-bottom: var(--space-4);
      }
    }
  `]
})
export class EquipmentDetailComponent implements OnInit {
  equipment: Equipment | null = null;
  loading: boolean = true;
  bookingForm: FormGroup;
  today: string = '';
  minEndDate: string = '';
  rentalDays: number = 0;
  totalAmount: number = 0;
  isSubmitting: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipmentService: EquipmentService,
    private bookingService: BookingService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    const currentDate = new Date();
    this.today = this.formatDate(currentDate);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    this.minEndDate = this.formatDate(nextDate);
    
    this.bookingForm = this.fb.group({
      startDate: [this.today, Validators.required],
      endDate: [this.minEndDate, Validators.required]
    });
  }
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadEquipment(id);
      } else {
        this.loading = false;
      }
    });
    
    // Calculate rental days and total when form changes
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateRental();
    });
  }
  
  loadEquipment(id: string) {
    this.loading = true;
    this.equipmentService.getEquipmentById(id).subscribe({
      next: (equipment) => {
        this.equipment = equipment;
        this.loading = false;
        this.calculateRental();
      },
      error: () => {
        this.equipment = null;
        this.loading = false;
      }
    });
  }
  
  getSpecifications(): { key: string, value: string }[] {
    if (!this.equipment || !this.equipment.specifications) {
      return [];
    }
    
    return Object.entries(this.equipment.specifications).map(([key, value]) => ({
      key,
      value
    }));
  }
  
  calculateRental() {
    const startDateValue = this.bookingForm.get('startDate')?.value;
    const endDateValue = this.bookingForm.get('endDate')?.value;
    
    if (startDateValue && endDateValue && this.equipment) {
      const startDate = new Date(startDateValue);
      const endDate = new Date(endDateValue);
      
      // Calculate difference in days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff > 0) {
        this.rentalDays = daysDiff;
        this.totalAmount = daysDiff * this.equipment.dailyRate;
      } else {
        this.rentalDays = -1;
        this.totalAmount = -1;
      }
    }
  }
  
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  onSubmit() {
    if (this.bookingForm.invalid || !this.equipment || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    const bookingData = {
      equipment: this.equipment._id,
      equipmentName: this.equipment.name,
      startDate: this.bookingForm.get('startDate')?.value,
      endDate: this.bookingForm.get('endDate')?.value,
      totalAmount: this.totalAmount
    };
    
    // Create a FormData instance for the booking with image upload capability
    const formData = new FormData();
    Object.entries(bookingData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (this.totalAmount == -1 || this.rentalDays == -1){
      this.isSubmitting = false
      this.snackBar.open('Invalid Dates', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return ;
    }
    
    this.bookingService.createBooking(formData).subscribe({
      next: (booking) => {
        this.isSubmitting = false;
        // Navigate to the payment page or booking confirmation
        this.router.navigate(['/farmer/bookings', booking._id]);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Booking error:', error);
        this.snackBar.open(error.error.message, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        // Handle error (show notification, etc.)
      }
    });
  }
}