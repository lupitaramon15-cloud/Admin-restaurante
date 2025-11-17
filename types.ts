export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  imageUrl?: string;
  isSpecial?: boolean;
  restaurantId: string;
}

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be a hash
  whatsApp: string;
  role: 'admin' | 'customer';
  restaurantId: string; // Associates user with a restaurant. For admins, this is their own ID.
  businessName?: string; // Only for admins
  isActive?: boolean; // For admins, determines if their restaurant is active.
  location?: {
    city: string;
    country: string;
  };
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number; // Price at time of order
  notes?: string;
}

export type PaymentMethod = 'cash' | 'transfer' | 'card';

export interface Order {
  id:string;
  userId: string;
  items: OrderItem[];
  total: number;
  date: string; // ISO 8601 format
  paymentMethod: PaymentMethod;
  restaurantId: string;
}