export type UserRole = 'admin' | 'customer' | 'landscaper';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  landscaper_id: string;
  service_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  notes?: string;
  service_type: string;
  location: string;
}