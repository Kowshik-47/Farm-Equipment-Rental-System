import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../core/models/booking.model';
import { EquipmentService } from '../../../../core/services/equipment.service';
import { UserService } from '../../../../core/services/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { LoaderComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: "./booking-management.component.html",
  styles: [`
    .booking-management {
      max-width: 1200px;
      margin: 0 auto;
    }

    .booking-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }

    .booking-card {
      height: 100%;
    }
    .btns{
      float:right;
      width: 70%;
      display:flex;
      justify-content: space-evenly;
    }
    .accept {
      border-radius:20px;
      color : green;
      padding : 4px 10px;
      font-size: 1em;
    }
    .deny{
      color : red;
      border-radius:20px;
      padding: 4px 10px;
      font-size:1em;
    }
    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }

    .booking-details p {
      margin-bottom: var(--space-2);
    }

    .proof-image {
      margin: var(--space-3) 0;
    }

    .proof-image img {
      max-width: 100%;
      border-radius: 4px;
    }
    .pending{
      color : yellow;
    }
    .Progress{
      color : orange;
    }
    .active, .confirmed, .completed {
      color : green;
    }
    .cancelled{
      color : red;
    }
  `]
})
export class BookingManagementComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading: boolean = true;

  constructor(private bookingService: BookingService,
    private equipmentService: EquipmentService,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.loadBookings();
  }

  private async loadBookings() {
    this.isLoading = true
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.isLoading = false
        this.changeDetectorRef.detectChanges()
      },
      error: (error) => {
        this.isLoading = false
        this.changeDetectorRef.detectChanges()
        console.error('Error loading bookings:');
      }
    });
  }

  async accept(booking: Booking) {
    if (booking && booking.status === 'pending') {
      booking.status = 'In Progress'
      this.bookingService.updateBooking(booking._id.toString(), booking).subscribe(
        (res) => { this.changeDetectorRef.detectChanges() },
        (error) => {
          this.changeDetectorRef.detectChanges()
          console.log('Something went wrong')
        }
      )
    }
  }

  async deny(booking: Booking) {
    if (booking && (booking.status === 'pending' || booking.status === 'In Progress')) {
      booking.status = 'cancelled'
      this.bookingService.updateBooking(booking._id.toString(), booking).subscribe(
        (res) => {
          this.changeDetectorRef.detectChanges()
        },
        (error) => {
          this.changeDetectorRef.detectChanges()
          console.log('Something went Wrong')
        }
      )
    }
  }
}
