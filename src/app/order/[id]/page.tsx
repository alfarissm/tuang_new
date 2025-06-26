
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, FileText, Bell, Star, Wallet, Loader2, Hourglass } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { OrderItemStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const statuses: OrderItemStatus[] = ['Order Placed', 'Payment Confirmed', 'Completed'];
const statusIcons = {
  'Order Placed': FileText,
  'Payment Confirmed': CheckCircle,
  'Completed': Bell
};

const getItemStatusVariant = (status: OrderItemStatus) => {
    switch(status) {
        case 'Completed': return 'default';
        case 'Payment Confirmed': return 'secondary';
        case 'Order Placed': return 'outline';
        default: return 'outline';
    }
}

const RatingInput = ({ orderId, currentRating }: { orderId: string, currentRating?: number }) => {
  const { addRatingToOrder } = useOrders();
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRating = async (rate: number) => {
    if (currentRating || isSubmitting) return; // Prevent re-rating
    setIsSubmitting(true);
    try {
        setRating(rate);
        await addRatingToOrder(orderId, rate);
        toast({
            title: "Terima kasih!",
            description: `Anda memberikan ${rate} bintang untuk pesanan ini.`,
            className: "bg-accent text-accent-foreground",
        });
    } catch (error) {
        setRating(currentRating || 0);
        toast({
            title: "Gagal memberikan rating",
            description: "Terjadi kesalahan. Silakan coba lagi.",
            variant: "destructive"
        })
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 text-center">
        <h3 className="font-semibold font-headline">Beri Rating Pesanan Anda</h3>
        <div className="flex justify-center items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-8 w-8 transition-all",
                        !currentRating && "cursor-pointer",
                        (hoverRating >= star || rating >= star)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground"
                    )}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                />
            ))}
        </div>
        {currentRating && <p className="text-sm text-muted-foreground">Anda telah memberikan rating untuk pesanan ini.</p>}
    </div>
  )
}

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const { getOrderById, isLoading } = useOrders();
  const order = getOrderById(params.id);
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [hasNotified, setHasNotified] = useState(false);

  const currentStatus = order?.status ?? 'Order Placed';
  const currentStatusIndex = statuses.indexOf(currentStatus);

  useEffect(() => {
    if (order?.status === 'Completed' && !hasNotified) {
        toast({
            title: "Pesanan Selesai!",
            description: "Semua item pesanan Anda telah selesai dan siap diambil.",
            variant: "default",
            className: "bg-accent text-accent-foreground",
        });
        setHasNotified(true);
    }
  }, [order, toast, hasNotified]);

  const handleNewOrder = () => {
    clearCart();
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl py-8 text-center flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Mencari pesanan...</p>
          </div>
      </div>
    );
  }

  if (!order) {
    return (
        <div className="container mx-auto max-w-2xl py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-6">Sepertinya ada yang salah. Silakan buat pesanan baru.</p>
            <Button asChild>
                <Link href="/" onClick={handleNewOrder}>Buat Pesanan Baru</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href="/" onClick={handleNewOrder} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Buat Pesanan Baru
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Status Pesanan</CardTitle>
          <CardDescription>
            Pesanan Anda <span className="font-bold text-accent">#{params.id.substring(0,7)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {order.payment_method === 'cash' && order.status === 'Order Placed' && (
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertTitle>Menunggu Pembayaran Tunai</AlertTitle>
              <AlertDescription>
                Silakan tunjukkan halaman ini ke kasir untuk menyelesaikan pembayaran. Status akan diperbarui setelah pembayaran dikonfirmasi oleh penjual.
              </AlertDescription>
            </Alert>
          )}

          {/* Status Stepper */}
          <div>
            <div className="flex justify-between items-center">
              {statuses.map((status, index) => {
                const Icon = statusIcons[status];
                return (
                  <div key={status} className="flex flex-col items-center z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                      index <= currentStatusIndex ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className={cn(
                      "text-xs text-center mt-2 font-semibold",
                      index <= currentStatusIndex ? "text-accent" : "text-muted-foreground"
                    )}>{status}</p>
                  </div>
                );
              })}
            </div>
            <div className="relative -mt-12 h-2 bg-muted">
              <div
                className="absolute top-0 left-0 h-2 bg-accent transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <Separator />
          
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold font-headline">Ringkasan Pesanan</h3>
            <div className="space-y-2 text-sm border rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pelanggan</span>
                <span className="font-medium">{order.customer_name || 'Pelanggan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NIM/NIP</span>
                <span className="font-medium">{order.customer_id || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No Meja</span>
                <span className="font-medium">{order.table_number || '-'}</span>
              </div>
              <Separator />
               {order.items.map(item => (
                <div className="flex justify-between items-center" key={item.id}>
                    <div>
                        <span>{item.name} x {item.quantity}</span>
                        <p className="text-xs text-muted-foreground">{item.vendor}</p>
                    </div>
                    <div className="text-right">
                       <span>Rp{(item.price * item.quantity).toLocaleString("id-ID")}</span>
                       <Badge variant={getItemStatusVariant(item.status)} className="ml-2 text-xs">{item.status === 'Payment Confirmed' ? 'Diproses' : item.status}</Badge>
                    </div>
                </div>
               ))}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>Rp{order.total_amount.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {currentStatus === 'Completed' && (
             <div className="space-y-6">
                <Separator />
                <RatingInput orderId={order.id} currentRating={order.rating} />
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6" asChild>
                    <Link href="/" onClick={handleNewOrder}>Buat Pesanan Baru</Link>
                </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
