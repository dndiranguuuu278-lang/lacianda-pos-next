import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, AuthError } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireSession();
    const result = await query<any>('SELECT id, email, name, role, pin_hash FROM users WHERE id = $1', [session.id]);
    const user = result.rows[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, hasPin: !!user.pin_hash } });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
