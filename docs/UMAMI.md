# Umami setup (Hobby / free)

Money Tracker can optionally load [Umami Cloud](https://umami.is/pricing) for **anonymous pageviews** so you can see whether people other than you open the app. Financial data is never sent. There is no in-app telemetry UI or opt-out toggle — if `VITE_UMAMI_WEBSITE_ID` is set, pageviews are collected.

## 1. Create a free Umami account

1. Go to [https://cloud.umami.is](https://cloud.umami.is) and sign up.
2. Choose the **Hobby** plan ($0 / month).
3. Create a team / workspace if prompted.

## 2. Add your website

1. In the Umami dashboard: **Add website**.
2. **Name:** e.g. `Money Tracker`
3. **Domain:** `localhost` for local tests, or your production host (e.g. `money-tracker.vercel.app`) — **no port**.
4. Copy the **Website ID** (UUID).

## 3. Configure the app

```bash
cp .env.example .env
```

```env
VITE_UMAMI_WEBSITE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# optional:
# VITE_UMAMI_SCRIPT_URL="https://cloud.umami.is/script.js"
```

Restart the dev server:

```bash
npm run dev
```

## 4. Verify

1. Open the app and refresh once.
2. Umami → **Realtime**: pageviews should appear.
3. Dev console may log `[Analytics] Umami script loaded`.

If the env var is empty, nothing is sent remotely.

## 5. “Are there other users?”

Check **Visitors** / unique visitors in Umami. More than one (after sharing a public URL) usually means other people or another device.

## Privacy

| Item | Sent to Umami? |
|------|----------------|
| Pageviews | Yes, if `VITE_UMAMI_WEBSITE_ID` is set |
| Balances, amounts, notes, categories | Never |

## Production

Set `VITE_UMAMI_WEBSITE_ID` on the host and **redeploy**. Update the Umami website domain to match production.
