import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipmentService } from '../../../../core/services/equipment.service';
import { Equipment } from '../../../../core/models/equipment.model';

@Component({
  selector: 'app-equipment-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl : "./equipment-management.component.html",
  styles: [`
    .equipment-management {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .equipment-list {
      margin-top: var(--space-5);
    }
    
    .equipment-card {
      margin-bottom: var(--space-3);
    }
    
    .equipment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .equipment-actions {
      display: flex;
      gap: var(--space-2);
    }
    
    .equipment-details p {
      margin-bottom: var(--space-2);
    }
  `]
})
export class EquipmentManagementComponent implements OnInit {
  equipmentForm: FormGroup;
  equipmentList: Equipment[] = [];
  isSubmitting = false;
    selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private equipmentService: EquipmentService
  ) {
    this.equipmentForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      dailyRate: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadEquipment();
  }

  onFileSelect(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }  

  onSubmit() {
    if (this.equipmentForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    
    Object.keys(this.equipmentForm.value).forEach(key => {
      formData.append(key, this.equipmentForm.value[key]);
    });

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });
    console.log(formData);
    this.equipmentService.addEquipment(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.equipmentForm.reset();
        this.selectedFiles = [];
        this.loadEquipment();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding equipment:', error);
      }
    });
  }

  loadEquipment() {
    this.equipmentService.getAllEquipment().subscribe({
      next: (equipment) => {
        this.equipmentList = equipment;
      },
      error: (error) => {
        console.error('Error loading equipment:', error);
      }
    });
  }

  toggleMaintenance(equipment: Equipment) {
    this.equipmentService.setMaintenanceStatus(equipment._id, !equipment.isInMaintenance)
      .subscribe({
        next: () => {
          this.loadEquipment();
        },
        error: (error) => {
          console.error('Error updating maintenance status:', error);
        }
      });
  }

  deleteEquipment(id: string) {
    if (confirm('Are you sure you want to delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe({
        next: () => {
          this.loadEquipment();
        },
        error: (error) => {
          console.error('Error deleting equipment:', error);
        }
      });
    }
  }
}