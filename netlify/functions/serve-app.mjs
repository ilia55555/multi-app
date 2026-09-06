import { getStore } from '@netlify/blobs';

const contentTypes = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8', json: 'application/json; charset=utf-8', svg: 'image/svg+xml',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  ico: 'image/x-icon', woff: 'font/woff', woff2: 'font/woff2', mp3: 'audio/mpeg', mp4: 'video/mp4', webm: 'video/webm',
};

export default async (request) => {
  const marker = '/serve-app/';
  const pathname = new URL(request.url).pathname;
  const requested = decodeURIComponent(pathname.includes(marker) ? pathname.split(marker)[1] : '');
  const parts = requested.split('/').filter(Boolean);
  const id = parts.shift();
  const filePath = parts.join('/') || 'index.html';
  if (!id || filePath.includes('..')) return new Response('Not found', { status: 404 });

  const store = getStore('community-apps');
  const body = await store.get(`files/${id}/${filePath}`, { type: 'arrayBuffer' });
  if (!body) return new Response('Not found', { status: 404 });
  const extension = filePath.split('.').pop().toLowerCase();
  const headers = new Headers({
    'content-type': contentTypes[extension] || 'application/octet-stream',
    'cache-control': 'public, max-age=300',
    'x-content-type-options': 'nosniff',
  });
  if (extension === 'html') {
    headers.set('content-security-policy', "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https: wss:");
  }
  return new Response(body, { headers });
};
