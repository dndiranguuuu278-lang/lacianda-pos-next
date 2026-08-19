import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

export async function GET() {
  try {
    await requireSession();
    const result = await query(
      'SELECT name, category, buying_price, selling_price, stock_qty, barcode FROM products ORDER BY name ASC'
    );
    const csv = stringify(result.rows as Record<string, unknown>[], {
      header: true,
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'category', header: 'Category' },
        { key: 'buying_price', header: 'Buying Price' },
        { key: 'selling_price', header: 'Selling Price' },
        { key: 'stock_qty', header: 'Stock Quantity' },
        { key: 'barcode', header: 'Barcode' }
      ]
    });
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="lacianda-inventory-${Date.now()}.csv"`
      }
    });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
