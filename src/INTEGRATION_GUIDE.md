# Panduan Integrasi Database (Supabase)

Dokumen ini menjelaskan langkah-langkah yang perlu Anda lakukan untuk menyelesaikan integrasi database Supabase ke dalam aplikasi "Tuang". Kode aplikasi telah diperbarui untuk berkomunikasi dengan Supabase.

## Langkah 1: Siapkan Proyek Supabase

1.  Buat proyek baru di [dashboard Supabase](https://app.supabase.io).
2.  Setelah proyek Anda siap, navigasikan ke **Project Settings** > **API**.
3.  Salin **Project URL** dan **anon public key**.

## Langkah 2: Tambahkan Kredensial ke Aplikasi

1.  Buka file `src/lib/supabase.ts` di proyek Anda.
2.  Ganti nilai placeholder `supabaseUrl` dan `supabaseAnonKey` dengan kredensial yang Anda salin dari dashboard Supabase Anda.

    ```typescript
    // src/lib/supabase.ts

    import { createClient } from '@supabase/supabase-js';

    // GANTI DENGAN KREDENSIAL ANDA
    const supabaseUrl = 'URL_PROYEK_SUPABASE_ANDA';
    const supabaseAnonKey = 'KUNCI_ANON_PUBLIK_ANDA';
    
    // ... sisa kode tidak perlu diubah
    ```
    Atau, Anda bisa membuat file `.env.local` di root proyek Anda dan menambahkannya di sana:
    ```
    NEXT_PUBLIC_SUPABASE_URL=URL_PROYEK_SUPABASE_ANDA
    NEXT_PUBLIC_SUPABASE_ANON_KEY=KUNCI_ANON_PUBLIK_ANDA
    ```

## Langkah 3: Buat Tabel Database

1.  Di dashboard Supabase proyek Anda, buka **SQL Editor**.
2.  Klik **New query**.
3.  Salin dan tempel kode SQL di bawah ini, lalu klik **Run** untuk membuat semua tabel yang diperlukan.

```sql
-- Tabel untuk Kategori Menu
-- Pastikan kolom 'name' unik karena akan menjadi referensi.
CREATE TABLE categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel untuk Item Menu
-- Kolom 'category' sekarang memiliki relasi (foreign key) ke tabel 'categories'.
-- ON UPDATE CASCADE: Jika nama kategori diubah, semua menu item yang terkait akan otomatis diperbarui.
-- ON DELETE RESTRICT: Mencegah penghapusan kategori jika masih ada menu yang menggunakannya.
CREATE TABLE menu_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT,
  price NUMERIC NOT NULL,
  vendor TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel untuk Pesanan
-- Menyimpan detail setiap transaksi. Kolom 'items' menggunakan JSONB untuk fleksibilitas.
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  table_number TEXT,
  customer_name TEXT NOT NULL,
  customer_id TEXT,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rating INTEGER
);

-- Aktifkan Realtime untuk tabel-tabel penting
-- Ini akan membuat aplikasi merespons perubahan data secara otomatis
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- (Opsional) Tambahkan beberapa data awal untuk pengujian
-- Jalankan ini SETELAH tabel-tabel di atas dibuat.
INSERT INTO categories (name) VALUES 
  ('Makanan Berat'), 
  ('Minuman Dingin'), 
  ('Camilan');

INSERT INTO menu_items (name, category, price, vendor, image_url) VALUES
  ('Nasi Goreng Spesial', 'Makanan Berat', 25000, 'Warung Bu Siti', 'https://placehold.co/300x200.png'),
  ('Es Teh Manis', 'Minuman Dingin', 5000, 'Warung Bu Siti', 'https://placehold.co/300x200.png'),
  ('Tahu Krispi', 'Camilan', 10000, 'Kedai Pak Budi', 'https://placehold.co/300x200.png');

```

## Langkah 4: Siapkan Supabase Storage untuk Gambar

Aplikasi ini menggunakan Supabase Storage untuk menyimpan gambar menu. Anda perlu membuat "bucket" untuk ini.

1.  Di dasbor Supabase, navigasikan ke **Storage**.
2.  Klik **New Bucket**.
3.  Beri nama bucket `menu-images`.
4.  **PENTING:** Aktifkan (toggle on) **"Public bucket"**.
5.  Klik **Create Bucket**.
6.  Setelah bucket dibuat, navigasikan kembali ke **SQL Editor** dan jalankan query berikut untuk mengatur izin (Policies) agar aplikasi bisa mengunggah gambar.

```sql
-- Kebijakan ini mengizinkan SIAPA SAJA untuk mengunggah gambar.
-- Ini diperlukan karena kita belum mengimplementasikan otentikasi pengguna Supabase.
-- UNTUK PRODUKSI, Anda HARUS memperketat kebijakan ini.
CREATE POLICY "Allow anonymous uploads to menu-images"
ON storage.objects FOR INSERT
TO anon -- 'anon' berarti siapa saja dengan kunci anon (kunci publik)
WITH CHECK ( bucket_id = 'menu-images' );
```


Setelah Anda menyelesaikan semua langkah ini, aplikasi Anda akan sepenuhnya terintegrasi dengan database dan penyimpanan file Supabase.
