import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }
  
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }
  
  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, userData);
  }
  
  updateUser(id: string, userData: any): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, userData);
  }
  
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }
  
  promoteToAdmin(id: string): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${id}/promote`, {});
  }
  
  demoteFromAdmin(id: string): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${id}/demote`, {});
  }
  createAdmin(admin: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/admin`, admin);
  }
}