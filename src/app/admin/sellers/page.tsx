
"use client";

import React, { useMemo, useState } from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';
import { useMenu } from '@/context/MenuContext';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface Seller {
  id: number;
  name: string;
  // These fields are illustrative for the UI but not stored in context
  owner: string; 
  joinDate: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminSellersPage() {
  const { toast } = useToast();
  const { vendors, updateVendorName, deleteVendor } = useMenu();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The seller list is derived from the MenuContext vendors, but we add local UI fields
  const sellerList: Seller[] = useMemo(() => {
    return vendors.map((vendorName, index) => ({
      id: index + 1,
      name: vendorName,
      owner: `Pemilik ${vendorName}`,
      joinDate: '2023-01-01', // Mock data
    }));
  }, [vendors]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sellerList.length / ITEMS_PER_PAGE);
  const paginatedSellers = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return sellerList.slice(startIndex, endIndex);
  }, [sellerList, currentPage]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // We only support 'edit' for now, 'add' is complex as it requires adding a menu.
  const [dialogMode, setDialogMode] = useState<'edit'>('edit'); 
  const [currentSeller, setCurrentSeller] = useState<Partial<Seller>>({ name: '', owner: '' });
  const [originalSellerName, setOriginalSellerName] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Seller | null>(null);

  const openDialog = (mode: 'edit', seller: Seller) => {
      setDialogMode(mode);
      setCurrentSeller(seller);
      setOriginalSellerName(seller.name);
      setIsDialogOpen(true);
  }

  const openDeleteConfirmation = (seller: Seller) => {
      setDeleteTarget(seller);
      setIsDeleteDialogOpen(true);
  }
  
  const closeDialogs = () => {
      setIsDialogOpen(false);
      setIsDeleteDialogOpen(false);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!currentSeller.name?.trim()) {
        toast({ title: "Nama warung tidak boleh kosong", variant: "destructive"});
        return;
    }
    
    setIsSubmitting(true);
    try {
        if (dialogMode === 'edit') {
          await updateVendorName(originalSellerName, currentSeller.name);
          toast({
            title: "Penjual Diperbarui!",
            description: `Data untuk "${currentSeller.name}" telah berhasil diperbarui.`,
            className: "bg-accent text-accent-foreground",
          });
        }
    } catch (error) {
         toast({ title: "Terjadi kesalahan", description: "Gagal memperbarui penjual.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
        closeDialogs();
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
        await deleteVendor(deleteTarget.name);
        toast({
          title: "Penjual Dihapus!",
          description: `Penjual "${deleteTarget.name}" telah berhasil dihapus beserta semua menunya.`,
          variant: 'destructive'
        });
    } catch (error) {
        toast({ title: "Terjadi kesalahan", description: "Gagal menghapus penjual.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
        closeDialogs();
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Kelola Penjual</h2>
          <p className="text-muted-foreground">Daftar semua penjual yang terdaftar di Tuang.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Penjual
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0 mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Warung</TableHead>
                <TableHead>Pemilik</TableHead>
                <TableHead>Tanggal Bergabung</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>{seller.id}</TableCell>
                  <TableCell className="font-medium">{seller.name}</TableCell>
                  <TableCell>{seller.owner}</TableCell>
                  <TableCell>{seller.joinDate}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog('edit', seller)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteConfirmation(seller)}
                          className="text-destructive focus:text-destructive"
                        >
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

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Penjual</DialogTitle>
            <DialogDescription>
              Ubah detail penjual. Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama Warung
                </Label>
                <Input 
                  id="name" 
                  value={currentSeller.name || ''} 
                  onChange={(e) => setCurrentSeller({...currentSeller, name: e.target.value})} 
                  className="col-span-3" 
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner" className="text-right">
                  Pemilik
                </Label>
                <Input 
                  id="owner" 
                  value={currentSeller.owner || ''} 
                  onChange={(e) => setCurrentSeller({...currentSeller, owner: e.target.value})} 
                  className="col-span-3" 
                  required 
                  disabled
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialogs} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Simpan Perubahan
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
                      Tindakan ini tidak bisa dibatalkan. Ini akan menghapus penjual "{deleteTarget?.name}" dan semua menunya secara permanen.
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
