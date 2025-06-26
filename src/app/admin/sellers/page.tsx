
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
import type { Vendor } from '@/lib/types';
import { PaginationControls } from '@/components/ui/pagination-controls';

const ITEMS_PER_PAGE = 10;

export default function AdminSellersPage() {
  const { toast } = useToast();
  const { vendors, addVendor, updateVendor, deleteVendor } = useMenu();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(vendors.length / ITEMS_PER_PAGE);
  const paginatedSellers = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return vendors.slice(startIndex, endIndex);
  }, [vendors, currentPage]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add'); 
  const [currentSeller, setCurrentSeller] = useState<Partial<Vendor>>({ name: '', owner: '' });
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  const openDialog = (mode: 'add' | 'edit', seller?: Vendor) => {
      setDialogMode(mode);
      if (mode === 'edit' && seller) {
          setCurrentSeller(seller);
      } else {
          setCurrentSeller({ name: '', owner: '' });
      }
      setIsDialogOpen(true);
  }

  const openDeleteConfirmation = (seller: Vendor) => {
      setDeleteTarget(seller);
      setIsDeleteDialogOpen(true);
  }
  
  const closeDialogs = () => {
      setIsDialogOpen(false);
      setIsDeleteDialogOpen(false);
      setCurrentSeller({ name: '', owner: ''});
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!currentSeller.name?.trim()) {
        toast({ title: "Nama warung tidak boleh kosong", variant: "destructive"});
        return;
    }
    
    setIsSubmitting(true);
    try {
        if (dialogMode === 'add') {
          await addVendor(currentSeller.name);
          toast({
            title: "Penjual Ditambahkan!",
            description: `Penjual "${currentSeller.name}" telah berhasil ditambahkan.`,
            className: "bg-accent text-accent-foreground",
          });
        } else if (currentSeller.id) {
          await updateVendor(currentSeller as Vendor);
          toast({
            title: "Penjual Diperbarui!",
            description: `Data untuk "${currentSeller.name}" telah berhasil diperbarui.`,
            className: "bg-accent text-accent-foreground",
          });
        }
    } catch (error: any) {
         const isDuplicate = error.message?.includes('duplicate key value violates unique constraint');
         toast({ 
            title: "Terjadi kesalahan", 
            description: isDuplicate ? `Nama penjual "${currentSeller.name}" sudah ada.` : "Gagal menyimpan data penjual.", 
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
        if (!isSubmitting) { // Only close if not submitting (i.e. on success)
            closeDialogs();
        }
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
        await deleteVendor(deleteTarget.id);
        toast({
          title: "Penjual Dihapus!",
          description: `Penjual "${deleteTarget.name}" telah berhasil dihapus.`,
          variant: 'destructive'
        });
    } catch (error) {
        toast({ 
            title: "Gagal Menghapus Penjual", 
            description: "Pastikan semua menu dari penjual ini telah dihapus terlebih dahulu.", 
            variant: "destructive"
        });
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
          <Button onClick={() => openDialog('add')}>
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
                  <TableCell>{seller.owner || '-'}</TableCell>
                  <TableCell>{new Date(seller.created_at!).toLocaleDateString('id-ID')}</TableCell>
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Tambah Penjual Baru' : 'Edit Penjual'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Masukkan nama penjual baru.' : 'Ubah detail penjual. Klik simpan jika sudah selesai.'}
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
                  placeholder="(Opsional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialogs} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {dialogMode === 'add' ? 'Simpan' : 'Simpan Perubahan'}
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
                      Tindakan ini tidak bisa dibatalkan. Ini akan menghapus penjual "{deleteTarget?.name}" secara permanen. Aksi ini akan gagal jika penjual masih memiliki menu.
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
