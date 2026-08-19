import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const { pin } = (await req.json()) as { pin?: string };
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
    }
    const hash = await bcrypt.hash(pin, 10);
    await query('UPDATE users SET pin_hash = $1 WHERE id = $2', [hash, user.id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
