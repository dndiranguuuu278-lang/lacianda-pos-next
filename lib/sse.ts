// Minimal SSE broadcast hub for live checkout status. Clients subscribe
// with a checkoutRequestId (returned by /api/stk-push) and receive one
// event when /api/mpesa-callback resolves that transaction.
//
// NOTE: in-memory, so this only works with a single Next.js server
// instance/process (fine for `next start` on one machine; serverless /
// multi-instance deployments need Redis pub/sub or similar instead, since
// the webhook and the subscribed browser tab aren't guaranteed to hit the
// same process there).

type Listener = (data: unknown) => void;

const globalForSse = globalThis as unknown as { sseListeners?: Map<string, Set<Listener>> };
const listeners = globalForSse.sseListeners ?? new Map<string, Set<Listener>>();
globalForSse.sseListeners = listeners;

export function subscribe(checkoutRequestId: string, listener: Listener): () => void {
  if (!listeners.has(checkoutRequestId)) listeners.set(checkoutRequestId, new Set());
  listeners.get(checkoutRequestId)!.add(listener);
  return () => {
    listeners.get(checkoutRequestId)?.delete(listener);
    if (listeners.get(checkoutRequestId)?.size === 0) listeners.delete(checkoutRequestId);
  };
}

export function publish(checkoutRequestId: string, payload: unknown) {
  const subs = listeners.get(checkoutRequestId);
  if (!subs) return;
  for (const listener of subs) listener(payload);
}
