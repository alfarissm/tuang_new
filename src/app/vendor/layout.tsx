
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  LineChart,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { auth, logout } = useAuth()
  const [isVerified, setIsVerified] = React.useState(false);
  const { setTheme } = useTheme()

  React.useEffect(() => {
    // If not on the login page and not a vendor, redirect.
    if (pathname !== '/vendor/login' && !auth.isVendor) {
      router.replace("/vendor/login");
    } else {
      // Otherwise, verification passes.
      setIsVerified(true);
    }
  }, [auth.isVendor, router, pathname]);

  // Early return for the login page must come AFTER all hooks.
  if (pathname === '/vendor/login') {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Image src="/tuang.svg" alt="Tuang logo" width={48} height={48} className="animate-pulse" />
          <p className="text-muted-foreground">Memuat dasbor...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Image src="/tuang.svg" alt="Tuang Vendor logo" width={32} height={32} />
            <span className="text-lg font-semibold font-headline text-accent">
              Tuang Vendor
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/vendor">
                <SidebarMenuButton
                  isActive={isActive("/vendor")}
                  icon={<LayoutDashboard />}
                >
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/vendor/orders">
                <SidebarMenuButton isActive={isActive("/vendor/orders")} icon={<ShoppingCart />}>
                  Kelola Pesanan
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/vendor/menus">
                <SidebarMenuButton isActive={isActive("/vendor/menus")} icon={<Utensils />}>
                  Kelola Menu
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/vendor/reports">
                <SidebarMenuButton isActive={isActive("/vendor/reports")} icon={<LineChart />}>
                  Laporan
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" alt="Vendor" data-ai-hint="person avatar" />
              <AvatarFallback>{auth.vendorName?.substring(0, 2).toUpperCase() || 'V'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{auth.vendorName || 'Vendor'}</span>
               <button onClick={() => logout('vendor')} className="text-xs text-left text-muted-foreground hover:underline">
                Keluar
              </button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add search here */}
          </div>
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
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
