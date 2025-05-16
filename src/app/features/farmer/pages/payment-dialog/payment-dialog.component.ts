import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css'],
  imports: [MatDialogModule,MatFormFieldModule,MatInputModule,MatIconModule,MatButtonModule,CommonModule,FormsModule]
})
export class PaymentDialogComponent {
    processing = false;
  paymentError = '';
  cardDetails = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };

  // Updated regular expressions
  private cardRegex = /^(\d{4}\s?){4}$/; // Accepts with or without spaces
  private expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
  private cvvRegex = /^\d{3,4}$/;
  private nameRegex = /^[a-zA-Z\s]{3,}$/;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { booking: any },
    private snackBar: MatSnackBar
  ) {}

  validateForm(): boolean {
    this.paymentError = '';
    
    // Remove spaces before validation
    const cleanCardNumber = this.cardDetails.number.replace(/\s/g, '');

    if (!this.cardRegex.test(this.cardDetails.number) || cleanCardNumber.length !== 16) {
      this.paymentError = 'Please enter a valid 16-digit card number';
      return false;
    }

    if (!this.expiryRegex.test(this.cardDetails.expiry)) {
      this.paymentError = 'Please enter a valid expiry date (MM/YY)';
      return false;
    }

    if (!this.cvvRegex.test(this.cardDetails.cvv)) {
      this.paymentError = 'Please enter a valid CVV (3 or 4 digits)';
      return false;
    }

    if (!this.nameRegex.test(this.cardDetails.name)) {
      this.paymentError = 'Please enter a valid cardholder name';
      return false;
    }

    return true;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s+/g, '');
    if (value.length > 16) {
      value = value.substr(0, 16);
    }
    // Add space after every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardDetails.number = value.trim(); // Trim to prevent trailing space
  }
  processPayment(): void {
    if (!this.validateForm()) return;

    this.processing = true;

    // Simulate payment processing delay
    setTimeout(() => {
      this.processing = false;
      
      // Generate fake payment ID for demo
      const fakePaymentId = `demo_pay_${Date.now()}`;
      
      // Update booking locally (no API call)
      this.data.booking.paymentStatus = 'paid';
      this.data.booking.status = 'confirmed';
      this.data.booking.paymentId = fakePaymentId;
      
      this.snackBar.open('Payment processed successfully!', 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      
      this.dialogRef.close('success');
    }, 1500);
  }
  formatExpiry(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substr(0, 2) + '/' + value.substr(2, 2);
    }
    this.cardDetails.expiry = value;
  }
} 