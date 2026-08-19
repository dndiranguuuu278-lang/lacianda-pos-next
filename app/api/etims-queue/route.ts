import { NextRequest, NextResponse } from 'next/server';
import { requireSession, AuthError } from '@/lib/auth';
import { listQueue } from '@/lib/etims';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const rows = await listQueue(status);
    return NextResponse.json({ queue: rows });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
