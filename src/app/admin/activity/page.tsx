
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useOrders } from '@/context/OrderContext';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { PaginationControls } from '@/components/ui/pagination-controls';

const ITEMS_PER_PAGE = 10;

export default function AdminActivityPage() {
    const { orders } = useOrders();
    const [currentPage, setCurrentPage] = React.useState(1);

    const activityLog = React.useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map(order => ({
                id: order.id,
                description: `Pesanan baru #${order.id.substring(0,7)} dibuat oleh ${order.customer_name}.`,
                time: new Date(order.created_at)
            }));
      }, [orders]);

    const totalPages = Math.ceil(activityLog.length / ITEMS_PER_PAGE);
    const paginatedLogs = React.useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return activityLog.slice(startIndex, endIndex);
    }, [currentPage, activityLog]);


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Log Aktivitas Sistem</h2>
          <p className="text-muted-foreground">Riwayat lengkap aktivitas yang terjadi di dalam sistem.</p>
        </div>
       <Card>
            <CardHeader>
                <CardTitle>Semua Aktivitas</CardTitle>
                <CardDescription>Aktivitas diurutkan dari yang paling baru.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {paginatedLogs.length > 0 ? paginatedLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-4">
                        <div className="bg-muted p-3 rounded-full">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="pt-1">
                            <p className="text-sm">{log.description}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(log.time, { addSuffix: true, locale: id })}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground py-12">
                        Tidak ada aktivitas yang tercatat.
                    </div>
                )}
                 <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </CardContent>
        </Card>
    </div>
  )
}
