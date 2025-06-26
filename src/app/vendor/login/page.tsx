
"use client"

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenu } from "@/context/MenuContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function VendorLoginPage() {
  const { auth, loginVendor } = useAuth();
  const { vendors, isLoading: isMenuLoading } = useMenu();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedVendor, setSelectedVendor] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isClient && auth.isVendor) {
      router.replace('/vendor');
    }
  }, [auth.isVendor, router, isClient]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) {
      toast({
        title: "Pilih Penjual",
        description: "Anda harus memilih nama warung untuk login.",
        variant: "destructive",
      });
      return;
    }
    if (!password) {
      toast({
        title: "Password Dibutuhkan",
        description: "Silakan masukkan password Anda.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginVendor(selectedVendor, password);
      // Redirect handled by AuthContext
    } catch (error: any) {
      toast({
        title: "Login Gagal",
        description: error.message || "Silakan periksa kembali nama warung dan password Anda.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isClient || isMenuLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="text-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-7 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (auth.isVendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Image src="/tuang.svg" alt="Tuang logo" width={48} height={48} className="animate-pulse" />
          <p className="text-muted-foreground">Mengarahkan ke dasbor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Image src="/tuang.svg" alt="Tuang logo" width={32} height={32} />
            </div>
          <CardTitle className="text-2xl font-headline">Vendor Login</CardTitle>
          <CardDescription>
            Pilih nama warung dan masukkan password Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="vendor-select">Nama Warung</Label>
               <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger id="vendor-select">
                    <SelectValue placeholder="Pilih warung Anda" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.length > 0 ? (
                        vendors.map(vendor => <SelectItem key={vendor.id} value={vendor.name}>{vendor.name}</SelectItem>)
                    ) : (
                        <SelectItem value="none" disabled>Belum ada penjual terdaftar</SelectItem>
                    )}
                  </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={vendors.length === 0 || isLoading}>
              {isLoading ? 'Memverifikasi...' : 'Login'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Bukan Penjual? Kembali ke{' '}
            <Link href="/" className="underline">
              Halaman Utama
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
