
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  vendor: string;
  image_url: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

// The 'items' array will be stored as a JSONB column in Supabase
export interface Order {
  id: string;
  table_number: string;
  customer_name: string;
  customer_id: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    vendor: string;
  }>;
  total_amount: number;
  status: 'Order Placed' | 'Payment Confirmed' | 'Completed';
  payment_method: 'qris' | 'cash';
  created_at: string;
  rating?: number;
}
