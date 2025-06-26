
"use client"

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorLoginPage() {
  const { auth, loginVendor } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isClient && auth.isVendor) {
      router.replace('/vendor');
    }
  }, [auth.isVendor, router, isClient]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For this prototype, we'll log in a specific vendor
    loginVendor("Warung Bu Siti");
  }

  if (!isClient) {
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
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (auth.isVendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Icons.logo className="size-12 animate-pulse text-muted-foreground" />
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
                <Icons.logo className="h-12 w-12 text-accent" />
            </div>
          <CardTitle className="text-2xl font-headline">Vendor Login</CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses dasbor penjual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="penjual@example.com"
                required
                defaultValue="penjual@tuang.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Login
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
