import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

function generateReceiptNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `LC-${stamp}-${rand}`;
}

/**
 * POST /api/sales
 * Body: { items: [{ product_id, quantity }], payment_method: 'cash' }
 * Cash sales finalize here synchronously. M-Pesa sales go through
 * /api/stk-push -> /api/mpesa-callback instead, since that flow is async.
 */
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const { items, payment_method, tax_rate = 16 } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const productIds = items.map((i: any) => i.product_id);
    const productsResult = await query<any>('SELECT * FROM products WHERE id = ANY($1::uuid[])', [productIds]);
    const productMap = new Map(productsResult.rows.map((p: any) => [p.id, p]));

    let subtotal = 0;
    const lineItems: any[] = [];
    for (const item of items) {
      const product: any = productMap.get(item.product_id);
      if (!product) return NextResponse.json({ error: `Unknown product: ${item.product_id}` }, { status: 400 });
      if (product.stock_qty < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 409 });
      }
      const lineTotal = Number(product.selling_price) * item.quantity;
      subtotal += lineTotal;
      lineItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.selling_price,
        line_total: lineTotal
      });
    }

    const taxAmount = +(subtotal - subtotal / (1 + tax_rate / 100)).toFixed(2);
    const receiptNumber = generateReceiptNumber();

    const saleResult = await query<any>(
      `INSERT INTO sales (receipt_number, total_amount, tax_amount, payment_method)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [receiptNumber, subtotal, taxAmount, payment_method || 'cash']
    );
    const sale = saleResult.rows[0];

    for (const li of lineItems) {
      await query(
        `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, line_total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [sale.id, li.product_id, li.product_name, li.quantity, li.unit_price, li.line_total]
      );
      await query('UPDATE products SET stock_qty = stock_qty - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        li.quantity,
        li.product_id
      ]);
    }

    // Fiscalization is handled by a follow-up call to /api/etims from the
    // client right after this returns, so a slow/unreachable KRA endpoint
    // never blocks the till from completing the sale.
    return NextResponse.json({ sale, items: lineItems }, { status: 201 });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const limit = req.nextUrl.searchParams.get('limit') || '50';
    const offset = req.nextUrl.searchParams.get('offset') || '0';
    const result = await query('SELECT * FROM sales ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return NextResponse.json({ sales: result.rows });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
