
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthState {
  isAdmin: boolean;
  isVendor: boolean;
  vendorName: string | null;
}

interface AuthContextType {
  auth: AuthState;
  loginAdmin: () => void;
  loginVendor: (vendorName: string, password: string) => Promise<void>;
  logout: (role: 'admin' | 'vendor') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ isAdmin: false, isVendor: false, vendorName: null });
  const router = useRouter();

  const loginAdmin = useCallback(() => {
    setAuth({ isAdmin: true, isVendor: false, vendorName: null });
    router.push('/admin');
  }, [router]);

  const loginVendor = useCallback(async (vendorName: string, password: string) => {
    const { data, error } = await supabase
        .from('vendors')
        .select('password')
        .eq('name', vendorName)
        .single();

    if (error || !data) {
        throw new Error("Vendor tidak ditemukan atau terjadi kesalahan.");
    }
    
    // !! PENTING: Ini adalah perbandingan teks biasa dan TIDAK AMAN untuk produksi.
    // Di aplikasi nyata, Anda harus menggunakan hashing (misalnya, bcrypt) di sisi server.
    if (data.password !== password) {
        throw new Error("Password yang dimasukkan salah.");
    }

    setAuth({ isAdmin: false, isVendor: true, vendorName });
    router.push('/vendor');
  }, [router]);

  const logout = useCallback((role: 'admin' | 'vendor') => {
    setAuth({ isAdmin: false, isVendor: false, vendorName: null });
    if (role === 'admin') {
      router.push('/admin/login');
    } else {
      router.push('/vendor/login');
    }
  }, [router]);

  const value = { auth, loginAdmin, loginVendor, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
