(() => {
  'use strict';

  const PROTOCOL = 'SCF2';
  const SCANNER_ENGINE_KEY = 'secretchat-transfer-scanner-engine';
  const VIEWPORT_HEIGHT_KEY = 'secretchat-transfer-viewport-height';
  const SCANNER_ENGINE_VALUES = ['zxing', 'html5qrcode', 'jsqr', 'qrscanner'];
  const FILE_KEY_ITERATIONS = 300000;
  const MIN_FILE_PASSWORD_LENGTH = 4;
  const MIN_GENERATED_PASSWORD_LENGTH = 64;
  const MAX_GENERATED_PASSWORD_LENGTH = 256;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const $ = (id) => document.getElementById(id);
  const nativeBridge = (method) => window.SecretChatRuntime?.platform === 'android'
    ? window.SecretChatRuntime.nativeBridge(method) : null;
  const text = {
    fa: {
      tab: 'انتقال فایل',
      sendTitle: 'ارسال', chooseFile: 'انتخاب فایل', optionalPassword: 'رمز اختیاری فایل', generatePassword: 'ساخت رمز سخت', strengthEmpty: 'حداقل رمز: ۴ کاراکتر؛ حداکثر ندارد.', shortPassword: (n) => `رمز کوتاه است؛ ${n} کاراکتر دیگر لازم است.`, strongPassword: (n) => `امنیت ۱۰۰/۱۰۰؛ طول ${n} کاراکتر.`, passwordScore: (score) => `امتیاز رمز: ${score}/۱۰۰.`, speed: 'سرعت نمایش (QR در ثانیه)', frameNumber: 'شماره QR', chunkSize: 'تراکم هر QR', fullscreen: 'تمام صفحه', exitFullscreen: 'خروج از تمام صفحه', zoom: 'زوم', downloadQrZip: 'دانلود ZIP همه QRها', scanImages: 'اسکن دسته‌ای عکس‌های QR یا فایل ZIP', enterPassword: 'رمز فایل را وارد کنید', unlockFile: 'باز کردن فایل', passwordRequired: 'همه QRها دریافت شد؛ برای بازکردن فایل رمز را وارد کنید.', wrongPassword: 'رمز اشتباه است.', zipReady: 'فایل ZIP حاوی همه QRها آماده شد.', slow: 'آرام', normal: 'معمولی', fast: 'سریع',
      play: 'پخش', pause: 'مکث', previous: 'قبلی', next: 'بعدی', resizeViewport: 'برای تغییر ارتفاع کادر QR بکشید', receiveTitle: 'دریافت',
      openScanner: 'بازکردن اسکنر', reset: 'شروع دوباره', saveFile: 'ذخیره فایل', preparing: 'در حال آماده‌سازی فایل…', openZipFolder: 'باز کردن پوشه ZIP',
      ready: (count, duration) => `${count} کد QR آماده شد؛ زمان تقریبی هر چرخه ${duration} است.`, badFile: 'فایل قابل خواندن نیست.',
      waiting: 'در انتظار QRهای فایل…', receiving: (done, total) => `دریافت ${done} از ${total} بخش`, different: 'QR مربوط به فایل دیگری است؛ برای دریافت آن «شروع دوباره» را بزنید.',
      invalid: 'بخش QR خراب یا نامعتبر بود.', verifying: 'همه بخش‌ها رسید؛ در حال بررسی فایل…', complete: 'فایل کامل و معتبر دریافت شد.', hashError: 'بررسی نهایی فایل ناموفق بود؛ چرخه QR را دوباره اسکن کنید.', saved: 'فایل ذخیره شد.', saveError: 'ذخیره فایل انجام نشد.',
      scannerTitle: 'دوربین دریافت فایل', scannerEngine: 'موتور اسکن', recommendedEngine: 'ZXing (پیشنهادی)', closeScanner: 'بستن دوربین', scannerStarting: 'در حال راه‌اندازی دوربین اختصاصی…', scannerReady: 'دوربین آماده است؛ QRهای انتقال فایل را داخل کادر بگیرید.', scannerError: 'دوربین انتقال فایل راه‌اندازی نشد.',
      scannerProgress: (done, total) => `دریافت فایل: ${done} از ${total}`, scannerComplete: 'فایل کامل دریافت شد؛ می‌توانید دوربین را ببندید.'
    },
    en: {
      tab: 'File QR',
      sendTitle: 'Send', chooseFile: 'Choose file', optionalPassword: 'Optional file password', generatePassword: 'Generate strong password', strengthEmpty: 'Minimum password: 4 characters; no maximum.', shortPassword: (n) => `Password is short; ${n} more characters needed.`, strongPassword: (n) => `Security 100/100; length ${n} characters.`, passwordScore: (score) => `Password score: ${score}/100.`, speed: 'Display speed (QR per second)', frameNumber: 'QR number', chunkSize: 'QR density', fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen', zoom: 'Zoom', downloadQrZip: 'Download all QR images as ZIP', scanImages: 'Batch scan QR images or a ZIP file', enterPassword: 'Enter the file password', unlockFile: 'Unlock file', passwordRequired: 'All QR codes were received; enter the password to unlock the file.', wrongPassword: 'The password is incorrect.', zipReady: 'The ZIP containing all QR images is ready.', slow: 'Slow', normal: 'Normal', fast: 'Fast',
      play: 'Play', pause: 'Pause', previous: 'Previous', next: 'Next', resizeViewport: 'Drag to resize the QR area', receiveTitle: 'Receive',
      openScanner: 'Open scanner', reset: 'Start over', saveFile: 'Save file', preparing: 'Preparing file…', openZipFolder: 'Open ZIP folder',
      ready: (count, duration) => `${count} QR codes ready; each cycle takes about ${duration}.`, badFile: 'The file could not be read.',
      waiting: 'Waiting for file QR codes…', receiving: (done, total) => `Received ${done} of ${total} chunks`, different: 'This QR belongs to another file; select Start over to receive it.',
      invalid: 'The QR chunk was damaged or invalid.', verifying: 'All chunks received; verifying file…', complete: 'The complete verified file was received.', hashError: 'Final file verification failed; scan the QR cycle again.', saved: 'File saved.', saveError: 'The file could not be saved.',
      scannerTitle: 'File receiver camera', scannerEngine: 'Scan engine', recommendedEngine: 'ZXing (Recommended)', closeScanner: 'Close camera', scannerStarting: 'Starting the dedicated receiver camera…', scannerReady: 'Camera ready; place the transfer QR codes inside the frame.', scannerError: 'The file-transfer camera could not be started.',
      scannerProgress: (done, total) => `Receiving file: ${done} of ${total}`, scannerComplete: 'File received completely; you can close the camera.'
    }
  };

  let frames = [];
  let frameIndex = 0;
  let playTimer = null;
  let frameJumpTimer = null;
  const viewportPointers = new Map();
  let panStart = null;
  let viewportResizeStart = null;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let fullscreenPlaceholder = null;
  let received = freshReceiveState();
  let transferScanner = null;
  let transferScannerRunning = false;
  let transferScannerStarting = false;
  const scannerEnginePromises = {};
  let selectedScannerEngine = localStorage.getItem(SCANNER_ENGINE_KEY) || 'zxing';
  if (!SCANNER_ENGINE_VALUES.includes(selectedScannerEngine)) selectedScannerEngine = 'zxing';

  function language() { return document.documentElement.lang === 'en' ? 'en' : 'fa'; }
  function tr(key, ...args) {
    const value = text[language()][key];
    return typeof value === 'function' ? value(...args) : value;
  }

  function applyTransferLanguage() {
    document.querySelectorAll('[data-transfer-i18n]').forEach((element) => {
      const value = text[language()][element.dataset.transferI18n];
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('[data-transfer-recommended-engine]').forEach((element) => { element.textContent = tr('recommendedEngine'); });
    document.querySelectorAll('[data-transfer-placeholder-fa]').forEach((element) => {
      element.placeholder = element.dataset[language() === 'fa' ? 'transferPlaceholderFa' : 'transferPlaceholderEn'];
    });
    document.querySelectorAll('[data-transfer-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', tr(element.dataset.transferI18nAria));
    });
    updatePlaybackButton();
    updateTransferPasswordStrength();
  }

  function transferPasswordScore(password) {
    const uniqueChars = new Set(password).size;
    const variety = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password), /[آ-ی۰-۹]/.test(password)].filter(Boolean).length;
    const lengthScore = Math.min(70, password.length / MIN_GENERATED_PASSWORD_LENGTH * 70);
    const varietyScore = Math.min(20, variety * 5);
    const uniqueScore = Math.min(10, uniqueChars / 3);
    const score = Math.min(100, Math.round(lengthScore + varietyScore + uniqueScore));
    return password.length >= MIN_GENERATED_PASSWORD_LENGTH && uniqueChars >= 32 ? Math.max(92, score) : score;
  }

  function updateTransferPasswordStrength() {
    const password = $('transferSendPassword').value;
    const score = transferPasswordScore(password);
    const remaining = Math.max(0, MIN_FILE_PASSWORD_LENGTH - password.length);
    $('transferPasswordMeter').style.width = `${score}%`;
    if (!password) $('transferPasswordStrength').textContent = tr('strengthEmpty');
    else if (remaining) $('transferPasswordStrength').textContent = tr('shortPassword', remaining);
    else if (score >= 95) $('transferPasswordStrength').textContent = tr('strongPassword', password.length);
    else $('transferPasswordStrength').textContent = tr('passwordScore', score);
  }

  function generateTransferPassword() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-+=?آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی۰۱۲۳۴۵۶۷۸۹';
    const lengthBytes = crypto.getRandomValues(new Uint32Array(1));
    const length = MIN_GENERATED_PASSWORD_LENGTH + lengthBytes[0] % (MAX_GENERATED_PASSWORD_LENGTH - MIN_GENERATED_PASSWORD_LENGTH + 1);
    const output = [];
    const limit = Math.floor(256 / alphabet.length) * alphabet.length;
    while (output.length < length) {
      crypto.getRandomValues(new Uint8Array(Math.max(64, length - output.length))).forEach((byte) => {
        if (output.length < length && byte < limit) output.push(alphabet[byte % alphabet.length]);
      });
    }
    $('transferSendPassword').value = output.join('');
    updateTransferPasswordStrength();
    prepareFile($('transferFile').files[0]);
  }

  function freshReceiveState() {
    return {
      id: '',
      total: 0,
      blockLen: 0,
      manifest: null,
      blocks: [],
      equations: new Map(),
      byBlock: new Map(),
      solvedCount: 0,
      blob: null,
      bytes: null,
      assembling: false
    };
  }

  function setStatus(id, message, type = '') {
    const element = $(id);
    element.textContent = message;
    element.className = `transfer-status ${type}`.trim();
  }

  function showZipReadyStatus(showFolderButton) {
    setStatus('transferSendStatus', tr('zipReady'), 'ok');
    if (!showFolderButton) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'transfer-open-folder-button';
    button.textContent = tr('openZipFolder');
    button.addEventListener('click', () => nativeBridge('openZipDirectory')?.());
    $('transferSendStatus').append(button);
  }

  function bytesToBase64(bytes) {
    let binary = '';
    const step = 0x8000;
    for (let i = 0; i < bytes.length; i += step) binary += String.fromCharCode(...bytes.subarray(i, i + step));
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function base64UrlEncode(value) {
    return bytesToBase64(encoder.encode(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
  }

  function base64UrlDecode(value) {
    const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
    return decoder.decode(base64ToBytes(padded));
  }

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
    return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0');
  }

  async function sha256(bytes) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  async function deriveFileKey(password, salt) {
    const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: FILE_KEY_ITERATIONS, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptFileBytes(bytes, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveFileKey(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
    return { bytes: new Uint8Array(encrypted), salt: bytesToBase64(salt), iv: bytesToBase64(iv) };
  }

  async function decryptFileBytes(bytes, password, manifest) {
    const key = await deriveFileKey(password, base64ToBytes(manifest.salt));
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(manifest.iv) }, key, bytes);
    return new Uint8Array(decrypted);
  }

  function uint16(value) { return new Uint8Array([value & 255, value >>> 8 & 255]); }
  function uint32(value) { return new Uint8Array([value & 255, value >>> 8 & 255, value >>> 16 & 255, value >>> 24 & 255]); }
  function concatBytes(parts) {
    const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0;
    parts.forEach((part) => { output.set(part, offset); offset += part.length; });
    return output;
  }

  function createStoreZip(files) {
    const locals = [];
    const central = [];
    let offset = 0;
    files.forEach(({ name, bytes }) => {
      const nameBytes = encoder.encode(name);
      const crc = parseInt(crc32(bytes), 16) >>> 0;
      const local = concatBytes([uint32(0x04034b50), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0), uint32(crc), uint32(bytes.length), uint32(bytes.length), uint16(nameBytes.length), uint16(0), nameBytes, bytes]);
      locals.push(local);
      central.push(concatBytes([uint32(0x02014b50), uint16(20), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0), uint32(crc), uint32(bytes.length), uint32(bytes.length), uint16(nameBytes.length), uint16(0), uint16(0), uint16(0), uint16(0), uint32(0), uint32(offset), nameBytes]));
      offset += local.length;
    });
    const directory = concatBytes(central);
    return concatBytes([...locals, directory, uint32(0x06054b50), uint16(0), uint16(0), uint16(files.length), uint16(files.length), uint32(directory.length), uint32(offset), uint16(0)]);
  }

  function zipImageFiles(file) {
    return file.arrayBuffer().then((buffer) => {
      const bytes = new Uint8Array(buffer);
      const view = new DataView(buffer);
      const images = [];
      let offset = 0;
      while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
        const flags = view.getUint16(offset + 6, true);
        const method = view.getUint16(offset + 8, true);
        const size = view.getUint32(offset + 18, true);
        const nameLength = view.getUint16(offset + 26, true);
        const extraLength = view.getUint16(offset + 28, true);
        const dataStart = offset + 30 + nameLength + extraLength;
        const dataEnd = dataStart + size;
        if ((flags & 8) || method !== 0 || dataEnd > bytes.length) throw new Error('UNSUPPORTED_ZIP');
        const name = decoder.decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
        if (/\.(?:png|jpe?g|webp|gif|bmp)$/iu.test(name) && !name.endsWith('/')) {
          images.push(new File([bytes.slice(dataStart, dataEnd)], name.split('/').pop(), { type: imageMimeType(name) }));
        }
        offset = dataEnd;
      }
      if (!images.length) throw new Error('EMPTY_ZIP');
      return images;
    });
  }

  function imageMimeType(name) {
    const extension = name.split('.').pop().toLowerCase();
    return extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension === 'svg' ? 'svg+xml' : extension}`;
  }

  function transferId() {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function xorInto(target, source) {
    const length = Math.min(target.length, source.length);
    for (let i = 0; i < length; i += 1) target[i] ^= source[i];
    return target;
  }

  function makePaddedBlock(bytes, index, blockLen) {
    const block = new Uint8Array(blockLen);
    const start = index * blockLen;
    block.set(bytes.subarray(start, Math.min(bytes.length, start + blockLen)));
    return block;
  }

  function seedForFrame(id, sequence) {
    let seed = 2166136261 >>> 0;
    const textValue = `${id}:${sequence}`;
    for (let i = 0; i < textValue.length; i += 1) {
      seed ^= textValue.charCodeAt(i);
      seed = Math.imul(seed, 16777619) >>> 0;
    }
    return seed || 0x9e3779b9;
  }

  function nextRandom(state) {
    let value = state.value >>> 0;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    state.value = value >>> 0;
    return state.value;
  }

  function repairIndices(id, sequence, total) {
    if (sequence < total) return [sequence];
    if (total <= 1) return [0];

    const state = { value: seedForFrame(id, sequence) };
    const roll = nextRandom(state) % 100;
    const degree = Math.min(total, roll < 48 ? 2 : roll < 78 ? 3 : roll < 94 ? 4 : 5);
    const selected = new Set();
    while (selected.size < degree) selected.add(nextRandom(state) % total);
    return [...selected].sort((a, b) => a - b);
  }

  function removeEquation(sequence) {
    const equation = received.equations.get(sequence);
    if (!equation) return;
    for (const index of equation.indices) {
      const refs = received.byBlock.get(index);
      if (!refs) continue;
      refs.delete(sequence);
      if (!refs.size) received.byBlock.delete(index);
    }
    received.equations.delete(sequence);
  }

  function solveBlock(index, bytes) {
    const queue = [[index, bytes]];

    while (queue.length) {
      const [solvedIndex, solvedBytes] = queue.shift();
      if (received.blocks[solvedIndex]) continue;

      received.blocks[solvedIndex] = solvedBytes;
      received.solvedCount += 1;

      const refs = [...(received.byBlock.get(solvedIndex) || [])];
      received.byBlock.delete(solvedIndex);

      for (const sequence of refs) {
        const equation = received.equations.get(sequence);
        if (!equation || !equation.indices.has(solvedIndex)) continue;

        equation.indices.delete(solvedIndex);
        xorInto(equation.data, solvedBytes);

        if (!equation.indices.size) {
          removeEquation(sequence);
          continue;
        }

        if (equation.indices.size === 1) {
          const nextIndex = equation.indices.values().next().value;
          const nextBytes = equation.data;
          removeEquation(sequence);
          queue.push([nextIndex, nextBytes]);
        }
      }
    }
  }

  function addEquation(sequence, indices, payload) {
    if (received.equations.has(sequence)) return;

    const data = payload.slice();
    const unknown = new Set();

    for (const index of indices) {
      const known = received.blocks[index];
      if (known) xorInto(data, known);
      else unknown.add(index);
    }

    if (!unknown.size) return;
    if (unknown.size === 1) {
      solveBlock(unknown.values().next().value, data);
      return;
    }

    const equation = { indices: unknown, data };
    received.equations.set(sequence, equation);

    for (const index of unknown) {
      if (!received.byBlock.has(index)) received.byBlock.set(index, new Set());
      received.byBlock.get(index).add(sequence);
    }
  }

  function formatDuration(milliseconds) {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return language() === 'fa' ? `${seconds} ثانیه` : `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return language() === 'fa' ? `${minutes} دقیقه` : `${minutes} min`;
  }

  function updateSendControls(enabled) {
    ['transferPlayPause', 'transferPrevious', 'transferNext', 'transferModalPlayPause', 'transferModalPrevious', 'transferModalNext', 'transferFrameNumber'].forEach((id) => { $(id).disabled = !enabled; });
  }

  function frameRate() { return Number($('transferSpeed').value); }
  function frameInterval() { return 1000 / frameRate(); }

  function updateSpeedOutput() {
    $('transferSpeedValue').textContent = frameRate().toLocaleString('en-US', { maximumFractionDigits: 2 });
    updateRangeVisual($('transferSpeed'));
  }

  function updateDensityOutput() {
    $('transferChunkSizeValue').textContent = String(Number($('transferChunkSize').value));
    updateRangeVisual($('transferChunkSize'));
  }

  function setViewportHeight(height, persist = true) {
    const pixels = Math.max(120, Math.round(height));
    $('transferQrStage').style.setProperty('--qr-viewport-height', `${pixels}px`);
    if (persist) localStorage.setItem(VIEWPORT_HEIGHT_KEY, String(pixels / window.innerHeight * 100));
  }

  function startViewportResize(event) {
    if (!fullscreenActive()) return;
    const handle = $('transferViewportResizeHandle');
    handle.setPointerCapture(event.pointerId);
    viewportResizeStart = { pointerId: event.pointerId, y: event.clientY, height: $('transferQrViewport').offsetHeight };
    handle.classList.add('is-resizing');
    event.preventDefault();
  }

  function moveViewportResize(event) {
    if (!viewportResizeStart || event.pointerId !== viewportResizeStart.pointerId) return;
    setViewportHeight(viewportResizeStart.height + event.clientY - viewportResizeStart.y, false);
    event.preventDefault();
  }

  function endViewportResize(event) {
    if (!viewportResizeStart || event.pointerId !== viewportResizeStart.pointerId) return;
    viewportResizeStart = null;
    $('transferViewportResizeHandle').classList.remove('is-resizing');
    setViewportHeight($('transferQrViewport').offsetHeight);
    setQrZoom($('transferQrZoom').value);
  }

  function resizeViewportWithKeyboard(event) {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    setViewportHeight($('transferQrViewport').offsetHeight + direction * (event.shiftKey ? 100 : 24));
    setQrZoom($('transferQrZoom').value);
    event.preventDefault();
  }

  function updateRangeVisual(input) {
    const progress = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
  }

  function fullscreenActive() {
    return $('transferQrStage').classList.contains('fullscreen-fallback');
  }

  function setQrZoom(value) {
    const input = $('transferQrZoom');
    const viewport = $('transferQrViewport');
    const previousWidth = viewport.scrollWidth;
    const previousHeight = viewport.scrollHeight;
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    const zoom = Math.min(Number(input.max), Math.max(Number(input.min), Math.round(Number(value) * 10) / 10));
    input.value = zoom.toFixed(1);
    $('transferQrZoomValue').textContent = `${zoom.toFixed(1)}×`;
    updateRangeVisual(input);
    if (fullscreenActive()) {
      const baseSize = Math.max(240, Math.min(viewport.clientWidth, viewport.clientHeight) * 0.92);
      $('transferQrStage').style.setProperty('--qr-box-size', `${Math.round(baseSize * zoom)}px`);
      requestAnimationFrame(() => {
        const ratioX = previousWidth > viewport.clientWidth ? centerX / previousWidth : 0.5;
        const ratioY = previousHeight > viewport.clientHeight ? centerY / previousHeight : 0.5;
        viewport.scrollLeft = ratioX * viewport.scrollWidth - viewport.clientWidth / 2;
        viewport.scrollTop = ratioY * viewport.scrollHeight - viewport.clientHeight / 2;
      });
    }
  }

  function pointerDistance() {
    const pointers = [...viewportPointers.values()];
    return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
  }

  function startViewportGesture(event) {
    if (!fullscreenActive()) return;
    const viewport = $('transferQrViewport');
    viewport.setPointerCapture(event.pointerId);
    viewportPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (viewportPointers.size === 1) {
      panStart = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.classList.add('is-panning');
    } else if (viewportPointers.size === 2) {
      pinchStartDistance = pointerDistance();
      pinchStartZoom = Number($('transferQrZoom').value);
      panStart = null;
    }
    event.preventDefault();
  }

  function moveViewportGesture(event) {
    if (!viewportPointers.has(event.pointerId)) return;
    const viewport = $('transferQrViewport');
    viewportPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (viewportPointers.size === 2 && pinchStartDistance) {
      setQrZoom(pinchStartZoom * pointerDistance() / pinchStartDistance);
    } else if (viewportPointers.size === 1 && panStart) {
      viewport.scrollLeft = panStart.left - (event.clientX - panStart.x);
      viewport.scrollTop = panStart.top - (event.clientY - panStart.y);
    }
    event.preventDefault();
  }

  function endViewportGesture(event) {
    viewportPointers.delete(event.pointerId);
    const viewport = $('transferQrViewport');
    if (viewportPointers.size === 1) {
      const pointer = [...viewportPointers.values()][0];
      panStart = { x: pointer.x, y: pointer.y, left: viewport.scrollLeft, top: viewport.scrollTop };
    } else {
      panStart = null;
      pinchStartDistance = 0;
      viewport.classList.remove('is-panning');
    }
  }

  function updateFullscreenButton() {
    const active = fullscreenActive();
    const stage = $('transferQrStage');
    const button = $('transferFullscreen');
    button.textContent = tr(active ? 'exitFullscreen' : 'fullscreen');
    button.setAttribute('aria-label', tr(active ? 'exitFullscreen' : 'fullscreen'));
    if (active) {
      stage.setAttribute('role', 'dialog');
      stage.setAttribute('aria-modal', 'true');
    } else {
      stage.removeAttribute('role');
      stage.removeAttribute('aria-modal');
    }
    if (active) setQrZoom($('transferQrZoom').value);
    else stage.style.removeProperty('--qr-box-size');
    document.documentElement.classList.toggle('transfer-fullscreen-fallback-open', stage.classList.contains('fullscreen-fallback'));
  }

  function toggleTransferFullscreen() {
    const stage = $('transferQrStage');
    if (stage.classList.contains('fullscreen-fallback')) {
      stage.classList.remove('fullscreen-fallback');
      if (fullscreenPlaceholder?.parentNode) fullscreenPlaceholder.replaceWith(stage);
      fullscreenPlaceholder = null;
    } else {
      fullscreenPlaceholder = document.createComment('transfer fullscreen position');
      stage.replaceWith(fullscreenPlaceholder);
      document.body.append(stage);
      stage.classList.add('fullscreen-fallback');
    }
    updateFullscreenButton();
  }

  function updatePlaybackButton() {
    const key = playTimer ? 'pause' : 'play';
    ['transferPlayPause', 'transferModalPlayPause'].forEach((id) => {
      const button = $(id);
      button.textContent = tr(key);
      button.dataset.transferI18n = key;
    });
  }

  function drawFrame(index) {
    if (!frames.length) return;
    frameIndex = (index + frames.length) % frames.length;
    try {
      window.drawQrToCanvas(frames[frameIndex], $('transferQrCanvas'));
      $('transferFrameNumber').value = String(frameIndex + 1);
      $('transferFrameNumber').max = String(frames.length);
      $('transferFrameTotal').textContent = String(frames.length);
      $('transferSendProgress').value = (frameIndex + 1) / frames.length;
    } catch (error) {
      pauseFrames();
      setStatus('transferSendStatus', error.message || tr('badFile'), 'error');
    }
  }

  function playFrames() {
    if (!frames.length) return;
    pauseFrames();
    playTimer = setInterval(() => drawFrame(frameIndex + 1), frameInterval());
    updatePlaybackButton();
  }

  function canvasPngBytes(canvas) {
    return new Promise((resolve, reject) => canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error('PNG_FAILED'));
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, 'image/png'));
  }

  async function downloadQrZip() {
    if (!frames.length) return;
    $('transferDownloadZip').disabled = true;
    try {
      const digits = String(frames.length).length;
      const files = [];
      for (let index = 0; index < frames.length; index += 1) {
        const canvas = document.createElement('canvas');
        window.drawQrToCanvas(frames[index], canvas);
        files.push({ name: `qr-${String(index + 1).padStart(digits, '0')}.png`, bytes: await canvasPngBytes(canvas) });
      }
      const zip = new Blob([createStoreZip(files)], { type: 'application/zip' });
      const name = 'secretchat-qr-images.zip';
      const androidZipSaver = nativeBridge('saveQrZip');
      if (androidZipSaver) {
        const saved = androidZipSaver(name, bytesToBase64(new Uint8Array(await zip.arrayBuffer())));
        if (!saved) throw new Error('ANDROID_SAVE_FAILED');
      } else {
        const url = URL.createObjectURL(zip);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      await window.SecretChatOutputs?.add(name, zip);
      showZipReadyStatus(Boolean(androidZipSaver && nativeBridge('openZipDirectory')));
    } catch (error) {
      setStatus('transferSendStatus', error.message || tr('badFile'), 'error');
    } finally {
      $('transferDownloadZip').disabled = false;
    }
  }

  async function scanTransferImages(fileList) {
    const selectedFiles = [...fileList];
    if (!selectedFiles.length) return;
    setStatus('transferReceiveStatus', tr('scannerStarting'));
    let scanner;
    try {
      const expanded = await Promise.all(selectedFiles.map((file) => /\.zip$/iu.test(file.name) || /(?:^|\/)zip(?:$|;)/iu.test(file.type) ? zipImageFiles(file) : [file]));
      const files = expanded.flat().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      if (!(await loadTransferScannerEngine('html5qrcode'))) throw new Error('HTML5_QRCODE_MISSING');
      const qrFormat = window.Html5QrcodeSupportedFormats?.QR_CODE;
      scanner = new Html5Qrcode('transferScannerTarget', Number.isInteger(qrFormat) ? { formatsToSupport: [qrFormat] } : {}, false);
      let scanned = 0;
      for (const file of files) {
        try {
          const value = await scanner.scanFile(file, false);
          await receiveFrame(value);
          scanned += 1;
        } catch (error) {
          // Continue so one unreadable image does not discard an otherwise valid batch.
        }
      }
      if (!scanned) throw new Error('NO_QR_FOUND');
    } catch (error) {
      setStatus('transferReceiveStatus', `${tr('invalid')} ${error.message || ''}`.trim(), 'error');
    } finally {
      try { await scanner?.clear(); } catch (error) {}
      $('transferQrImages').value = '';
    }
  }

  function pauseFrames() {
    clearInterval(playTimer);
    playTimer = null;
    updatePlaybackButton();
  }

  function toggleFrames() { if (playTimer) pauseFrames(); else playFrames(); }

  function jumpToTypedFrame() {
    clearTimeout(frameJumpTimer);
    if (!$('transferFrameNumber').value || !frames.length) return;
    const requested = Math.min(frames.length, Math.max(1, Math.trunc(Number($('transferFrameNumber').value)) || 1));
    pauseFrames();
    drawFrame(requested - 1);
  }

  async function prepareFile(file) {
    pauseFrames();
    frames = [];
    updateSendControls(false);
    $('transferDownloadZip').disabled = true;
    $('transferQrStage').hidden = true;
    if (!file) return;
    setStatus('transferSendStatus', tr('preparing'));

    try {
      const plainBytes = new Uint8Array(await file.arrayBuffer());
      const password = $('transferSendPassword').value;
      if (password && password.length < MIN_FILE_PASSWORD_LENGTH) {
        throw new Error(tr('shortPassword', MIN_FILE_PASSWORD_LENGTH - password.length));
      }

      const protectedFile = password ? await encryptFileBytes(plainBytes, password) : null;
      const bytes = protectedFile?.bytes || plainBytes;
      const blockLen = Number($('transferChunkSize').value);
      const total = Math.ceil(bytes.length / blockLen) || 1;
      if (total > 99999) throw new Error(tr('badFile'));

      const id = transferId();
      const hash = await sha256(bytes);
      const manifest = {
        name: file.name.slice(0, 160),
        type: (file.type || 'application/octet-stream').slice(0, 100),
        size: bytes.length,
        blockLen,
        total,
        hash
      };

      if (protectedFile) {
        Object.assign(manifest, {
          encrypted: true,
          salt: protectedFile.salt,
          iv: protectedFile.iv,
          plainSize: plainBytes.length,
          plainHash: await sha256(plainBytes)
        });
      }

      const sourceBlocks = Array.from({ length: total }, (_, index) => makePaddedBlock(bytes, index, blockLen));
      const manifestFrame = `${PROTOCOL}|${id}|M|${total}|${blockLen}|${base64UrlEncode(JSON.stringify(manifest))}`;
      const dataFrames = [];

      for (let sequence = 0; sequence < total; sequence += 1) {
        const payload = sourceBlocks[sequence];
        dataFrames.push(`${PROTOCOL}|${id}|F|${sequence}|${total}|${crc32(payload)}|${sequence}|${bytesToBase64(payload)}`);
      }

      const repairCount = Math.max(12, Math.ceil(total * 0.4));
      for (let repair = 0; repair < repairCount; repair += 1) {
        const sequence = total + repair;
        const indices = repairIndices(id, sequence, total);
        const payload = new Uint8Array(blockLen);
        for (const index of indices) xorInto(payload, sourceBlocks[index]);
        dataFrames.push(`${PROTOCOL}|${id}|F|${sequence}|${total}|${crc32(payload)}|${indices.join('.')}|${bytesToBase64(payload)}`);
      }

      frames = [];
      dataFrames.forEach((frame, index) => {
        if (index % 12 === 0) frames.push(manifestFrame);
        frames.push(frame);
      });

      frameIndex = 0;
      $('transferQrStage').hidden = false;
      updateSendControls(true);
      $('transferDownloadZip').disabled = false;
      drawFrame(0);

      const cycleTime = frames.length * frameInterval();
      setStatus('transferSendStatus', tr('ready', frames.length, formatDuration(cycleTime)), 'ok');
    } catch (error) {
      setStatus('transferSendStatus', error.message || tr('badFile'), 'error');
    }
  }

  function updateScannerProgress(message) {
    $('transferCameraStatus').textContent = message;
    $('transferCameraStatus').className = 'transfer-status';
  }

  function loadTransferScannerEngine(engine) {
    const readyChecks = {
      html5qrcode: () => Boolean(window.Html5Qrcode),
      jsqr: () => Boolean(window.jsQR),
      zxing: () => Boolean(window.ZXing?.BrowserMultiFormatReader),
      qrscanner: () => Boolean(window.QrScanner)
    };
    const files = {
      html5qrcode: 'html5-qrcode.min.js',
      jsqr: 'jsQR.min.js',
      zxing: 'zxing.min.js',
      qrscanner: 'qr-scanner.umd.min.js'
    };
    const ready = readyChecks[engine];
    if (!ready || !files[engine]) return Promise.resolve(false);
    if (ready()) return Promise.resolve(true);
    if (scannerEnginePromises[engine]) return scannerEnginePromises[engine];
    scannerEnginePromises[engine] = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = new URL(`./vendor/${files[engine]}`, document.baseURI).href;
      script.async = true;
      script.onload = () => resolve(ready());
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    }).then((loaded) => {
      if (!loaded) delete scannerEnginePromises[engine];
      return loaded;
    });
    return scannerEnginePromises[engine];
  }

  async function stopTransferScanner() {
    const scanner = transferScanner;
    transferScanner = null;
    transferScannerStarting = false;
    try {
      if (scanner) await scanner.stop();
    } catch (error) {
      // The stream may already be stopped by Android WebView.
    }
    try { if (scanner) await scanner.clear(); } catch (error) {}
    transferScannerRunning = false;
    $('transferScannerTarget').replaceChildren();
  }

  async function closeTransferScanner() {
    $('transferScannerModal').classList.remove('active');
    await stopTransferScanner();
  }

  async function openTransferScanner() {
    if (transferScannerStarting || transferScannerRunning) return;
    $('transferScannerModal').classList.add('active');
    $('transferCameraStatus').textContent = tr('scannerStarting');
    $('transferCameraStatus').className = 'transfer-status';
    transferScannerStarting = true;
    try {
      const engine = selectedScannerEngine;
      if (!(await loadTransferScannerEngine(engine))) throw new Error(`${engine.toUpperCase()}_MISSING`);
      if (!$('transferScannerModal').classList.contains('active') || !transferScannerStarting) return;
      let scanner;
      if (engine === 'jsqr') {
        const video = document.createElement('video');
        video.muted = true;
        video.setAttribute('playsinline', '');
        $('transferScannerTarget').replaceChildren(video);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'environment' } });
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        let animationFrame = 0;
        let stopped = false;
        const scan = () => {
          if (stopped) return;
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = context.getImageData(0, 0, canvas.width, canvas.height);
            const result = window.jsQR(image.data, image.width, image.height);
            if (result?.data) receiveFrame(result.data);
          }
          animationFrame = requestAnimationFrame(scan);
        };
        scanner = {
          stop: async () => {
            stopped = true;
            cancelAnimationFrame(animationFrame);
            stream.getTracks().forEach((track) => track.stop());
          },
          clear: async () => $('transferScannerTarget').replaceChildren()
        };
        transferScanner = scanner;
        scan();
      } else if (engine === 'zxing') {
        const video = document.createElement('video');
        video.id = 'transferZxingVideo';
        video.muted = true;
        video.setAttribute('playsinline', '');
        $('transferScannerTarget').replaceChildren(video);
        const reader = new ZXing.BrowserMultiFormatReader();
        scanner = {
          stop: async () => reader.reset(),
          clear: async () => $('transferScannerTarget').replaceChildren()
        };
        transferScanner = scanner;
        await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: 'environment' } },
          video,
          (result) => { if (result) receiveFrame(result.getText?.() || result.text || ''); }
        );
      } else if (engine === 'qrscanner') {
        const video = document.createElement('video');
        video.muted = true;
        video.setAttribute('playsinline', '');
        $('transferScannerTarget').replaceChildren(video);
        const reader = new QrScanner(
          video,
          (result) => receiveFrame(result?.data || result || ''),
          { preferredCamera: 'environment', returnDetailedScanResult: true, highlightScanRegion: false, highlightCodeOutline: false }
        );
        scanner = {
          stop: async () => reader.stop(),
          clear: async () => {
            reader.destroy();
            $('transferScannerTarget').replaceChildren();
          }
        };
        transferScanner = scanner;
        await reader.start();
      } else {
        const qrFormat = window.Html5QrcodeSupportedFormats?.QR_CODE;
        const config = Number.isInteger(qrFormat) ? { formatsToSupport: [qrFormat] } : {};
        scanner = new Html5Qrcode('transferScannerTarget', config, false);
        transferScanner = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: (width, height) => Math.max(160, Math.min(270, width - 32, height - 32)), aspectRatio: 1 },
          (value) => receiveFrame(value),
          () => {}
        );
      }
      if (transferScanner !== scanner) {
        await scanner.stop().catch(() => {});
        await scanner.clear().catch(() => {});
        return;
      }
      transferScannerRunning = true;
      $('transferCameraStatus').textContent = tr('scannerReady');
    } catch (error) {
      await stopTransferScanner();
      $('transferCameraStatus').textContent = `${tr('scannerError')} ${error.message || ''}`.trim();
      $('transferCameraStatus').className = 'transfer-status error';
    } finally {
      transferScannerStarting = false;
    }
  }

  function parseFrame(value) {
    if (typeof value !== 'string' || !value.startsWith(`${PROTOCOL}|`)) return null;
    const parts = value.split('|');

    if (parts[2] === 'M' && parts.length === 6) {
      return {
        id: parts[1],
        kind: 'M',
        total: Number(parts[3]),
        blockLen: Number(parts[4]),
        payload: parts[5]
      };
    }

    if (parts[2] === 'F' && parts.length === 8) {
      return {
        id: parts[1],
        kind: 'F',
        sequence: Number(parts[3]),
        total: Number(parts[4]),
        crc: parts[5],
        indices: parts[6].split('.').map(Number),
        payload: parts[7]
      };
    }

    throw new Error('INVALID_FRAME');
  }

  async function finishReceive() {
    if (received.assembling || !received.manifest || received.solvedCount !== received.total) return;
    received.assembling = true;
    setStatus('transferReceiveStatus', tr('verifying'));

    try {
      const padded = new Uint8Array(received.total * received.blockLen);
      for (let index = 0; index < received.total; index += 1) {
        const block = received.blocks[index];
        if (!block) throw new Error('MISSING_BLOCK');
        padded.set(block, index * received.blockLen);
      }

      const bytes = padded.slice(0, received.manifest.size);
      if (await sha256(bytes) !== received.manifest.hash) throw new Error('HASH_MISMATCH');

      if (received.manifest.encrypted) {
        received.encryptedBytes = bytes;
        $('transferPasswordUnlock').hidden = false;
        setStatus('transferReceiveStatus', tr('passwordRequired'), 'ok');
        updateScannerProgress(tr('scannerComplete'));
        await closeTransferScanner();
        $('transferReceivePassword').focus();
        return;
      }

      showReceivedFile(bytes);
      await closeTransferScanner();
    } catch (error) {
      received.assembling = false;
      setStatus('transferReceiveStatus', tr('hashError'), 'error');
    }
  }

  function showReceivedFile(bytes) {
    received.bytes = bytes;
    received.blob = new Blob([bytes], { type: received.manifest.type });

    if (received.manifest.type.startsWith('image/')) {
      received.previewUrl = URL.createObjectURL(received.blob);
      $('transferImagePreview').src = received.previewUrl;
      $('transferImagePreview').alt = received.manifest.name;
      $('transferImagePreview').hidden = false;
    } else {
      $('transferImagePreview').removeAttribute('src');
      $('transferImagePreview').hidden = true;
    }

    $('transferReceivedName').textContent = received.manifest.name;
    $('transferReceivedSize').textContent = `${bytes.length.toLocaleString()} bytes`;
    $('transferFileReady').hidden = false;
    setStatus('transferReceiveStatus', tr('complete'), 'ok');
    updateScannerProgress(tr('scannerComplete'));
  }

  async function unlockReceivedFile() {
    if (!received.encryptedBytes || !received.manifest) return;
    try {
      const bytes = await decryptFileBytes(received.encryptedBytes, $('transferReceivePassword').value, received.manifest);
      if (bytes.length !== received.manifest.plainSize || await sha256(bytes) !== received.manifest.plainHash) {
        throw new Error('BAD_PASSWORD');
      }
      $('transferPasswordUnlock').hidden = true;
      $('transferReceivePassword').value = '';
      showReceivedFile(bytes);
    } catch (error) {
      setStatus('transferReceiveStatus', tr('wrongPassword'), 'error');
    }
  }

  async function receiveFrame(value) {
    let frame;
    try {
      frame = parseFrame(value);
    } catch (error) {
      setStatus('transferReceiveStatus', tr('invalid'), 'error');
      return;
    }

    if (!frame) return;
    if (!frame.id || !Number.isInteger(frame.total) || frame.total < 1 || frame.total > 99999) {
      setStatus('transferReceiveStatus', tr('invalid'), 'error');
      return;
    }

    if (received.id && received.id !== frame.id) {
      setStatus('transferReceiveStatus', tr('different'), 'error');
      return;
    }

    if (!received.id) {
      received.id = frame.id;
      received.total = frame.total;
      received.blocks = new Array(frame.total);
    }

    if (received.total !== frame.total) {
      setStatus('transferReceiveStatus', tr('invalid'), 'error');
      return;
    }

    try {
      if (frame.kind === 'M') {
        const manifest = JSON.parse(base64UrlDecode(frame.payload));
        if (
          !manifest.name ||
          !Number.isInteger(manifest.size) ||
          manifest.size < 0 ||
          !Number.isInteger(manifest.blockLen) ||
          manifest.blockLen < 1 ||
          !Number.isInteger(manifest.total) ||
          manifest.total !== received.total ||
          manifest.blockLen !== frame.blockLen ||
          !/^[a-f0-9]{64}$/u.test(manifest.hash)
        ) {
          throw new Error('INVALID_MANIFEST');
        }

        if (
          manifest.encrypted &&
          (!manifest.salt || !manifest.iv || !Number.isInteger(manifest.plainSize) || !/^[a-f0-9]{64}$/u.test(manifest.plainHash))
        ) {
          throw new Error('INVALID_ENCRYPTED_MANIFEST');
        }

        if (received.blockLen && received.blockLen !== manifest.blockLen) throw new Error('BLOCK_LENGTH_MISMATCH');
        received.blockLen = manifest.blockLen;
        received.manifest = manifest;
      } else {
        if (!Number.isInteger(frame.sequence) || frame.sequence < 0) throw new Error('INVALID_SEQUENCE');
        if (!frame.indices.length || frame.indices.length > 5 || frame.indices.some((index) => !Number.isInteger(index) || index < 0 || index >= received.total)) {
          throw new Error('INVALID_INDICES');
        }

        const payload = base64ToBytes(frame.payload);
        if (crc32(payload) !== frame.crc) throw new Error('CRC_MISMATCH');

        if (received.blockLen && received.blockLen !== payload.length) throw new Error('BLOCK_LENGTH_MISMATCH');
        if (!received.blockLen) received.blockLen = payload.length;

        addEquation(frame.sequence, frame.indices, payload);
      }

      const done = received.solvedCount;
      $('transferReceiveProgress').value = done / received.total;
      setStatus('transferReceiveStatus', tr('receiving', done, received.total));
      updateScannerProgress(tr('scannerProgress', done, received.total));
      await finishReceive();
    } catch (error) {
      setStatus('transferReceiveStatus', tr('invalid'), 'error');
    }
  }

  function resetReceive() {
    if (received.previewUrl) URL.revokeObjectURL(received.previewUrl);
    received = freshReceiveState();
    $('transferReceiveProgress').value = 0;
    $('transferFileReady').hidden = true;
    $('transferImagePreview').removeAttribute('src');
    $('transferImagePreview').hidden = true;
    $('transferPasswordUnlock').hidden = true;
    $('transferReceivePassword').value = '';
    $('transferReceivePassword').type = 'password';
    const passwordToggle = document.querySelector('[data-toggle-password="transferReceivePassword"]');
    passwordToggle?.classList.remove('visible');
    passwordToggle?.setAttribute('aria-label', 'show password');
    setStatus('transferReceiveStatus', tr('waiting'));
  }

  function safeFileName(value) { return value.replace(/[\\/:*?"<>|]/gu, '_') || 'received-file'; }

  async function saveReceivedFile() {
    if (!received.blob || !received.bytes || !received.manifest) return;
    const name = safeFileName(received.manifest.name);
    try {
      const androidFileSaver = nativeBridge('saveBase64File');
      if (androidFileSaver) {
        const saved = androidFileSaver(name, bytesToBase64(received.bytes), received.manifest.type);
        if (!saved) throw new Error('ANDROID_SAVE_FAILED');
      } else {
        const url = URL.createObjectURL(received.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      setStatus('transferReceiveStatus', tr('saved'), 'ok');
      await window.SecretChatOutputs?.add(name, received.blob);
    } catch (error) {
      setStatus('transferReceiveStatus', tr('saveError'), 'error');
    }
  }

  $('transferFile').addEventListener('change', () => prepareFile($('transferFile').files[0]));
  $('transferSendPassword').addEventListener('input', updateTransferPasswordStrength);
  $('transferSendPassword').addEventListener('change', () => prepareFile($('transferFile').files[0]));
  $('transferGeneratePassword').addEventListener('click', generateTransferPassword);
  $('transferChunkSize').addEventListener('change', () => prepareFile($('transferFile').files[0]));
  $('transferChunkSize').addEventListener('input', updateDensityOutput);
  $('transferSpeed').addEventListener('input', () => {
    updateSpeedOutput();
    if (playTimer) playFrames();
    if (frames.length) setStatus('transferSendStatus', tr('ready', frames.length, formatDuration(frames.length * frameInterval())), 'ok');
  });
  $('transferPlayPause').addEventListener('click', toggleFrames);
  $('transferModalPlayPause').addEventListener('click', toggleFrames);
  $('transferDownloadZip').addEventListener('click', downloadQrZip);
  $('transferQrZoom').addEventListener('input', () => setQrZoom($('transferQrZoom').value));
  $('transferViewportResizeHandle').addEventListener('pointerdown', startViewportResize);
  $('transferViewportResizeHandle').addEventListener('pointermove', moveViewportResize);
  $('transferViewportResizeHandle').addEventListener('pointerup', endViewportResize);
  $('transferViewportResizeHandle').addEventListener('pointercancel', endViewportResize);
  $('transferViewportResizeHandle').addEventListener('keydown', resizeViewportWithKeyboard);
  $('transferQrViewport').addEventListener('pointerdown', startViewportGesture);
  $('transferQrViewport').addEventListener('pointermove', moveViewportGesture);
  $('transferQrViewport').addEventListener('pointerup', endViewportGesture);
  $('transferQrViewport').addEventListener('pointercancel', endViewportGesture);
  $('transferFullscreen').addEventListener('click', toggleTransferFullscreen);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !$('transferQrStage').classList.contains('fullscreen-fallback')) return;
    toggleTransferFullscreen();
  });
  document.addEventListener('fullscreenchange', updateFullscreenButton);
  window.addEventListener('resize', () => {
    if (!fullscreenActive()) return;
    const savedHeight = Number(localStorage.getItem(VIEWPORT_HEIGHT_KEY));
    if (savedHeight > 0) setViewportHeight(window.innerHeight * savedHeight / 100, false);
    setQrZoom($('transferQrZoom').value);
  });
  $('transferModalPrevious').addEventListener('click', () => { pauseFrames(); drawFrame(frameIndex - 1); });
  $('transferModalNext').addEventListener('click', () => { pauseFrames(); drawFrame(frameIndex + 1); });
  $('transferPrevious').addEventListener('click', () => { pauseFrames(); drawFrame(frameIndex - 1); });
  $('transferNext').addEventListener('click', () => { pauseFrames(); drawFrame(frameIndex + 1); });
  $('transferFrameNumber').addEventListener('input', () => {
    clearTimeout(frameJumpTimer);
    frameJumpTimer = setTimeout(jumpToTypedFrame, 450);
  });
  $('transferFrameNumber').addEventListener('change', jumpToTypedFrame);
  $('transferFrameNumber').addEventListener('keydown', (event) => { if (event.key === 'Enter') jumpToTypedFrame(); });
  $('transferOpenScanner').addEventListener('click', openTransferScanner);
  $('transferScannerEngine').value = selectedScannerEngine;
  $('transferScannerEngine').addEventListener('change', async () => {
    selectedScannerEngine = $('transferScannerEngine').value;
    localStorage.setItem(SCANNER_ENGINE_KEY, selectedScannerEngine);
    const wasOpen = $('transferScannerModal').classList.contains('active');
    await stopTransferScanner();
    if (wasOpen) openTransferScanner();
  });
  $('transferCloseScanner').addEventListener('click', closeTransferScanner);
  $('transferStopScanner').addEventListener('click', closeTransferScanner);
  $('transferScannerModal').addEventListener('click', (event) => { if (event.target === $('transferScannerModal')) closeTransferScanner(); });
  $('transferResetReceive').addEventListener('click', resetReceive);
  $('transferSaveFile').addEventListener('click', saveReceivedFile);
  $('transferUnlockFile').addEventListener('click', unlockReceivedFile);
  $('transferReceivePassword').addEventListener('keydown', (event) => { if (event.key === 'Enter') unlockReceivedFile(); });
  $('transferQrImages').addEventListener('change', () => scanTransferImages($('transferQrImages').files));
  window.addEventListener('secretchat:tabchange', (event) => {
    if (event.detail?.tab !== 'transfer') {
      pauseFrames();
      closeTransferScanner();
    }
  });
  new MutationObserver(applyTransferLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  applyTransferLanguage();
  updateSpeedOutput();
  updateDensityOutput();
  const savedViewportHeight = Number(localStorage.getItem(VIEWPORT_HEIGHT_KEY));
  setViewportHeight(window.innerHeight * (savedViewportHeight > 0 ? savedViewportHeight : 55) / 100, false);
  setQrZoom(1);
  updateFullscreenButton();
  resetReceive();
})();
