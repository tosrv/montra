import type { Locale } from '../i18n/locale.ts';

export type LocalizedString = { en: string; id: string };

export type ContentDocType = 'doc' | 'blog';

export type ContentDoc = {
  slug: string;
  type: ContentDocType;
  publishedAt: string; // YYYY-MM-DD
  title: LocalizedString;
  description: LocalizedString;
  /** Body paragraphs, each bilingual. */
  body: LocalizedString[];
};

/** Static docs + blog content (no database). */
export const DOCS: ContentDoc[] = [
  {
    slug: 'getting-started',
    type: 'doc',
    publishedAt: '2026-09-01',
    title: {
      en: 'Getting Started',
      id: 'Mulai Menggunakan',
    },
    description: {
      en: 'Open MonTra, add an account, and record your first transaction — all on this device.',
      id: 'Buka MonTra, tambah akun, dan catat transaksi pertama — semuanya di perangkat ini.',
    },
    body: [
      {
        en: 'MonTra is a local-first personal finance tracker. Your data lives in this browser’s IndexedDB. There is no account to create and no cloud database for balances or transactions.',
        id: 'MonTra adalah pencatat keuangan pribadi local-first. Data Anda tersimpan di IndexedDB browser ini. Tidak perlu membuat akun dan tidak ada database cloud untuk saldo atau transaksi.',
      },
      {
        en: 'Start by opening the app from the home page. On first launch, MonTra seeds a few sample accounts and categories so you can explore immediately. You can edit or delete them anytime.',
        id: 'Mulai dengan membuka aplikasi dari halaman utama. Saat pertama kali dibuka, MonTra menambahkan beberapa akun dan kategori contoh agar Anda bisa langsung mencoba. Anda bisa mengubah atau menghapusnya kapan saja.',
      },
      {
        en: 'Add income or expense transactions from the Transactions page or the mobile + button. Transfers move money between accounts without counting as income or expense.',
        id: 'Tambah transaksi pemasukan atau pengeluaran dari halaman Transaksi atau tombol + di mobile. Transfer memindahkan uang antar akun tanpa dihitung sebagai pemasukan atau pengeluaran.',
      },
      {
        en: 'Use the Dashboard to see monthly income, expenses, and category breakdowns. Everything updates as soon as you save a transaction on this device.',
        id: 'Gunakan Dasbor untuk melihat pemasukan, pengeluaran, dan rincian kategori bulanan. Semuanya diperbarui segera setelah Anda menyimpan transaksi di perangkat ini.',
      },
    ],
  },
  {
    slug: 'backup-and-restore',
    type: 'doc',
    publishedAt: '2026-09-05',
    title: {
      en: 'Backup & Restore',
      id: 'Backup & Pulihkan',
    },
    description: {
      en: 'Export a JSON backup, restore it on another browser, and keep CSV exports for spreadsheets.',
      id: 'Ekspor backup JSON, pulihkan di browser lain, dan simpan ekspor CSV untuk spreadsheet.',
    },
    body: [
      {
        en: 'Because MonTra stores data only on this device, a browser clear or a new phone can wipe your records. Regular JSON backups are the recommended way to keep ownership of your data.',
        id: 'Karena MonTra menyimpan data hanya di perangkat ini, membersihkan browser atau ganti ponsel bisa menghapus catatan Anda. Backup JSON berkala adalah cara yang disarankan untuk tetap menguasai data Anda.',
      },
      {
        en: 'Open Settings and choose Export Backup. MonTra downloads a JSON file with schema version, settings, accounts, categories, and transactions. Store that file somewhere you control (drive, USB, or encrypted archive).',
        id: 'Buka Pengaturan lalu pilih Ekspor Backup. MonTra mengunduh file JSON berisi versi skema, pengaturan, akun, kategori, dan transaksi. Simpan file itu di tempat yang Anda kendalikan (drive, USB, atau arsip terenkripsi).',
      },
      {
        en: 'To restore, use Import Backup and select a MonTra JSON file. The app validates the payload before replacing local data. Invalid files are rejected with clear errors.',
        id: 'Untuk memulihkan, gunakan Impor Backup dan pilih file JSON MonTra. Aplikasi memvalidasi isi file sebelum mengganti data lokal. File yang tidak valid ditolak dengan pesan kesalahan yang jelas.',
      },
      {
        en: 'You can also export transactions as CSV for spreadsheets. CSV is for analysis only — use JSON when you need a full restore.',
        id: 'Anda juga bisa mengekspor transaksi sebagai CSV untuk spreadsheet. CSV hanya untuk analisis — gunakan JSON jika Anda butuh pemulihan penuh.',
      },
    ],
  },
  {
    slug: 'why-local-first',
    type: 'doc',
    publishedAt: '2026-09-10',
    title: {
      en: 'Why Local-First',
      id: 'Mengapa Local-First',
    },
    description: {
      en: 'How MonTra keeps financial records on your device instead of a remote database.',
      id: 'Bagaimana MonTra menjaga catatan keuangan di perangkat Anda, bukan di database jarak jauh.',
    },
    body: [
      {
        en: 'Most finance apps upload transactions to a vendor database. That can be convenient, but it also means passwords, balances, and private notes leave your device.',
        id: 'Kebanyakan aplikasi keuangan mengunggah transaksi ke database penyedia. Itu nyaman, tetapi password, saldo, dan catatan pribadi juga meninggalkan perangkat Anda.',
      },
      {
        en: 'MonTra’s model is different: the website is mostly static UI. Financial records stay in IndexedDB. Optional anonymous pageview analytics never include money data.',
        id: 'Model MonTra berbeda: situs ini hampir hanya UI statis. Catatan keuangan tetap di IndexedDB. Analitik pageview anonim opsional tidak pernah menyertakan data uang.',
      },
      {
        en: 'Local-first also means the app keeps working when you are offline (after the first load), and you can leave or self-host the static site without migrating a cloud database.',
        id: 'Local-first juga berarti aplikasi tetap bisa dipakai saat offline (setelah dimuat pertama kali), dan Anda bisa meninggalkan atau self-host situs statis tanpa migrasi database cloud.',
      },
    ],
  },
  {
    slug: 'install-montra-as-an-app',
    type: 'blog',
    publishedAt: '2026-09-18',
    title: {
      en: 'Install MonTra as an App',
      id: 'Pasang MonTra sebagai Aplikasi',
    },
    description: {
      en: 'Use Add to Home Screen on supported browsers so MonTra feels like a native app.',
      id: 'Gunakan Tambah ke Layar Utama di browser yang didukung agar MonTra terasa seperti aplikasi native.',
    },
    body: [
      {
        en: 'MonTra is a Progressive Web App. On Chromium browsers (Chrome, Edge, Brave, and similar) that support installation, you may see an Install control inside the app workspace.',
        id: 'MonTra adalah Progressive Web App. Di browser Chromium (Chrome, Edge, Brave, dan sejenisnya) yang mendukung instalasi, Anda mungkin melihat kontrol Instal di dalam ruang kerja aplikasi.',
      },
      {
        en: 'Tap Install (or Add to Home Screen) and accept the browser’s native prompt. After install, MonTra opens in its own window without the browser chrome.',
        id: 'Ketuk Instal (atau Tambah ke Layar Utama) dan terima prompt native dari browser. Setelah terpasang, MonTra terbuka di jendelanya sendiri tanpa bilah browser.',
      },
      {
        en: 'On iPhone and iPad, browsers do not expose the same install prompt. Use Safari’s Share sheet → Add to Home Screen instead. Your local data stays on that device either way.',
        id: 'Di iPhone dan iPad, browser tidak menampilkan prompt instalasi yang sama. Gunakan Share di Safari → Tambah ke Layar Utama. Data lokal tetap di perangkat itu, apa pun caranya.',
      },
    ],
  },
];

export function pickLocale(value: LocalizedString, locale: Locale): string {
  return value[locale] || value.en;
}
