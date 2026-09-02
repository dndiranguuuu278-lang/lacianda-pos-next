import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { query } from '@/lib/db';
import { issueSession } from '@/lib/auth';
import type { UserRow } from '@/types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { credential } = (await req.json()) as { credential?: string };
    if (!credential) return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'GOOGLE_CLIENT_ID is not configured on the server' }, { status: 500 });
    }

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
    const { sub: googleId, email, name } = payload;

    const existing = await query<UserRow>('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);

    let user: UserRow;
    if (existing.rows.length) {
      user = existing.rows[0];
      if (!user.google_id) {
        await query('UPDATE users SET google_id = $1, name = COALESCE(name, $2) WHERE id = $3', [googleId, name, user.id]);
      }
    } else {
      const inserted = await query<UserRow>(
        `INSERT INTO users (google_id, email, name, role) VALUES ($1, $2, $3, 'cashier') RETURNING *`,
        [googleId, email, name]
      );
      user = inserted.rows[0];
    }

    await issueSession({ id: user.id, email: user.email, name: user.name, role: user.role });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, hasPin: !!user.pin_hash } });
  } catch (err: any) {
    console.error('[auth/google] error:', err.message);
    return NextResponse.json({ error: 'Google authentication failed' }, { status: 401 });
  }
}
