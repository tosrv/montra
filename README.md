# Money Tracker

A local-first personal finance tracker. **Your money. Your device. Your privacy.**

Track income, expenses, and account transfers entirely in your browser — no account, no cloud database, no financial data leaving your device.

## Features

- **Transactions** — Record income, expense, and transfers between accounts
- **Multiple accounts** — Bank and cash accounts with live balance calculation
- **Categories** — Customize income/expense categories with icons
- **Monthly dashboard** — Income, expense, net cash flow, and category breakdown
- **Backup & restore** — Full JSON export/import with validation
- **CSV export** — Download transactions as a spreadsheet
- **Privacy-first** — Financial data stored in IndexedDB; optional Umami pageviews only (no money data)

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Routing | React Router 7 |
| Storage | Dexie (IndexedDB) |
| Build | Vite 8 |
| Icons / motion | Lucide React, Motion |

## Getting started

### Requirements

- Node.js 20+ (tested with 22)
- npm 10+

### Install

```bash
npm install
```

### Development

```bash
cp .env.example .env   # optional — needed for Umami
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Umami (optional remote visits)

To see whether other people open the app, use free **Umami Cloud Hobby**.  
Step-by-step: [docs/UMAMI.md](./docs/UMAMI.md).

```env
VITE_UMAMI_WEBSITE_ID="your-website-uuid"
```

### Build

```bash
npm run build
npm run preview
```

### Lint (typecheck)

```bash
npm run lint
```

## App routes

| Path | Description |
|------|-------------|
| `/` | Public landing page |
| `/app` | Dashboard (monthly overview) |
| `/app/transactions` | Transaction list & management |
| `/app/accounts` | Accounts & balances |
| `/app/categories` | Category management |
| `/app/settings` | Currency, theme, backup, reset |

## Data & privacy

- All financial records live in the browser’s **IndexedDB** (`moneyTrackerDB`).
- Amounts are stored as **integers** in the smallest currency unit (e.g. `25000` = Rp 25.000).
- Default currency is **IDR**; also supported: USD, EUR, GBP, SGD, MYR, JPY, AUD.
- Seed data on first launch: sample Indonesian bank accounts (BNI, Jago, BCA, Cash) and common categories — **no fake balances or transactions**.
- Backup file name pattern: `money-tracker-backup-YYYY-MM-DD.json`.
- Clearing site data / switching browsers will remove local data unless you restore a backup.

## Project structure

```
src/
  components/     # Layout, UI, transaction modal
  db/             # Dexie schema & seed
  hooks/          # Dashboard, accounts, categories, settings
  pages/          # Landing + app pages
  services/       # Transactions, accounts, categories, backup, Umami bootstrap
  utils/          # Currency & date helpers
  types.ts        # Shared domain types
  App.tsx         # Routes
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run clean` | Remove `dist` and `server.js` |

## Product docs

- [PRD.md](./docs/PRD.md) — product goals, requirements, and scope
- [ERD.md](./docs/ERD.md) — entity relationship diagram (IndexedDB / Dexie)
- [UMAMI.md](./docs/UMAMI.md) — Umami Cloud setup for anonymous visits

## License

Private project (`"private": true` in `package.json`).
