# Lacianda POS (Next.js)

Mobile-first Point of Sale PWA for Kenyan retail, rebuilt on **Next.js 16 (App
Router) + React + TypeScript**, migrated from an earlier Express/vanilla-JS
version. Neon Postgres, Google sign-in with PIN backup, CSV inventory sync,
M-Pesa STK push with live status via Server-Sent Events, KRA eTIMS fiscal
invoices with an offline retry queue, and Web Bluetooth ESC/POS thermal
printing.

## Directory structure

```
app/
  api/
    auth/{google,pin/login,pin/set,me,logout}/route.ts   Session auth
    stk-push/route.ts            M-Pesa STK push trigger (till → customer phone)
    mpesa-callback/route.ts      Safaricom Daraja webhook, finalizes the sale
    payments/stream/[id]/route.ts   SSE stream the till subscribes to for live status
    etims/route.ts               Submits/queues a sale's invoice to KRA eTIMS
    etims-queue/route.ts         Lists the compliance queue
    etims-queue/[id]/retry/route.ts   Retries one queued invoice
    products/route.ts            List/create products
    products/[id]/route.ts       Update/delete a product
    products/csv/{import,export}/route.ts   Bulk CSV upsert
    sales/route.ts               Cash checkout + sale history
    sales/[id]/route.ts          Single sale detail
    settings/route.ts            Store profile, theme, tax, M-Pesa config
  etims-queue/page.tsx          eTIMS pending tax submissions queue (UI)
  import/page.tsx                CSV bulk inventory upload (UI)
  login/page.tsx                 Staff PIN / Google sign-in
  settings/page.tsx              Store details, tax & M-Pesa config (UI)
  stock/page.tsx                 Inventory CRUD table
  sales/page.tsx                 Sales history
  page.tsx                       The till (POS/checkout) — root route
  layout.tsx                     Root layout, renders <Navbar />
lib/
  etims.ts                       eTIMS signature/payload helper, submission client, offline queue
  mpesa.ts                       M-Pesa OAuth token + STK push trigger
  receipt.ts                     Printable receipt layouts (HTML print + ESC/POS bytes)
  printer.ts                     Web Bluetooth client (browser-only), built on receipt.ts
  auth.ts                        JWT session cookie helpers (next/headers)
  db.ts                          Neon serverless pool
  apiClient.ts                   Client-side fetch wrapper used by every page
  sse.ts                         In-memory pub/sub shared between the webhook and the stream route
db/migrate.ts                    Idempotent schema migrations (npm run migrate)
components/Navbar.tsx            Top bar + mobile bottom nav, links every page
hooks/useSession.ts              Client hook: redirects to /login if unauthenticated
```

## What's real vs. what needs your credentials

Every route above is fully implemented and runs end-to-end against a real
Neon database — nothing is mocked. Four integrations are gated by
third-party accounts only you can provision; each fails with a clear error
until configured, rather than pretending to succeed:

| Feature | Needs |
|---|---|
| Database | A Neon Postgres project + connection string |
| Google sign-in | The OAuth consent screen published for external users (client ID is already wired in) |
| M-Pesa STK push | A Safaricom Daraja app — consumer key/secret, shortcode, passkey, a public HTTPS callback URL |
| KRA eTIMS | Completed KRA OSCU/VSCU onboarding for your business PIN, which issues a device-specific CMC key — there's no generic "KRA API key" |
| Silent printing | An ESC/POS Bluetooth thermal printer + a Chromium browser (Web Bluetooth isn't supported in iOS Safari) |

## 1. Install and configure

```bash
npm install
cp .env.example .env   # then fill in real values
```

At minimum, set `DATABASE_URL` and `JWT_SECRET` to get the app running.

## 2. Run migrations

```bash
npm run migrate
```

Creates `users`, `products`, `sales`, `store_settings`, plus two supporting
tables every route above depends on:

- **`sale_items`** — a sale is a basket of many products; without line
  items, receipts, stock deduction, and eTIMS invoices have nothing to
  reference.
- **`payment_transactions`** — an STK push is asynchronous (prompt sent →
  customer enters PIN → webhook fires later); this holds the cart snapshot
  in between.
- **`etims_queue`** — every eTIMS submission attempt (success or failure) is
  logged here. This is both the compliance audit trail and the offline
  retry queue that `/etims-queue` reads from.

Safe to re-run anytime — every statement is `IF NOT EXISTS`.

## 3. Run the app

```bash
npm run dev     # development
npm run build && npm start   # production
```

## 4. M-Pesa (Daraja)

Fill in `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`,
`MPESA_PASSKEY`. `MPESA_CALLBACK_URL` must be a publicly reachable HTTPS URL
pointing at `/api/mpesa-callback` on your deployed server — Safaricom cannot
call `localhost`; use a tunnel (ngrok, Cloudflare Tunnel) for local testing.

Flow: cashier taps M-Pesa on `/` → enters phone → `POST /api/stk-push`
prompts the customer → the till opens an SSE connection to
`/api/payments/stream/:checkoutRequestId` → Safaricom calls
`/api/mpesa-callback` → the server finalizes the sale, deducts stock, queues
+ attempts eTIMS submission, and pushes `paid`/`failed` to the open
connection. The UI updates without polling.

## 5. KRA eTIMS

`lib/etims.ts` is shaped to KRA's documented invoice payload and sandbox
host, but real submissions require `ETIMS_CMC_KEY` and `KRA_PIN` from
completed OSCU/VSCU onboarding. Until then, checkout still succeeds — every
attempt is logged to `etims_queue` as `failed` with the real error message,
visible and retryable from `/etims-queue`. This is intentional: a tax
integration going down should never stop a till from selling.

## 6. Thermal printing

Web Bluetooth requires a secure context (HTTPS or `localhost`) and only
works in Chromium-based browsers. From the checkout receipt screen or
Settings → Receipt printer, pair your 80mm/58mm ESC/POS printer. Once
paired, receipts auto-print silently on payment confirmation (cash or
M-Pesa). If your printer uses a GATT service UUID other than the two common
ones in `lib/printer.ts`, pair once, check the browser console for the
discovered service, and add it to `CANDIDATE_SERVICES`.

A browser-print fallback (`lib/receipt.ts` → `buildReceiptHtml`) is
available from the same screen for tills without a Bluetooth printer.

## Notes on scope and honesty

- The SSE hub in `lib/sse.ts` is in-memory and keyed off `globalThis`, so it
  assumes a single Node process. Fine for `next start` on one machine; a
  multi-instance/serverless deployment needs Redis pub/sub instead, since
  the webhook and the subscribed browser tab aren't guaranteed to hit the
  same process there.
- All prices and stock levels are re-validated server-side at checkout and
  in `/api/stk-push` — the client never dictates what something costs.
- `GET /api/settings` degrades to sensible defaults if the database is
  unreachable, since the Navbar calls it on every page load — the rest of
  the app (auth, checkout, etc.) correctly surfaces DB errors instead of
  hiding them.
