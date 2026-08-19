import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';
import { stkPush } from '@/lib/mpesa';

interface CartItemInput {
  product_id: string;
  quantity: number;
}

interface ProductRow {
  id: string;
  name: string;
  selling_price: string;
  stock_qty: number;
}

/**
 * POST /api/stk-push
 * Body: { phone: string, items: [{ product_id, quantity }] }
 *
 * Prices/stock are re-validated server-side (never trust client-sent
 * prices), an STK push prompt is sent to the customer's phone, and the
 * cart is snapshotted against the CheckoutRequestID so /api/mpesa-callback
 * can finalize the sale once Safaricom confirms payment.
 */
export async function POST(req: NextRequest) {
  try {
    await requireSession();

    const { phone, items } = (await req.json()) as { phone?: string; items?: CartItemInput[] };
    if (!phone) return NextResponse.json({ error: 'Customer phone number is required' }, { status: 400 });
    if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const productIds = items.map((i) => i.product_id);
    const productsResult = await query<ProductRow>('SELECT * FROM products WHERE id = ANY($1::uuid[])', [productIds]);
    const productMap = new Map(productsResult.rows.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems: { product_id: string; product_name: string; quantity: number; unit_price: number; line_total: number }[] = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
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
        unit_price: Number(product.selling_price),
        line_total: lineTotal
      });
    }

    const taxRate = 16;
    const stk = await stkPush({ phone, amount: subtotal, accountRef: 'LaciandaPOS', description: 'POS Sale' });

    await query(
      `INSERT INTO payment_transactions (checkout_request_id, merchant_request_id, phone, amount, status, cart_snapshot)
       VALUES ($1,$2,$3,$4,'pending',$5)`,
      [stk.CheckoutRequestID, stk.MerchantRequestID, phone, subtotal, JSON.stringify({ items: lineItems, tax_rate: taxRate })]
    );

    return NextResponse.json({
      checkoutRequestId: stk.CheckoutRequestID,
      merchantRequestId: stk.MerchantRequestID,
      amount: subtotal,
      message: 'STK push sent — ask the customer to enter their M-Pesa PIN'
    });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[api/stk-push] error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
