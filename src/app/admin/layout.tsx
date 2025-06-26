
"use client"

import * as React from "react"
import Link from "next/link"
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
  Users,
  Utensils,
  LineChart,
  Moon,
  Sun,
  LayoutGrid,
  ShoppingCart,
  History,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function AdminLayout({
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
    // If not on the login page and not an admin, redirect.
    if (pathname !== '/admin/login' && !auth.isAdmin) {
      router.replace("/admin/login");
    } else {
      // Otherwise, verification passes.
      setIsVerified(true);
    }
  }, [auth.isAdmin, router, pathname]);

  // Early return for the login page must come AFTER all hooks.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Icons.logo className="size-12 animate-pulse text-muted-foreground" />
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
            <Icons.logo className="size-8 text-accent" />
            <span className="text-lg font-semibold font-headline text-accent">
              Tuang Admin
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin">
                <SidebarMenuButton
                  isActive={isActive("/admin")}
                  icon={<LayoutDashboard />}
                >
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/orders">
                <SidebarMenuButton isActive={isActive("/admin/orders")} icon={<ShoppingCart />}>
                  Kelola Pesanan
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/sellers">
                <SidebarMenuButton isActive={isActive("/admin/sellers")} icon={<Users />}>
                  Kelola Penjual
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/menus">
                <SidebarMenuButton isActive={isActive("/admin/menus")} icon={<Utensils />}>
                  Kelola Menu
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/admin/categories">
                <SidebarMenuButton isActive={isActive("/admin/categories")} icon={<LayoutGrid />}>
                  Kelola Kategori
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/admin/reports">
                <SidebarMenuButton isActive={isActive("/admin/reports")} icon={<LineChart />}>
                  Laporan Keuangan
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/activity">
                <SidebarMenuButton isActive={isActive("/admin/activity")} icon={<History />}>
                  Log Aktivitas
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin</span>
              <button onClick={() => logout('admin')} className="text-xs text-left text-muted-foreground hover:underline">
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
