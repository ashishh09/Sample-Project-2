export type UserRole = 'admin' | 'waiter' | 'cashier' | 'kitchen' | 'manager';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  current_order_id?: string;
  notes?: string;
}

export type MenuCategory = 
  | 'Starters'
  | 'Main Course'
  | 'Pizza'
  | 'Burger'
  | 'Beverages'
  | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  available: boolean;
  description?: string;
  is_veg?: boolean;
}

export interface OrderItem {
  id: string;
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  order_number: string;
  table_id: string;
  table_number: string;
  user_id: string;
  waiter_name: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'UNPAID' | 'PAID';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card';

export interface Bill {
  id: string;
  bill_number: string;
  order_id: string;
  order_number: string;
  table_number: string;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  grand_total: number;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  bill_id: string;
  bill_number: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  payment_date: string;
  cash_tendered?: number;
  change_returned?: number;
  transaction_ref?: string;
}

export interface SystemSettings {
  restaurant_name: string;
  currency_symbol: string;
  gst_rate: number; // percentage, e.g. 5
  tagline: string;
  phone: string;
  address: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

export interface TestCaseResult {
  id: string;
  title: string;
  phase: string;
  expected: string;
  actual: string;
  passed: boolean;
  durationMs: number;
}
