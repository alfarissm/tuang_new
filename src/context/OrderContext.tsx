
"use client";

import type { Order, OrderItemStatus } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useCart } from './CartContext';
import { supabase } from '@/lib/supabase';

type PaymentMethod = 'qris' | 'cash';
type CustomerInfo = { customerName: string; customerId: string };
type AddOrderPayload = {
  paymentMethod: PaymentMethod;
  customerInfo: CustomerInfo;
  note?: string;
};


// Helper function to derive the overall order status from its items
const getOverallStatus = (items: Order['items']): OrderItemStatus => {
  const allCompleted = items.every(item => item.status === 'Completed');
  if (allCompleted) return 'Completed';

  // Check if *any* item has been confirmed. This marks the whole order as processing.
  const anyConfirmed = items.some(item => item.status === 'Payment Confirmed' || item.status === 'Completed');
  if (anyConfirmed) return 'Payment Confirmed';
  
  // If nothing is confirmed or completed, it's still just placed.
  return 'Order Placed';
};


interface OrderContextType {
  orders: Order[];
  addOrder: (payload: AddOrderPayload) => Promise<string>;
  updateItemStatus: (orderId: string, itemId: number, status: OrderItemStatus) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderItemStatus) => Promise<void>;
  addRatingToOrder: (orderId: string, rating: number) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getVendorOrders: (vendorName: string) => Order[];
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { cart, totalAmount, tableNumber } = useCart();

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    }
  }, [fetchOrders]);

  const addOrder = useCallback(async (payload: AddOrderPayload): Promise<string> => {
    const { paymentMethod, customerInfo, note } = payload;
    const orderId = `ORD${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
    const initialStatus: OrderItemStatus = paymentMethod === 'qris' ? 'Payment Confirmed' : 'Order Placed';
    
    const newOrder = {
      id: orderId,
      table_number: tableNumber,
      customer_name: customerInfo.customerName,
      customer_id: customerInfo.customerId,
      note: note,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor,
        image_url: item.image_url,
        status: initialStatus,
      })),
      total_amount: totalAmount,
      status: initialStatus,
      payment_method: paymentMethod,
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }

    return orderId;
  }, [cart, totalAmount, tableNumber]);
  
  const updateItemStatus = useCallback(async (orderId: string, itemId: number, newStatus: OrderItemStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const updatedItems = order.items.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    );
    
    const { error } = await supabase.from('orders').update({ items: updatedItems }).eq('id', orderId);
     if (error) {
        console.error('Error updating item status:', error);
        throw error;
    }
  }, [orders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderItemStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");

    // When updating the whole order (e.g. for cash payment confirmation), all items get the new status
    const updatedItems = order.items.map(item => ({ ...item, status }));
    const { error } = await supabase.from('orders').update({ items: updatedItems }).eq('id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
  }, [orders]);

  const addRatingToOrder = useCallback(async (orderId: string, rating: number) => {
    const { error } = await supabase.from('orders').update({ rating }).eq('id', orderId);
    if (error) {
        console.error('Error adding rating:', error);
        throw error;
    }
  }, []);

  const getOrderById = useCallback((orderId: string) => {
    const order = orders.find(order => order.id === orderId);
    if (!order) return undefined;
    // Return order with derived status
    return { ...order, status: getOverallStatus(order.items) };
  }, [orders]);
  
  const getVendorOrders = useCallback((vendorName: string) => {
     return orders
      .map(order => {
        // First, filter to see if this vendor has items in this order
        const vendorItems = order.items.filter(item => item.vendor === vendorName);
        if (vendorItems.length === 0) {
          return null; // This order is not for this vendor
        }

        // If it is, calculate the total ONLY for this vendor's items
        const vendorTotal = vendorItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        
        // Return a new order object containing only this vendor's items and total
        return {
          ...order,
          items: vendorItems,
          total_amount: vendorTotal,
          status: getOverallStatus(order.items), // Overall status is still derived from ALL items
        };
      })
      .filter((order): order is Order => order !== null) // Filter out the nulls
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders]);

  const value = useMemo(() => ({ orders, addOrder, updateItemStatus, updateOrderStatus, getOrderById, getVendorOrders, addRatingToOrder, isLoading }), [orders, addOrder, updateItemStatus, updateOrderStatus, getOrderById, getVendorOrders, addRatingToOrder, isLoading]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
