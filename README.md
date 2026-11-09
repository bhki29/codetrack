# CodeTrack — Pelacak Progres Belajar Pemrograman

Aplikasi web pribadi untuk mencatat target belajar **harian**, **mingguan**, dan **milestone proyek**, lengkap dengan login.

- **Frontend:** React (Vite) + Tailwind CSS v3
- **Backend, database & login:** Supabase (PostgreSQL + Auth)

Setiap pengguna hanya bisa melihat datanya sendiri (dijaga oleh Row Level Security di database).

## Fitur
- Masuk dengan email + kata sandi (tanpa pendaftaran publik; akun dibuat manual di Supabase)
- Dashboard: streak, target selesai, jam belajar mingguan, heatmap konsistensi, progres per bahasa
- Target harian & mingguan: tambah, ubah status (Belum mulai → Berjalan → Selesai), hapus
- Proyek: buat proyek, tambah milestone, ubah status (Akan dikerjakan / Berjalan / Tinjauan / Selesai), progres otomatis

## Yang perlu disiapkan
1. **Node.js 18 atau lebih baru** (cek dengan `node -v`; unduh di https://nodejs.org)
2. **Akun Supabase gratis** di https://supabase.com

## Langkah 1 — Buat proyek Supabase
1. Masuk ke Supabase, klik **New project**, isi nama dan kata sandi database, pilih region terdekat (mis. Singapore), lalu tunggu proyek siap.
2. Buka menu **SQL Editor** → **New query**.
3. Salin seluruh isi file `supabase/schema.sql`, tempel, lalu klik **Run**. Ini membuat tabel dan aturan keamanannya.
4. Buat akun untuk dirimu: **Authentication → Users → Add user → Create new user**, isi email dan kata sandi, lalu centang **Auto Confirm User**. Setelah itu matikan pendaftaran publik di **Authentication → Sign In / Providers**, matikan **Allow new users to sign up**, supaya hanya akun yang kamu buat yang bisa masuk.
5. Buka **Project Settings → API**. Catat dua nilai: **Project URL** dan **anon public key**.

## Langkah 2 — Jalankan di komputer
```bash
# 1. masuk ke folder proyek
cd codetrack-react

# 2. salin file env, lalu isi dengan nilai dari Langkah 1 nomor 5
cp .env.example .env        # Windows: copy .env.example .env

# 3. pasang dependensi
npm install

# 4. jalankan
npm run dev
```
Buka alamat yang tampil di terminal (biasanya http://localhost:5173), lalu masuk dengan akun yang sudah kamu buat di Supabase (lihat Langkah 1 nomor 4).

Isi `.env`:
```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
Setelah mengubah `.env`, hentikan server (Ctrl+C) lalu jalankan `npm run dev` lagi. Jangan pernah memakai *service_role key* di sini; pakai hanya **anon public key**.

## Langkah 3 (opsional) — Publikasi online
1. Unggah proyek ke GitHub (file `.env` tidak ikut karena sudah ada di `.gitignore`).
2. Di https://vercel.com atau https://netlify.com, impor repositori itu.
3. Tambahkan dua environment variable (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) di pengaturan proyeknya, lalu deploy.
4. Di Supabase: **Authentication → URL Configuration**, isi **Site URL** dengan alamat situs kamu.

## Struktur folder
```
codetrack-react/
├── index.html            # halaman dasar
├── package.json          # daftar dependensi & perintah
├── vite.config.js        # konfigurasi Vite
├── tailwind.config.js    # konfigurasi Tailwind
├── postcss.config.js     # pemroses CSS
├── .env.example          # contoh pengaturan koneksi Supabase
├── supabase/schema.sql   # tabel database + keamanan (RLS)
└── src/
    ├── main.jsx          # titik masuk React
    ├── index.css         # mengaktifkan Tailwind
    ├── supabase.js       # koneksi ke Supabase
    └── App.jsx           # login, dashboard, target, proyek
```

## Cara kerja data
- `milestones`: target harian/mingguan. Saat statusnya jadi **Selesai**, waktunya (`completed_at`) dicatat dan menjadi dasar streak, heatmap, dan jam belajar (dari kolom estimasi menit).
- `projects` dan `project_milestones`: proyek dan milestone-nya.
- Streak = jumlah hari berturut-turut yang ada target selesai. Jika hari ini belum belajar, streak tetap hidup sampai kemarin.

## Masalah umum
| Masalah | Penyebab & solusi |
|---|---|
| Layar putih / error "File .env belum diisi" | `.env` belum dibuat atau salah isi. Cek Langkah 2, lalu jalankan ulang `npm run dev`. |
| "Gagal memuat data … relation does not exist" | `schema.sql` belum dijalankan. Ulangi Langkah 1 nomor 3. |
| "Email atau kata sandi salah" | Akun belum dibuat di Supabase (Langkah 1 nomor 4), atau user belum dikonfirmasi (centang Auto Confirm User). |
| "Invalid API key" | Yang dipakai bukan anon public key, atau ada spasi/kutip tambahan di `.env`. |
| Error "Application Control policy has blocked this file" (Windows) | Proyek ini sudah memakai Rollup versi WebAssembly dan Tailwind v3 agar tidak butuh file native. Hapus folder `node_modules` dan file `package-lock.json`, lalu jalankan `npm install` lagi. |
| `npm` tidak dikenali | Node.js belum terpasang. Pasang dulu lalu buka ulang terminal. |

## Belum ada di versi ini
Halaman Statistik, Bahasa, dan Lencana; pencarian global; animasi konfeti; papan Kanban drag-and-drop (status proyek diubah lewat dropdown); edit judul target (saat ini hapus lalu buat ulang).
