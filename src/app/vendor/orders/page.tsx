
"use client"

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useToast } from '@/hooks/use-toast';

type Status = 'Order Placed' | 'Payment Confirmed' | 'Completed';

const ITEMS_PER_PAGE = 5;

const getStatusVariant = (status: Status) => {
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

export default function VendorOrdersPage() {
    const { getVendorOrders, updateOrderStatus } = useOrders();
    const { auth } = useAuth();
    const { toast } = useToast();
    const vendorName = auth.vendorName || "";
    const orders = useMemo(() => getVendorOrders(vendorName), [getVendorOrders, vendorName]);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return orders.slice(startIndex, endIndex);
    }, [orders, currentPage]);

    const handleStatusChange = async (orderId: string, newStatus: Status) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            toast({
                title: "Status Diperbarui",
                description: `Status pesanan #${orderId.substring(0,7)} telah diubah menjadi "${newStatus}".`,
                className: "bg-accent text-accent-foreground"
            })
        } catch (error) {
            toast({
                title: "Gagal Memperbarui Status",
                description: `Terjadi kesalahan saat mengubah status pesanan.`,
                variant: "destructive"
            })
        }
    };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Kelola Pesanan</h2>
      <p className="text-muted-foreground">Lihat dan kelola pesanan yang masuk untuk {vendorName}.</p>
      
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Pesanan #{order.id.substring(0,7)}</CardTitle>
                <CardDescription>Pelanggan: {order.customer_name}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah Item</span>
                  <span className="font-medium">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">Rp{order.total_amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-muted-foreground">Status</span>
                   <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value as Status)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ubah Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Order Placed">Order Diterima</SelectItem>
                    <SelectItem value="Payment Confirmed">Pembayaran Dikonfirmasi</SelectItem>
                    <SelectItem value="Completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-12">
            Belum ada pesanan yang masuk.
          </div>
        )}
        <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardContent className="p-0 mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jumlah Item</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                    <TableCell className="text-right">Rp{order.total_amount.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value as Status)}>
                        <SelectTrigger className="w-[200px] mx-auto">
                          <SelectValue placeholder="Ubah Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Order Placed">Order Diterima</SelectItem>
                          <SelectItem value="Payment Confirmed">Pembayaran Dikonfirmasi</SelectItem>
                          <SelectItem value="Completed">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Belum ada pesanan yang masuk.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="w-full"
            />
        </CardFooter>
      </Card>
    </div>
  )
}
