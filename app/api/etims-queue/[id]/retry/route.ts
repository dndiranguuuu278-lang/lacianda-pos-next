import { NextRequest, NextResponse } from 'next/server';
import { requireSession, AuthError } from '@/lib/auth';
import { processQueueEntry } from '@/lib/etims';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const outcome = await processQueueEntry(id);
    return NextResponse.json(outcome);
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
