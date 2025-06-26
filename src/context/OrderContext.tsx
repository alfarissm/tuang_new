
"use client";

import type { Order } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useCart } from './CartContext';
import { supabase } from '@/lib/supabase';

type Status = 'Order Placed' | 'Payment Confirmed' | 'Completed';
type PaymentMethod = 'qris' | 'cash';

interface OrderContextType {
  orders: Order[];
  addOrder: (paymentMethod: PaymentMethod) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Status) => Promise<void>;
  addRatingToOrder: (orderId: string, rating: number) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getVendorOrders: (vendorName: string) => Order[];
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { cart, totalAmount, tableNumber, customerName, customerId } = useCart();

  const fetchOrders = useCallback(async () => {
    // We don't set loading to true here to avoid flickering on re-fetches from subscriptions
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
    
    // Set up a realtime subscription
    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders(); // Refetch on any change
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    }
  }, [fetchOrders]);

  const addOrder = async (paymentMethod: PaymentMethod): Promise<string> => {
    const orderId = `ORD${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
    const newOrder = {
      id: orderId,
      table_number: tableNumber,
      customer_name: customerName,
      customer_id: customerId, // Use customerId from context
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor,
      })),
      total_amount: totalAmount,
      status: 'Order Placed' as Status,
      payment_method: paymentMethod,
      // created_at is handled by Supabase (default NOW())
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }
    // No need to fetch manually, realtime subscription will handle it.
    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: Status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
  };

  const addRatingToOrder = async (orderId: string, rating: number) => {
    const { error } = await supabase.from('orders').update({ rating }).eq('id', orderId);
    if (error) {
        console.error('Error adding rating:', error);
        throw error;
    }
  };

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);
  
  const getVendorOrders = useCallback((vendorName: string) => {
    return orders.filter(order => 
      order.items.some(item => item.vendor === vendorName)
    ).map(order => {
      // Create a vendor-specific view of the order
      const vendorItems = order.items.filter(item => item.vendor === vendorName);
      const vendorTotal = vendorItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return {
        ...order,
        items: vendorItems,
        total_amount: vendorTotal, // Show the total for this vendor only
      };
    });
  }, [orders]);

  const value = { orders, addOrder, updateOrderStatus, getOrderById, getVendorOrders, addRatingToOrder, isLoading };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
