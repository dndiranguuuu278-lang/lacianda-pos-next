import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'lacianda_session';
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

import type { SessionUser } from '@/types';
export type { SessionUser };

export async function issueSession(user: SessionUser) {
  const token = jwt.sign(user, SECRET, { expiresIn: '30d' });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/'
  });
  return token;
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new AuthError('Not authenticated', 401);
  return user;
}

export function requireRole(user: SessionUser, ...roles: string[]) {
  if (!roles.includes(user.role)) throw new AuthError('Insufficient permissions', 403);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}
