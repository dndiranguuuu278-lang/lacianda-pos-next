import { NextRequest } from 'next/server';
import { subscribe } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ checkoutRequestId: string }> }) {
  const { checkoutRequestId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`event: connected\ndata: {}\n\n`));

      const unsubscribe = subscribe(checkoutRequestId, (payload) => {
        controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify(payload)}\n\n`));
      });

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(':ping\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
