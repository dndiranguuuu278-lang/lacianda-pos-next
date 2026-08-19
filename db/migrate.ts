// Idempotent schema migration. Safe to run repeatedly: every statement is
// CREATE ... IF NOT EXISTS / ADD COLUMN IF NOT EXISTS, so it never clobbers data.
// Run standalone with: npm run migrate  (uses tsx, loads .env itself)
import 'dotenv/config';
import { query } from '../lib/db';

const STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,

  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR UNIQUE,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    pin_hash VARCHAR,
    role VARCHAR DEFAULT 'cashier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR UNIQUE NOT NULL,
    category VARCHAR,
    buying_price DECIMAL(10,2) DEFAULT 0.00,
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    stock_qty INT DEFAULT 0,
    barcode VARCHAR UNIQUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR UNIQUE NOT NULL,
    total_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR,
    mpesa_code VARCHAR,
    etims_cuin VARCHAR,
    etims_qr_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // A sale is a basket of many products — needed for receipts, stock
  // deduction, and eTIMS invoice line items.
  `CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name VARCHAR DEFAULT 'Lacianda POS',
    theme_mode VARCHAR DEFAULT 'dark',
    accent_color VARCHAR DEFAULT '#0f172a',
    kra_pin VARCHAR,
    mpesa_shortcode VARCHAR,
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // Holds an STK push's cart between "prompt sent" and the async webhook
  // that confirms/fails it.
  `CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_request_id VARCHAR UNIQUE,
    merchant_request_id VARCHAR,
    phone VARCHAR,
    amount DECIMAL(10,2),
    status VARCHAR DEFAULT 'pending',
    mpesa_code VARCHAR,
    result_desc TEXT,
    sale_id UUID REFERENCES sales(id),
    cart_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // eTIMS submission log + offline/failure queue. Every attempt is recorded
  // here (not just failures) so it doubles as the KRA compliance audit
  // trail the brief asks for, and the /etims-queue page can show pending
  // and failed rows for retry when connectivity to KRA is spotty.
  `CREATE TABLE IF NOT EXISTS etims_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    receipt_number VARCHAR NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending', -- pending | submitted | failed
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT,
    cuin VARCHAR,
    qr_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  `INSERT INTO store_settings (id, store_name)
   VALUES (1, 'Lacianda POS')
   ON CONFLICT (id) DO NOTHING;`,

  `ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS mpesa_shortcode VARCHAR;`,

  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`,
  `CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);`,
  `CREATE INDEX IF NOT EXISTS idx_etims_queue_status ON etims_queue(status);`
];

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.warn('[migrate] Skipping — DATABASE_URL not set.');
    return;
  }
  console.log('[migrate] Running schema migrations…');
  for (const stmt of STATEMENTS) {
    await query(stmt);
  }
  console.log('[migrate] Done.');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migrate] Failed:', err);
    process.exit(1);
  });
