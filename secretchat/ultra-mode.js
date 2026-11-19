/* Ultra Secret Mode: hardened, memory-only handling for highly sensitive text (e.g. wallet seed phrases). */
(() => {
  'use strict';

  const ULTRA_VERSION = 'SecretChat-ultra-v1';
  const ULTRA_ALG = 'AES-GCM-256/PBKDF2-SHA512/padded-512/aad';
  const ULTRA_ITERATIONS = 1200000;
  const ULTRA_SALT_BYTES = 32;
  const ULTRA_IV_BYTES = 12;
  const ULTRA_MIN_PASSWORD = 15;
  const ultraPasswordOk = (password) => password.length >= ULTRA_MIN_PASSWORD && /\p{Lu}/u.test(password) && /\p{Ll}/u.test(password) && /\p{Nd}/u.test(password);
  const PAD_BLOCK = 512;
  const IDLE_WIPE_MS = 120000;
  const REVEAL_WIPE_MS = 60000;
  const CLIPBOARD_CLEAR_MS = 60000;
  const COPY_ALLOWED = new Set(['encryptedOutput']);
  const PASTE_ALLOWED = new Set(['cipherMessage']);
  const SENSITIVE_IDS = ['encryptPassword', 'decryptPassword', 'plainMessage', 'encryptedOutput', 'cipherMessage', 'decryptedOutput', 'qrReaderResult', 'transferSendPassword', 'transferReceivePassword'];

  const texts = {
    fa: {
      toggleOn: 'حالت فوق‌محرمانه فعال شد؛ همهٔ قابلیت‌های جانبی بسته شدند.',
      toggleOff: 'حالت فوق‌محرمانه خاموش شد و همهٔ داده‌ها پاک شدند.',
      banner: 'حالت فوق‌محرمانه فعال است — فقط تایپ دستی؛ خروج یا مینیمایز همه‌چیز را پاک می‌کند.',
      ultraRequired: 'این پیام با حالت فوق‌محرمانه ساخته شده؛ ابتدا آن حالت را روشن کنید.',
      ultraOnly: 'در حالت فوق‌محرمانه فقط پیام‌های فوق‌محرمانه باز می‌شوند.',
      minPassword: `در حالت فوق‌محرمانه رمز باید حداقل ${ULTRA_MIN_PASSWORD} کاراکتر و شامل حرف بزرگ، حرف کوچک و عدد باشد (نماد اختیاری).`,
      blocked: 'این کار در حالت فوق‌محرمانه غیرفعال است.',
      copiedTimed: 'کپی شد؛ کلیپ‌بورد پس از ۶۰ ثانیه پاک می‌شود.',
      encrypted: 'رمزنگاری شد؛ متن اصلی و رمز از حافظهٔ فرم پاک شدند.',
      unlocked: 'باز شد؛ برای دیدن، دکمهٔ نمایش را نگه دارید. ۶۰ ثانیه بعد پاک می‌شود.',
      hold: 'نگه دارید تا نمایش',
      wiped: 'داده‌های حساس پاک شدند.',
      label: 'حالت فوق‌محرمانه'
    },
    en: {
      toggleOn: 'Ultra Secret Mode on; all extra features are locked.',
      toggleOff: 'Ultra Secret Mode off; all data wiped.',
      banner: 'Ultra Secret Mode — manual typing only; leaving or minimizing wipes everything.',
      ultraRequired: 'This message was made in Ultra Secret Mode; turn that mode on first.',
      ultraOnly: 'Ultra Secret Mode only opens ultra-secret messages.',
      minPassword: `Ultra Secret Mode needs at least ${ULTRA_MIN_PASSWORD} characters with uppercase, lowercase and a digit (symbols optional).`,
      blocked: 'Disabled in Ultra Secret Mode.',
      copiedTimed: 'Copied; the clipboard is cleared after 60 seconds.',
      encrypted: 'Encrypted; the original text and password were wiped from the form.',
      unlocked: 'Unlocked; hold the reveal button to view. Wiped in 60 seconds.',
      hold: 'Hold to reveal',
      wiped: 'Sensitive data wiped.',
      label: 'Ultra Secret Mode'
    }
  };

  const $ = (id) => document.getElementById(id);
  const lang = () => (typeof language === 'string' && texts[language] ? language : 'fa');
  const text = (key) => texts[lang()][key];
  const enc = new TextEncoder();
  const dec = new TextDecoder('utf-8', { fatal: true });

  let active = false;
  let idleTimer = null;
  let revealTimer = null;
  let clipboardTimer = null;
  let busy = false;

  function native(method) {
    const bridge = window.AndroidApp;
    return bridge && typeof bridge[method] === 'function' ? bridge[method].bind(bridge) : null;
  }

  function status(id, message, type = '') {
    if (typeof setStatus === 'function') setStatus(id, message, type);
  }

  function b64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function unb64(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function aad(header) {
    return enc.encode(`${header.v}|${header.alg}|${header.iter}|${header.salt}|${header.iv}`);
  }

  async function deriveUltraKey(password, salt) {
    const passwordBytes = enc.encode(`${ULTRA_VERSION}\u0000${password}`);
    try {
      const base = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveKey']);
      return await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: ULTRA_ITERATIONS, hash: 'SHA-512' },
        base,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } finally {
      passwordBytes.fill(0);
    }
  }

  function pad(messageBytes) {
    const needed = 4 + messageBytes.length;
    const total = Math.ceil(needed / PAD_BLOCK) * PAD_BLOCK;
    const out = new Uint8Array(total);
    new DataView(out.buffer).setUint32(0, messageBytes.length, false);
    out.set(messageBytes, 4);
    crypto.getRandomValues(out.subarray(needed));
    return out;
  }

  function unpad(padded) {
    if (padded.length < 4 || padded.length % PAD_BLOCK !== 0) throw new Error('bad padding');
    const length = new DataView(padded.buffer, padded.byteOffset, padded.byteLength).getUint32(0, false);
    if (length > padded.length - 4) throw new Error('bad padding');
    return padded.subarray(4, 4 + length);
  }

  function isUltraPayload(payload) {
    return !!payload && payload.v === ULTRA_VERSION;
  }

  function parsePayload(cipher) {
    return JSON.parse(decodeURIComponent(escape(atob(cipher))));
  }

  function resetField(id) {
    const element = $(id);
    if (!element) return;
    element.value = '';
    if (typeof autoGrow === 'function' && element.tagName === 'TEXTAREA') autoGrow(element);
  }

  function hideOutput() {
    $('decryptedOutput')?.classList.remove('ultra-revealed');
  }

  async function encrypt() {
    if (busy) return;
    const password = $('encryptPassword').value;
    const message = $('plainMessage').value;
    if (!password || !message) return status('encryptStatus', t('fillBoth'), 'warn');
    if (!ultraPasswordOk(password)) return status('encryptStatus', text('minPassword'), 'warn');
    busy = true;
    let messageBytes = null;
    let padded = null;
    try {
      const salt = crypto.getRandomValues(new Uint8Array(ULTRA_SALT_BYTES));
      const iv = crypto.getRandomValues(new Uint8Array(ULTRA_IV_BYTES));
      const header = { v: ULTRA_VERSION, alg: ULTRA_ALG, iter: ULTRA_ITERATIONS, salt: b64(salt), iv: b64(iv) };
      const key = await deriveUltraKey(password, salt);
      messageBytes = enc.encode(message);
      padded = pad(messageBytes);
      const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(header), tagLength: 128 }, key, padded);
      if (!active) return;
      const payload = { ...header, data: b64(new Uint8Array(data)) };
      $('encryptedOutput').value = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      autoGrow($('encryptedOutput'));
      resetField('plainMessage');
      resetField('encryptPassword');
      updateStrength('encryptPassword', 'encryptStrength', 'encryptMeter');
      status('encryptStatus', text('encrypted'), 'ok');
    } catch (error) {
      status('encryptStatus', t('decryptFailed'), 'error');
    } finally {
      messageBytes?.fill(0);
      padded?.fill(0);
      busy = false;
    }
  }

  async function decrypt() {
    if (busy) return;
    const password = $('decryptPassword').value;
    const cipher = $('cipherMessage').value.trim();
    hideOutput();
    resetField('decryptedOutput');
    if (!password || !cipher) return status('decryptStatus', t('fillCipher'), 'warn');
    busy = true;
    let plain = null;
    try {
      let payload;
      try { payload = parsePayload(cipher); } catch (error) { throw new Error('format'); }
      if (!isUltraPayload(payload)) return status('decryptStatus', text('ultraOnly'), 'error');
      if (!ultraPasswordOk(password)) return status('decryptStatus', text('minPassword'), 'warn');
      if (payload.alg !== ULTRA_ALG || payload.iter !== ULTRA_ITERATIONS) throw new Error('params');
      const salt = unb64(payload.salt);
      const iv = unb64(payload.iv);
      if (salt.length !== ULTRA_SALT_BYTES || iv.length !== ULTRA_IV_BYTES) throw new Error('params');
      const key = await deriveUltraKey(password, salt);
      const header = { v: payload.v, alg: payload.alg, iter: payload.iter, salt: payload.salt, iv: payload.iv };
      plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad(header), tagLength: 128 }, key, unb64(payload.data)));
      if (!active) return;
      $('decryptedOutput').value = dec.decode(unpad(plain));
      autoGrow($('decryptedOutput'));
      resetField('decryptPassword');
      updateStrength('decryptPassword', 'decryptStrength', 'decryptMeter');
      status('decryptStatus', text('unlocked'), 'ok');
      clearTimeout(revealTimer);
      revealTimer = setTimeout(() => { hideOutput(); resetField('decryptedOutput'); status('decryptStatus', text('wiped'), 'warn'); }, REVEAL_WIPE_MS);
    } catch (error) {
      resetField('decryptedOutput');
      status('decryptStatus', t('decryptFailed'), 'error');
    } finally {
      plain?.fill(0);
      busy = false;
    }
  }

  function scheduleClipboardClear() {
    clearTimeout(clipboardTimer);
    clipboardTimer = setTimeout(() => {
      try { navigator.clipboard?.writeText(''); } catch (error) {}
    }, CLIPBOARD_CLEAR_MS);
  }

  async function copy(sourceId, statusId, button) {
    if (!COPY_ALLOWED.has(sourceId)) return status(statusId, text('blocked'), 'warn');
    const value = $(sourceId)?.value;
    if (!value) return status(statusId, t('copyEmpty'), 'warn');
    const nativeCopy = native('copySensitiveText');
    let ok = false;
    if (nativeCopy) {
      try { ok = !!nativeCopy(value); } catch (error) { ok = false; }
    }
    if (!ok) {
      try { await navigator.clipboard.writeText(value); ok = true; scheduleClipboardClear(); } catch (error) { ok = false; }
    }
    if (!ok) return status(statusId, text('blocked'), 'warn');
    if (typeof markCopied === 'function') markCopied(button);
    status(statusId, text('copiedTimed'), 'ok');
  }

  function canPaste(targetId) {
    return PASTE_ALLOWED.has(targetId);
  }

  function closeEverything() {
    try { if (typeof stopQrCamera === 'function') stopQrCamera(); } catch (error) {}
    try { if (typeof closeAllQr === 'function') closeAllQr(); } catch (error) {}
    try { if (typeof closeExportMenus === 'function') closeExportMenus(); } catch (error) {}
    if ($('transferScannerModal')?.classList.contains('active')) $('transferCloseScanner')?.click();
    if ($('transferPasswordModal')?.classList.contains('active')) $('transferClosePassword')?.click();
    document.querySelectorAll('.modal-backdrop.active').forEach((modal) => modal.classList.remove('active'));
    if (document.querySelector('.tab.active')?.dataset.tab === 'transfer' && typeof switchTab === 'function') switchTab('decrypt');
  }

  function wipe(reason = '') {
    clearTimeout(revealTimer);
    hideOutput();
    try { if (typeof clearSensitiveData === 'function') clearSensitiveData(); } catch (error) {}
    SENSITIVE_IDS.forEach(resetField);
    if (active) closeEverything();
    try { window.getSelection()?.removeAllRanges(); } catch (error) {}
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    if (reason === 'idle') status('decryptStatus', text('wiped'), 'warn');
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    if (active) idleTimer = setTimeout(() => wipe('idle'), IDLE_WIPE_MS);
  }

  function hardenInputs(enabled) {
    ['plainMessage', 'decryptedOutput', 'encryptPassword', 'decryptPassword', 'cipherMessage', 'encryptedOutput'].forEach((id) => {
      const element = $(id);
      if (!element) return;
      if (enabled) {
        element.setAttribute('autocomplete', 'off');
        element.setAttribute('autocorrect', 'off');
        element.setAttribute('autocapitalize', 'off');
        element.setAttribute('spellcheck', 'false');
        element.setAttribute('data-gramm', 'false');
        element.setAttribute('data-enable-grammarly', 'false');
      }
    });
  }

  function applyTexts() {
    const button = $('ultraModeButton');
    if (button) {
      button.setAttribute('aria-label', text('label'));
      button.title = text('label');
      button.setAttribute('aria-pressed', String(active));
    }
    const banner = $('ultraBanner');
    if (banner) banner.textContent = text('banner');
    const reveal = $('ultraReveal');
    if (reveal) reveal.textContent = text('hold');
  }

  function setActive(enabled) {
    enabled = !!enabled;
    if (enabled === active) return;
    wipe();
    active = enabled;
    document.body.classList.toggle('ultra', active);
    $('ultraBanner').hidden = !active;
    hardenInputs(active);
    if (active) closeEverything();
    try { native('setUltraMode')?.(active); } catch (error) {}
    applyTexts();
    resetIdle();
    if (typeof showToast === 'function') showToast(text(active ? 'toggleOn' : 'toggleOff'), active ? 'ok' : 'warn');
  }

  function guarded(event) {
    if (!active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function targetId(event) {
    const target = event.target;
    return target && target.id ? target.id : '';
  }

  // Global enforcement while ultra mode is active.
  document.addEventListener('copy', guarded, true);
  document.addEventListener('cut', guarded, true);
  document.addEventListener('contextmenu', guarded, true);
  document.addEventListener('dragstart', guarded, true);
  document.addEventListener('drop', guarded, true);
  document.addEventListener('dragover', guarded, true);
  document.addEventListener('paste', (event) => { if (active && !canPaste(targetId(event))) guarded(event); }, true);
  document.addEventListener('beforeinput', (event) => {
    if (!active) return;
    const type = event.inputType || '';
    if ((type.startsWith('insertFromPaste') || type === 'insertFromDrop' || type === 'insertFromYank' || type === 'deleteByCut') && !canPaste(targetId(event))) guarded(event);
  }, true);
  document.addEventListener('select', (event) => {
    if (!active || canPaste(targetId(event))) return;
    const element = event.target;
    if (element && typeof element.setSelectionRange === 'function' && element.selectionStart !== element.selectionEnd) {
      try { element.setSelectionRange(element.selectionEnd, element.selectionEnd); } catch (error) {}
    }
  }, true);
  document.addEventListener('keydown', (event) => {
    if (!active) return;
    resetIdle();
    const key = (event.key || '').toLowerCase();
    if (key === 'printscreen') { wipe(); guarded(event); return; }
    if ((event.ctrlKey || event.metaKey) && ['c', 'x', 'p', 's', 'a'].includes(key)) guarded(event);
    if ((event.ctrlKey || event.metaKey) && key === 'v' && !canPaste(targetId(event))) guarded(event);
  }, true);
  ['pointerdown', 'input', 'touchstart', 'wheel'].forEach((name) => document.addEventListener(name, resetIdle, { capture: true, passive: true }));

  // Any way of leaving the app wipes everything.
  const leave = () => { if (active) wipe('leave'); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') leave(); });
  window.addEventListener('blur', leave);
  window.addEventListener('pagehide', leave);
  window.addEventListener('freeze', leave);
  window.addEventListener('beforeprint', leave);
  window.addEventListener('beforeunload', leave);

  function bindUi() {
    $('ultraModeButton')?.addEventListener('click', () => setActive(!active));
    $('languageButton')?.addEventListener('click', applyTexts);
    const reveal = $('ultraReveal');
    if (reveal) {
      const show = (event) => { event.preventDefault(); if ($('decryptedOutput').value) $('decryptedOutput').classList.add('ultra-revealed'); };
      reveal.addEventListener('pointerdown', show);
      ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach((name) => reveal.addEventListener(name, hideOutput));
      reveal.addEventListener('contextmenu', (event) => event.preventDefault());
    }
    applyTexts();
  }

  window.SecretChatUltra = Object.freeze({
    get active() { return active; },
    encrypt,
    decrypt,
    copy,
    canPaste,
    isUltraPayload,
    text,
    wipe,
    setActive
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindUi);
  else bindUi();
})();
