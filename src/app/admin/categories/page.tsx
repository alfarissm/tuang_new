
"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useMenu } from '@/context/MenuContext';
import type { Category } from '@/lib/types';
import { PaginationControls } from '@/components/ui/pagination-controls';

const ITEMS_PER_PAGE = 10;

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const { categories, addCategory, updateCategory, deleteCategory } = useMenu();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({ name: '' });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return categories.slice(startIndex, endIndex);
  }, [categories, currentPage]);

  const openDialog = (mode: 'add' | 'edit', category?: Category) => {
      setDialogMode(mode);
      if (mode === 'edit' && category) {
          setCurrentCategory(category);
      } else {
          setCurrentCategory({ name: '' });
      }
      setIsDialogOpen(true);
  }
  
  const openDeleteConfirmation = (category: Category) => {
      setDeleteTarget(category);
      setIsDeleteDialogOpen(true);
  }
  
  const closeDialogs = () => {
      setIsDialogOpen(false);
      setIsDeleteDialogOpen(false);
      setCurrentCategory({ name: '' });
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!currentCategory.name?.trim()) {
        toast({ title: "Nama kategori tidak boleh kosong", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        if (dialogMode === 'add' && currentCategory.name) {
          await addCategory(currentCategory.name);
          toast({
            title: "Kategori Ditambahkan!",
            description: `Kategori "${currentCategory.name}" telah berhasil ditambahkan.`,
            className: "bg-accent text-accent-foreground",
          });
        } else if (currentCategory.id) {
          await updateCategory(currentCategory as Category);
          toast({
            title: "Kategori Diperbarui!",
            description: `Kategori "${currentCategory.name}" telah berhasil diperbarui.`,
            className: "bg-accent text-accent-foreground",
          });
        }
    } catch (error) {
        toast({ title: "Terjadi kesalahan", description: "Gagal menyimpan kategori.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        closeDialogs();
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
        await deleteCategory(deleteTarget.id);
        toast({
          title: "Kategori Dihapus!",
          description: `Kategori "${deleteTarget.name}" telah berhasil dihapus.`,
          variant: 'destructive'
        });
    } catch (error) {
        toast({ title: "Terjadi kesalahan", description: "Gagal menghapus kategori.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        closeDialogs();
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Kelola Kategori</h2>
          <p className="text-muted-foreground">Tambah, edit, atau hapus kategori menu.</p>
        </div>
        <div className="flex items-center space-x-2">
           <Button onClick={() => openDialog('add')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0 mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog('edit', category)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteConfirmation(category)}
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
            <DialogTitle>{dialogMode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Masukkan nama kategori baru.' : 'Ubah nama kategori. Klik simpan jika sudah selesai.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input 
                  id="name" 
                  value={currentCategory.name || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})} 
                  placeholder="cth: Minuman Dingin" 
                  className="col-span-3" 
                  required 
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
                      Tindakan ini tidak bisa dibatalkan. Ini akan menghapus kategori "{deleteTarget?.name}" secara permanen.
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
