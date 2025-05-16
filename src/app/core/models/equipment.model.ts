export interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  dailyRate: number;
  images: string[];
  isAvailable: boolean;
  isInMaintenance: boolean;
  features?: string[];
  specifications?: {
    [key: string]: string;
  };
  createdAt: Date;
  updatedAt: Date;
}