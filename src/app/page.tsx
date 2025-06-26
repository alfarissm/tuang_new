
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, PlusCircle, MinusCircle, ShoppingCart, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { useMenu } from "@/context/MenuContext";

const MenuGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
    {Array.from({ length: 10 }).map((_, i) => (
      <Card key={i} className="overflow-hidden flex flex-col group">
        <CardHeader className="p-0 relative">
          <Skeleton className="w-full h-32 sm:h-40" />
        </CardHeader>
        <CardContent className="p-3 md:p-4 flex-grow flex flex-col">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter className="p-3 md:p-4 pt-0">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

export default function HomePage() {
  const {
    cart,
    addToCart,
    updateQuantity,
    totalAmount,
    totalItems,
    tableNumber,
    setTableNumber,
  } = useCart();
  const { menuItems, categories: menuCategories, isLoading } = useMenu();
  const { setTheme } = useTheme();

  const [isClient, setIsClient] = useState(false);
  const [localTableNumber, setLocalTableNumber] = useState(tableNumber || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showTableNumberError, setShowTableNumberError] = useState(false);
  
  const categories = useMemo(() => ["All", ...menuCategories.map(c => c.name)], [menuCategories]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, menuItems]);

  const handleStartOrdering = () => {
    if (localTableNumber.trim()) {
      setTableNumber(localTableNumber);
      setShowTableNumberError(false);
    } else {
      setShowTableNumberError(true);
    }
  };

  const header = (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Image src="/tuang.svg" alt="Tuang logo" width={32} height={32} />
          <span className="text-2xl font-bold font-headline text-accent">Tuang</span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
           <Link href="/vendor/login">
            <Button variant="ghost" className="px-2 sm:px-4">Vendor</Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="ghost" className="px-2 sm:px-4">Admin</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );

  if (!isClient) {
    return (
       <div className="min-h-screen bg-background text-foreground">
        {header}
        <main className="container flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 4rem)'}}>
          <Card className="w-full max-w-md">
            <CardHeader>
              <Skeleton className="h-7 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
               </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-12 w-full" />
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {header}
      
      {!tableNumber ? (
        <main className="container flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 4rem)'}}>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-center">Selamat Datang di Tuang</CardTitle>
              <CardDescription className="text-center">
                Silakan masukkan nomor meja Anda untuk memulai pemesanan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <label htmlFor="tableNumber" className="text-sm font-medium">Nomor Meja</label>
                  <Input
                    id="tableNumber"
                    type="number"
                    placeholder="Contoh: 14"
                    value={localTableNumber}
                    onChange={(e) => {
                      setLocalTableNumber(e.target.value);
                      if(e.target.value.trim()){
                        setShowTableNumberError(false);
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartOrdering()}
                    className="mt-1 text-center text-lg h-12"
                  />
                  {showTableNumberError && <p className="text-destructive text-xs text-center pt-2">Nomor meja tidak boleh kosong.</p>}
               </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartOrdering} className="w-full text-lg py-6 bg-accent hover:bg-accent/90">
                Mulai Memesan
              </Button>
            </CardFooter>
          </Card>
        </main>
      ) : (
        <main className="container py-4 md:py-8">
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-headline">Pilih Menu</h2>
                  <p className="text-muted-foreground text-sm">Selamat menikmati waktu Anda!</p>
                </div>
                <div className="text-left sm:text-right bg-muted px-3 py-1 rounded-md">
                    <p className="text-xs text-muted-foreground">Nomor Meja</p>
                    <p className="text-xl font-bold text-accent">{tableNumber}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="sticky top-[65px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 py-4 -my-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Cari makanan atau minuman..."
                  className="pl-10 h-11 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>

            {isLoading ? <MenuGridSkeleton /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredMenuItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden flex flex-col group">
                    <CardHeader className="p-0 relative">
                      <Image
                        src={item.image_url || 'https://placehold.co/300x200.png'}
                        alt={item.name}
                        width={300}
                        height={200}
                        className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="food meal"
                      />
                       <Badge variant="secondary" className="absolute top-2 left-2">{item.vendor}</Badge>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 flex-grow flex flex-col">
                      <h3 className="text-base md:text-lg font-bold font-headline leading-tight flex-grow">{item.name}</h3>
                      <p className="text-lg font-semibold text-accent mt-2">
                        Rp{item.price.toLocaleString("id-ID")}
                      </p>
                    </CardContent>
                    <CardFooter className="p-3 md:p-4 pt-0">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => addToCart(item)}>
                        <PlusCircle className="mr-2 h-5 w-5" /> Tambah
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
             <Sheet>
                <SheetTrigger asChild>
                    <Button className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 md:h-16 w-auto px-4 md:px-6 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground text-base md:text-lg flex items-center gap-3 md:gap-4 z-50">
                        <div className="relative">
                            <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
                            <Badge className="absolute -top-2 -right-3 px-2 py-0.5 text-xs bg-primary text-primary-foreground">{totalItems}</Badge>
                        </div>
                        <div className="hidden sm:block">
                            <Separator orientation="vertical" className="h-6 md:h-8 bg-accent-foreground/50" />
                        </div>
                        <span className="hidden sm:block">Rp{totalAmount.toLocaleString("id-ID")}</span>
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="font-headline text-2xl">Pesanan Anda</SheetTitle>
                    <SheetDescription>
                      Periksa kembali pesanan Anda untuk meja nomor <span className="font-bold text-foreground">{tableNumber}</span>.
                    </SheetDescription>
                  </SheetHeader>
                   <div className="flex-grow space-y-4 overflow-y-auto pr-6 -mr-6 py-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <Image src={item.image_url || 'https://placehold.co/64x64.png'} alt={item.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" data-ai-hint="food meal"/>
                          <div>
                            <p className="font-semibold leading-tight">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Rp{item.price.toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="font-bold w-5 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SheetFooter className="mt-auto">
                    <div className="w-full space-y-4 pt-4 border-t">
                        <div className="flex justify-between w-full font-bold text-lg">
                            <span>Total</span>
                            <span>Rp{totalAmount.toLocaleString("id-ID")}</span>
                        </div>
                        <Link href="/checkout" passHref className="w-full">
                          <Button
                            size="lg"
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg"
                          >
                            Lanjut ke Checkout
                          </Button>
                        </Link>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
          )}
        </main>
      )}
    </div>
  );
}
