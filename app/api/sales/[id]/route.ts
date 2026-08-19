import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const sale = await query('SELECT * FROM sales WHERE id = $1', [id]);
    if (!sale.rows.length) return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    const items = await query('SELECT * FROM sale_items WHERE sale_id = $1', [id]);
    return NextResponse.json({ sale: sale.rows[0], items: items.rows });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
