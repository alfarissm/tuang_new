
"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders } from '@/context/OrderContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PaginationControls } from '@/components/ui/pagination-controls';
import type { OrderItemStatus } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

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

const getUniqueVendors = (items: { vendor: string }[]): string => {
  const vendors = new Set(items.map(item => item.vendor));
  return Array.from(vendors).join(', ');
};

export default function AdminOrdersPage() {
    const { orders } = useOrders();
    const [currentPage, setCurrentPage] = useState(1);

    const sortedOrders = useMemo(() => 
        [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), 
        [orders]
    );

    const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sortedOrders.slice(startIndex, endIndex);
    }, [sortedOrders, currentPage]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Kelola Semua Pesanan</h2>
          <p className="text-muted-foreground">Lihat semua pesanan yang masuk dari semua penjual.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-0 mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Penjual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getUniqueVendors(order.items)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'd LLL yyyy, HH:mm', { locale: id })}
                    </TableCell>
                    <TableCell className="text-right">Rp{order.total_amount.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Belum ada pesanan.
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
