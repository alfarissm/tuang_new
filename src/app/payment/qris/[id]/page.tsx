
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/context/OrderContext";

export default function QrisPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { getOrderById, updateOrderStatus } = useOrders();
  const order = getOrderById(params.id);

  const handlePaymentConfirmation = async () => {
    try {
        await updateOrderStatus(params.id, 'Payment Confirmed');
        toast({
          title: "Pembayaran Dikonfirmasi!",
          description: "Pesanan Anda sedang diproses. Anda akan diarahkan ke halaman status pesanan.",
          variant: "default",
          className: "bg-accent text-accent-foreground",
        });
        router.push(`/order/${params.id}`);
    } catch (error) {
        toast({
            title: "Gagal Konfirmasi Pembayaran",
            description: "Terjadi kesalahan. Coba lagi nanti.",
            variant: "destructive"
        })
    }
  }

  if (!order) {
     return (
        <div className="container mx-auto max-w-md py-8 text-center">
            <h2 className="text-2xl font-bold mb-4 font-headline">Pesanan Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-6">Sepertinya ada yang salah. Silakan buat pesanan baru.</p>
            <Button asChild>
                <Link href="/">Buat Pesanan Baru</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Link href="/checkout" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Checkout
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Pembayaran QRIS</CardTitle>
          <CardDescription className="text-center">
            Scan kode QR di bawah ini untuk membayar pesanan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Image 
              src="/qria.png" 
              alt="QR Code" 
              width={300} 
              height={300} 
              data-ai-hint="qr code"
              className="rounded-lg"
            />
          </div>
          <Separator />
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-center text-lg mb-2 font-headline">Ringkasan Pesanan</h3>
            {order.items.map(item => (
              <div className="flex justify-between items-center" key={item.id}>
                 <div className="flex items-center gap-3">
                    <Image src={item.image_url || 'https://placehold.co/64x64.png'} alt={item.name} width={40} height={40} className="rounded-md object-cover h-10 w-10" data-ai-hint="food meal"/>
                    <div>
                        <p className="leading-tight">{item.name} x {item.quantity}</p>
                    </div>
                 </div>
                <span>Rp{(item.price * item.quantity).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
              <span>Total Pembayaran</span>
              <span>Rp{order.total_amount.toLocaleString("id-ID")}</span>
          </div>
          <Button onClick={handlePaymentConfirmation} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
            Saya Sudah Bayar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
