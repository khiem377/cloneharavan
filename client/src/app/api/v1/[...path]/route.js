import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_SERVER_URL || 'http://127.0.0.1:5000/api/v1';

async function handler(request, context) {
  const { path } = await context.params;
  const pathStr = Array.isArray(path) ? path.join('/') : path;

  const { search } = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/${pathStr}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!['host', 'connection', 'content-length'].includes(lowerKey)) {
      headers.set(key, value);
    }
  });

  const method = request.method;
  let body = undefined;

  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await request.json().catch(() => null);
      if (json) body = JSON.stringify(json);
    } else if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      body = await request.blob();
    }
  }

  try {
    let backendRes;
    try {
      backendRes = await fetch(targetUrl, {
        method,
        headers,
        body,
        duplex: 'half',
      });
    } catch {
      const fallbackUrl = targetUrl.includes('localhost')
        ? targetUrl.replace('localhost', '127.0.0.1')
        : targetUrl.replace('127.0.0.1', 'localhost');
      backendRes = await fetch(fallbackUrl, {
        method,
        headers,
        body,
        duplex: 'half',
      });
    }

    const data = await backendRes.text();
    const resHeaders = new Headers();
    backendRes.headers.forEach((val, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        resHeaders.set(key, val);
      }
    });

    return new NextResponse(data, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error(`API Proxy Error for [${method}] ${targetUrl}:`, err?.message);
    return NextResponse.json(
      { status: 'error', message: 'Không thể kết nối đến máy chủ BE' },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
