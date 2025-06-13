import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/profile`, userData)
      .pipe(
        tap(updatedUser => {
          const currentUser = this.currentUserSubject.value;
          if (currentUser && isPlatformBrowser(this.platformId)) {
            const newUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newUser));
            this.currentUserSubject.next(newUser);
          }
        })
      );
  }

  requestPasscode(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  verifyPasscode(email: string, passcode: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/verify-passcode`, { email, passcode });
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { email, newPassword });
  }
}
