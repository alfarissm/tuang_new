
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card"
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
import type { OrderItemStatus } from '@/lib/types';
import { ChevronDown, ChevronUp, Wallet, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const ITEMS_PER_PAGE = 5;

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

export default function VendorOrdersPage() {
    const { getVendorOrders, updateItemStatus, updateOrderStatus } = useOrders();
    const { auth } = useAuth();
    const { toast } = useToast();
    const vendorName = auth.vendorName || "";
    const orders = useMemo(() => getVendorOrders(vendorName), [getVendorOrders, vendorName]);
    const [currentPage, setCurrentPage] = useState(1);
    const [openOrders, setOpenOrders] = useState<string[]>([]);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return orders.slice(startIndex, endIndex);
    }, [orders, currentPage]);
    
    React.useEffect(() => {
      // Automatically open the first order on the page if it's not completed
      if (paginatedOrders.length > 0 && paginatedOrders[0].status !== 'Completed' && openOrders.length === 0) {
        setOpenOrders([paginatedOrders[0].id]);
      }
    }, [paginatedOrders, currentPage, openOrders]);


    const handleItemStatusChange = async (orderId: string, itemId: number, newStatus: OrderItemStatus) => {
        try {
            await updateItemStatus(orderId, itemId, newStatus);
            toast({
                title: "Status Item Diperbarui",
                description: `Status item telah diubah menjadi "${newStatus}".`,
                className: "bg-accent text-accent-foreground"
            })
        } catch (error) {
            toast({
                title: "Gagal Memperbarui Status",
                description: `Terjadi kesalahan saat mengubah status item.`,
                variant: "destructive"
            })
        }
    };
    
    // For cash orders, the vendor needs to confirm payment for the whole order
    const handleCashPaymentConfirmation = async (orderId: string) => {
        try {
            await updateOrderStatus(orderId, 'Payment Confirmed');
            toast({
                title: "Pembayaran Dikonfirmasi",
                description: `Status pesanan #${orderId.substring(0,7)} telah diubah menjadi "Payment Confirmed".`,
                className: "bg-accent text-accent-foreground"
            })
        } catch (error) {
             toast({
                title: "Gagal Konfirmasi Pembayaran",
                description: `Terjadi kesalahan.`,
                variant: "destructive"
            })
        }
    }
    
    const toggleOrder = (orderId: string) => {
      setOpenOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Kelola Pesanan</h2>
      <p className="text-muted-foreground">Lihat dan kelola pesanan yang masuk untuk {vendorName}.</p>
      
      <div className="space-y-4">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <Collapsible
              key={order.id}
              open={openOrders.includes(order.id)}
              onOpenChange={() => toggleOrder(order.id)}
              className="space-y-2"
            >
              <Card>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-lg" onClick={() => toggleOrder(order.id)}>
                  <div className="flex items-center gap-4">
                     <Button variant="ghost" size="icon" className="h-9 w-9 data-[state=open]:rotate-180 transition-transform">
                        <ChevronDown className="h-5 w-5" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    <div>
                      <p className="font-semibold text-primary">#{order.id.substring(0, 7)}</p>
                      <p className="text-sm font-medium">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                     <div className="text-right">
                        <p className="font-bold">Rp{order.total_amount.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-muted-foreground">{order.items.length} item</p>
                     </div>
                    <Badge variant={getStatusVariant(order.status)} className="h-6 text-xs">{order.status}</Badge>
                  </div>
                </div>
                
                <CollapsibleContent className="px-4 pb-4">
                  <div className="border-t pt-4 space-y-4">
                    {order.payment_method === 'cash' && order.status === 'Order Placed' && (
                        <Alert>
                            <Wallet className="h-4 w-4" />
                            <AlertTitle className="font-headline">Konfirmasi Pembayaran</AlertTitle>
                            <AlertDescription className="flex justify-between items-center">
                                Pesanan ini menunggu pembayaran tunai.
                                <Button size="sm" onClick={() => handleCashPaymentConfirmation(order.id)}>Konfirmasi Bayar</Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    {order.note && (
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                <StickyNote className="h-4 w-4" />
                                Catatan Pelanggan:
                            </h4>
                            <p className="text-sm bg-muted/50 p-2 rounded-md whitespace-pre-wrap">{order.note}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                      {order.items.map(item => (
                        <div key={item.id} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                          <div className="md:col-span-2">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">x {item.quantity}</p>
                          </div>
                          <div className="text-left md:text-center">
                             <Badge variant={getStatusVariant(item.status)}>{item.status === 'Payment Confirmed' ? 'Diproses' : item.status}</Badge>
                          </div>
                          <div>
                            <Select 
                                value={item.status} 
                                onValueChange={(value) => handleItemStatusChange(order.id, item.id, value as OrderItemStatus)}
                                disabled={order.status === 'Order Placed'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Ubah Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Payment Confirmed">Proses</SelectItem>
                                    <SelectItem value="Completed">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Belum ada pesanan yang masuk.</p>
            </CardContent>
          </Card>
        )}

         <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="pt-4"
        />
      </div>
    </div>
  )
}
