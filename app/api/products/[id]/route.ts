import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const { name, category, buying_price, selling_price, stock_qty, barcode } = await req.json();
    const result = await query(
      `UPDATE products SET
         name = COALESCE($1, name), category = COALESCE($2, category),
         buying_price = COALESCE($3, buying_price), selling_price = COALESCE($4, selling_price),
         stock_qty = COALESCE($5, stock_qty), barcode = COALESCE($6, barcode),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, category, buying_price, selling_price, stock_qty, barcode, id]
    );
    if (!result.rows.length) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product: result.rows[0] });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
