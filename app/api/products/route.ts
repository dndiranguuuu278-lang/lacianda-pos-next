import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const search = req.nextUrl.searchParams.get('search');
    const category = req.nextUrl.searchParams.get('category');

    const clauses: string[] = [];
    const params: unknown[] = [];
    if (search) {
      params.push(`%${search}%`);
      clauses.push(`(name ILIKE $${params.length} OR barcode ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      clauses.push(`category = $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await query(`SELECT * FROM products ${where} ORDER BY name ASC`, params);
    return NextResponse.json({ products: result.rows });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const { name, category, buying_price, selling_price, stock_qty, barcode } = await req.json();
    if (!name) return NextResponse.json({ error: 'Product name is required' }, { status: 400 });

    const result = await query(
      `INSERT INTO products (name, category, buying_price, selling_price, stock_qty, barcode, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6, CURRENT_TIMESTAMP)
       ON CONFLICT (name) DO UPDATE SET
         category = EXCLUDED.category, buying_price = EXCLUDED.buying_price,
         selling_price = EXCLUDED.selling_price, stock_qty = EXCLUDED.stock_qty,
         barcode = EXCLUDED.barcode, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [name, category || null, buying_price || 0, selling_price || 0, stock_qty || 0, barcode || null]
    );
    return NextResponse.json({ product: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err.code === '23505') return NextResponse.json({ error: 'Barcode already in use' }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
