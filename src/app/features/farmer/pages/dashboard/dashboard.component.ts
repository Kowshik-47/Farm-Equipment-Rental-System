import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../core/models/booking.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .status-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-5);
    }
    
    .status-card {
      display: flex;
      align-items: center;
      padding: var(--space-4);
    }
    
    .status-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: var(--space-3);
    }
    
    .status-icon.confirmed {
      background-color: rgba(76, 175, 80, 0.2);
      color: var(--primary);
    }
    
    .status-icon.pending {
      background-color: rgba(255, 152, 0, 0.2);
      color: var(--accent);
    }
    
    .status-icon.completed {
      background-color: rgba(33, 150, 243, 0.2);
      color: #2196F3;
    }
    
    .status-icon.action {
      background-color: rgba(141, 110, 99, 0.2);
      color: var(--secondary);
    }
    
    .status-content {
      flex: 1;
    }
    
    .status-content h3 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: var(--space-1);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .view-all {
      font-size: 14px;
      font-weight: 500;
    }
    
    .recent-section {
      margin-bottom: var(--space-5);
    }
    
    .booking-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }
    
    .booking-card {
      transition: all 0.3s ease;
    }
    
    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .booking-dates {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }
    
    .date-label {
      font-size: 12px;
      color: var(--neutral-600);
    }
    
    .date-value {
      font-weight: 500;
    }
    
    .booking-footer {
      display: flex;
      justify-content: flex-end;
    }
    
    .badge {
      font-size: 12px;
      padding: 3px 8px;
    }
    
    .badge-confirmed {
      background-color: var(--success);
    }
    
    .badge-pending {
      background-color: var(--warning);
    }
    
    .badge-cancelled {
      background-color: var(--error);
    }
    
    .badge-completed {
      background-color: var(--neutral-600);
    }

    .badge-Progress {
      background-color: var(--warning);
    }

    .badge-active {
      background-color: var(--success);
    }
    
    .empty-state {
      padding: var(--space-5);
      text-align: center;
    }
    
    .empty-state p {
      margin-bottom: var(--space-3);
      color: var(--neutral-600);
    }
    
    .activity-timeline {
      margin-top: var(--space-4);
    }
    
    .timeline-item {
      position: relative;
      padding-left: 40px;
      margin-bottom: var(--space-4);
    }
    
    .timeline-icon {
      position: absolute;
      left: 0;
      top: 16px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
    }
    
    .timeline-icon.confirmed {
      background-color: var(--success);
    }
    
    .timeline-icon.pending {
      background-color: var(--warning);
    }
    
    .timeline-icon.cancelled {
      background-color: var(--error);
    }
    
    .timeline-icon.completed {
      background-color: var(--neutral-600);
    }

    .timeline-icon.Progress {
      background-color: var(--neutral-600);
    }
    .timeline-icon.active {
      background-color: var(--success);
    }
    
    .timeline-content {
      position: relative;
    }
    
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }
    
    .timeline-date {
      font-size: 12px;
      color: var(--neutral-600);
    }
    
    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }
    
    @media (max-width: 768px) {
      .booking-dates {
        grid-template-columns: 1fr;
      }
      
      .status-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 576px) {
      .status-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  activeBookings: Booking[] = [];
  pendingBookings: Booking[] = [];
  completedBookings: Booking[] = [];
  recentBookings: Booking[] = [];
  
  constructor(private bookingService: BookingService,
    private dialog : MatDialog  ) {}
  
  ngOnInit() {
    this.loadUserBookings();
  }
  
  loadUserBookings() {
    this.bookingService.getUserBookings().subscribe(bookings => {
      // Sort by creation date (newest first)
      bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Filter bookings by status
      this.activeBookings = bookings.filter(booking => 
        booking.status === 'active' && 
        new Date(booking.endDate) >= new Date()
      );
      
      this.pendingBookings = bookings.filter(booking => booking.status === 'pending' || booking.status === 'In Progress');
      
      this.completedBookings = bookings.filter(booking => 
        booking.status === 'completed' || 
        (booking.status === 'confirmed' && new Date(booking.endDate) < new Date())
      );
      
      // Get recent bookings (last 5)
      this.recentBookings = bookings.slice(0, 5);
    });
  }

  openBookingDetails(booking: Booking): void {
    const dialogRef = this.dialog.open(BookingDialogComponent, {
      width: '500px',
      data: { booking }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadUserBookings();
      }
    });
  }
    
}