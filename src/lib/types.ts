
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  vendor: string;
  image_url: string | null; // Can be null initially
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface Vendor {
  id: number;
  name: string;
  owner?: string;
  password?: string;
  created_at?: string;
}

export type OrderItemStatus = 'Order Placed' | 'Payment Confirmed' | 'Completed';


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
    status: OrderItemStatus; 
  }>;
  total_amount: number;
  status: OrderItemStatus; 
  payment_method: 'qris' | 'cash';
  created_at: string;
  rating?: number;
}
