# Tuang - Aplikasi Kantin Digital

Selamat datang di **Tuang**, sebuah aplikasi kantin digital modern yang dirancang untuk merevolusi cara pemesanan dan manajemen di lingkungan kantin. Aplikasi ini menyediakan tiga portal utama: satu untuk pelanggan, satu untuk penjual (vendor), dan satu untuk administrator, semuanya terintegrasi dengan mulus untuk pengalaman yang efisien.

![Tuang Homepage]()
*Tangkapan layar halaman utama aplikasi Tuang.*

## Fitur Utama

### 1. Portal Pelanggan (`/`)
- **Penjelajahan Menu Intuitif:** Pelanggan dapat dengan mudah menelusuri menu dari berbagai vendor, difilter berdasarkan kategori.
- **Sistem Keranjang Belanja:** Tambahkan item ke keranjang, sesuaikan jumlah, dan lihat total pesanan secara real-time.
- **Proses Checkout Mudah:** Masukkan nama dan nomor meja, lalu pilih metode pembayaran (QRIS atau Tunai).
- **Pelacakan Status Pesanan:** Setelah memesan, pelanggan mendapatkan halaman status khusus untuk melacak kemajuan pesanan mereka secara visual, dari "Dipesan" hingga "Siap Diambil".
- **Pemberian Rating:** Pelanggan dapat memberikan rating bintang setelah pesanan selesai.

### 2. Dasbor Vendor (`/vendor`)
- **Login Aman:** Setiap vendor memiliki akun sendiri dengan password yang di-hash untuk keamanan.
- **Manajemen Pesanan:** Lihat pesanan yang masuk secara real-time, khusus untuk warung mereka.
- **Pembaruan Status Item:** Vendor dapat memperbarui status setiap item dalam pesanan (misalnya, dari "Diproses" menjadi "Selesai").
- **Manajemen Menu:** Tambah, edit, dan hapus item menu dengan mudah, termasuk mengunggah gambar produk.
- **Laporan Pendapatan:** Lihat grafik pendapatan harian untuk melacak kinerja penjualan.

### 3. Dasbor Admin (`/admin`)
- **Login Admin:** Akses dasbor pusat dengan kredensial admin.
- **Gambaran Umum (Dashboard):** Lihat statistik kunci seperti total pendapatan, jumlah pesanan, total penjual, dan total menu.
- **Manajemen Terpusat:**
    - **Kelola Penjual:** Tambah, edit, atau hapus data vendor.
    - **Kelola Menu:** Kelola semua item menu dari semua vendor di satu tempat.
    - **Kelola Kategori:** Atur kategori menu yang tersedia di seluruh aplikasi.
- **Laporan Keuangan Komprehensif:** Analisis pendapatan bulanan dari seluruh platform.
- **Log Aktivitas:** Pantau semua aktivitas penting yang terjadi di sistem.

## Tumpukan Teknologi (Tech Stack)

- **Framework:** Next.js 14+ (dengan App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Komponen UI:** Shadcn/ui
- **Manajemen State:** React Context (Hooks `useContext` dan `useState`)
- **Backend & Database:** Supabase
  - **Database:** PostgreSQL
  - **Penyimpanan File:** Supabase Storage (untuk gambar menu)
  - **Realtime:** Supabase Realtime untuk pembaruan data live.
  - **Auth:** Fungsi RPC untuk verifikasi login vendor yang aman.

## Memulai Proyek Secara Lokal

Untuk menjalankan proyek ini di lingkungan pengembangan lokal Anda, ikuti langkah-langkah berikut.

### Prasyarat
- Node.js (v18 atau lebih baru)
- `npm` atau `yarn`

### 1. Instalasi Dependensi
Setelah mengkloning repositori, navigasikan ke direktori proyek dan instal semua dependensi yang diperlukan.
```bash
npm install
```

### 2. Konfigurasi Supabase
Aplikasi ini memerlukan koneksi ke proyek Supabase untuk berfungsi.
1.  **Buat Proyek Supabase:** Jika Anda belum punya, buat proyek baru di [dashboard Supabase](https://app.supabase.io).
2.  **Jalankan Skrip SQL:** Ikuti instruksi lengkap di dalam file `src/INTEGRATION_GUIDE.md`. File ini berisi semua skema tabel, fungsi keamanan (seperti hashing password), dan data awal yang diperlukan. Ini adalah langkah **krusial**.
3.  **Siapkan Kredensial:**
    - Buat file baru bernama `.env.local` di direktori root proyek Anda.
    - Tambahkan URL dan kunci `anon public` proyek Supabase Anda ke dalamnya:
      ```
      NEXT_PUBLIC_SUPABASE_URL=URL_PROYEK_SUPABASE_ANDA
      NEXT_PUBLIC_SUPABASE_ANON_KEY=KUNCI_ANON_PUBLIK_ANDA
      ```
    - Anda bisa mendapatkan kredensial ini dari **Project Settings > API** di dasbor Supabase Anda.

### 3. Jalankan Server Pengembangan
Setelah konfigurasi selesai, jalankan server pengembangan Next.js.
```bash
npm run dev
```
Aplikasi akan tersedia di `http://localhost:3000`.

## Struktur Proyek

```
/
├── public/                 # Aset statis (logo, gambar)
├── src/
│   ├── app/                # Halaman dan layout Next.js (App Router)
│   │   ├── (customer)/     # Rute untuk pelanggan (/, /checkout, /order)
│   │   ├── admin/          # Rute untuk dasbor admin
│   │   └── vendor/         # Rute untuk dasbor vendor
│   ├── components/         # Komponen UI (sebagian besar dari Shadcn)
│   ├── context/            # Provider state global (Auth, Cart, Menu, Orders)
│   ├── hooks/              # Custom hooks (e.g., use-toast)
│   ├── lib/                # Utilitas inti, tipe data, dan klien Supabase
│   └── INTEGRATION_GUIDE.md # Panduan penting untuk setup database
├── next.config.mjs         # Konfigurasi Next.js
└── tailwind.config.ts      # Konfigurasi Tailwind CSS
```
