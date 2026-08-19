'use client';

async function req<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJson && (data as any).error) || 'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  googleLogin: (credential: string) => req('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  pinLogin: (email: string, pin: string) => req('/api/auth/pin/login', { method: 'POST', body: JSON.stringify({ email, pin }) }),
  setPin: (pin: string) => req('/api/auth/pin/set', { method: 'POST', body: JSON.stringify({ pin }) }),
  me: () => req<{ user: any }>('/api/auth/me'),
  logout: () => req('/api/auth/logout', { method: 'POST' }),

  listProducts: (qs = '') => req<{ products: any[] }>(`/api/products${qs}`),
  createProduct: (p: any) => req('/api/products', { method: 'POST', body: JSON.stringify(p) }),
  updateProduct: (id: string, p: any) => req(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deleteProduct: (id: string) => req(`/api/products/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return req<{ upserted: number; total: number; errors: string[] }>('/api/products/csv/import', { method: 'POST', body: fd });
  },

  checkout: (payload: any) => req('/api/sales', { method: 'POST', body: JSON.stringify(payload) }),
  listSales: () => req<{ sales: any[] }>('/api/sales'),

  stkPush: (payload: any) => req<{ checkoutRequestId: string; amount: number }>('/api/stk-push', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  submitEtims: (saleId: string) => req('/api/etims', { method: 'POST', body: JSON.stringify({ saleId }) }),
  listEtimsQueue: (status?: string) => req<{ queue: any[] }>(`/api/etims-queue${status ? `?status=${status}` : ''}`),
  retryEtims: (id: string) => req(`/api/etims-queue/${id}/retry`, { method: 'POST' }),

  getSettings: () => req<{ settings: any }>('/api/settings'),
  updateSettings: (payload: any) => req<{ settings: any }>('/api/settings', { method: 'PUT', body: JSON.stringify(payload) })
};
