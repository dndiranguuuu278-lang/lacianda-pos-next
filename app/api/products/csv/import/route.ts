import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

/**
 * POST /api/products/csv/import
 * multipart/form-data with a `file` field.
 * Expected columns (case-insensitive, order-independent):
 *   Name, Category, Buying Price, Selling Price, Stock Quantity, Barcode
 * Bulk UPSERT keyed on product name, so re-uploads sync existing rows
 * across every connected device.
 */
export async function POST(req: NextRequest) {
  try {
    await requireSession();

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const text = await file.text();
    let records: Record<string, string>[];
    try {
      records = parse(text, {
        columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true
      });
    } catch (err: any) {
      return NextResponse.json({ error: `Could not parse CSV: ${err.message}` }, { status: 400 });
    }

    const norm = (row: Record<string, string>, keys: string[]) => {
      for (const k of keys) if (row[k] !== undefined && row[k] !== '') return row[k];
      return null;
    };

    let upserted = 0;
    const errors: string[] = [];

    for (const [i, row] of records.entries()) {
      const name = norm(row, ['name', 'product name']);
      if (!name) {
        errors.push(`Row ${i + 2}: missing product name — skipped`);
        continue;
      }
      const category = norm(row, ['category']);
      const buying = parseFloat(norm(row, ['buying price', 'buying_price', 'cost']) || '') || 0;
      const selling = parseFloat(norm(row, ['selling price', 'selling_price', 'price']) || '') || 0;
      const stock = parseInt(norm(row, ['stock quantity', 'stock_qty', 'quantity', 'qty']) || '', 10) || 0;
      const barcode = norm(row, ['barcode', 'sku']);

      try {
        await query(
          `INSERT INTO products (name, category, buying_price, selling_price, stock_qty, barcode, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6, CURRENT_TIMESTAMP)
           ON CONFLICT (name) DO UPDATE SET
             category = EXCLUDED.category, buying_price = EXCLUDED.buying_price,
             selling_price = EXCLUDED.selling_price, stock_qty = EXCLUDED.stock_qty,
             barcode = COALESCE(EXCLUDED.barcode, products.barcode), updated_at = CURRENT_TIMESTAMP`,
          [name, category, buying, selling, stock, barcode]
        );
        upserted += 1;
      } catch (err: any) {
        errors.push(`Row ${i + 2} (${name}): ${err.message}`);
      }
    }

    return NextResponse.json({ upserted, total: records.length, errors });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
