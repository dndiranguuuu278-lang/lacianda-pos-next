import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { issueSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, pin } = (await req.json()) as { email?: string; pin?: string };
  if (!email || !pin) return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 });

  const result = await query<any>('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !user.pin_hash) {
    return NextResponse.json({ error: 'No PIN set for this account' }, { status: 401 });
  }
  const ok = await bcrypt.compare(pin, user.pin_hash);
  if (!ok) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

  await issueSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, hasPin: true } });
}
