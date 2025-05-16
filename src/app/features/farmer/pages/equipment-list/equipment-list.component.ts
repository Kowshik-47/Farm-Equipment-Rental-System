import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EquipmentService } from '../../../../core/services/equipment.service';
import { Equipment } from '../../../../core/models/equipment.model';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './equipment-list.component.html',
  styles: [`
    .equipment-list-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .filters {
      margin-bottom: var(--space-4);
    }
    
    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: flex-end;
    }
    
    .filter-section {
      flex: 1;
      min-width: 200px;
    }
    
    .equipment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }
    
    .equipment-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .equipment-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .equipment-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    
    .equipment-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .equipment-card:hover .equipment-image img {
      transform: scale(1.05);
    }
    
    .maintenance-badge {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      background-color: var(--error);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .equipment-info {
      padding: var(--space-3);
      flex: 1;
    }
    
    .equipment-category {
      font-size: 14px;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .equipment-rate {
      font-weight: 600;
      color: var(--primary);
      margin-bottom: var(--space-2);
      font-size: 18px;
    }
    
    .equipment-description {
      color: var(--neutral-700);
      margin-bottom: var(--space-2);
      font-size: 14px;
      line-height: 1.5;
    }
    
    .equipment-footer {
      padding: 0 var(--space-3) var(--space-3);
      display: flex;
      justify-content: center;
    }
    
    .empty-state, .loading-state {
      padding: var(--space-5);
      text-align: center;
    }
    
    .empty-state p, .loading-state p {
      margin-bottom: var(--space-3);
      color: var(--neutral-600);
    }
    
    @media (max-width: 768px) {
      .filter-form {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-section {
        width: 100%;
      }
    }
  `]
})
export class EquipmentListComponent implements OnInit {
  allEquipment: Equipment[] = [];
  filteredEquipment: Equipment[] = [];
  categories: string[] = [];
  filterForm: FormGroup;
  loading: boolean = true;
  
  constructor(
    private equipmentService: EquipmentService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      sortBy: ['nameAsc']
    });
  }
  
  ngOnInit() {
    this.loadEquipment();
    
    // Apply filters when form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadEquipment() {
    this.loading = true;
    this.equipmentService.getAllEquipment().subscribe(equipment => {
      this.allEquipment = equipment;
      
      // Extract unique categories
      const categorySet = new Set<string>();
      equipment.forEach(item => categorySet.add(item.category));
      this.categories = Array.from(categorySet);
      
      this.applyFilters();
      this.loading = false;
    });
  }
  
  applyFilters() {
    const { search, category, sortBy } = this.filterForm.value;
    
    // Filter by search term
    let filtered = this.allEquipment;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    
    // Sort items
    switch (sortBy) {
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'priceAsc':
        filtered.sort((a, b) => a.dailyRate - b.dailyRate);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.dailyRate - a.dailyRate);
        break;
    }
    
    this.filteredEquipment = filtered;
  }
  
  resetFilters() {
    this.filterForm.setValue({
      search: '',
      category: '',
      sortBy: 'nameAsc'
    });
  }
}