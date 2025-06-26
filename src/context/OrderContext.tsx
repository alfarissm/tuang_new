
"use client";

import type { Order, OrderItemStatus } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useCart } from './CartContext';
import { supabase } from '@/lib/supabase';

type PaymentMethod = 'qris' | 'cash';

// Helper function to derive the overall order status from its items
const getOverallStatus = (items: Order['items']): OrderItemStatus => {
  const allCompleted = items.every(item => item.status === 'Completed');
  if (allCompleted) return 'Completed';

  const anyConfirmed = items.some(item => item.status === 'Payment Confirmed');
  if (anyConfirmed) return 'Payment Confirmed';
  
  return 'Order Placed';
};


interface OrderContextType {
  orders: Order[];
  addOrder: (paymentMethod: PaymentMethod) => Promise<string>;
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
  const { cart, totalAmount, tableNumber, customerName, customerId } = useCart();

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      // Derive the overall status for each order upon fetching
      const ordersWithDerivedStatus = data.map(order => ({
        ...order,
        status: getOverallStatus(order.items)
      }));
      setOrders(ordersWithDerivedStatus || []);
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

  const addOrder = async (paymentMethod: PaymentMethod): Promise<string> => {
    const orderId = `ORD${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
    const initialStatus: OrderItemStatus = paymentMethod === 'qris' ? 'Payment Confirmed' : 'Order Placed';
    
    const newOrder = {
      id: orderId,
      table_number: tableNumber,
      customer_name: customerName,
      customer_id: customerId,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor,
        status: initialStatus, // Set initial status for each item
      })),
      total_amount: totalAmount,
      status: initialStatus, // Initial overall status
      payment_method: paymentMethod,
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }
    return orderId;
  };
  
  const updateItemStatus = async (orderId: string, itemId: number, newStatus: OrderItemStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const updatedItems = order.items.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    );

    const overallStatus = getOverallStatus(updatedItems);
    
    const { error } = await supabase.from('orders').update({ items: updatedItems, status: overallStatus }).eq('id', orderId);
     if (error) {
        console.error('Error updating item status:', error);
        throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderItemStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");

    // When updating the whole order, all items get the new status
    const updatedItems = order.items.map(item => ({ ...item, status }));
    const { error } = await supabase.from('orders').update({ items: updatedItems, status }).eq('id', orderId);

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
     return orders
      .filter(order => order.items.some(item => item.vendor === vendorName))
      .map(order => {
        const vendorItems = order.items.filter(item => item.vendor === vendorName);
        const vendorTotal = vendorItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return {
          ...order,
          items: vendorItems,
          total_amount: vendorTotal,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders]);

  const value = { orders, addOrder, updateItemStatus, updateOrderStatus, getOrderById, getVendorOrders, addRatingToOrder, isLoading };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
