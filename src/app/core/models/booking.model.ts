import { User } from './user.model';
import { Equipment } from './equipment.model';

export interface Booking {
  _id: string;
  farmer: User;
  equipment: Equipment;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled'| 'In Progress' | 'completed' | 'active';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  proofImage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}