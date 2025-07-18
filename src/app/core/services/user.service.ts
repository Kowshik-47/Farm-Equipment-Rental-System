import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${process.env.['apiUrl']}/users`);
  }
  
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${process.env.['apiUrl']}/users/${id}`);
  }
  
  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${process.env.['apiUrl']}/users`, userData);
  }
  
  updateUser(id: string, userData: any): Observable<User> {
    return this.http.put<User>(`${process.env.['apiUrl']}/users/${id}`, userData);
  }
  
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${process.env.['apiUrl']}/users/${id}`);
  }
  
  promoteToAdmin(id: string): Observable<User> {
    return this.http.patch<User>(`${process.env.['apiUrl']}/users/${id}/promote`, {});
  }
  
  demoteFromAdmin(id: string): Observable<User> {
    return this.http.patch<User>(`${process.env.['apiUrl']}/users/${id}/demote`, {});
  }
  createAdmin(admin: User): Observable<User> {
    return this.http.post<User>(`${process.env.['apiUrl']}/admin`, admin);
  }
}
