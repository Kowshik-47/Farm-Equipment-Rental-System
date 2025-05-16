import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../core/models/booking.model';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { EquipmentService } from '../../../../core/services/equipment.service';
import { jsPDF } from 'jspdf';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css'],
  imports: [CommonModule,RouterModule],
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private bookingService: BookingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private equipmentService: EquipmentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUserBookings();
  }

  getEquipmentName(booking: Booking): any {
    this.equipmentService.getEquipmentById(booking._id.toString()).subscribe({
      next: (equipment) => {
        return equipment.name.toString();
      },
      error: () => {
        console.error('Error fetching equipment name');
      }
    }); 
  }

  loadUserBookings(): void {
    this.isLoading = true;
    this.bookingService.getUserBookings().subscribe(
      (bookings) => {
        this.bookings = bookings;
        this.isLoading = false;
      },
      (error) => {
        // Fallback to cache if available
        this.errorMessage = 'Failed to load bookings';
        this.isLoading = false;
      }
    );
  }

  openPaymentDialog(booking: Booking): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { booking }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        // Update local state immediately from cache
        this.bookingService.processPayment(booking._id, 'Card')
          .subscribe({
            next: async (response) => {
              this.snackBar.open(response, 'Close', { 
                duration: 3000,
                panelClass: ['success-snackbar'] 
              });
              // Generate and send PDF only after successful payment
              this.generateAndDownloadPDF(booking);
            }
          })
      }
    })
  }

  cancelBooking(booking: Booking): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      console.log('Booking cancelled:', booking);
      if(booking &&  this.canCancel(booking)){
        booking.status = 'cancelled'
        this.bookingService.updateBooking(booking._id.toString(), booking).subscribe(
          (res) => {
            this.snackBar.open('Booking cancelled successfully!', 'Close', { duration: 3000 })
          },
          (error) =>{
            console.log(error)
          }
        )
      }
    }
  }

  canPay(booking: Booking): boolean {
    return booking.status === 'In Progress'  && booking.paymentStatus !== 'paid';
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'pending' || booking.status === 'In Progress';
  }

  private generateAndDownloadPDF(booking: Booking): void {
    this.userService.getUserById(booking.farmer.toString()).subscribe({
      next: (user) => {
        // Generate PDF with enhanced styling
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Set default font
        doc.setFont('helvetica', 'normal');

        // Page border
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277, 'S');

        // Project title
        let yPosition = 20;
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        const projectTitle = 'AgriEquip Booking Confirmation';
        const projectTitleWidth = doc.getTextWidth(projectTitle);
        doc.text(projectTitle, (210 - projectTitleWidth) / 2, yPosition);

        // Subtitle
        yPosition += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const subtitle = 'Rental Service Receipt';
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (210 - subtitleWidth) / 2, yPosition);

        // User Details Section
        yPosition += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition - 4, 180, 8, 'F');
        const userHeader = 'User Details';
        const userHeaderWidth = doc.getTextWidth(userHeader);
        doc.text(userHeader, (210 - userHeaderWidth) / 2, yPosition);

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Name: ${user.name || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Email: ${user.email || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Phone: ${user.phone || 'N/A'}`, 15, yPosition);

        // Section border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(15, yPosition + 5, 195, yPosition + 5);

        // Booking Details Section
        yPosition += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition - 4, 180, 8, 'F');
        const bookingHeader = 'Booking Details';
        const bookingHeaderWidth = doc.getTextWidth(bookingHeader);
        doc.text(bookingHeader, (210 - bookingHeaderWidth) / 2, yPosition);

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Booking ID: ${booking._id || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Status: ${booking.status || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Start Date: ${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`End Date: ${booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Amount: ₹${booking.totalAmount || 0}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Equipment: ${booking.equipment?.name || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Payment Status: ${booking.paymentStatus || 'N/A'}`, 15, yPosition);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const footerText = `Generated on: ${new Date().toLocaleDateString()} | AgriEquip`;
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (210 - footerWidth) / 2, 285);

        // Convert PDF to base64 for email
        const pdfData = doc.output('blob');
        const reader = new FileReader();
        reader.readAsDataURL(pdfData);
        reader.onloadend = () => {
          const base64Data = reader.result as string;

          // Send email via server route
          this.http.post('http://localhost:3000/api/bookings/send-email', {
            email: user.email || 'N/A',
            pdfData: base64Data
          }).subscribe({
            next: () => {
              this.snackBar.open('Email sent successfully', 'Close', { duration: 3000 });
            },
            error: (err) => {
              console.error('Error sending email:', err);
              this.snackBar.open('Failed to send email', 'Close', { duration: 3000 });
            }
          });

          // Trigger download
          const url = window.URL.createObjectURL(pdfData);
          const link = document.createElement('a');
          link.href = url;
          link.download = `booking_confirmation_${booking._id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.snackBar.open('PDF downloaded successfully', 'Close', { duration: 3000 });
        };
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.snackBar.open('Failed to fetch user details', 'Close', { duration: 3000 });
      }
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