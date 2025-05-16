export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  address?: string;
  role: 'farmer' | 'admin';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}