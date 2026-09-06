import { getStore } from '@netlify/blobs';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export default async () => {
  try {
    const store = getStore('community-apps');
    const apps = await store.get('catalog.json', { type: 'json' }) || [];
    return json({ apps });
  } catch (error) {
    console.error('Unable to read app catalog', error);
    return json({ error: 'خواندن فهرست اپ‌ها ممکن نشد.' }, 500);
  }
};
