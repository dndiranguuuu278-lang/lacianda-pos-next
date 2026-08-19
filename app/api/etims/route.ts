import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';
import { submitInvoice, enqueueInvoice, processQueueEntry, type EtimsLineItem } from '@/lib/etims';

/**
 * POST /api/etims
 * Body: { saleId: string }
 *
 * Attempts to fiscalize a sale immediately. If KRA is unreachable or
 * rejects the submission, the attempt is recorded in etims_queue as
 * 'failed' instead of throwing away the invoice — it can be retried later
 * from /etims-queue. This is the route the checkout flow calls right after
 * a sale is recorded.
 */
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const { saleId } = (await req.json()) as { saleId?: string };
    if (!saleId) return NextResponse.json({ error: 'saleId is required' }, { status: 400 });

    const saleRows = await query<{ id: string; receipt_number: string; total_amount: string; tax_amount: string }>(
      'SELECT * FROM sales WHERE id = $1',
      [saleId]
    );
    const sale = saleRows.rows[0];
    if (!sale) return NextResponse.json({ error: 'Sale not found' }, { status: 404 });

    const itemsResult = await query<EtimsLineItem>(
      'SELECT product_name, quantity, unit_price, line_total FROM sale_items WHERE sale_id = $1',
      [saleId]
    );

    const invoiceInput = {
      receiptNumber: sale.receipt_number,
      items: itemsResult.rows,
      totalAmount: Number(sale.total_amount),
      taxAmount: Number(sale.tax_amount)
    };

    // Always log the attempt for the compliance audit trail, regardless of outcome.
    const queueId = await enqueueInvoice(saleId, invoiceInput);

    try {
      const result = await submitInvoice(invoiceInput);
      await query(`UPDATE etims_queue SET status='submitted', cuin=$1, qr_url=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`, [
        result.cuin,
        result.qrUrl,
        queueId
      ]);
      await query('UPDATE sales SET etims_cuin=$1, etims_qr_url=$2 WHERE id=$3', [result.cuin, result.qrUrl, saleId]);
      return NextResponse.json({ status: 'submitted', cuin: result.cuin, qrUrl: result.qrUrl, queueId });
    } catch (err: any) {
      await query(`UPDATE etims_queue SET status='failed', last_error=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`, [
        err.message,
        queueId
      ]);
      // Not an HTTP error — checkout should still succeed even if eTIMS is down.
      return NextResponse.json({ status: 'failed', error: err.message, queueId });
    }
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[api/etims] error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** GET /api/etims?queueId=... — used by the eTIMS queue page to retry a specific pending/failed row. */
export async function PATCH(req: NextRequest) {
  try {
    await requireSession();
    const { queueId } = (await req.json()) as { queueId?: string };
    if (!queueId) return NextResponse.json({ error: 'queueId is required' }, { status: 400 });
    const outcome = await processQueueEntry(queueId);
    return NextResponse.json(outcome);
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
