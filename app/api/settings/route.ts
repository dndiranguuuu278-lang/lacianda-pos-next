import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSession, requireRole, AuthError } from '@/lib/auth';

export async function GET() {
  try {
    const result = await query('SELECT * FROM store_settings WHERE id = 1');
    return NextResponse.json({ settings: result.rows[0] });
  } catch (err: any) {
    // Settings are read on every page (Navbar, Till, etc.) — degrade to
    // sensible defaults instead of breaking the whole app when the DB
    // isn't reachable yet.
    return NextResponse.json({ settings: { store_name: 'Lacianda POS', theme_mode: 'dark', accent_color: '#10b981' } });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireSession();
    requireRole(user, 'admin', 'manager');
    const { store_name, theme_mode, accent_color, kra_pin, mpesa_shortcode, logo_url } = await req.json();
    const result = await query(
      `UPDATE store_settings SET
         store_name = COALESCE($1, store_name), theme_mode = COALESCE($2, theme_mode),
         accent_color = COALESCE($3, accent_color), kra_pin = COALESCE($4, kra_pin),
         mpesa_shortcode = COALESCE($5, mpesa_shortcode), logo_url = COALESCE($6, logo_url),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = 1 RETURNING *`,
      [store_name, theme_mode, accent_color, kra_pin, mpesa_shortcode, logo_url]
    );
    return NextResponse.json({ settings: result.rows[0] });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
