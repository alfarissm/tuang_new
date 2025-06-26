
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Utensils, Star } from "lucide-react";
import { useOrders } from '@/context/OrderContext';
import { isToday } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';

export default function VendorDashboardPage() {
  const { auth } = useAuth();
  const vendorName = auth.vendorName || "";
  const { getVendorOrders } = useOrders();
  const { menuItems } = useMenu();
  const vendorOrders = getVendorOrders(vendorName);
  
  const stats = useMemo(() => {
    if (!vendorName) return { revenueToday: 0, activeOrders: 0, menuCount: 0, averageRating: 0, ratingCount: 0 };
    
    const revenueToday = vendorOrders.reduce((total, order) => {
      if (isToday(new Date(order.created_at))) {
        // Recalculate total only for this vendor's items in the order for that day
        const vendorItemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return total + vendorItemsTotal;
      }
      return total;
    }, 0);

    const activeOrders = vendorOrders.filter(order => order.status !== 'Completed').length;
    
    const menuCount = menuItems.filter(item => item.vendor === vendorName).length;

    const ratedOrders = vendorOrders.filter(order => order.rating !== undefined && order.rating > 0);
    const ratingCount = ratedOrders.length;
    const averageRating = ratingCount > 0
        ? ratedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / ratingCount
        : 0;

    return { revenueToday, activeOrders, menuCount, averageRating, ratingCount };
  }, [vendorOrders, vendorName, menuItems]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard {vendorName}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{stats.revenueToday.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Berdasarkan semua pesanan hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">pesanan belum selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Menu</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuCount}</div>
            <p className="text-xs text-muted-foreground">menu yang dijual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5.0` : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">dari {stats.ratingCount} ulasan</p>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Manajemen Cepat</CardTitle>
          <CardDescription>Pilih dari menu di samping untuk mengelola pesanan dan menu anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Gunakan navigasi di sebelah kiri untuk memulai.</p>
        </CardContent>
      </Card>
    </div>
  );
}
