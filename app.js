const manifest = {
  name: 'جعبه ابزار من',
  short_name: 'جعبه ابزار',
  description: 'مرکز دسترسی به اپلیکیشن‌های شخصی',
  start_url: './index.html',
  scope: './',
  display: 'standalone',
  background_color: '#07111f',
  theme_color: '#07111f',
  lang: 'fa',
  dir: 'rtl',
  icons: [{
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='112' fill='%23734be0'/%3E%3Cg fill='white'%3E%3Crect x='112' y='112' width='120' height='120' rx='25'/%3E%3Crect x='280' y='112' width='120' height='120' rx='25'/%3E%3Crect x='112' y='280' width='120' height='120' rx='25'/%3E%3Crect x='280' y='280' width='120' height='120' rx='25'/%3E%3C/g%3E%3C/svg%3E",
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'any maskable'
  }]
};

const manifestLink = document.querySelector('#app-manifest');
if (manifestLink) {
  manifestLink.href = `data:application/manifest+json,${encodeURIComponent(JSON.stringify(manifest))}`;
}

const appsGrid = document.querySelector('#appsGrid');
const search = document.querySelector('#search');
const resultCount = document.querySelector('#resultCount');
const emptyResults = document.querySelector('#emptyResults');
const loadError = document.querySelector('#loadError');
const toolCount = document.querySelector('#toolCount');

let cards = [];

function safeAppUrl(path) {
  const value = String(path ?? '').trim();
  if (!value) throw new Error('App path is empty');

  const url = new URL(value, document.baseURI);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== window.location.origin) {
    throw new Error('App path must point to this site');
  }
  return url.href;
}

function createCard(app, index) {
  const name = String(app.name ?? '').trim();
  const description = String(app.description ?? '').trim();
  const href = safeAppUrl(app.path);

  if (!name || !description) {
    throw new Error('Each app needs name, description and path');
  }

  const card = document.createElement('a');
  card.className = index === 0 ? 'app-card featured' : 'app-card';
  card.href = href;
  card.dataset.search = `${name} ${description} ${app.path}`.toLowerCase();

  const top = document.createElement('div');
  top.className = 'card-top';

  const icon = document.createElement('span');
  icon.className = 'app-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = Array.from(name)[0] || '•';

  const status = document.createElement('span');
  status.className = 'status';
  status.innerHTML = '<i></i> فعال';

  const copy = document.createElement('div');
  copy.className = 'card-copy';

  const title = document.createElement('h3');
  title.textContent = name;

  const text = document.createElement('p');
  text.textContent = description;

  copy.append(title, text);

  const foot = document.createElement('div');
  foot.className = 'card-foot';

  const enter = document.createElement('span');
  enter.textContent = 'ورود به اپ';

  const arrow = document.createElement('b');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '←';

  foot.append(enter, arrow);
  top.append(icon, status);
  card.append(top, copy, foot);

  return card;
}

function updateSearch() {
  const value = search?.value.trim().toLowerCase() ?? '';
  let visible = 0;

  for (const card of cards) {
    const matched = !value || card.dataset.search.includes(value);
    card.hidden = !matched;
    if (matched) visible += 1;
  }

  if (resultCount) {
    resultCount.textContent = value
      ? `${visible.toLocaleString('fa-IR')} نتیجه پیدا شد`
      : `${cards.length.toLocaleString('fa-IR')} ابزار برای استفاده آماده است`;
  }

  if (emptyResults) emptyResults.hidden = visible !== 0;
}

async function loadApps() {
  try {
    const response = await fetch('./apps.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`apps.json: HTTP ${response.status}`);

    const apps = await response.json();
    if (!Array.isArray(apps)) throw new Error('apps.json must contain an array');

    const fragment = document.createDocumentFragment();
    const renderedCards = apps.map((app, index) => createCard(app, index));
    for (const card of renderedCards) fragment.append(card);

    appsGrid?.replaceChildren(fragment);
    cards = renderedCards;

    if (toolCount) toolCount.textContent = cards.length.toLocaleString('fa-IR');
    if (loadError) loadError.hidden = true;
    updateSearch();
  } catch (error) {
    console.error('Unable to load apps.json', error);
    cards = [];
    appsGrid?.replaceChildren();
    if (toolCount) toolCount.textContent = '۰';
    if (resultCount) resultCount.textContent = 'فهرست اپ‌ها در دسترس نیست';
    if (emptyResults) emptyResults.hidden = true;
    if (loadError) loadError.hidden = false;
  }
}

search?.addEventListener('input', updateSearch);

window.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    search?.focus();
  }
});

const installButton = document.querySelector('#installButton');
let installPrompt;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  if (installButton) installButton.hidden = false;
});

installButton?.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  if (installButton) installButton.hidden = true;
});

if (window.matchMedia('(display-mode: standalone)').matches && installButton) {
  installButton.hidden = true;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

loadApps();
