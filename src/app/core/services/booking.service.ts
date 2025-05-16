import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Booking } from '../models/booking.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class BookingService {
  constructor(private http: HttpClient ) {}
  
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings`);
  }
  
  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings/user`);
  }
  
  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${environment.apiUrl}/bookings/${id}`);
  }
  
  createBooking(bookingData: FormData): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiUrl}/bookings`, bookingData);
  }
  
  updateBooking(id: string, bookingData: any): Observable<Booking> {
    return this.http.put<Booking>(`${environment.apiUrl}/bookings/${id}`, bookingData)
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/${id}/cancel`, {})
  }
  
  getActiveBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings/active`);
  }
  
  getBookingStatistics(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/bookings/statistics`);
  }
  processPayment(bookingId: string, paymentMethod: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/bookings/payments/process`, { bookingId })
  }
  sendBookingEmail(email: string, pdfData: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/bookings/send-email`, { email, pdfData });
  }
}