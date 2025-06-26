
"use client"

import { useOrders } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users, Utensils, Clock, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useMenu } from "@/context/MenuContext";
import { OrderItemStatus } from "@/lib/types";

const getStatusVariant = (status: OrderItemStatus) => {
    switch(status) {
        case 'Completed':
            return 'default'
        case 'Payment Confirmed':
            return 'secondary'
        case 'Order Placed':
            return 'outline'
        default:
            return 'outline'
    }
}

export default function AdminDashboardPage() {
  const { orders } = useOrders();
  const { menuItems, vendors } = useMenu();

  const totalRevenue = useMemo(() => {
    return orders.reduce((total, order) => total + order.total_amount, 0);
  }, [orders]);

  const totalSellers = vendors.length;
  
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  }, [orders]);

  const activityLog = useMemo(() => {
    return recentOrders.map(order => ({
        id: order.id,
        description: `Pesanan baru #${order.id.substring(0,7)} dibuat oleh ${order.customer_name}.`,
        time: new Date(order.created_at)
    }));
  }, [recentOrders]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">dari semua pesanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{orders.length}</div>
            <p className="text-xs text-muted-foreground">pesanan telah dibuat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjual</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSellers}</div>
            <p className="text-xs text-muted-foreground">penjual terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Menu</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-muted-foreground">menu tersedia</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 flex flex-col">
            <CardHeader>
                <CardTitle>Info Pesanan Masuk</CardTitle>
                <CardDescription>5 pesanan terbaru yang masuk.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pelanggan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <div className="font-medium">{order.customer_name}</div>
                                    <div className="text-sm text-muted-foreground">{order.customer_id || '-'}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">Rp{order.total_amount.toLocaleString("id-ID")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/admin/orders">
                        Lihat Semua Pesanan
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
         <Card className="lg:col-span-3 flex flex-col">
            <CardHeader>
                <CardTitle>Log Aktivitas</CardTitle>
                <CardDescription>Aktivitas terbaru di dalam sistem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                {activityLog.length > 0 ? activityLog.map(log => (
                    <div key={log.id} className="flex items-start gap-4">
                        <div className="bg-muted p-2 rounded-full">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm">{log.description}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(log.time, { addSuffix: true, locale: id })}
                            </p>
                        </div>
                    </div>
                )) : (
                     <div className="text-center text-muted-foreground py-6">
                        Tidak ada aktivitas.
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/admin/activity">
                        Lihat Semua Aktivitas
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
