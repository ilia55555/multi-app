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

const search = document.querySelector('#search');
const resultCount = document.querySelector('#resultCount');
const emptyResults = document.querySelector('#emptyResults');
const toolCount = document.querySelector('#toolCount');
const cards = [...document.querySelectorAll('.app-card[data-search]')];

const setCount = visible => {
  const text = `${visible.toLocaleString('fa-IR')} ابزار برای استفاده آماده است`;
  if (resultCount) resultCount.textContent = text;
};

if (toolCount) toolCount.textContent = cards.length.toLocaleString('fa-IR');
setCount(cards.length);

search?.addEventListener('input', () => {
  const value = search.value.trim().toLowerCase();
  let visible = 0;

  for (const card of cards) {
    const matched = card.dataset.search.toLowerCase().includes(value);
    card.hidden = !matched;
    if (matched) visible += 1;
  }

  if (resultCount) {
    resultCount.textContent = value
      ? `${visible.toLocaleString('fa-IR')} نتیجه پیدا شد`
      : `${cards.length.toLocaleString('fa-IR')} ابزار برای استفاده آماده است`;
  }
  if (emptyResults) emptyResults.hidden = visible !== 0;
});

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
