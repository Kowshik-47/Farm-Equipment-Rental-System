import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../models/equipment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  constructor(private http: HttpClient) {}
  
  getAllEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${environment.apiUrl}/equipment`);
  }
  
  getEquipmentById(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${environment.apiUrl}/equipment/${id}`);
  }
  
  addEquipment(equipmentData: FormData): Observable<Equipment> {
    return this.http.post<Equipment>(`${environment.apiUrl}/equipment`, equipmentData);
  }
  
  updateEquipment(id: string, equipmentData: FormData): Observable<Equipment> {
    return this.http.put<Equipment>(`${environment.apiUrl}/equipment/${id}`, equipmentData);
  }
  
  deleteEquipment(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/equipment/${id}`);
  }
  
  setMaintenanceStatus(id: string, isInMaintenance: boolean): Observable<Equipment> {
    return this.http.patch<Equipment>(`${environment.apiUrl}/equipment/${id}/maintenance`, {
      isInMaintenance
    });
  }
  
  getAvailableEquipment(startDate: Date, endDate: Date): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${environment.apiUrl}/equipment/available`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  }
}