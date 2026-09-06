import { getStore } from '@netlify/blobs';
import JSZip from 'jszip';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});
const safePath = (value) => value.replaceAll('\\', '/').replace(/^\/+/, '').split('/').filter(part => part && part !== '.' && part !== '..').join('/');
const slug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'app';

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'متد درخواست پشتیبانی نمی‌شود.' }, 405);
  const expectedKey = Netlify.env.get('UPLOAD_SECRET');
  if (expectedKey && request.headers.get('x-upload-secret') !== expectedKey) {
    return json({ error: 'کلید آپلود صحیح نیست.' }, 401);
  }

  try {
    const form = await request.formData();
    const files = form.getAll('files').filter(value => value instanceof File);
    const title = String(form.get('title') || '').trim();
    if (!title || !files.length) return json({ error: 'نام اپ و فایل‌های آن الزامی است.' }, 400);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_UPLOAD_BYTES) return json({ error: 'حجم این آپلود باید کمتر از ۵ مگابایت باشد.' }, 413);

    const id = `${slug(title)}-${crypto.randomUUID().slice(0, 8)}`;
    const entries = [];
    for (const file of files) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        const archive = await JSZip.loadAsync(await file.arrayBuffer());
        for (const item of Object.values(archive.files)) {
          if (!item.dir) entries.push({ path: safePath(item.name), data: await item.async('uint8array') });
        }
      } else {
        const relativePath = safePath(file.name);
        entries.push({ path: relativePath, data: new Uint8Array(await file.arrayBuffer()) });
      }
    }

    const usable = entries.filter(entry => entry.path && !entry.path.startsWith('__MACOSX/'));
    const indexEntry = usable.find(entry => entry.path.toLowerCase() === 'index.html')
      || usable.find(entry => entry.path.toLowerCase().endsWith('/index.html'));
    if (!indexEntry) return json({ error: 'اپ باید در ریشهٔ خود فایل index.html داشته باشد.' }, 400);
    const rootPrefix = indexEntry.path.slice(0, -'index.html'.length);
    const normalized = usable
      .filter(entry => entry.path.startsWith(rootPrefix))
      .map(entry => ({ ...entry, path: entry.path.slice(rootPrefix.length) }));

    const index = normalized.find(entry => entry.path.toLowerCase() === 'index.html');
    const html = new TextDecoder().decode(index.data)
      .replace(/(src|href)=(['"])\/(?!\/)/gi, `$1=$2/community-apps/${id}/`);
    index.data = new TextEncoder().encode(html);

    const store = getStore('community-apps');
    await Promise.all(normalized.map(entry => store.set(`files/${id}/${entry.path}`, entry.data)));
    if (!normalized.some(entry => entry.path.toLowerCase().endsWith('.md'))) {
      await store.set(`files/${id}/README.md`, `# ${title}\n\nاین اپ از طریق مرکز اپلیکیشن‌ها در PR شماره 3 بارگذاری شده است.\n`);
    }
    const current = await store.get('catalog.json', { type: 'json' }) || [];
    const app = { id, title, fileCount: normalized.length, createdAt: new Date().toISOString(), url: `/community-apps/${id}/index.html` };
    await store.setJSON('catalog.json', [app, ...current]);
    return json({ app }, 201);
  } catch (error) {
    console.error('Unable to upload app', error);
    return json({ error: 'فایل‌ها قابل پردازش نبودند؛ ساختار ZIP را بررسی کنید.' }, 500);
  }
};
