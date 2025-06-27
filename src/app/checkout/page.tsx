
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, User, Hash, CreditCard, Wallet, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useOrders } from "@/context/OrderContext";
import { Textarea } from "@/components/ui/textarea";

const checkoutFormSchema = z.object({
  customerName: z.string().min(1, "Nama tidak boleh kosong."),
  customerId: z.string().min(1, "NIM/NIP tidak boleh kosong."),
  note: z.string().optional(),
  paymentMethod: z.enum(["qris", "cash"], {
    required_error: "Anda harus memilih metode pembayaran.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, totalAmount, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerId: "",
      note: "",
    },
  });

  async function onSubmit(data: CheckoutFormValues) {
    setIsLoading(true);
    
    try {
        const orderId = await addOrder({
            paymentMethod: data.paymentMethod as "qris" | "cash",
            customerInfo: {
                customerName: data.customerName,
                customerId: data.customerId,
            },
            note: data.note,
        });
        
        clearCart();
        
        if (data.paymentMethod === 'qris') {
            router.push(`/payment/qris/${orderId}`);
        } else {
            toast({
                title: "Pesanan Berhasil Dibuat!",
                description: "Silakan lakukan pembayaran tunai di kasir. Anda akan diarahkan ke halaman status pesanan.",
                variant: "default",
                className: "bg-accent text-accent-foreground",
            });
            router.push(`/order/${orderId}`);
        }
    } catch (error) {
        toast({
            title: "Gagal Membuat Pesanan",
            description: "Terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi.",
            variant: "destructive",
        });
        setIsLoading(false);
    }
  }

  if (cart.length === 0 && !isLoading) {
    return (
        <div className="container mx-auto max-w-2xl py-8 text-center">
            <h2 className="text-2xl font-bold mb-4 font-headline">Keranjang Anda Kosong</h2>
            <p className="text-muted-foreground mb-6">Sepertinya Anda belum memesan apa pun. Silakan kembali ke menu untuk memesan.</p>
            <Button asChild>
                <Link href="/">Kembali ke Menu</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Menu
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Checkout</CardTitle>
          <CardDescription>Selesaikan pesanan Anda dengan mengisi data di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold font-headline">Ringkasan Pesanan</h3>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                {cart.map(item => (
                    <div className="flex justify-between" key={item.id}>
                        <span>{item.name} x {item.quantity}</span>
                        <span>Rp{(item.price * item.quantity).toLocaleString("id-ID")}</span>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>Rp{totalAmount.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <Separator className="my-6" />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                                <Input placeholder="Masukkan nama Anda" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIM / NIP</FormLabel>
                            <FormControl>
                                <Input placeholder="Masukkan NIM atau NIP" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Catatan (Opsional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Contoh: Tidak pakai pedas, es batunya sedikit saja."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
               <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                            <FormControl>
                                <RadioGroupItem value="qris" id="qris" className="sr-only" />
                            </FormControl>
                            <Label htmlFor="qris" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === 'qris' && "border-accent")}>
                                <CreditCard className="mb-3 h-6 w-6" />
                                QRIS
                            </Label>
                        </FormItem>
                         <FormItem>
                            <FormControl>
                                <RadioGroupItem value="cash" id="cash" className="sr-only" />
                            </FormControl>
                            <Label htmlFor="cash" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === 'cash' && "border-accent")}>
                                <Wallet className="mb-3 h-6 w-6" />
                                Tunai
                            </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses...
                    </>
                ) : (
                    'Buat Pesanan'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
