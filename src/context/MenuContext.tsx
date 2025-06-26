
"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import type { MenuItem, Category } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface MenuContextType {
  menuItems: MenuItem[];
  categories: Category[];
  vendors: string[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (itemId: number) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  updateVendorName: (oldName: string, newName: string) => Promise<void>;
  deleteVendor: (name:string) => Promise<void>;
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Helper to upload base64 image to Supabase Storage and return public URL
const uploadMenuImage = async (base64Data?: string | null): Promise<string> => {
  // If no new image is provided or if it's already a URL, return it or a placeholder
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return base64Data || 'https://placehold.co/300x200.png';
  }

  try {
    // Convert base64 to a Blob for uploading
    const response = await fetch(base64Data);
    const blob = await response.blob();
    const fileExtension = blob.type.split('/')[1];
    const filePath = `public/${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images') // Bucket name in Supabase
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Fallback to a placeholder if upload fails
    return 'https://placehold.co/300x200.png';
  }
};


export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    // We don't set loading to true here to avoid flickering on re-fetches from subscriptions
    try {
      // Fetch Menu Items
      const { data: menuData, error: menuError } = await supabase.from('menu_items').select('*').order('name', { ascending: true });
      if (menuError) throw menuError;
      setMenuItems(menuData || []);

      // Fetch Categories
      const { data: categoryData, error: categoryError } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (categoryError) throw categoryError;
      setCategories(categoryData || []);

    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    
    // Set up a realtime subscription to menu_items and categories
    const channel = supabase.channel('realtime-menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, (payload) => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        fetchAllData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    }

  }, [fetchAllData]);

  const vendors = useMemo(() => {
    const vendorSet = new Set(menuItems.map(item => item.vendor));
    return Array.from(vendorSet);
  }, [menuItems]);

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
    // Note: This does not delete the image from storage to keep it simple.
    // In a production app, you might want to delete the image from Supabase Storage as well.
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
  };
  
  const addCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (error) {
        console.error('Error adding category:', error);
        throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    const { error } = await supabase.from('categories').update({ name: category.name }).eq('id', category.id);
    if (error) {
        console.error('Error updating category:', error);
        throw error;
    }
  };
  
  const deleteCategory = async (categoryId: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
  };

  const updateVendorName = async (oldName: string, newName: string) => {
    // This is a bulk update.
    const { error } = await supabase.from('menu_items').update({ vendor: newName }).eq('vendor', oldName);
    if (error) {
        console.error('Error updating vendor name:', error);
        throw error;
    }
  };

  const deleteVendor = async (name: string) => {
    // This is a bulk delete.
    const { error } = await supabase.from('menu_items').delete().eq('vendor', name);
    if (error) {
        console.error('Error deleting vendor:', error);
        throw error;
    }
  };

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
    updateVendorName,
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
