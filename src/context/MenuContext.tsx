
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { MenuItem, Category, Vendor } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface MenuContextType {
  menuItems: MenuItem[];
  categories: Category[];
  vendors: Vendor[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (itemId: number) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  addVendor: (name: string, owner: string | undefined, password: string) => Promise<void>;
  updateVendor: (vendor: Vendor) => Promise<void>;
  deleteVendor: (vendorId: number) => Promise<void>;
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Helper to upload image to Supabase Storage and return public URL
const uploadMenuImage = async (imageDataUrl?: string | null): Promise<string | null> => {
  // If no new image is provided (null/undefined) or it's an existing HTTP URL, pass it through.
  if (!imageDataUrl || imageDataUrl.startsWith('http')) {
    return imageDataUrl;
  }

  // If it's not a data URL, something is wrong.
  if (!imageDataUrl.startsWith('data:image')) {
    console.error("Invalid image data format provided.");
    throw new Error("Format data gambar tidak valid.");
  }

  try {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    if (!blob.type.startsWith('image/')) {
       throw new Error('Tipe file tidak valid, hanya gambar yang diizinkan.');
    }

    const fileExtension = blob.type.split('/')[1];
    const filePath = `public/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images') // Bucket name in Supabase
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: false, // Use false to avoid overwriting by chance
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }
    
    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
        throw new Error("Tidak dapat mengambil URL publik setelah unggahan selesai.");
    }
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error during image upload process:', error);
    // Re-throw the error to be handled by the calling function (e.g., show a toast)
    throw new Error('Unggahan gambar gagal. Silakan coba lagi.');
  }
};


export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      const [menuRes, categoryRes, vendorRes] = await Promise.all([
          supabase.from('menu_items').select('*').order('name', { ascending: true }),
          supabase.from('categories').select('*').order('name', { ascending: true }),
          // Jangan ambil kolom password ke client
          supabase.from('vendors').select('id, name, owner, created_at').order('name', { ascending: true })
      ]);

      if (menuRes.error) throw menuRes.error;
      if (categoryRes.error) throw categoryRes.error;
      if (vendorRes.error) throw vendorRes.error;
      
      setMenuItems(menuRes.data || []);
      setCategories(categoryRes.data || []);
      setVendors(vendorRes.data || []);

    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    
    // Set up a realtime subscription to all relevant tables
    const channel = supabase.channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => fetchAllData())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    }
  }, [fetchAllData]);


  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at'>) => {
    const finalImageUrl = await uploadMenuImage(item.image_url);
    const { error } = await supabase.from('menu_items').insert([{
        ...item,
        image_url: finalImageUrl
    }]);
    if (error) {
        console.error('Error adding menu item:', error);
        throw error;
    }
  };

  const updateMenuItem = async (item: MenuItem) => {
    const finalImageUrl = await uploadMenuImage(item.image_url);
    const { error } = await supabase.from('menu_items').update({
        name: item.name,
        category: item.category,
        price: item.price,
        vendor: item.vendor,
        image_url: finalImageUrl
    }).eq('id', item.id);
    if (error) {
        console.error('Error updating menu item:', error)
        throw error;
    };
  };

  const deleteMenuItem = async (itemId: number) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
  };
  
  const addCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (error) throw error;
  };

  const updateCategory = async (category: Category) => {
    const { error } = await supabase.from('categories').update({ name: category.name }).eq('id', category.id);
    if (error) throw error;
  };
  
  const deleteCategory = async (categoryId: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) throw error;
  };

  const addVendor = async (name: string, owner: string | undefined, password: string) => {
    const { error } = await supabase.rpc('manage_vendor_with_hashed_password', {
      p_id: null,
      p_name: name,
      p_owner: owner,
      p_password: password
    });
    if (error) throw error;
  };

  const updateVendor = async (vendor: Vendor) => {
    const { error } = await supabase.rpc('manage_vendor_with_hashed_password', {
      p_id: vendor.id,
      p_name: vendor.name,
      p_owner: vendor.owner,
      // Password bisa kosong jika tidak ingin diubah
      p_password: vendor.password 
    });
    if (error) throw error;
  }

  const deleteVendor = async (vendorId: number) => {
     const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
    if (error) throw error;
  }
  
  const value = {
    menuItems,
    categories,
    vendors,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addVendor,
    updateVendor,
    deleteVendor,
    isLoading
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
