import { NextRequest } from 'next/server';
import http from 'http';
import https from 'https';

export const runtime = 'nodejs';

function normalizeTarget(input: string): { upstream: URL; connectHost: string; connectPort: number; isHttps: boolean } {
  const upstream = new URL(input);
  const isHttps = upstream.protocol === 'https:';

  // В docker-compose MinIO подписывает URL с host=minio:9000.
  // Браузер этот host не резолвит, поэтому подключаемся к localhost:9000,
  // но сохраняем Host header из signed URL.
  if (upstream.hostname === 'minio') {
    return {
      upstream,
      connectHost: '127.0.0.1',
      connectPort: Number(upstream.port || 9000),
      isHttps,
    };
  }

  return {
    upstream,
    connectHost: upstream.hostname,
    connectPort: Number(upstream.port || (isHttps ? 443 : 80)),
    isHttps,
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return new Response('Missing url', { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return new Response('Invalid url', { status: 400 });
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return new Response('Unsupported protocol', { status: 400 });
  }

  const { upstream, connectHost, connectPort, isHttps } = normalizeTarget(rawUrl);
  const client = isHttps ? https : http;

  return new Promise<Response>((resolve) => {
    const req = client.request(
      {
        protocol: upstream.protocol,
        host: connectHost,
        port: connectPort,
        method: 'GET',
        path: `${upstream.pathname}${upstream.search}`,
        headers: {
          // Для presigned URL важно сохранить оригинальный host.
          Host: upstream.host,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          const headers = new Headers();
          const contentType = res.headers['content-type'];
          if (typeof contentType === 'string') {
            headers.set('Content-Type', contentType);
          } else {
            headers.set('Content-Type', 'application/octet-stream');
          }
          resolve(new Response(body, { status: res.statusCode || 502, headers }));
        });
      }
    );

    req.on('error', () => {
      resolve(new Response('Failed to proxy file', { status: 502 }));
    });

    req.end();
  });
}
