import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../core/models/booking.model';
import { EquipmentService } from '../../../../core/services/equipment.service';
import { UserService } from '../../../../core/services/user.service';
import { Observable } from 'rxjs';
import { User } from '../../../../core/models/user.model';
import { Equipment } from '../../../../core/models/equipment.model';  

@Component({
  selector: 'app-admin-dashboard',
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
    
    .booking-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }
    
    .booking-card {
      padding: var(--space-3);
    }
    
    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .booking-info p {
      margin-bottom: var(--space-2);
    }
    
    .error-message {
      color: red;
      padding: var(--space-3);
      text-align: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  statistics: any = {
    totalBookings: 0,
    revenue: 0
  };
  activeBookings: Booking[] = [];
  errorMessage: string | null = null;
  popularEquipment : string | null = null;

  constructor(private bookingService: BookingService, private userService : UserService, private equipmentService : EquipmentService) {}

  ngOnInit() {
    this.loadStatistics();
    this.loadActiveBookings();
  }

  private loadStatistics() {
    this.bookingService.getBookingStatistics().subscribe({
      next: (stats) => {
        this.statistics = {
          totalBookings: stats.totalBookings || 0,
          revenue: stats.revenue || 0,
          bookingsByStatus: stats.bookingsByStatus || [],
          bookingsByMonth: stats.bookingsByMonth || [],
          popularEquipment: stats.popularEquipment || []
        };

        this.popularEquipment = this.statistics.popularEquipment[0].equipment.name
        this.errorMessage = null;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.errorMessage = 'Failed to load statistics. Please try again later.';
      }
    });
  }

  private loadActiveBookings() {
    this.bookingService.getActiveBookings().subscribe({
      next: (bookings) => {
        this.activeBookings = bookings;
        this.errorMessage = null;
      },
      error: (error) => {
        console.error('Error loading active bookings:', error);
        this.errorMessage = 'Failed to load active bookings. Please try again later.';
      }
    });
  }
}