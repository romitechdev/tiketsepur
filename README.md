# TiketSepur

Marketplace tiket kereta berbasis Next.js App Router, Prisma, dan Supabase Auth.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma (Supabase PostgreSQL)
- Supabase Auth (`@supabase/supabase-js` + `@supabase/ssr`)

## Environment Variables

Untuk produksi di Vercel, set env berikut di dashboard Vercel dan gunakan nilai berbeda untuk local VM bila perlu:

```env
DATABASE_URL="postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
NEXT_PUBLIC_BASE_URL="https://tiketsepur.vercel.app"
SUPABASE_STORAGE_BUCKET="ticket-assets"
MAINTENANCE_CRON_SECRET="replace-with-strong-random-secret"
ACTIVITY_LOG_RETENTION_DAYS="90"
RATE_LIMIT_RETENTION_HOURS="24"

ADMIN_EMAILS="admin1@mail.com,admin2@mail.com"
```

Catatan:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` dipakai di client dan server auth session refresh.
- `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server-side privileged operations.
- `DATABASE_URL` dan `DIRECT_URL` dipakai Prisma untuk akses database Supabase Postgres.
- `NEXT_PUBLIC_BASE_URL` dipakai untuk redirect auth dan canonical SEO production.
- `SUPABASE_STORAGE_BUCKET` untuk file upload tiket dan foto profil di Supabase Storage.
- `MAINTENANCE_CRON_SECRET` untuk proteksi endpoint cleanup terjadwal.
- `ACTIVITY_LOG_RETENTION_DAYS` durasi retensi log aktivitas.
- `RATE_LIMIT_RETENTION_HOURS` durasi retensi bucket rate-limit kadaluarsa.
- `ADMIN_EMAILS` dipakai untuk otorisasi dashboard admin.

## Production Hardening

- Upload file: memakai Supabase Storage (bukan local filesystem).
- Log aktivitas: tersimpan di tabel `ActivityLog` (bukan file lokal).
- Rate limit: tersimpan di tabel `RateLimitBucket` sehingga konsisten antar instance.

### Cron Cleanup (Wajib Production)

Jalankan endpoint cleanup terproteksi secara berkala (misalnya tiap 6-12 jam):

`POST /api/internal/maintenance/cleanup`

Header salah satu:

- `Authorization: Bearer <MAINTENANCE_CRON_SECRET>`
- `x-maintenance-secret: <MAINTENANCE_CRON_SECRET>`

Endpoint ini menghapus:

- `ActivityLog` yang melewati `ACTIVITY_LOG_RETENTION_DAYS`
- `RateLimitBucket` kadaluarsa yang melewati `RATE_LIMIT_RETENTION_HOURS`

## Migrasi Database ke Supabase

Jika sebelumnya memakai SQLite, jalankan langkah berikut setelah mengisi `DATABASE_URL`:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Jika butuh sinkronisasi cepat schema ke DB tanpa migration history tambahan:

```bash
npm run prisma:push
```

## Supabase Auth Setup

Di dashboard Supabase:

1. Aktifkan provider yang ingin dipakai (Google / Email OTP).
2. Tambahkan URL callback / redirect aplikasi production, misalnya `https://tiketsepur.vercel.app/`.
3. Untuk local development, pastikan URL berikut terdaftar:
	- `http://localhost:3000`

Pastikan juga bagian Auth > URL Configuration di Supabase memakai domain production sebagai Site URL, dan whitelist redirect URLs mencakup domain produksi serta localhost untuk dev.

## Install & Run

```bash
npm install
npm run dev
```

App tersedia di `http://localhost:3000`.

## SEO & Open Graph (Production Ready)

Aplikasi dilengkapi SEO lengkap untuk production:

### Root Metadata (`app/layout.tsx`)
- **OpenGraph tags** untuk social media sharing (Facebook, Twitter, LinkedIn)
- **Twitter Card** (summary_large_image) untuk tweet preview
- **Viewport** dan theme color configuration
- **Language alternatives** untuk multi-region SEO
- **Robots indexing directives** (auto index, follow untuk page utama)

### Per-Page Metadata
- **Home** (`/`) — Optimized untuk main marketplace keyword
- **Ticket Detail** (`/ticket/[id]`) — Dynamic metadata dengan harga, rute, dan image OpenGraph
- **Login** (`/login`) — Excluded dari indexing (no-index)
- **Upload** (`/upload`) — Optimized untuk "jual tiket" keywords
- **Privacy & Terms** — Proper SEO metadata

### Sitemap & Robots
- **`/sitemap.xml`** — Auto-generated dynamic sitemap dengan semua ticket listings
- **`/robots.txt`** — Configured untuk allow public pages, disallow admin/API
- **Sitemap updates** — Real-time sesuai ticket availability

### Environment untuk Base URL
```env
NEXT_PUBLIC_BASE_URL="https://tiketsepur.com"
```

Update nilai ini ke domain production Anda untuk mesin pencari.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Buat project baru di Vercel dan import repo tersebut.
3. Set environment variables di Vercel sesuai blok `Environment Variables` di atas.
4. Pastikan `NEXT_PUBLIC_BASE_URL` memakai `https://tiketsepur.vercel.app` atau custom domain kamu.
5. Build command biarkan default `npm run build`.
6. Output framework biarkan default Next.js.
7. Deploy.
8. Setelah deploy, buka Supabase Auth dan tambahkan domain production ke Site URL serta Redirect URLs.

## Build Production

```bash
npm run build
npm run start
```

## Validasi Cepat

- Public page (`/`, `/login`) harus `200`.
- API terlindungi user (`/api/profile`, `/api/tickets/my`) harus `401` jika belum login.
- API admin (`/api/admin/users`, `/api/admin/logs`) harus `403` jika bukan admin.
