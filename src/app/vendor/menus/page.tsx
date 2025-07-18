
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import type { MenuItem } from '@/lib/types';
import { PaginationControls } from '@/components/ui/pagination-controls';


const emptyMenu: Partial<MenuItem> = {
    name: '',
    category: '',
    price: 0,
    image_url: null,
};

const ITEMS_PER_PAGE = 5;

export default function VendorMenusPage() {
  const { toast } = useToast();
  const { auth } = useAuth();
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const vendorName = auth.vendorName || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  
  const [currentMenu, setCurrentMenu] = useState<Partial<MenuItem>>(emptyMenu);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);


  const [currentPage, setCurrentPage] = useState(1);

  const vendorMenuItems = useMemo(() => {
    if (!vendorName) return [];
    return menuItems.filter(item => item.vendor === vendorName);
  }, [vendorName, menuItems]);
  
  const totalPages = Math.ceil(vendorMenuItems.length / ITEMS_PER_PAGE);
  const paginatedMenuItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return vendorMenuItems.slice(startIndex, endIndex);
  }, [vendorMenuItems, currentPage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(currentMenu.image_url || null);
    }
  };
  
  const openDialog = (mode: 'add' | 'edit', menu?: MenuItem) => {
      setDialogMode(mode);
      if (mode === 'edit' && menu) {
          setCurrentMenu(menu);
          setImagePreview(menu.image_url);
      } else {
          setCurrentMenu(emptyMenu);
          setImagePreview(null);
      }
      setImageFile(null);
      setIsDialogOpen(true);
  }
  
  const openDeleteConfirmation = (menu: MenuItem) => {
      setDeleteTarget(menu);
      setIsDeleteDialogOpen(true);
  }
  
  const closeDialogs = () => {
      setIsDialogOpen(false);
      setIsDeleteDialogOpen(false);
      setCurrentMenu(emptyMenu);
      setImagePreview(null);
      setImageFile(null);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!currentMenu.name || !currentMenu.category || currentMenu.price === undefined) {
        toast({ title: "Form tidak lengkap", description: "Harap isi semua kolom yang wajib diisi.", variant: "destructive"});
        return;
    }
    
    setIsSubmitting(true);
    
    // imagePreview will be a base64 string for new uploads, or existing http URL for edits without image change.
    const imageUrlToUpload = imagePreview;

    try {
        if (dialogMode === 'add') {
          const newMenu = {
            name: currentMenu.name,
            category: currentMenu.category,
            price: Number(currentMenu.price),
            vendor: vendorName,
            image_url: imageUrlToUpload,
          };
          await addMenuItem(newMenu);
          toast({
            title: "Menu Ditambahkan!",
            description: `Menu "${newMenu.name}" telah berhasil ditambahkan.`,
            className: "bg-accent text-accent-foreground",
          });
        } else {
          const updatedMenu = { ...currentMenu, vendor: vendorName, price: Number(currentMenu.price), image_url: imageUrlToUpload };
          await updateMenuItem(updatedMenu as MenuItem);
          toast({
            title: "Menu Diperbarui!",
            description: `Menu "${updatedMenu.name}" telah berhasil diperbarui.`,
            className: "bg-accent text-accent-foreground",
          });
        }
        closeDialogs();
    } catch (error: any) {
        toast({ title: "Terjadi kesalahan", description: error.message || "Gagal menyimpan menu.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
        await deleteMenuItem(deleteTarget.id);
        toast({
          title: "Menu Dihapus!",
          description: `Menu "${deleteTarget.name}" telah berhasil dihapus.`,
          variant: 'destructive'
        });
    } catch (error: any) {
        toast({ title: "Terjadi kesalahan", description: error.message || "Gagal menghapus menu.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
        closeDialogs();
    }
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Kelola Menu Anda</h2>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus item menu dari {vendorName}.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => openDialog('add')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Menu
          </Button>
        </div>
      </div>
      
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {paginatedMenuItems.length > 0 ? (
            paginatedMenuItems.map((item) => (
            <Card key={item.id} className="flex items-center p-4 justify-between">
                <div className="flex items-center gap-4">
                    <Image src={item.image_url || 'https://placehold.co/64x64.png'} alt={item.name} className="h-16 w-16 rounded-md object-cover" width={64} height={64} data-ai-hint="food meal"/>
                    <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge variant="outline" className="mt-1">{item.category}</Badge>
                        <p className="text-accent font-semibold mt-1">Rp{item.price.toLocaleString("id-ID")}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 self-start">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openDialog('edit', item)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteConfirmation(item)}
                      className="text-destructive focus:text-destructive">
                        Hapus
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Card>
            ))
        ) : (
            <div className="text-center text-muted-foreground py-12">
                Belum ada menu yang ditambahkan.
            </div>
        )}
        <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardContent className="p-0 mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Menu</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMenuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">Rp{item.price.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog('edit', item)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteConfirmation(item)}
                          className="text-destructive focus:text-destructive">
                            Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{dialogMode === 'add' ? 'Tambah Menu Baru' : 'Edit Menu'}</DialogTitle>
                <DialogDescription>
                  Masukkan detail menu untuk warung Anda.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nama Menu
                    </Label>
                    <Input id="name" value={currentMenu.name || ''} onChange={(e) => setCurrentMenu({...currentMenu, name: e.target.value})} placeholder="cth: Nasi Uduk" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Kategori
                    </Label>
                     <Select required value={currentMenu.category} onValueChange={(value) => setCurrentMenu({...currentMenu, category: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Harga (Rp)
                    </Label>
                    <Input id="price" type="number" value={currentMenu.price || ''} onChange={(e) => setCurrentMenu({...currentMenu, price: Number(e.target.value)})} placeholder="cth: 15000" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="image" className="text-right pt-2">
                      Gambar
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Input id="image" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                      <div className="w-full aspect-video relative bg-muted rounded-md border flex items-center justify-center">
                          {imagePreview ? (
                              <Image src={imagePreview} alt="Pratinjau menu" fill style={{objectFit:"contain"}} className="p-1" data-ai-hint="food meal"/>
                          ) : (
                              <span className="text-xs text-muted-foreground">Pratinjau gambar</span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={closeDialogs} disabled={isSubmitting}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {dialogMode === 'add' ? 'Simpan Menu' : 'Simpan Perubahan'}
                    </Button>
                </DialogFooter>
              </form>
            </DialogContent>
        </Dialog>
      
      {/* Delete Confirmation Dialog */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Tindakan ini tidak bisa dibatalkan. Ini akan menghapus menu "{deleteTarget?.name}" secara permanen.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={closeDialogs}>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
