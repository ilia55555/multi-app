const VERSION = 'SecretChat-v2';
const ITERATIONS = 1000000;
const MIN_PASSWORD_LENGTH = 4;
const MIN_GENERATED_PASSWORD_LENGTH = 64;
const MAX_GENERATED_PASSWORD_LENGTH = 256;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PREF_THEME_KEY = 'secretchat-theme';
const PREF_LANGUAGE_KEY = 'secretchat-language';
const PREF_QR_ENGINE_KEY = 'secretchat-qr-engine';
const IS_ANDROID_RUNTIME = location.hostname === 'secretchat.local'
  && new URLSearchParams(location.search).get('native') === 'android';
const OUTPUT_FILE_BACKEND = IS_ANDROID_RUNTIME ? 'android' : 'web';
const $ = (id) => document.getElementById(id);

const themes = [
  ['#00e5ff', '#9d4edd'],
  ['#22c55e', '#00e5ff'],
  ['#f97316', '#ef4444'],
  ['#a78bfa', '#ec4899'],
  ['#facc15', '#38bdf8']
];

const i18n = {
  fa: {
    note: 'رمز حداقل ۴ کاراکتر است و حداکثر ندارد؛ برای امنیت بیشتر از رمز تصادفی استفاده کنید.',
    decryptTab: 'بازگشایی', encryptTab: 'رمزگذاری', passwordLabel: 'رمز', encryptedMessageLabel: 'پیام رمزنگاری‌شده',
    finalMessageLabel: 'پیام نهایی', messageLabel: 'پیام', encryptedOutputLabel: 'خروجی رمزنگاری‌شده', copyPassword: 'کپی رمز', pastePassword: 'پیست رمز',
    copyMessage: 'کپی پیام', pasteMessage: 'پیست پیام', copyButton: 'کپی', exportButton: 'خروجی', printButton: 'پرینت', pdfButton: 'PDF', txtButton: 'TXT', exportNameTitle: 'نام فایل خروجی', exportNameLabel: 'نام فایل را بنویسید', saveButton: 'ذخیره', qrEngineLabel: 'موتور اسکن', recommendedEngine: 'ZXing (پیشنهادی)', closeButton: 'بستن', saveQrImageButton: 'ذخیره عکس', qrReaderTitle: 'خواندن QR و بارکد', qrImageLabel: 'انتخاب تصویر QR / بارکد', cameraButton: 'خواندن با دوربین', stopCameraButton: 'توقف دوربین', showScanLog: 'نمایش لاگ', hideScanLog: 'بستن لاگ', scanDebugLabel: 'لاگ عیب‌یابی اسکن', copyScanLog: 'کپی لاگ', clearScanLog: 'پاک کردن لاگ', cameraDenied: 'اجازه دوربین داده نشد.', qrCameraStarted: 'دوربین فعال شد؛ کد را داخل کادر بگیرید.', qrResultLabel: 'متن خوانده‌شده', qrUnsupported: 'موتور اسکن بارگذاری نشد یا دوربین در این مرورگر پشتیبانی نمی‌شود.', qrReadFailed: 'QR یا بارکد خوانده نشد.', qrReadOk: 'کد خوانده شد.', placePassword: 'در رمز', placeCipher: 'در پیام رمزنگاری‌شده', placePlain: 'در پیام عادی', placed: 'جایگذاری شد.', unlockButton: 'باز کردن قفل', encryptButton: 'رمزنگاری', generateButton: 'ساخت رمز سخت',
    clearButton: 'پاک کردن', strengthEmpty: 'حداقل رمز: ۴ کاراکتر؛ حداکثر ندارد.', fillBoth: 'لطفاً رمز و پیام را وارد کنید.',
    fillCipher: 'لطفاً رمز و پیام رمزنگاری‌شده را وارد کنید.', minPassword: 'رمز باید حداقل ۴ کاراکتر باشد؛ حداکثر طول ندارد.',
    encrypted: 'پیام رمزنگاری شد.', unlocked: 'قفل پیام باز شد.', decryptFailed: 'رمز اشتباه است یا پیام خراب/دستکاری شده است.',
    copyEmpty: 'چیزی برای کپی وجود ندارد.', copied: 'کپی شد.', pasteEmpty: 'کلیپ‌بورد خالی است.', pasted: 'پیست شد.', pasteDenied: 'اجازه کلیپ‌بورد داده نشد؛ با Ctrl+V پیست کنید.',
    generated: 'رمز تصادفی ۶۴ تا ۲۵۶ کاراکتری ساخته شد.', downloaded: 'فایل آماده شد.', browserDownloaded: 'فایل آماده شد.', savedIn: () => 'فایل آماده شد.', openFile: 'باز کردن', deleteFile: 'حذف', outputFiles: 'فایل‌های خروجی', importFile: 'وارد کردن فایل یا ZIP', importOutputTitle: 'متن فایل کجا قرار بگیرد؟', importToCipher: 'پیام رمزنگاری‌شده', importToPlain: 'پیام در تب رمزگذاری', importTooLarge: 'حجم فایل برای وارد کردن متن بیشتر از ۵ مگابایت است.', importUnsupported: 'فقط فایل‌های TXT، HTML، JS، CSS، JSON و ZIP قابل وارد کردن هستند.', importedFile: 'متن فایل وارد شد.', fileNameLabel: 'نام فایل:', androidVaultLocation: 'خزانه امن داخلی اندروید', browserVaultLocation: 'فضای امن محلی مرورگر', noOutputFiles: 'هنوز فایل خروجی ساخته نشده است.', deleteConfirm: 'این فایل حذف شود؟', fileDeleted: 'فایل حذف شد.', pdfSaved: 'PDF ذخیره شد.', printReady: 'پنجره چاپ باز شد.', pdfReady: 'برای PDF گزینه Save as PDF را انتخاب کنید.', qrReady: 'QR ساخته شد.', qrImageSaved: 'عکس QR ذخیره شد.', qrEmpty: 'این فیلد خالی است.', qrTooLong: 'متن برای QR خیلی طولانی است؛ فایل را دانلود کنید.', projectImported: 'پروژه بررسی و ذخیره شد؛ می‌توانید بعداً نیز آن را باز کنید.', projectInvalid: 'ZIP معتبر نیست، HTML ندارد یا شامل فایل خطرناک/ساختار ناامن است.', projectTooLarge: 'حداکثر حجم ZIP برابر ۵۰ مگابایت است.', runProject: 'اجرای HTML', projectFiles: (n) => `${n} فایل پروژه`, zipActionTitle: 'با این پروژه چه کاری انجام شود؟', openProject: 'باز کردن', encryptProject: 'رمزگذاری', decryptProject: 'رمزگشایی', extractProject: 'استخراج پروژه', chooseProjectFile: 'کدام فایل؟', projectExtracted: 'پروژه در یک پوشه جدید داخل Documents/SecretChat/projects استخراج شد.', extractFailed: 'استخراج انجام نشد یا انتخاب پوشه پشتیبانی نمی‌شود.', externalOpenFailed: 'مرورگر خارجی باز نشد.', projectReady: (n) => `محتوای ZIP بررسی شد: ${n} فایل قابل استفاده.`, shortRemaining: (n) => `رمز کوتاه است؛ ${n} کاراکتر دیگر لازم است.`, strong: (n) => `امنیت ۱۰۰/۱۰۰؛ طول ${n} کاراکتر.`, okScore: (s) => `رمز قابل قبول است؛ امتیاز ${s}/۱۰۰.`
  },
  en: {
    note: 'Password minimum is 4 characters with no maximum; use a random password for stronger security.',
    decryptTab: 'Decrypt', encryptTab: 'Encrypt', passwordLabel: 'Password', encryptedMessageLabel: 'Encrypted message',
    finalMessageLabel: 'Final message', messageLabel: 'Message', encryptedOutputLabel: 'Encrypted output', copyPassword: 'Copy password', pastePassword: 'Paste password',
    copyMessage: 'Copy message', pasteMessage: 'Paste message', copyButton: 'Copy', exportButton: 'Export', printButton: 'Print', pdfButton: 'PDF', txtButton: 'TXT', exportNameTitle: 'Export file name', exportNameLabel: 'Enter file name', saveButton: 'Save', qrEngineLabel: 'Scan engine', recommendedEngine: 'ZXing (Recommended)', closeButton: 'Close', saveQrImageButton: 'Save image', qrReaderTitle: 'Read QR and barcode', qrImageLabel: 'Choose QR / barcode image', cameraButton: 'Scan with camera', stopCameraButton: 'Stop camera', showScanLog: 'Show log', hideScanLog: 'Hide log', scanDebugLabel: 'Scanner diagnostic log', copyScanLog: 'Copy log', clearScanLog: 'Clear log', cameraDenied: 'Camera permission was denied.', qrCameraStarted: 'Camera started; place the code inside the frame.', qrResultLabel: 'Read text', qrUnsupported: 'Scanner engine failed to load or camera is unsupported in this browser.', qrReadFailed: 'QR or barcode could not be read.', qrReadOk: 'Code read.', placePassword: 'To password', placeCipher: 'To encrypted message', placePlain: 'To plain message', placed: 'Placed.', unlockButton: 'Unlock', encryptButton: 'Encrypt', generateButton: 'Generate strong password',
    clearButton: 'Clear', strengthEmpty: 'Minimum password: 4 characters; no maximum.', fillBoth: 'Enter both password and message.',
    fillCipher: 'Enter both password and encrypted message.', minPassword: 'Password must be at least 4 characters; no maximum length.',
    encrypted: 'Message encrypted.', unlocked: 'Message unlocked.', decryptFailed: 'Wrong password or damaged/tampered message.',
    copyEmpty: 'Nothing to copy.', copied: 'Copied.', pasteEmpty: 'Clipboard is empty.', pasted: 'Pasted.', pasteDenied: 'Clipboard permission denied; use Ctrl+V.',
    generated: 'Random 64-256 character password generated.', downloaded: 'File ready.', browserDownloaded: 'File ready.', savedIn: () => 'File ready.', openFile: 'Open', deleteFile: 'Delete', outputFiles: 'Exported files', importFile: 'Import file or ZIP', importOutputTitle: 'Where should the file text go?', importToCipher: 'Encrypted message', importToPlain: 'Message in Encrypt tab', importTooLarge: 'The text file is larger than the 5 MB import limit.', importUnsupported: 'Only TXT, HTML, JS, CSS, JSON, and ZIP files can be imported.', importedFile: 'File text imported.', fileNameLabel: 'File name:', androidVaultLocation: 'Android private secure vault', browserVaultLocation: 'Browser private local storage', noOutputFiles: 'No exported files yet.', deleteConfirm: 'Delete this file?', fileDeleted: 'File deleted.', pdfSaved: 'PDF saved.', printReady: 'Print window opened.', pdfReady: 'Choose Save as PDF in the print dialog.', qrReady: 'QR created.', qrImageSaved: 'QR image saved.', qrEmpty: 'This field is empty.', qrTooLong: 'Text is too long for QR; download it as a file.', projectImported: 'Project checked and saved; it can be opened again later.', projectInvalid: 'The ZIP is invalid, has no HTML, or contains an unsafe file or structure.', projectTooLarge: 'The ZIP size limit is 50 MB.', runProject: 'Run HTML', projectFiles: (n) => `${n} project files`, zipActionTitle: 'What would you like to do with this project?', openProject: 'Open', encryptProject: 'Encrypt', decryptProject: 'Decrypt', extractProject: 'Extract project', chooseProjectFile: 'Which file?', projectExtracted: 'Project extracted into a new folder under Documents/SecretChat/projects.', extractFailed: 'Extraction failed or folder selection is unsupported.', externalOpenFailed: 'The external browser could not be opened.', projectReady: (n) => `ZIP checked: ${n} usable files.`, shortRemaining: (n) => `Password is short; ${n} more characters needed.`, strong: (n) => `Security 100/100; length ${n} characters.`, okScore: (s) => `Password is acceptable; score ${s}/100.`
  }
};

let themeIndex = Number(localStorage.getItem(PREF_THEME_KEY) || 0) % themes.length;
let language = localStorage.getItem(PREF_LANGUAGE_KEY) || 'fa';
let qrScanner = null;
let qrCameraStarting = false;
let qrCameraStopping = false;
let qrCameraStarted = false;
let qrCameraRunId = 0;
let qrFileScanner = null;
let exportRequest = null;
const usedDownloadNames = {};
const QR_ENGINE_VALUES = ['zxing', 'html5qrcode', 'jsqr', 'qrscanner'];
let selectedQrEngine = localStorage.getItem(PREF_QR_ENGINE_KEY) || 'zxing';
if (!QR_ENGINE_VALUES.includes(selectedQrEngine)) selectedQrEngine = 'zxing';

function t(key, ...args) {
  const value = i18n[language][key];
  return typeof value === 'function' ? value(...args) : value;
}

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password, salt, iterations = ITERATIONS) {
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

let toastTimer = null;

function showToast(message, type, action = null) {
  if (!message || !['ok', 'error'].includes(type)) return;
  const toast = $('appToast');
  toast.textContent = message;
  if (action) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'toast-action'; button.textContent = t('openFile');
    button.addEventListener('click', () => { action(); toast.classList.remove('show'); });
    toast.appendChild(button);
  }
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, type === 'ok' ? 7000 : 4000);
}

function setStatus(id, message, type = '') {
  const element = $(id);
  element.textContent = message;
  element.className = `status ${type}`.trim();
  showToast(message, type);
  if (id === 'qrReaderStatus') updateScanDebugVisibility(type === 'error');
}

function updateScanDebugVisibility(hasError) {
  const button = $('toggleQrDebugLog');
  const panel = $('qrDebugPanel');
  if (!button || !panel) return;
  if (hasError) panel.hidden = false;
  button.textContent = t(panel.hidden ? 'showScanLog' : 'hideScanLog');
  button.setAttribute('aria-expanded', String(!panel.hidden));
}

function toggleScanDebug() {
  const button = $('toggleQrDebugLog');
  const panel = $('qrDebugPanel');
  if (!button || !panel) return;
  panel.hidden = !panel.hidden;
  button.textContent = t(panel.hidden ? 'showScanLog' : 'hideScanLog');
  button.setAttribute('aria-expanded', String(!panel.hidden));
}

function autoGrow(element) {
  element.style.height = 'auto';
  const minHeight = element.classList.contains('reader-result') ? 96 : 108;
  const maxHeight = element.classList.contains('reader-result') ? 220 : 340;
  const nextHeight = Math.min(Math.max(minHeight, element.scrollHeight), maxHeight);
  element.style.height = `${nextHeight}px`;
  element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function passwordScore(password) {
  const uniqueChars = new Set(password).size;
  const variety = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password), /[آ-ی۰-۹]/.test(password)].filter(Boolean).length;
  const lengthScore = Math.min(70, (password.length / MIN_GENERATED_PASSWORD_LENGTH) * 70);
  const varietyScore = Math.min(20, variety * 5);
  const uniqueScore = Math.min(10, uniqueChars / 3);
  const score = Math.min(100, Math.round(lengthScore + varietyScore + uniqueScore));
  return password.length >= MIN_GENERATED_PASSWORD_LENGTH && uniqueChars >= 32 ? Math.max(92, score) : score;
}

function updateStrength(inputId, textId, meterId) {
  const password = $(inputId).value;
  const score = passwordScore(password);
  const remaining = Math.max(0, MIN_PASSWORD_LENGTH - password.length);
  $(meterId).style.width = `${score}%`;
  if (!password) $(textId).textContent = t('strengthEmpty');
  else if (remaining > 0) $(textId).textContent = t('shortRemaining', remaining);
  else if (score >= 95) $(textId).textContent = t('strong', password.length);
  else $(textId).textContent = t('okScore', score);
}

function validatePassword(password, statusId) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    setStatus(statusId, t('minPassword'), 'warn');
    return false;
  }
  return true;
}

function randomPassword() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-+=?آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی۰۱۲۳۴۵۶۷۸۹';
  const range = MAX_GENERATED_PASSWORD_LENGTH - MIN_GENERATED_PASSWORD_LENGTH + 1;
  const lengthBytes = new Uint32Array(1);
  crypto.getRandomValues(lengthBytes);
  const length = MIN_GENERATED_PASSWORD_LENGTH + (lengthBytes[0] % range);
  const output = [];
  const limit = Math.floor(256 / alphabet.length) * alphabet.length;
  while (output.length < length) {
    const bytes = new Uint8Array(Math.max(64, length - output.length));
    crypto.getRandomValues(bytes);
    bytes.forEach((byte) => {
      if (output.length < length && byte < limit) output.push(alphabet[byte % alphabet.length]);
    });
  }
  return output.join('');
}

async function encryptMessage() {
  const password = $('encryptPassword').value;
  const message = $('plainMessage').value;
  if (!password || !message) return setStatus('encryptStatus', t('fillBoth'), 'warn');
  if (!validatePassword(password, 'encryptStatus')) return;

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(message));
    const payload = { v: VERSION, alg: 'AES-GCM-256/PBKDF2-SHA256', iter: ITERATIONS, salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(encrypted)) };
    $('encryptedOutput').value = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    autoGrow($('encryptedOutput'));
    setStatus('encryptStatus', t('encrypted'), 'ok');
  } catch (error) {
    writeAppLog('encryptMessage', error);
    setStatus('encryptStatus', error.message, 'error');
  }
}

async function decryptMessage() {
  const password = $('decryptPassword').value;
  const cipher = $('cipherMessage').value.trim();
  if (!password || !cipher) return setStatus('decryptStatus', t('fillCipher'), 'warn');
  if (!validatePassword(password, 'decryptStatus')) return;

  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(cipher))));
    if (!['SecretChat-v1', VERSION].includes(payload.v)) throw new Error('Unsupported payload');
    const key = await deriveKey(password, base64ToBytes(payload.salt), payload.iter || ITERATIONS);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(payload.iv) }, key, base64ToBytes(payload.data));
    $('decryptedOutput').value = decoder.decode(decrypted);
    autoGrow($('decryptedOutput'));
    setStatus('decryptStatus', t('unlocked'), 'ok');
  } catch (error) {
    $('decryptedOutput').value = '';
    autoGrow($('decryptedOutput'));
    setStatus('decryptStatus', t('decryptFailed'), 'error');
  }
}

function markCopied(button) {
  if (!button) return;
  button.classList.add('copied');
  setTimeout(() => button.classList.remove('copied'), 1200);
}

async function copyText(sourceId, statusId, button) {
  const value = $(sourceId).value;
  if (!value) return setStatus(statusId, t('copyEmpty'), 'warn');
  await navigator.clipboard.writeText(value);
  markCopied(button);
  setStatus(statusId, t('copied'), 'ok');
}

async function readClipboardText() {
  const pasteClipboardText = androidBridge('pasteClipboardText');
  if (pasteClipboardText) {
    const nativeValue = pasteClipboardText();
    if (nativeValue) return nativeValue;
  }
  try {
    if (navigator.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (error) {
    writeAppLog('navigator.clipboard.readText', error);
  }
  return '';
}

async function pasteText(targetId, statusId) {
  try {
    const value = await readClipboardText();
    if (!value) return setStatus(statusId, t('pasteEmpty'), 'warn');
    $(targetId).value = value;
    $(targetId).dispatchEvent(new Event('input'));
    setStatus(statusId, t('pasted'), 'ok');
  } catch (error) {
    setStatus(statusId, t('pasteDenied'), 'warn');
  }
}


function sanitizeFilePart(value) {
  return (value || '')
    .trim()
    .replace(/\.[A-Za-z0-9]{1,8}$/u, '')
    .replace(/[\\/:*?"<>|\u0000-\u001F]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function shortHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).slice(0, 6);
}

function compactDateStamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function extractHtmlTitle(text) {
  return text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    ?.trim();
}

function extractJsonName(text) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed.name || parsed.title || parsed.project || parsed.app || parsed.id;
    }
  } catch (error) {}
  return '';
}

function extractCodeName(text) {
  return text.match(/(?:^|\n)\s*(?:\/\/|\/\*|#)\s*(?:@?name|title|project)\s*[:=-]\s*([^\n*]+)/i)?.[1]?.trim()
    || text.match(/(?:function|class)\s+([A-Za-z_$][\w$]*)/)?.[1]
    || text.match(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/)?.[1];
}

function inferFileBase(text, sourceId, type) {
  const content = text || '';
  const detectors = {
    html: extractHtmlTitle,
    json: extractJsonName,
    js: extractCodeName,
    css: extractCodeName,
    txt: extractCodeName
  };
  const detected = sanitizeFilePart(detectors[type]?.(content));
  const sourceLabel = sanitizeFilePart(sourceId.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
  const hash = shortHash(content);
  if (detected) return `${detected}-${hash}`;
  return `secretchat-${type || 'export'}-${sourceLabel}-${compactDateStamp()}-${hash}`;
}

function uniqueFileName(base, extension) {
  const safeBase = sanitizeFilePart(base) || 'secretchat-export';
  const key = `${safeBase}.${extension}`.toLowerCase();
  const count = usedDownloadNames[key] || 0;
  usedDownloadNames[key] = count + 1;
  return count ? `${safeBase}(${count}).${extension}` : `${safeBase}.${extension}`;
}

function safeFileName(sourceId, extension, customName = '', content = '', type = extension) {
  return uniqueFileName(sanitizeFilePart(customName) || inferFileBase(content, sourceId, type), extension);
}

function exportPayload(value, type) {
  if (type === 'html') return { extension: 'html', mime: 'text/html;charset=utf-8', content: value };
  if (type === 'js') return { extension: 'js', mime: 'text/javascript;charset=utf-8', content: value };
  if (type === 'css') return { extension: 'css', mime: 'text/css;charset=utf-8', content: value };
  if (type === 'json') return { extension: 'json', mime: 'application/json;charset=utf-8', content: value };
  return { extension: 'txt', mime: 'text/plain;charset=utf-8', content: value };
}

function androidBridge(method) {
  if (!IS_ANDROID_RUNTIME) return null;
  return window.AndroidApp && typeof window.AndroidApp[method] === 'function' ? window.AndroidApp[method].bind(window.AndroidApp) : null;
}

function hasNativeOutputVault() {
  const backend = androidBridge('getSecureOutputBackend');
  if (!backend) return false;
  try {
    return backend() === 'android-keystore-v1'
      && Boolean(androidBridge('listSecureOutputFiles'))
      && Boolean(androidBridge('openSecureOutputFile'))
      && Boolean(androidBridge('deleteSecureOutputFile'));
  } catch (error) { return false; }
}

window.SecretChatRuntime = Object.freeze({
  platform: OUTPUT_FILE_BACKEND,
  nativeBridge: (method) => androidBridge(method)
});

function appLogFileName() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `secretchat-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.log`;
}

function errorToLogText(context, error, details = {}) {
  const lines = [
    `time: ${new Date().toISOString()}`,
    `context: ${context}`,
    `url: ${location.href}`,
    `userAgent: ${navigator.userAgent}`,
    `language: ${language}`
  ];
  Object.entries(details).forEach(([key, value]) => lines.push(`${key}: ${String(value)}`));
  if (error) {
    lines.push(`name: ${error.name || 'Error'}`);
    lines.push(`message: ${error.message || String(error)}`);
    if (error.stack) lines.push(`stack:\n${error.stack}`);
  }
  return `${lines.join('\n')}\n`;
}

function writeAppLog(context, error, details = {}) {
  let content = errorToLogText(context, error, details);
  const secrets = [...document.querySelectorAll('[data-toggle-password]')]
    .map((button) => $(button.dataset.togglePassword)?.value || '')
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  secrets.forEach((secret) => { content = content.split(secret).join('[REDACTED]'); });
  try {
    const androidSaveLog = androidBridge('saveLogFile');
    if (androidSaveLog && androidSaveLog(appLogFileName(), content)) return true;
  } catch (logError) {}
  try {
    const key = `secretchat-log-${Date.now()}`;
    localStorage.setItem(key, content.slice(0, 6000));
  } catch (storageError) {}
  console.error('[SecretChat]', context, error, details);
  return false;
}

function savedPathMessage(fileName) {
  const getSaveDirectory = androidBridge('getSaveDirectory');
  if (!getSaveDirectory) return t('browserDownloaded');
  try {
    const directory = getSaveDirectory();
    return directory ? t('savedIn', `${directory}/${fileName}`) : t('downloaded');
  } catch (error) {
    return t('downloaded');
  }
}

function browserDownload(fileName, href) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const outputFileMemory = new Map();
let outputFileDbPromise;

function outputFileDb() {
  if (OUTPUT_FILE_BACKEND !== 'web') return Promise.reject(new Error('INDEXED_DB_DISABLED_ON_ANDROID'));
  if (!('indexedDB' in window)) return Promise.reject(new Error('INDEXED_DB_UNAVAILABLE'));
  if (!outputFileDbPromise) outputFileDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('secretchat-private-outputs', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return outputFileDbPromise;
}

async function outputFileTransaction(mode, operation) {
  const db = await outputFileDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', mode);
    const request = operation(transaction.objectStore('files'));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function listOutputFiles() {
  if (OUTPUT_FILE_BACKEND === 'android') {
    if (!hasNativeOutputVault()) return [];
    const nativeList = androidBridge('listSecureOutputFiles');
    try {
      const records = JSON.parse(nativeList());
      return Array.isArray(records) ? records.sort((a, b) => b.createdAt - a.createdAt) : [];
    } catch (error) { return []; }
  }
  try { return (await outputFileTransaction('readonly', (store) => store.getAll())).sort((a, b) => b.createdAt - a.createdAt); }
  catch (error) { return [...outputFileMemory.values()].sort((a, b) => b.createdAt - a.createdAt); }
}

async function openOutputFile(id) {
  if (OUTPUT_FILE_BACKEND === 'android') {
    if (!hasNativeOutputVault()) return;
    const nativeOpen = androidBridge('openSecureOutputFile');
    nativeOpen(id);
    return;
  }
  let record;
  try { record = await outputFileTransaction('readonly', (store) => store.get(id)); } catch (error) { record = outputFileMemory.get(id); }
  if (!record?.blob) return;
  const safeInlineType = /^(?:image\/(?:png|jpeg|gif|webp)|application\/pdf)(?:$|;)/iu.test(record.type);
  const safeTextPreview = /^(?:text\/|application\/(?:json|javascript))(?:$|;)/iu.test(record.type);
  const previewBlob = safeInlineType
    ? record.blob
    : safeTextPreview ? new Blob([await record.blob.text()], { type: 'text/plain;charset=utf-8' }) : record.blob;
  const url = URL.createObjectURL(previewBlob);
  const link = document.createElement('a');
  link.href = url; link.target = '_blank'; link.rel = 'noopener';
  if (!safeInlineType && !safeTextPreview) link.download = record.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function deleteOutputFile(id) {
  if (!window.confirm(t('deleteConfirm'))) return;
  if (OUTPUT_FILE_BACKEND === 'android') {
    if (!hasNativeOutputVault()) return;
    const nativeDelete = androidBridge('deleteSecureOutputFile');
    nativeDelete(id);
    await renderOutputFiles();
    return;
  }
  try { await outputFileTransaction('readwrite', (store) => store.delete(id)); } catch (error) { outputFileMemory.delete(id); }
  await renderOutputFiles();
}

let pendingImportedText = '';

function requestOutputFileImport() {
  $('outputFileImport').value = '';
  $('outputFileImport').click();
}

async function prepareOutputFileImport(file) {
  if (!file) return;
  if (/\.zip$/iu.test(file.name) || /(?:^|\/)zip(?:$|;)/iu.test(file.type)) return importZipProject(file);
  if (!/\.(?:txt|html?|js|css|json)$/iu.test(file.name)) return showToast(t('importUnsupported'), 'error');
  if (file.size > 5 * 1024 * 1024) return showToast(t('importTooLarge'), 'error');
  pendingImportedText = await file.text();
  $('importOutputFileName').textContent = file.name;
  $('importOutputModal').classList.add('active');
}

function receiveExternalText(base64, name) {
  if (!IS_ANDROID_RUNTIME || typeof base64 !== 'string') return false;
  try {
    const bytes = base64ToBytes(base64);
    if (bytes.byteLength > 5 * 1024 * 1024) return false;
    pendingImportedText = decoder.decode(bytes);
    $('importOutputFileName').textContent = typeof name === 'string' ? name : 'imported.txt';
    $('importOutputModal').classList.add('active');
    return true;
  } catch (error) { return false; }
}

function closeOutputFileImport() {
  pendingImportedText = '';
  $('importOutputModal').classList.remove('active');
}

function placeImportedText(targetId, tab, statusId) {
  if (!pendingImportedText) return closeOutputFileImport();
  $(targetId).value = pendingImportedText;
  $(targetId).dispatchEvent(new Event('input'));
  switchTab(tab);
  closeOutputFileImport();
  setStatus(statusId, t('importedFile'), 'ok');
}

async function renderOutputFiles() {
  const records = await listOutputFiles();
  try {
    const projects = await projectTransaction('readonly', (store) => store.getAll());
    projects.forEach((record) => records.push({ ...record, project: true, type: 'application/zip', size: record.blob?.size || 0 }));
    records.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) { /* Project storage is unavailable. */ }
  document.querySelectorAll('[data-output-files]').forEach((container) => {
    container.replaceChildren();
    const header = document.createElement('div'); header.className = 'output-files-head';
    const title = document.createElement('h2'); title.textContent = t('outputFiles');
    const importButton = document.createElement('button'); importButton.type = 'button'; importButton.className = 'ghost output-file-import'; importButton.textContent = t('importFile'); importButton.addEventListener('click', requestOutputFileImport);
    header.append(title, importButton); container.appendChild(header);
    if (!records.length) {
      const empty = document.createElement('p'); empty.className = 'output-file-empty'; empty.textContent = t('noOutputFiles'); container.appendChild(empty); return;
    }
    const list = document.createElement('div'); list.className = 'output-file-list';
    records.forEach((record) => {
      const row = document.createElement('article'); row.className = 'output-file-row';
      const info = document.createElement('div'); info.className = 'output-file-info';
      const name = document.createElement('strong'); name.className = 'output-file-name';
      const nameLabel = document.createElement('span'); nameLabel.className = 'output-file-name-label'; nameLabel.textContent = t('fileNameLabel');
      const nameValue = document.createElement('bdi'); nameValue.className = 'output-file-name-value'; nameValue.textContent = record.name || '—'; nameValue.title = record.name || '';
      name.append(nameLabel, nameValue);
      const locationLabel = record.native ? t('androidVaultLocation') : t('browserVaultLocation');
      const detail = record.project ? t('projectFiles', record.fileCount) : `${Math.ceil(record.size / 1024)} KB`;
      const meta = document.createElement('span'); meta.className = 'output-file-meta'; meta.textContent = `${locationLabel} • ${new Date(record.createdAt).toLocaleString(language)} • ${detail}`;
      info.append(name, meta);
      const actions = document.createElement('div'); actions.className = 'output-file-actions';
      const open = document.createElement('button'); open.type = 'button'; open.className = 'primary'; open.textContent = t('openFile'); open.addEventListener('click', () => record.project ? askZipProjectAction(record.id) : openOutputFile(record.id));
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'danger'; remove.textContent = t('deleteFile'); remove.addEventListener('click', () => record.project ? deleteZipProject(record.id) : deleteOutputFile(record.id));
      actions.append(open, remove); row.append(info, actions); list.appendChild(row);
    });
    container.appendChild(list);
  });
}

async function registerOutputFile(name, blob) {
  if (OUTPUT_FILE_BACKEND === 'android') {
    if (!hasNativeOutputVault()) return null;
    const records = await listOutputFiles();
    await renderOutputFiles();
    const record = records.find((item) => item.name === name);
    showToast(t('downloaded'), 'ok', record ? () => openOutputFile(record.id) : null);
    return record || null;
  }
  const record = { id: `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`, name, type: blob.type || 'application/octet-stream', size: blob.size, createdAt: Date.now(), blob };
  try { await outputFileTransaction('readwrite', (store) => store.put(record)); } catch (error) { outputFileMemory.set(record.id, record); }
  await renderOutputFiles();
  showToast(t('downloaded'), 'ok', () => openOutputFile(record.id));
  return record;
}

window.SecretChatOutputs = { add: registerOutputFile, open: openOutputFile, refresh: renderOutputFiles };

const ZIP_PROJECT_LIMIT = 50 * 1024 * 1024;
const ZIP_EXPANDED_LIMIT = 200 * 1024 * 1024;
const ZIP_ENTRY_LIMIT = 2000;
const BLOCKED_PROJECT_FILE = /\.(?:apk|app|bat|bin|cmd|com|cpl|dll|dmg|exe|hta|jar|jscript|lnk|msi|msp|pif|ps1|reg|scr|sh|sys|vbs|vbe|wsf|wsh)$/iu;
const TEXT_PROJECT_FILE = /\.(?:html?|css|js|mjs|json|svg|txt|md|xml)$/iu;
let projectDbPromise;
let pendingProjectId = '';
let pendingProjectFiles = null;
let projectFileChoiceAction = null;

function projectDb() {
  if (!projectDbPromise) projectDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('secretchat-zip-projects', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('projects', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return projectDbPromise;
}

async function projectTransaction(mode, operation) {
  const db = await projectDb();
  return new Promise((resolve, reject) => {
    const request = operation(db.transaction('projects', mode).objectStore('projects'));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function normalizedZipPath(path) {
  const parts = path.replaceAll('\\', '/').split('/');
  const clean = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') throw new Error('ZIP_PATH_TRAVERSAL');
    clean.push(part);
  }
  return clean.join('/');
}

async function unzipProject(blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let end = -1;
  for (let offset = Math.max(0, bytes.length - 65557); offset <= bytes.length - 22; offset += 1) {
    if (view.getUint32(offset, true) === 0x06054b50) end = offset;
  }
  if (end < 0) throw new Error('INVALID_ZIP');
  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  if (!count || count === 0xffff || count > ZIP_ENTRY_LIMIT) throw new Error('ZIP_ENTRY_LIMIT');
  const files = new Map();
  let expandedSize = 0;
  for (let index = 0; index < count; index += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) throw new Error('INVALID_DIRECTORY');
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const externalAttributes = view.getUint32(offset + 38, true);
    const localOffset = view.getUint32(offset + 42, true);
    const nameEnd = offset + 46 + nameLength;
    if (nameEnd > bytes.length) throw new Error('INVALID_NAME');
    const name = normalizedZipPath(decoder.decode(bytes.subarray(offset + 46, nameEnd)));
    offset = nameEnd + extraLength + commentLength;
    if (!name || name.endsWith('/')) continue;
    const unixMode = externalAttributes >>> 16;
    if ((unixMode & 0xf000) === 0xa000 || BLOCKED_PROJECT_FILE.test(name)) throw new Error('UNSAFE_ENTRY');
    if ((flags & 1) || ![0, 8].includes(method) || size === 0xffffffff || compressedSize === 0xffffffff) throw new Error('UNSUPPORTED_ZIP');
    expandedSize += size;
    if (expandedSize > ZIP_EXPANDED_LIMIT || (compressedSize && size / compressedSize > 200)) throw new Error('ZIP_BOMB');
    if (localOffset + 30 > bytes.length || view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('INVALID_LOCAL_ENTRY');
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    if (start + compressedSize > bytes.length) throw new Error('INVALID_ENTRY_DATA');
    const compressed = bytes.slice(start, start + compressedSize);
    let content = compressed;
    if (method === 8) {
      if (typeof DecompressionStream !== 'function') throw new Error('DEFLATE_UNSUPPORTED');
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      content = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    if (content.length !== size) throw new Error('INVALID_ENTRY_SIZE');
    files.set(name, content);
  }
  if (![...files.keys()].some((name) => /\.html?$/iu.test(name))) throw new Error('HTML_REQUIRED');
  return files;
}

function relativeProjectPath(from, target) {
  if (/^(?:[a-z]+:|\/\/|#|data:|blob:)/iu.test(target)) return '';
  const base = from.split('/').slice(0, -1).join('/');
  try { return normalizedZipPath(`${base}/${decodeURIComponent(target.split(/[?#]/u)[0])}`); }
  catch (error) { return ''; }
}

function projectMime(name) {
  const extension = name.split('.').pop().toLowerCase();
  return ({ html: 'text/html', htm: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', ico: 'image/x-icon', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', mp3: 'audio/mpeg', mp4: 'video/mp4', webm: 'video/webm', pdf: 'application/pdf' })[extension] || 'application/octet-stream';
}

function bytesDataUrl(name, bytes) {
  return `data:${projectMime(name)};base64,${bytesToBase64(bytes)}`;
}

function inlineProjectCss(css, cssName, files) {
  return css.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/giu, (match, quote, target) => {
    const path = relativeProjectPath(cssName, target);
    return path && files.has(path) ? `url("${bytesDataUrl(path, files.get(path))}")` : match;
  });
}

function standaloneProjectHtml(files, htmlName, pageUrls = new Map()) {
  let html = decoder.decode(files.get(htmlName));
  html = html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*)>/giu, (tag, before, href) => {
    const path = relativeProjectPath(htmlName, href);
    if (!path || !files.has(path)) return tag;
    if (/\.css$/iu.test(path)) return `<style>${inlineProjectCss(decoder.decode(files.get(path)), path, files).replace(/<\/style/giu, '<\\/style')}</style>`;
    return tag.replace(href, bytesDataUrl(path, files.get(path)));
  });
  html = html.replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/script>/giu, (tag, before, src) => {
    const path = relativeProjectPath(htmlName, src);
    return path && files.has(path) ? `<script>${decoder.decode(files.get(path)).replace(/<\/script/giu, '<\\/script')}</script>` : tag;
  });
  html = html.replace(/\b(src|poster)=["']([^"']+)["']/giu, (tag, attribute, target) => {
    const path = relativeProjectPath(htmlName, target);
    return path && files.has(path) ? `${attribute}="${bytesDataUrl(path, files.get(path))}"` : tag;
  });
  html = html.replace(/\bhref=["']([^"']+)["']/giu, (tag, target) => {
    const path = relativeProjectPath(htmlName, target);
    return path && pageUrls.has(path) ? `href="${pageUrls.get(path)}"` : tag;
  });
  return html;
}

function externalProjectHtml(files, entryName) {
  const htmlNames = [...files.keys()].filter((name) => /\.html?$/iu.test(name));
  let pageUrls = new Map(htmlNames.map((name) => [name, bytesDataUrl(name, encoder.encode(standaloneProjectHtml(files, name)))]));
  pageUrls = new Map(htmlNames.map((name) => [name, bytesDataUrl(name, encoder.encode(standaloneProjectHtml(files, name, pageUrls)))]));
  return standaloneProjectHtml(files, entryName, pageUrls);
}

async function openProjectInExternalBrowser(entryName) {
  if (!pendingProjectFiles?.has(entryName)) return;
  const html = externalProjectHtml(pendingProjectFiles, entryName);
  const nativeOpen = androidBridge('openExternalHtml');
  closeProjectFileChoice();
  closeZipAction();
  if (nativeOpen) {
    if (!nativeOpen(entryName.split('/').pop(), bytesToBase64(encoder.encode(html)))) showToast(t('externalOpenFailed'), 'error');
    return;
  }
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer external';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function closeProjectFileChoice() {
  $('projectFileChoiceModal').classList.remove('active');
  $('projectFileChoices').replaceChildren();
  projectFileChoiceAction = null;
}

function chooseProjectFile(names, action) {
  if (names.length === 1) return action(names[0]);
  projectFileChoiceAction = action;
  const container = $('projectFileChoices');
  container.replaceChildren();
  names.forEach((name) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'ghost'; button.textContent = name;
    button.addEventListener('click', () => projectFileChoiceAction?.(name));
    container.appendChild(button);
  });
  $('projectFileChoiceModal').classList.add('active');
}

async function askZipProjectAction(id) {
  try {
    const record = await projectTransaction('readonly', (store) => store.get(id));
    pendingProjectFiles = await unzipProject(record.blob);
    pendingProjectId = id;
    $('zipActionSummary').textContent = `${record.name} — ${t('projectReady', pendingProjectFiles.size)}`;
    $('zipActionModal').classList.add('active');
  } catch (error) { showToast(t('projectInvalid'), 'error'); }
}

function closeZipAction() {
  $('zipActionModal').classList.remove('active');
  closeProjectFileChoice();
  pendingProjectId = '';
  pendingProjectFiles = null;
}

function placeProjectFile(name, targetId, tab, statusId) {
  if (!pendingProjectFiles?.has(name)) return;
  $(targetId).value = decoder.decode(pendingProjectFiles.get(name));
  $(targetId).dispatchEvent(new Event('input'));
  closeProjectFileChoice(); closeZipAction(); switchTab(tab);
  setStatus(statusId, t('importedFile'), 'ok');
}

async function extractZipProject() {
  if (!pendingProjectId || !pendingProjectFiles) return;
  const record = await projectTransaction('readonly', (store) => store.get(pendingProjectId));
  const nativeExtract = androidBridge('extractZipProject');
  if (nativeExtract) {
    const ok = nativeExtract(record.name, bytesToBase64(new Uint8Array(await record.blob.arrayBuffer())));
    showToast(ok ? t('projectExtracted') : t('extractFailed'), ok ? 'ok' : 'error');
    if (ok) closeZipAction();
    return;
  }
  try {
    if (!window.showDirectoryPicker) throw new Error('DIRECTORY_PICKER_UNAVAILABLE');
    const selectedDirectory = await window.showDirectoryPicker({ mode: 'readwrite' });
    const appDirectory = await selectedDirectory.getDirectoryHandle('SecretChat', { create: true });
    const projectsDirectory = await appDirectory.getDirectoryHandle('projects', { create: true });
    const projectFolderName = `${sanitizeFilePart(record.name) || 'project'}-${Date.now()}-${shortHash(record.id)}`;
    const root = await projectsDirectory.getDirectoryHandle(projectFolderName, { create: true });
    for (const [path, bytes] of pendingProjectFiles) {
      const parts = path.split('/');
      let directory = root;
      for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part, { create: true });
      const handle = await directory.getFileHandle(parts.at(-1), { create: true });
      const writer = await handle.createWritable(); await writer.write(bytes); await writer.close();
    }
    showToast(t('projectExtracted'), 'ok'); closeZipAction();
  } catch (error) { showToast(t('extractFailed'), 'error'); }
}

async function deleteZipProject(id) {
  if (!window.confirm(t('deleteConfirm'))) return;
  await projectTransaction('readwrite', (store) => store.delete(id));
  renderOutputFiles();
}

async function importZipProject(file) {
  if (!file) return;
  if (file.size > ZIP_PROJECT_LIMIT) return showToast(t('projectTooLarge'), 'error');
  try {
    const files = await unzipProject(file);
    const record = { id: `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`, name: file.name, fileCount: files.size, createdAt: Date.now(), blob: file };
    await projectTransaction('readwrite', (store) => store.put(record));
    await renderOutputFiles();
    showToast(t('projectImported'), 'ok');
    askZipProjectAction(record.id);
  } catch (error) { showToast(t('projectInvalid'), 'error'); }
}


function utf16Hex(text) {
  const bytes = [0xFE, 0xFF];
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code > 0xFFFF) {
      const value = code - 0x10000;
      const high = 0xD800 + (value >> 10);
      const low = 0xDC00 + (value & 0x3FF);
      bytes.push(high >> 8, high & 0xFF, low >> 8, low & 0xFF);
    } else {
      bytes.push(code >> 8, code & 0xFF);
    }
  }
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function pdfEscape(text) {
  return text.replace(/[\\()]/g, '\\$&');
}

function makeSimplePdf(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').slice(0, 120);
  const content = ['BT', '/F1 12 Tf', '50 790 Td', '16 TL'];
  lines.forEach((line, index) => {
    if (index > 0) content.push('T*');
    content.push(`<${utf16Hex(line.slice(0, 160))}> Tj`);
  });
  content.push('ET');
  const stream = content.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function binaryToBase64(binary) {
  return btoa(unescape(encodeURIComponent(binary)));
}

async function savePdfFile(sourceId, statusId) {
  const value = $(sourceId).value;
  if (!value) return setStatus(statusId, t('qrEmpty'), 'warn');
  const fileName = safeFileName(sourceId, 'pdf');
  const pdf = makeSimplePdf(value);
  const bytes = Uint8Array.from(pdf, (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const androidSaveBase64 = androidBridge('saveBase64File');
  if (androidSaveBase64) {
    const ok = androidSaveBase64(fileName, binaryToBase64(pdf), 'application/pdf');
    setStatus(statusId, ok ? t('pdfSaved') : t('pasteDenied'), ok ? 'ok' : 'error');
    if (ok) await registerOutputFile(fileName, blob);
    return;
  }
  const url = URL.createObjectURL(blob);
  browserDownload(fileName, url);
  URL.revokeObjectURL(url);
  setStatus(statusId, t('pdfSaved'), 'ok');
  await registerOutputFile(fileName, blob);
}

async function saveExportFile(sourceId, statusId, type, customName = '') {
  const value = $(sourceId).value;
  if (!value) return setStatus(statusId, t('qrEmpty'), 'warn');
  const payload = exportPayload(value, type);
  const fileName = safeFileName(sourceId, payload.extension, customName, value, type);
  const androidSave = androidBridge('saveCustomBackup');
  const androidSaveBase64 = androidBridge('saveBase64File');
  const blob = new Blob([payload.content], { type: payload.mime });
  if (androidSaveBase64 && type !== 'txt') {
    const ok = androidSaveBase64(fileName, btoa(unescape(encodeURIComponent(payload.content))), payload.mime.split(';')[0]);
    setStatus(statusId, ok ? savedPathMessage(fileName) : t('pasteDenied'), ok ? 'ok' : 'error');
    if (ok) await registerOutputFile(fileName, blob);
    return;
  }
  if (androidSave) {
    const ok = androidSave(fileName, payload.content);
    setStatus(statusId, ok ? savedPathMessage(fileName) : t('pasteDenied'), ok ? 'ok' : 'error');
    if (ok) await registerOutputFile(fileName, blob);
    return;
  }
  const url = URL.createObjectURL(blob);
  browserDownload(fileName, url);
  URL.revokeObjectURL(url);
  setStatus(statusId, savedPathMessage(fileName), 'ok');
  await registerOutputFile(fileName, blob);
}

function openExportNameModal(sourceId, statusId, type) {
  const value = $(sourceId).value;
  if (!value) return setStatus(statusId, t('qrEmpty'), 'warn');
  exportRequest = { sourceId, statusId, type };
  $('exportFileName').value = '';
  $('exportNameModal').classList.add('active');
  setTimeout(() => $('exportFileName').focus(), 0);
}

function closeExportNameModal() {
  exportRequest = null;
  $('exportNameModal').classList.remove('active');
}

function confirmExportNameModal() {
  if (!exportRequest) return closeExportNameModal();
  const { sourceId, statusId, type } = exportRequest;
  const customName = $('exportFileName').value;
  closeExportNameModal();
  saveExportFile(sourceId, statusId, type, customName);
}

function printField(sourceId, statusId, asPdf = false) {
  const value = $(sourceId).value;
  if (!value) return setStatus(statusId, t('qrEmpty'), 'warn');
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return setStatus(statusId, t('pasteDenied'), 'warn');
  const escaped = value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
  win.document.write(`<!doctype html><html lang="${language}" dir="rtl"><head><meta charset="utf-8"><title>SecretChat</title><style>body{font-family:Tahoma,Arial,sans-serif;white-space:pre-wrap;line-height:1.8;padding:32px;direction:rtl;text-align:right;color:#111}</style></head><body>${escaped}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  setStatus(statusId, asPdf ? t('pdfReady') : t('printReady'), 'ok');
}

function exportField(sourceId, statusId, type) {
  closeExportMenus();
  openExportNameModal(sourceId, statusId, type);
}

function closeExportMenus() {
  document.querySelectorAll('.export-wrap.active').forEach((wrap) => wrap.classList.remove('active'));
}

function getQrBox(sourceId) {
  return $(`${sourceId}Qr`);
}

function closeQr(sourceId) {
  const box = getQrBox(sourceId);
  if (box) {
    box.classList.remove('active');
    box.dataset.pinned = '';
  }
}

function closeAllQr() {
  document.querySelectorAll('.qr-box.active').forEach((box) => {
    box.classList.remove('active');
    box.dataset.pinned = '';
  });
}

function makeQrMatrix(input, options = {}) {
  const rawBytes = input instanceof Uint8Array || input instanceof Uint8ClampedArray || input instanceof ArrayBuffer;
  const bytes = Array.from(input instanceof ArrayBuffer ? new Uint8Array(input) : rawBytes ? input : encoder.encode(String(input)));
  const useWayFold = options.wayfold === true;
  const eccLenTable = useWayFold
    ? [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28]
    : [-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30];
  const blockCountTable = useWayFold
    ? [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49]
    : [-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25];
  const formatEccBits = useWayFold ? 0 : 1;
  const maskPattern = useWayFold ? 4 : 0;
  const gfMul = (x, y) => {
    let z = 0;
    for (let i = 7; i >= 0; i -= 1) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xFF;
  };
  const rawModules = (ver) => {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  };
  const dataCodewords = (ver) => Math.floor(rawModules(ver) / 8) - eccLenTable[ver] * blockCountTable[ver];
  const countBits = (ver) => ver < 10 ? 8 : 16;
  let version = 1;
  for (; version <= 40; version += 1) {
    if (4 + countBits(version) + bytes.length * 8 <= dataCodewords(version) * 8) break;
  }
  if (version > 40) throw new Error('QR_TOO_LONG');

  const bits = [];
  const appendBits = (val, len) => {
    for (let i = len - 1; i >= 0; i -= 1) bits.push((val >>> i) & 1);
  };
  appendBits(4, 4);
  appendBits(bytes.length, countBits(version));
  bytes.forEach((byte) => appendBits(byte, 8));
  const capacity = dataCodewords(version) * 8;
  appendBits(0, Math.min(4, capacity - bits.length));
  appendBits(0, (8 - bits.length % 8) % 8);
  for (let pad = 0xEC; bits.length < capacity; pad ^= 0xEC ^ 0x11) appendBits(pad, 8);
  const data = Array(dataCodewords(version)).fill(0);
  bits.forEach((bit, i) => { data[i >>> 3] |= bit << (7 - (i & 7)); });

  const eccLen = eccLenTable[version];
  const numBlocks = blockCountTable[version];
  const rawCodewords = Math.floor(rawModules(version) / 8);
  const shortBlocks = numBlocks - rawCodewords % numBlocks;
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const divisor = (() => {
    const result = Array(eccLen).fill(0);
    result[eccLen - 1] = 1;
    let root = 1;
    for (let i = 0; i < eccLen; i += 1) {
      for (let j = 0; j < result.length; j += 1) {
        result[j] = gfMul(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = gfMul(root, 2);
    }
    return result;
  })();
  const remainder = (dat) => {
    const result = Array(eccLen).fill(0);
    dat.forEach((byte) => {
      const factor = byte ^ result.shift();
      result.push(0);
      divisor.forEach((coef, i) => { result[i] ^= gfMul(coef, factor); });
    });
    return result;
  };
  const blocks = [];
  for (let i = 0, k = 0; i < numBlocks; i += 1) {
    const datLen = shortBlockLen - eccLen + (i < shortBlocks ? 0 : 1);
    const dat = data.slice(k, k + datLen);
    k += datLen;
    const ecc = remainder(dat);
    if (i < shortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const codewords = [];
  for (let i = 0; i < blocks[0].length; i += 1) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - eccLen || j >= shortBlocks) codewords.push(block[i]);
    });
  }

  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));
  const setFunction = (x, y, dark) => { modules[y][x] = dark; isFunction[y][x] = true; };
  const getBit = (x, i) => ((x >>> i) & 1) !== 0;
  const drawFinder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy += 1) for (let dx = -4; dx <= 4; dx += 1) {
      const x = cx + dx, y = cy + dy;
      if (0 <= x && x < size && 0 <= y && y < size) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFunction(x, y, dist !== 2 && dist !== 4);
      }
    }
  };
  const drawAlign = (cx, cy) => {
    for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  };
  const alignPositions = () => {
    if (version === 1) return [];
    const numAlign = Math.floor(version / 7) + 2;
    const step = Math.floor((version * 8 + numAlign * 3 + 5) / (numAlign * 4 - 4)) * 2;
    const result = [6];
    for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  };
  const drawFormat = (mask) => {
    const dataBits = (formatEccBits << 3) | mask;
    let rem = dataBits;
    for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
    const bits15 = ((dataBits << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i += 1) setFunction(8, i, getBit(bits15, i));
    setFunction(8, 7, getBit(bits15, 6));
    setFunction(8, 8, getBit(bits15, 7));
    setFunction(7, 8, getBit(bits15, 8));
    for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, getBit(bits15, i));
    for (let i = 0; i < 8; i += 1) setFunction(size - 1 - i, 8, getBit(bits15, i));
    for (let i = 8; i < 15; i += 1) setFunction(8, size - 15 + i, getBit(bits15, i));
    setFunction(8, size - 8, true);
  };
  const drawVersion = () => {
    if (version < 7) return;
    let rem = version;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ (((rem >>> 11) & 1) * 0x1F25);
    const bits18 = (version << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const bit = getBit(bits18, i);
      const a = size - 11 + i % 3;
      const b = Math.floor(i / 3);
      setFunction(a, b, bit);
      setFunction(b, a, bit);
    }
  };
  for (let i = 0; i < size; i += 1) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }
  drawFinder(3, 3); drawFinder(size - 4, 3); drawFinder(3, size - 4);
  const pos = alignPositions();
  pos.forEach((x, i) => pos.forEach((y, j) => {
    if (!((i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0))) drawAlign(x, y);
  }));
  drawFormat(maskPattern); drawVersion();
  for (let i = 0, right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) for (let j = 0; j < 2; j += 1) {
      const x = right - j;
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? size - 1 - vert : vert;
      if (!isFunction[y][x] && i < codewords.length * 8) {
        modules[y][x] = getBit(codewords[i >>> 3], 7 - (i & 7));
        i += 1;
      }
    }
  }
  const shouldMask = (x, y) => {
    if (maskPattern === 4) return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    return (x + y) % 2 === 0;
  };
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    if (!isFunction[y][x] && shouldMask(x, y)) modules[y][x] = !modules[y][x];
  }
  drawFormat(maskPattern);
  return modules;
}

function drawQrToCanvas(text, canvas) {
  const modules = makeQrMatrix(text);
  return drawQrModulesToCanvas(modules, canvas, 384);
}

function drawQrBytesToCanvas(bytes, canvas) {
  const modules = makeQrMatrix(bytes, { wayfold: true });
  return drawQrModulesToCanvas(modules, canvas, 1000);
}

function drawQrModulesToCanvas(modules, canvas, targetCssSize = 384) {
  const border = 4;
  const fullModules = modules.length + border * 2;
  const dpr = window.devicePixelRatio || 1;
  const viewportTarget = Math.min(0.9 * Math.min(window.innerWidth, window.innerHeight), targetCssSize);
  const scale = Math.max(1, Math.floor(viewportTarget * dpr / fullModules));
  const size = fullModules * scale;

  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size / dpr}px`;
  canvas.style.height = `${size / dpr}px`;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';

  modules.forEach((row, y) => row.forEach((dark, x) => {
    if (dark) ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
  }));
}

window.drawQrBytesToCanvas = drawQrBytesToCanvas;

function showQr(sourceId, statusId) {
  const value = $(sourceId).value;
  if (!value) return setStatus(statusId, t('qrEmpty'), 'warn');
  const box = getQrBox(sourceId);
  try {
    closeAllQr();
    drawQrToCanvas(value, box.querySelector('canvas'));
    box.classList.add('active');
    setStatus(statusId, t('qrReady'), 'ok');
  } catch (error) {
    setStatus(statusId, error.message === 'QR_TOO_LONG' ? t('qrTooLong') : error.message, 'warn');
  }
}



function toggleQr(sourceId, statusId) {
  const box = getQrBox(sourceId);
  if (box && box.classList.contains('active')) closeQr(sourceId);
  else showQr(sourceId, statusId);
}


const VENDOR_BASE_URL = new URL('./vendor/', document.baseURI);
const vendorUrl = (fileName) => new URL(fileName, VENDOR_BASE_URL).href;
const ZXING_ENGINE_URL = vendorUrl('zxing.min.js');
const BARCODE_ENGINE_URL = vendorUrl('html5-qrcode.min.js');
const QR_ENGINE_URLS = {
  jsqr: vendorUrl('jsQR.min.js'),
  zxing: ZXING_ENGINE_URL,
  qrscanner: vendorUrl('qr-scanner.umd.min.js')
};
const qrEnginePromises = {};
let barcodeEnginePromise = null;
let activeCameraVideo = null;
let focusIndicatorTimer = null;
let lastCameraScanValue = '';

function cameraTrack() {
  return activeCameraVideo?.srcObject?.getVideoTracks?.()[0] || null;
}

async function maximizeCameraQuality(track) {
  if (!track?.applyConstraints) return;
  const capabilities = track.getCapabilities?.() || {};
  const frameRate = capabilities.frameRate?.max ? { ideal: Math.min(capabilities.frameRate.max, 30) } : undefined;
  const attempts = [
    { width: capabilities.width?.max && { ideal: capabilities.width.max }, height: capabilities.height?.max && { ideal: capabilities.height.max }, frameRate },
    { width: capabilities.width?.max && { ideal: capabilities.width.max }, frameRate },
    { height: capabilities.height?.max && { ideal: capabilities.height.max }, frameRate }
  ].map((attempt) => Object.fromEntries(Object.entries(attempt).filter(([, value]) => value)));
  let lastError = null;
  for (const constraints of attempts) {
    if (!Object.keys(constraints).length) continue;
    try {
      await track.applyConstraints(constraints);
      scanDebug('Maximum camera quality applied', track.getSettings?.() || {});
      return;
    } catch (error) {
      lastError = error;
    }
  }
  scanDebug('Maximum camera quality unavailable', scanErrorText(lastError));
}

async function focusCameraAt(normalizedX, normalizedY) {
  const track = cameraTrack();
  if (!track?.applyConstraints) return false;
  const capabilities = track.getCapabilities?.() || {};
  const advanced = [];
  const point = { x: normalizedX, y: normalizedY };
  if (capabilities.pointsOfInterest) advanced.push({ pointsOfInterest: [point] });
  if (capabilities.focusMode?.includes('single-shot')) advanced.push({ focusMode: 'single-shot' });
  else if (capabilities.focusMode?.includes('continuous')) advanced.push({ focusMode: 'continuous' });
  if (!advanced.length) {
    scanDebug('Tap focus unsupported by this camera/WebView');
    return false;
  }
  try {
    await track.applyConstraints({ advanced });
    scanDebug('Tap focus applied', point);
    return true;
  } catch (error) {
    scanDebug('Tap focus failed', scanErrorText(error));
    return false;
  }
}

function bindActiveCameraVideo(video) {
  activeCameraVideo = video;
  const track = cameraTrack();
  if (track) scanDebug('Camera stream ready', track.getSettings?.() || {});
}

function clearActiveCameraVideo(video = null) {
  if (!video || activeCameraVideo === video) activeCameraVideo = null;
}

function scanErrorText(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  const parts = [error.name, error.message].filter(Boolean);
  return parts.length ? parts.join(': ') : String(error);
}

function scanDebug(message, details = '') {
  const box = $('qrDebugLog');
  if (!box) return;
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const suffix = details ? ` | ${typeof details === 'string' ? details : JSON.stringify(details)}` : '';
  const firstMessage = box.textContent.trim() === 'لاگ اسکن اینجا نمایش داده می‌شود.';
  box.textContent = `${firstMessage ? '' : box.textContent}${firstMessage ? '' : '\n'}[${time}] ${message}${suffix}`;
  box.scrollTop = box.scrollHeight;
}

function clearScanDebug() {
  const box = $('qrDebugLog');
  if (box) box.textContent = '';
}

async function copyScanDebug() {
  const text = $('qrDebugLog')?.textContent || '';
  if (!text.trim()) return setStatus('qrReaderStatus', t('qrEmpty'), 'warn');
  await navigator.clipboard.writeText(text);
  setStatus('qrReaderStatus', t('copied'), 'ok');
}

function loadBarcodeEngine() {
  if (window.Html5Qrcode) { scanDebug('Html5Qrcode already available'); return Promise.resolve(true); }
  if (barcodeEnginePromise) { scanDebug('Html5Qrcode load already pending'); return barcodeEnginePromise; }
  scanDebug('Loading Html5Qrcode', BARCODE_ENGINE_URL);
  barcodeEnginePromise = new Promise((resolve) => {
    const script = document.createElement('script');
    let settled = false;
    const finish = (loaded, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (reason) scanDebug('Html5Qrcode load failed', reason);
      else scanDebug('Html5Qrcode load finished', loaded ? 'ready' : 'missing global');
      resolve(loaded);
    };
    const timeout = setTimeout(() => finish(false, `timeout: ${BARCODE_ENGINE_URL}; online=${navigator.onLine}`), 12000);
    script.src = BARCODE_ENGINE_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => finish(Boolean(window.Html5Qrcode));
    script.onerror = () => finish(false, `network/script error: ${BARCODE_ENGINE_URL}; online=${navigator.onLine}`);
    document.head.appendChild(script);
  }).then((loaded) => {
    if (!loaded) barcodeEnginePromise = null;
    return loaded;
  });
  return barcodeEnginePromise;
}


function loadScriptOnce(key, url, isReady) {
  if (isReady()) { scanDebug(`${key} already available`); return Promise.resolve(true); }
  if (qrEnginePromises[key]) { scanDebug(`${key} load already pending`); return qrEnginePromises[key]; }
  scanDebug(`Loading ${key}`, url);
  qrEnginePromises[key] = new Promise((resolve) => {
    const script = document.createElement('script');
    let settled = false;
    const finish = (loaded, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (reason) scanDebug(`${key} load failed`, reason);
      else scanDebug(`${key} load finished`, loaded ? 'ready' : 'missing global');
      resolve(loaded);
    };
    const timeout = setTimeout(() => finish(false, `timeout: ${url}; online=${navigator.onLine}`), 12000);
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => finish(isReady());
    script.onerror = () => finish(false, `network/script error: ${url}; online=${navigator.onLine}`);
    document.head.appendChild(script);
  }).then((loaded) => {
    if (!loaded) delete qrEnginePromises[key];
    return loaded;
  });
  return qrEnginePromises[key];
}

async function imageDataFromFile(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return { canvas, imageData };
}

function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
    image.src = url;
  });
}

async function readFileWithEngine(file, engine) {
  if (engine === 'html5qrcode') {
    if (!(await loadBarcodeEngine())) throw new Error('UNSUPPORTED');
    if (!qrFileScanner) qrFileScanner = new Html5Qrcode('qrFileScanTarget', barcodeConfig(), false);
    return await qrFileScanner.scanFile(file, true);
  }
  if (engine === 'jsqr') {
    if (!(await loadScriptOnce('jsqr', QR_ENGINE_URLS.jsqr, () => Boolean(window.jsQR)))) throw new Error('UNSUPPORTED');
    const { imageData } = await imageDataFromFile(file);
    return window.jsQR(imageData.data, imageData.width, imageData.height)?.data || '';
  }
  if (engine === 'zxing') {
    if (!(await loadScriptOnce('zxing', QR_ENGINE_URLS.zxing, () => Boolean(window.ZXing?.BrowserMultiFormatReader)))) throw new Error('UNSUPPORTED');
    const url = URL.createObjectURL(file);
    try {
      const reader = new ZXing.BrowserMultiFormatReader();
      const image = await loadImageElement(url);
      const result = await reader.decodeFromImageElement(image);
      return result?.getText?.() || result?.text || '';
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  if (engine === 'qrscanner') {
    if (!(await loadScriptOnce('qrscanner', QR_ENGINE_URLS.qrscanner, () => Boolean(window.QrScanner)))) throw new Error('UNSUPPORTED');
    return await QrScanner.scanImage(file, { returnDetailedScanResult: false });
  }
  return '';
}

async function readFileWithSelectedEngines(file) {
  scanDebug('Image scan started', { selectedQrEngine, fileName: file?.name || '', fileType: file?.type || '', fileSize: file?.size || 0 });
  const value = await readFileWithEngine(file, selectedQrEngine);
  scanDebug(value ? `Image engine succeeded: ${selectedQrEngine}` : `Image engine returned empty: ${selectedQrEngine}`, value ? String(value).slice(0, 120) : '');
  return value;
}

function barcodeConfig() {
  const formatsToSupport = Object.values(window.Html5QrcodeSupportedFormats || {}).filter((format) => Number.isInteger(format));
  return formatsToSupport.length ? { formatsToSupport } : {};
}

function updateQrCameraButton() {
  const button = $('toggleQrCamera');
  if (!button) return;
  const isActive = Boolean(qrScanner) || qrCameraStarting;
  button.disabled = qrCameraStopping;
  button.textContent = t(isActive ? 'stopCameraButton' : 'cameraButton');
  button.classList.toggle('danger', isActive);
  button.classList.toggle('primary', !isActive);
}

async function handleCameraTap(event) {
  const box = $('qrCameraBox');
  const indicator = $('cameraFocusIndicator');
  if (!box?.classList.contains('active') || !activeCameraVideo || !indicator) return;
  const rect = box.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  indicator.style.left = `${x * 100}%`;
  indicator.style.top = `${y * 100}%`;
  indicator.classList.remove('active', 'locked', 'unsupported');
  void indicator.offsetWidth;
  indicator.classList.add('active');
  const track = cameraTrack();
  await maximizeCameraQuality(track);
  const focused = await focusCameraAt(x, y);
  indicator.classList.add(focused ? 'locked' : 'unsupported');
  clearTimeout(focusIndicatorTimer);
  focusIndicatorTimer = setTimeout(() => indicator.classList.remove('active', 'locked', 'unsupported'), 1200);
}

async function stopQrCamera() {
  if (qrCameraStopping) return;
  qrCameraRunId += 1;
  const scanner = qrScanner;
  const shouldStopStream = qrCameraStarted;
  qrScanner = null;
  clearActiveCameraVideo();
  qrCameraStarting = false;
  qrCameraStarted = false;
  $('qrCameraBox').classList.remove('active');
  if (!scanner) {
    $('qrScannerTarget').replaceChildren();
    updateQrCameraButton();
    return;
  }
  qrCameraStopping = true;
  updateQrCameraButton();
  try {
    if (shouldStopStream) await Promise.race([scanner.stop().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1000))]);
    await Promise.race([scanner.clear().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1000))]);
  } finally {
    $('qrScannerTarget').replaceChildren();
    qrCameraStopping = false;
    updateQrCameraButton();
  }
}

function setQrReaderValue(value) {
  $('qrReaderResult').value = value;
  autoGrow($('qrReaderResult'));
  setStatus('qrReaderStatus', t('qrReadOk'), 'ok');
}

function onBarcodeRead(value) {
  if (!value) return;
  if (value === lastCameraScanValue) return;
  lastCameraScanValue = value;
  setQrReaderValue(value);
  stopQrCamera();
}

async function startZxingCamera() {
  scanDebug('ZXing camera start requested');
  try {
    await stopQrCamera();
    qrCameraStarting = true;
    $('qrCameraBox').classList.add('active');
    $('qrScannerTarget').replaceChildren();
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.id = 'secretchatZxingVideo';
    $('qrScannerTarget').appendChild(video);
    scanDebug('ZXing video element created', video.id);
    const reader = new ZXing.BrowserMultiFormatReader();
    qrScanner = { stop: () => Promise.resolve(reader.reset()), clear: () => Promise.resolve(reader.reset()) };
    updateQrCameraButton();
    await reader.decodeFromVideoDevice(null, 'secretchatZxingVideo', (result, error) => {
      if (result) { scanDebug('ZXing camera decoded result', result.text || result.getText?.() || ''); onBarcodeRead(result.text || result.getText?.() || ''); }
      else if (error && error.name !== 'NotFoundException') scanDebug('ZXing camera callback error', scanErrorText(error));
    });
    bindActiveCameraVideo(video);
    qrCameraStarting = false;
    qrCameraStarted = true;
    updateQrCameraButton();
    setStatus('qrReaderStatus', t('qrCameraStarted'), 'ok');
    scanDebug('Camera started successfully', selectedQrEngine);
    return true;
  } catch (error) {
    writeAppLog('startZxingCamera', error, { engine: selectedQrEngine });
    scanDebug('ZXing camera start failed', scanErrorText(error));
    qrCameraStarting = false;
    qrCameraStarted = false;
    await stopQrCamera();
    setStatus('qrReaderStatus', t('cameraDenied'), 'error');
    return false;
  }
}

async function startQrCamera() {
  if (qrCameraStarting) { scanDebug('Camera start ignored because another start is pending'); return; }
  scanDebug('Camera button pressed', { selectedQrEngine, hasMediaDevices: Boolean(navigator.mediaDevices), hasGetUserMedia: Boolean(navigator.mediaDevices?.getUserMedia), isSecureContext: window.isSecureContext, origin: location.origin });
  if (!navigator.mediaDevices?.getUserMedia) {
    scanDebug('Camera API unavailable');
    setStatus('qrReaderStatus', t('qrUnsupported'), 'error');
    return;
  }
  if (!QR_ENGINE_VALUES.includes(selectedQrEngine)) {
    scanDebug('Invalid scanner engine', selectedQrEngine);
    setStatus('qrReaderStatus', t('qrUnsupported'), 'error');
    return;
  }
  if (selectedQrEngine === 'zxing') {
    const loaded = await loadScriptOnce('zxing', QR_ENGINE_URLS.zxing, () => Boolean(window.ZXing?.BrowserMultiFormatReader));
    scanDebug('ZXing camera dependency state', loaded ? 'loaded' : 'not loaded');
    if (!loaded) setStatus('qrReaderStatus', t('qrUnsupported'), 'error');
    else await startZxingCamera();
    return;
  }
  if (selectedQrEngine !== 'html5qrcode') {
    scanDebug('Selected image engine has no live-camera API; using Html5Qrcode for camera', selectedQrEngine);
  }
  if (!(await loadBarcodeEngine())) {
    scanDebug('Html5Qrcode failed to load');
    setStatus('qrReaderStatus', t('qrUnsupported'), 'error');
    return;
  }
  try {
    await stopQrCamera();
    const runId = qrCameraRunId + 1;
    qrCameraRunId = runId;
    qrCameraStarting = true;
    $('qrCameraBox').classList.add('active');
    $('qrScannerTarget').replaceChildren();
    scanDebug('Starting Html5Qrcode camera with compatible environment-facing constraints');
    const scanner = new Html5Qrcode('qrScannerTarget', barcodeConfig(), false);
    qrScanner = scanner;
    updateQrCameraButton();
    await scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1
      },
      onBarcodeRead,
      () => {}
    );
    const html5Video = $('qrScannerTarget').querySelector('video');
    if (html5Video) bindActiveCameraVideo(html5Video);
    if (runId !== qrCameraRunId) {
      await scanner.stop().catch(() => {});
      await scanner.clear().catch(() => {});
      return;
    }
    qrCameraStarting = false;
    qrCameraStarted = true;
    updateQrCameraButton();
    setStatus('qrReaderStatus', t('qrCameraStarted'), 'ok');
    return true;
  } catch (error) {
    writeAppLog('startQrCamera', error, { engine: selectedQrEngine });
    scanDebug('Html5Qrcode camera start failed', scanErrorText(error));
    qrCameraStarting = false;
    qrCameraStarted = false;
    await stopQrCamera();
    setStatus('qrReaderStatus', t('cameraDenied'), 'error');
  }
}

function toggleQrCamera() {
  if (qrCameraStopping) return;
  if (qrScanner || qrCameraStarting) stopQrCamera();
  else startQrCamera();
}

function openQrReader() {
  $('qrReaderModal').classList.add('active');
  $('qrEngineSelect').value = selectedQrEngine;
  setStatus('qrReaderStatus', '');
  clearScanDebug();
  updateScanDebugVisibility(false);
  scanDebug('Scanner opened', { selectedQrEngine, origin: location.origin, isSecureContext: window.isSecureContext, userAgent: navigator.userAgent });
}

function openScannerFromShortcut() {
  openQrReader();
  if (!qrScanner && !qrCameraStarting) {
    startQrCamera();
  }
}

window.SecretChat = {
  ...(window.SecretChat || {}),
  openScanner: openScannerFromShortcut,
  receiveExternalText
};

function closeQrReader() {
  $('qrReaderModal').classList.remove('active');
  stopQrCamera();
}

async function readQrImage(file) {
  if (!file) { scanDebug('Image input changed without file'); return; }
  try {
    const value = await readFileWithSelectedEngines(file);
    if (!value) throw new Error('NO_BARCODE');
    setQrReaderValue(value);
  } catch (error) {
    writeAppLog('readQrImage', error, { engine: selectedQrEngine, fileName: file?.name || '' });
    scanDebug('Image scan failed completely', scanErrorText(error));
    setStatus('qrReaderStatus', error.message === 'UNSUPPORTED' ? t('qrUnsupported') : t('qrReadFailed'), 'error');
  } finally {
    $('qrImageInput').value = '';
  }
}

function placeQrResult(targetId) {
  const value = $('qrReaderResult').value;
  if (!value) return setStatus('qrReaderStatus', t('qrEmpty'), 'warn');
  $(targetId).value = value;
  $(targetId).dispatchEvent(new Event('input'));
  setStatus('qrReaderStatus', t('placed'), 'ok');
}

async function saveQrImage(sourceId, statusId) {
  const box = getQrBox(sourceId);
  if (!box || !box.classList.contains('active')) showQr(sourceId, statusId);
  if (!box || !box.classList.contains('active')) return;
  const canvas = box.querySelector('canvas');
  const fileName = safeFileName(`${sourceId}-qr`, 'png');
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  const blob = await (await fetch(dataUrl)).blob();
  const androidSaveBase64 = androidBridge('saveBase64File');
  const androidSaveQr = androidBridge('saveQrImage');
  if (androidSaveBase64 || androidSaveQr) {
    let ok = false;
    try {
      ok = androidSaveBase64 ? androidSaveBase64(fileName, base64, 'image/png') : androidSaveQr(fileName, base64);
    } catch (error) {
      ok = androidSaveQr ? androidSaveQr(fileName, base64) : false;
    }
    setStatus(statusId, ok ? savedPathMessage(fileName) : t('pasteDenied'), ok ? 'ok' : 'error');
    if (ok) await registerOutputFile(fileName, blob);
    return;
  }
  browserDownload(fileName, dataUrl);
  setStatus(statusId, savedPathMessage(fileName), 'ok');
  await registerOutputFile(fileName, blob);
}

function togglePassword(inputId, button) {
  const input = $(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  button.setAttribute('aria-label', isHidden ? 'hide password' : 'show password');
  button.classList.toggle('visible', isHidden);
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.toggle('active', panel.id === `${tab}Panel`));
  document.querySelectorAll('textarea').forEach(autoGrow);
  window.dispatchEvent(new CustomEvent('secretchat:tabchange', { detail: { tab } }));
}

function applyTheme(index) {
  const safeIndex = ((index % themes.length) + themes.length) % themes.length;
  themeIndex = safeIndex;
  document.documentElement.style.setProperty('--accent', themes[themeIndex][0]);
  document.documentElement.style.setProperty('--accent-2', themes[themeIndex][1]);
  document.documentElement.style.setProperty('--border', `color-mix(in srgb, ${themes[themeIndex][0]} 72%, white 8%)`);
  document.documentElement.style.setProperty('--shadow', `0 0 34px color-mix(in srgb, ${themes[themeIndex][0]} 30%, transparent), 0 0 80px color-mix(in srgb, ${themes[themeIndex][1]} 18%, transparent)`);
}

function changeTheme() {
  applyTheme(themeIndex + 1);
  localStorage.setItem(PREF_THEME_KEY, String(themeIndex));
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = 'rtl';
  $('languageButton').textContent = language === 'fa' ? 'en' : 'fa';
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-recommended-engine]').forEach((element) => { element.textContent = t('recommendedEngine'); });
  document.querySelectorAll('[data-placeholder-fa]').forEach((element) => { element.placeholder = element.dataset[`placeholder${language === 'fa' ? 'Fa' : 'En'}`]; });
  updateStrength('encryptPassword', 'encryptStrength', 'encryptMeter');
  updateStrength('decryptPassword', 'decryptStrength', 'decryptMeter');
  updateQrCameraButton();
  const debugPanel = $('qrDebugPanel');
  const debugButton = $('toggleQrDebugLog');
  if (debugPanel && debugButton) debugButton.textContent = t(debugPanel.hidden ? 'showScanLog' : 'hideScanLog');
  renderOutputFiles();
}

function switchLanguage() {
  language = language === 'fa' ? 'en' : 'fa';
  localStorage.setItem(PREF_LANGUAGE_KEY, language);
  applyLanguage();
}


function clearSensitiveData() {
  stopQrCamera();
  ['encryptPassword', 'decryptPassword', 'transferSendPassword', 'transferReceivePassword', 'plainMessage', 'encryptedOutput', 'cipherMessage', 'decryptedOutput', 'qrReaderResult'].forEach((id) => {
    const element = $(id);
    if (element) element.value = '';
  });
  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    const input = $(button.dataset.togglePassword);
    if (input) input.type = 'password';
    button.classList.remove('visible');
    button.setAttribute('aria-label', 'show password');
  });
  ['encryptStatus', 'decryptStatus', 'qrReaderStatus'].forEach((id) => setStatus(id, ''));
  ['plainMessage', 'encryptedOutput', 'cipherMessage', 'decryptedOutput'].forEach(closeQr);
  document.querySelectorAll('textarea').forEach(autoGrow);
  updateStrength('encryptPassword', 'encryptStrength', 'encryptMeter');
  updateStrength('decryptPassword', 'decryptStrength', 'decryptMeter');
  updateQrCameraButton();
}

applyTheme(themeIndex);
applyLanguage();
renderOutputFiles();

function updateRangeProgress(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const progress = max === min ? 0 : ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--range-progress', `${Math.min(100, Math.max(0, progress))}%`);
}

document.querySelectorAll('input[type="range"]').forEach(updateRangeProgress);
document.addEventListener('input', (event) => {
  if (event.target.matches('input[type="range"]')) updateRangeProgress(event.target);
});

$('themeButton').addEventListener('click', changeTheme);
$('languageButton').addEventListener('click', switchLanguage);
document.querySelectorAll('.tab').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
$('copyQrDebugLog')?.addEventListener('click', copyScanDebug);
$('clearQrDebugLog')?.addEventListener('click', clearScanDebug);
$('toggleQrDebugLog')?.addEventListener('click', toggleScanDebug);
document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', () => copyText(button.dataset.copy, button.dataset.status, button)));
document.querySelectorAll('[data-paste]').forEach((button) => button.addEventListener('click', () => pasteText(button.dataset.paste, button.dataset.status)));
document.querySelectorAll('[data-toggle-password]').forEach((button) => button.addEventListener('click', () => togglePassword(button.dataset.togglePassword, button)));
document.querySelectorAll('[data-export-toggle]').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  const wrap = button.closest('.export-wrap');
  const isActive = wrap.classList.contains('active');
  closeExportMenus();
  wrap.classList.toggle('active', !isActive);
}));
document.querySelectorAll('[data-export]').forEach((button) => button.addEventListener('click', () => exportField(button.dataset.source, button.dataset.status, button.dataset.export)));
document.addEventListener('click', () => {
  closeExportMenus();
  closeAllQr();
});
document.querySelectorAll('[data-qr]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleQr(button.dataset.qr, button.dataset.status);
  });
});
document.querySelectorAll('.qr-box').forEach((box) => box.addEventListener('click', (event) => event.stopPropagation()));
document.querySelectorAll('[data-close-qr]').forEach((button) => button.addEventListener('click', () => closeQr(button.dataset.closeQr)));
document.querySelectorAll('[data-save-qr]').forEach((button) => button.addEventListener('click', () => saveQrImage(button.dataset.saveQr, button.closest('.field').querySelector('[data-status]')?.dataset.status || 'encryptStatus')));
$('qrReaderButton').addEventListener('click', openQrReader);
$('closeQrReader').addEventListener('click', closeQrReader);
$('toggleQrCamera').addEventListener('click', toggleQrCamera);
$('qrCameraBox').addEventListener('pointerup', handleCameraTap);
$('qrEngineSelect').addEventListener('change', () => {
  selectedQrEngine = $('qrEngineSelect').value;
  if (!QR_ENGINE_VALUES.includes(selectedQrEngine)) selectedQrEngine = 'zxing';
  localStorage.setItem(PREF_QR_ENGINE_KEY, selectedQrEngine);
  stopQrCamera();
});
$('qrReaderModal').addEventListener('click', (event) => { if (event.target === $('qrReaderModal')) closeQrReader(); });
$('cancelExportName').addEventListener('click', closeExportNameModal);
$('closeExportName').addEventListener('click', closeExportNameModal);
$('confirmExportName').addEventListener('click', confirmExportNameModal);
$('exportNameModal').addEventListener('click', (event) => { if (event.target === $('exportNameModal')) closeExportNameModal(); });
$('exportFileName').addEventListener('keydown', (event) => { if (event.key === 'Enter') confirmExportNameModal(); });
$('outputFileImport').addEventListener('change', () => prepareOutputFileImport($('outputFileImport').files[0]));
$('closeZipAction').addEventListener('click', closeZipAction);
$('zipActionModal').addEventListener('click', (event) => { if (event.target === $('zipActionModal')) closeZipAction(); });
$('zipActionOpen').addEventListener('click', () => chooseProjectFile([...pendingProjectFiles.keys()].filter((name) => /\.html?$/iu.test(name)), openProjectInExternalBrowser));
$('zipActionEncrypt').addEventListener('click', () => chooseProjectFile([...pendingProjectFiles.keys()].filter((name) => TEXT_PROJECT_FILE.test(name)), (name) => placeProjectFile(name, 'plainMessage', 'encrypt', 'encryptStatus')));
$('zipActionDecrypt').addEventListener('click', () => chooseProjectFile([...pendingProjectFiles.keys()].filter((name) => TEXT_PROJECT_FILE.test(name)), (name) => placeProjectFile(name, 'cipherMessage', 'decrypt', 'decryptStatus')));
$('zipActionExtract').addEventListener('click', extractZipProject);
$('closeProjectFileChoice').addEventListener('click', closeProjectFileChoice);
$('projectFileChoiceModal').addEventListener('click', (event) => { if (event.target === $('projectFileChoiceModal')) closeProjectFileChoice(); });
$('closeImportOutput').addEventListener('click', closeOutputFileImport);
$('importToCipher').addEventListener('click', () => placeImportedText('cipherMessage', 'decrypt', 'decryptStatus'));
$('importToPlain').addEventListener('click', () => placeImportedText('plainMessage', 'encrypt', 'encryptStatus'));
$('importOutputModal').addEventListener('click', (event) => { if (event.target === $('importOutputModal')) closeOutputFileImport(); });
$('qrImageInput').addEventListener('change', () => {
  const [file] = $('qrImageInput').files;
  readQrImage(file);
});
document.querySelectorAll('[data-place-qr]').forEach((button) => button.addEventListener('click', () => placeQrResult(button.dataset.placeQr)));
document.querySelectorAll('textarea').forEach((textarea) => {
  textarea.addEventListener('input', () => autoGrow(textarea));
  autoGrow(textarea);
});
$('encryptPassword').addEventListener('input', () => updateStrength('encryptPassword', 'encryptStrength', 'encryptMeter'));
$('decryptPassword').addEventListener('input', () => updateStrength('decryptPassword', 'decryptStrength', 'decryptMeter'));
$('generatePassword').addEventListener('click', () => {
  $('encryptPassword').value = randomPassword();
  updateStrength('encryptPassword', 'encryptStrength', 'encryptMeter');
  setStatus('encryptStatus', t('generated'), 'ok');
});
$('encryptButton').addEventListener('click', encryptMessage);
$('decryptButton').addEventListener('click', decryptMessage);
$('clearEncrypt').addEventListener('click', () => {
  ['encryptPassword', 'plainMessage', 'encryptedOutput'].forEach((id) => { $(id).value = ''; });
  updateStrength('encryptPassword', 'encryptStrength', 'encryptMeter');
  document.querySelectorAll('#encryptPanel textarea').forEach(autoGrow);
  ['plainMessage', 'encryptedOutput'].forEach(closeQr);
  setStatus('encryptStatus', '');
});
$('clearDecrypt').addEventListener('click', () => {
  ['decryptPassword', 'cipherMessage', 'decryptedOutput'].forEach((id) => { $(id).value = ''; });
  updateStrength('decryptPassword', 'decryptStrength', 'decryptMeter');
  document.querySelectorAll('#decryptPanel textarea').forEach(autoGrow);
  ['cipherMessage', 'decryptedOutput'].forEach(closeQr);
  setStatus('decryptStatus', '');
});

window.addEventListener('error', (event) => writeAppLog('window.error', event.error || new Error(event.message), { file: event.filename || '', line: event.lineno || '', column: event.colno || '' }));
window.addEventListener('unhandledrejection', (event) => writeAppLog('window.unhandledrejection', event.reason instanceof Error ? event.reason : new Error(String(event.reason))));

window.addEventListener('pagehide', clearSensitiveData);
window.addEventListener('beforeunload', clearSensitiveData);
window.addEventListener('freeze', clearSensitiveData);
window.addEventListener('pageshow', (event) => { if (event.persisted) clearSensitiveData(); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

if (new URLSearchParams(location.search).get('openScanner') === '1') {
  openScannerFromShortcut();
  const cleanQuery = IS_ANDROID_RUNTIME ? '?native=android' : '';
  history.replaceState(null, '', `${location.pathname}${cleanQuery}${location.hash}`);
}
