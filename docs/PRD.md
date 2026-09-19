# Product Requirements Document (PRD)

**Product:** MonTra  
**Version:** 1.0  
**Status:** Current / shipped MVP  
**Last updated:** 2026-09-19

---

## 1. Ringkasan produk

MonTra adalah aplikasi pencatat keuangan pribadi berbasis web yang **local-first**. Pengguna mencatat pemasukan, pengeluaran, dan transfer antar akun tanpa membuat akun, tanpa login, dan tanpa mengunggah data keuangan ke server.

**Value proposition:**  
*Your money. Your device. Your privacy.*

---

## 2. Masalah yang diselesaikan

| Masalah | Dampak |
|---------|--------|
| Aplikasi keuangan biasanya menyimpan data di cloud | Kekhawatiran privasi & risiko kebocoran |
| Setup (daftar, verifikasi email, sinkronisasi bank) terlalu berat untuk tracking harian | Pengguna menyerah sebelum mulai |
| Spreadsheet manual sulit untuk multi-akun & transfer | Saldo tidak akurat / susah dirawat |
| Banyak app “gratis” memonetisasi via data pengguna | Trust rendah |

MonTra menargetkan pengguna yang ingin **kejelasan keuangan harian** dengan kontrol penuh atas datanya.

---

## 3. Tujuan produk

### Goals

1. Memungkinkan pencatatan transaksi (income / expense / transfer) dalam hitungan detik.
2. Memberikan ringkasan bulanan yang menjawab: *“Bagaimana kondisi uang saya bulan ini?”*
3. Menjamin data keuangan **tidak pernah** dikirim ke backend/cloud.
4. Menyediakan jalur aman untuk backup, restore, dan export CSV.

### Non-goals (saat ini)

- Sinkronisasi multi-perangkat / multi-browser
- Integrasi open banking / import otomatis dari bank
- Login, akun pengguna, atau kolaborasi keluarga
- Budgeting lanjutan, hutang/piutang, investasi, atau laporan pajak
- Fitur AI (dependency Gemini ada di proyek, belum menjadi fitur produk)

---

## 4. Persona & use case

### Persona primer

**“Solo tracker”** — individu yang ingin mencatat pengeluaran harian di HP/laptop, lebih peduli privasi daripada sinkronisasi cloud.

### Use case utama

| ID | Use case | Prioritas |
|----|----------|-----------|
| UC-01 | Membuka app dan langsung mulai tanpa daftar | P0 |
| UC-02 | Mencatat expense dengan kategori & akun | P0 |
| UC-03 | Mencatat income | P0 |
| UC-04 | Transfer antar akun (mis. BCA → Cash) | P0 |
| UC-05 | Melihat ringkasan bulan berjalan | P0 |
| UC-06 | Mengelola akun & kategori | P1 |
| UC-07 | Export backup JSON / restore | P1 |
| UC-08 | Export transaksi ke CSV | P1 |
| UC-09 | Mengubah mata uang & tema | P2 |
| UC-11 | Reset database ke default | P2 |

---

## 5. Ruang lingkup fungsional

### 5.1 Landing (publik)

- Menjelaskan value privacy & local-first
- CTA **Start Tracking** → `/app`
- Tanpa paywall / gate login

### 5.2 Dashboard (`/app`)

- Navigasi bulan (prev / next)
- Total income, expense, net cash flow
- Breakdown pengeluaran per kategori (jumlah + persentase)
- Akses cepat menambah transaksi
- Jumlah transaksi di periode terpilih

### 5.3 Transactions

- CRUD transaksi
- Tipe: `income` | `expense` | `transfer`
- Field: amount, date, account, (category untuk non-transfer), destination account (transfer), description
- Amount: bilangan bulat positif (integer)

### 5.4 Accounts

- Tipe akun: `bank` | `cash` | `other`
- Saldo dihitung dari: `initialBalance + income − expense + transferIn − transferOut`
- Seed default (pertama kali): BNI, Jago, BCA, Cash (saldo awal 0)

### 5.5 Categories

- Tipe: `income` | `expense`
- Nama + ikon (Lucide)
- Seed kategori umum (Salary, Food, Transport, dll.)

### 5.6 Settings

- Mata uang: IDR (default), USD, EUR, GBP, SGD, MYR, JPY, AUD
- Tema: system / light / dark
- Backup JSON (export) & restore dengan validasi skema
- Export CSV transaksi
- _(Opsional host)_ Umami pageviews via env — bukan fitur Settings user
- Reset database ke default (dengan konfirmasi)

---

## 6. Persyaratan non-fungsional

| Area | Requirement |
|------|-------------|
| Privacy | Data keuangan hanya di IndexedDB klien |
| Offline | Inti app harus tetap berfungsi tanpa jaringan setelah load |
| Analytics | Opsional Umami pageviews saja; **dilarang** mengirim amount, deskripsi, kategori, atau saldo |
| Integrity | Restore backup wajib validasi (tipe, amount > 0, referensi transfer, dll.) |
| UX | Tanpa login; time-to-first-transaction seminimal mungkin |
| Performance | Operasi lokal; dashboard bulanan harus responsif untuk volume data personal tipikal |
| Accessibility | UI jelas, kontras cukup; kontrol utama keyboard-friendly (target perbaikan berkelanjutan) |

---

## 7. Model data (ringkas)

```
Account      → id, name, type, initialBalance, timestamps
Category     → id, name, type, icon, createdAt
Transaction  → id, type, amount, accountId, categoryId?, destinationAccountId?,
               description, date (YYYY-MM-DD), timestamps
AppSettings  → id, currency, theme, schemaVersion
```

- Storage: Dexie / IndexedDB (`moneyTrackerDB`, schema v1)
- Backup envelope: `schemaVersion`, `exportedAt`, `appName`, `settings`, `accounts`, `categories`, `transactions`

---

## 8. Metrik sukses (produk)

Karena local-first, metrik remote (jika host mengaktifkan Umami):

| Metrik | Definisi |
|--------|----------|
| Unique visitors | Umami visitors (ada pengguna lain?) |
| Pageviews | Beban traffic |
| Retention proxy | Frekuensi restore/backup (kualitatif, tidak di-track otomatis) |

Metrik keuangan **tidak** dikumpulkan.

---

## 9. Batasan & risiko

| Risiko | Mitigasi |
|--------|----------|
| Data hilang jika user clear browser / ganti device | UX backup/restore yang jelas di Settings & landing |
| Tidak ada sync multi-device | Dikomunikasikan sebagai non-goal; backup manual |
| IndexedDB kuota browser | Volume personal tipikal aman; dokumentasikan batas |
| Peer dependency / tooling drift | Kunci versi yang kompatibel (Vite ↔ esbuild) |

---

## 10. Roadmap (usulan, di luar MVP)

| Fase | Ide | Catatan |
|------|-----|---------|
| Next | Filter & pencarian transaksi | Meningkatkan navigasi data besar |
| Next | Grafik tren multi-bulan | Perluasan dashboard |
| Later | PWA / installable | Memperkuat offline |
| Later | Enkripsi backup opsional | Extra privacy untuk file JSON |
| Explore | Asisten AI lokal/opsional | Hanya jika tetap privacy-preserving |

---

## 11. Keputusan produk yang mengikat

1. **Local-first adalah constraint, bukan fitur opsional** — jangan menambahkan cloud sync finansial tanpa keputusan produk eksplisit dan perubahan privasi.
2. **Tidak ada login** pada jalur kritis MVP.
3. **Amount integer** untuk menghindari error floating-point.
4. **Data keuangan tidak pernah ke analytics** (Umami pageview opsional hanya di level host).
5. **Seed akun/kategori boleh ada; seed saldo/transaksi palsu tidak boleh.**

---

## 12. Referensi teknis

- Entry routes: `src/App.tsx`
- Schema & seed: `src/db/database.ts`
- Domain types: `src/types.ts`
- Backup/CSV: `src/services/backupService.ts`
- Analytics bootstrap: `src/services/analyticsService.ts` (Umami only)
- Data model / ERD: [ERD.md](./ERD.md)
- Developer setup: [README.md](./README.md)
