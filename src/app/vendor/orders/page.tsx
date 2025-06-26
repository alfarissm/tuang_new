
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
import type { OrderItemStatus } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
      if (paginatedOrders.length > 0 && paginatedOrders[0].status !== 'Completed') {
        setOpenOrders([paginatedOrders[0].id]);
      }
    }, [paginatedOrders, currentPage]);


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
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Detail Pesanan</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total Anda</TableHead>
                <TableHead className="text-center">Status Pesanan</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <Collapsible asChild key={order.id} open={openOrders.includes(order.id)} onOpenChange={() => toggleOrder(order.id)}>
                    <>
                    <TableRow className="bg-muted/50 data-[state=open]:bg-muted">
                      <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell className="text-right">Rp{order.total_amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-center">
                          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                       <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full">
                              {openOrders.includes(order.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              <span className="sr-only">Toggle</span>
                            </Button>
                          </CollapsibleTrigger>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                       <tr className="bg-background">
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Detail Item</CardTitle>
                                    {order.payment_method === 'cash' && order.status === 'Order Placed' && (
                                        <div className="flex items-center justify-between">
                                            <CardDescription className="text-destructive">
                                                Pesanan ini menunggu konfirmasi pembayaran tunai.
                                            </CardDescription>
                                            <Button size="sm" onClick={() => handleCashPaymentConfirmation(order.id)}>Konfirmasi Pembayaran</Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead className="text-center">Jumlah</TableHead>
                                                <TableHead className="text-center">Status Item</TableHead>
                                                <TableHead className="text-center w-[200px]">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.items.map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Select 
                                                            value={item.status} 
                                                            onValueChange={(value) => handleItemStatusChange(order.id, item.id, value as OrderItemStatus)}
                                                            disabled={order.status === 'Order Placed'}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Ubah Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Payment Confirmed">Sedang Diproses</SelectItem>
                                                                <SelectItem value="Completed">Selesai</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                             </Card>
                          </div>
                        </TableCell>
                      </tr>
                    </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
