// Core Domain Models for JAS Hotel

export interface User {
  id: string;
  name: string;
  email: string;
  room_number?: string;
  created_at?: string;
}

export type MenuCategory = 
  | 'Breakfast'
  | 'Starters'
  | 'Main Course'
  | 'Sides'
  | 'Desserts'
  | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory | string;
  image_url: string;
  available: boolean;
  featured?: boolean;
  calories?: number;
  dietary?: string[]; // e.g. ["Vegetarian", "Gluten-Free"]
  preparation_time_minutes?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'room_service' | 'pickup';

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItemPayload {
  menu_item_id: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderPayload {
  order_type: OrderType;
  room_number?: string;
  special_instructions?: string;
  items: OrderItemPayload[];
}

export interface OrderItemDetail {
  id?: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_type: OrderType;
  room_number?: string;
  special_instructions?: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  items: OrderItemDetail[];
  payment_status?: 'Pending' | 'Paid' | 'Failed';
  payment_method?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at?: string;
}

// ----------------- ROOMS & BOOKINGS DOMAIN -----------------

export type RoomCategory =
  | 'Deluxe Heritage'
  | 'Executive Bay Suite'
  | 'Royal Pavilion'
  | 'Maharaja Presidential Suite';

export interface Room {
  id: string;
  name: string;
  category: RoomCategory | string;
  tagline: string;
  description: string;
  price_per_night: number;
  size_sqft: number;
  max_adults: number;
  max_children: number;
  bed_type: string;
  view: string;
  amenities: string[];
  images: string[];
  available: boolean;
  featured?: boolean;
}

export type BookingStatus =
  | 'Confirmed'
  | 'In-House'
  | 'Checked In'
  | 'Completed'
  | 'Cancelled';

export interface CreateRoomBookingPayload {
  room_id: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  guests_adults: number;
  guests_children: number;
  special_requests?: string;
}

export interface RoomBooking {
  id: string;
  user_id: string;
  room_id: string;
  room_name: string;
  room_image: string;
  room_category: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests_adults: number;
  guests_children: number;
  price_per_night: number;
  subtotal: number;
  tax: number;
  total: number;
  special_requests?: string;
  status: BookingStatus;
  payment_status?: 'Pending' | 'Paid' | 'Failed';
  payment_method?: string;
  razorpay_payment_id?: string;
  created_at: string;
}

export interface PaymentOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  is_simulated: boolean;
}

export interface VerifyPaymentPayload {
  reference_id: string;
  type: 'dining_order' | 'room_booking';
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  message: string;
  payment_status: string;
  transaction_id: string;
  record: Order | RoomBooking;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
