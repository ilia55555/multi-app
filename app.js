const manifest = {
  name: 'جعبه ابزار من',
  short_name: 'جعبه ابزار',
  description: 'مرکز دسترسی به اپلیکیشن‌های شخصی',
  start_url: './index.html',
  scope: './',
  display: 'standalone',
  background_color: '#090a0f',
  theme_color: '#090a0f',
  lang: 'fa',
  dir: 'rtl',
  icons: [{
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='112' fill='%23734be0'/%3E%3Cg fill='white'%3E%3Crect x='112' y='112' width='120' height='120' rx='25'/%3E%3Crect x='280' y='112' width='120' height='120' rx='25'/%3E%3Crect x='112' y='280' width='120' height='120' rx='25'/%3E%3Crect x='280' y='280' width='120' height='120' rx='25'/%3E%3C/g%3E%3C/svg%3E",
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'any maskable'
  }]
};

document.querySelector('#app-manifest').href = `data:application/manifest+json,${encodeURIComponent(JSON.stringify(manifest))}`;

const search = document.querySelector('#search');
search.addEventListener('input', () => {
  const value = search.value.trim().toLowerCase();
  document.querySelectorAll('[data-search]').forEach(card => {
    card.hidden = !card.dataset.search.toLowerCase().includes(value);
  });
});

const installButton = document.querySelector('#installButton');
let installPrompt;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installButton.hidden = true;
});

if (window.matchMedia('(display-mode: standalone)').matches) installButton.hidden = true;
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
