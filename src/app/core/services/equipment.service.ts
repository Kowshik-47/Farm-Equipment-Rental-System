import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  constructor(private http: HttpClient) {}
  
  getAllEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${process.env.apiUrl}/equipment`);
  }
  
  getEquipmentById(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${process.env.apiUrl}/equipment/${id}`);
  }
  
  addEquipment(equipmentData: FormData): Observable<Equipment> {
    return this.http.post<Equipment>(`${process.env.apiUrl}/equipment`, equipmentData);
  }
  
  updateEquipment(id: string, equipmentData: FormData): Observable<Equipment> {
    return this.http.put<Equipment>(`${process.env.apiUrl}/equipment/${id}`, equipmentData);
  }
  
  deleteEquipment(id: string): Observable<any> {
    return this.http.delete(`${process.env.apiUrl}/equipment/${id}`);
  }
  
  setMaintenanceStatus(id: string, isInMaintenance: boolean): Observable<Equipment> {
    return this.http.patch<Equipment>(`${process.env.apiUrl}/equipment/${id}/maintenance`, {
      isInMaintenance
    });
  }
  
  getAvailableEquipment(startDate: Date, endDate: Date): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${process.env.apiUrl}/equipment/available`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  }
}
