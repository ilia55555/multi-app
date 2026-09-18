(() => {
  'use strict';

  const WF = window.WayFoldProtocol;
  if (!WF) throw new Error('WayFold protocol core is unavailable');
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
  let senderState = null;
  let frameIndex = 0;
  let playTimer = null;
  let nextFrameAt = 0;
  let frameJumpTimer = null;
  const viewportPointers = new Map();
  let panStart = null;
  let viewportResizeStart = null;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let fullscreenPlaceholder = null;
  let received = freshReceiveState();
  const ignoredStreams = new Set();
  let receiveWatchdog = null;
  let receiveWakeLock = null;
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
      decoder: null,
      header: null,
      startedAt: 0,
      lastProgressAt: 0,
      framesAtStart: 0,
      blob: null,
      bytes: null,
      manifest: null,
      encryptedBytes: null,
      encryptedMeta: null,
      previewUrl: null,
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

  const fountainDegreeCache = new Map();

  function fountainDegreeCdf(total) {
    if (fountainDegreeCache.has(total)) return fountainDegreeCache.get(total);

    if (total <= 1) {
      const single = [1];
      fountainDegreeCache.set(total, single);
      return single;
    }

    const c = 0.1;
    const delta = 0.05;
    const r = c * Math.log(total / delta) * Math.sqrt(total);
    const spike = Math.max(1, Math.min(total, Math.floor(total / Math.max(r, 1e-9))));
    const weights = new Float64Array(total);
    let sum = 0;

    for (let degree = 1; degree <= total; degree += 1) {
      const rho = degree === 1 ? 1 / total : 1 / (degree * (degree - 1));
      let tau = 0;

      if (degree < spike) tau = r / (degree * total);
      else if (degree === spike) tau = r * Math.log(Math.max(r / delta, 1)) / total;

      const weight = rho + tau;
      weights[degree - 1] = weight;
      sum += weight;
    }

    const cdf = new Float64Array(total);
    let cumulative = 0;
    for (let index = 0; index < total; index += 1) {
      cumulative += weights[index] / sum;
      cdf[index] = cumulative;
    }
    cdf[total - 1] = 1;
    fountainDegreeCache.set(total, cdf);
    return cdf;
  }

  function repairIndices(id, sequence, total) {
    if (sequence < total) return [sequence];
    if (total <= 1) return [0];

    const state = { value: seedForFrame(id, sequence) };
    const cdf = fountainDegreeCdf(total);
    const roll = nextRandom(state) / 0x100000000;

    let low = 0;
    let high = cdf.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (roll <= cdf[mid]) high = mid;
      else low = mid + 1;
    }

    const degree = low + 1;
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

  const SECRET_ENCRYPTED_MIME = 'application/x-secretchat-wayfold-aesgcm';
  const SECRET_ENCRYPTED_MAGIC = new Uint8Array([83, 67, 69, 49]);

  async function packSecretEncryptedPayload(plainBytes, password, mime) {
    const protectedFile = await encryptFileBytes(plainBytes, password);
    const metadata = {
      salt: protectedFile.salt,
      iv: protectedFile.iv,
      plainSize: plainBytes.length,
      plainHash: await sha256(plainBytes),
      mime: mime || 'application/octet-stream'
    };
    const metadataBytes = encoder.encode(JSON.stringify(metadata));
    if (metadataBytes.length > 65535) throw new Error('ENCRYPTED_METADATA_TOO_LARGE');

    const output = new Uint8Array(6 + metadataBytes.length + protectedFile.bytes.length);
    output.set(SECRET_ENCRYPTED_MAGIC, 0);
    new DataView(output.buffer).setUint16(4, metadataBytes.length, true);
    output.set(metadataBytes, 6);
    output.set(protectedFile.bytes, 6 + metadataBytes.length);
    return output;
  }

  function unpackSecretEncryptedPayload(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 7) return null;
    for (let i = 0; i < SECRET_ENCRYPTED_MAGIC.length; i += 1) {
      if (bytes[i] !== SECRET_ENCRYPTED_MAGIC[i]) return null;
    }
    try {
      const metadataLength = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(4, true);
      const metadataEnd = 6 + metadataLength;
      if (metadataEnd >= bytes.length) return null;
      const metadata = JSON.parse(decoder.decode(bytes.subarray(6, metadataEnd)));
      if (
        !metadata?.salt ||
        !metadata?.iv ||
        !Number.isInteger(metadata.plainSize) ||
        metadata.plainSize < 0 ||
        !/^[a-f0-9]{64}$/u.test(metadata.plainHash || '')
      ) return null;
      return {
        metadata,
        encryptedBytes: bytes.slice(metadataEnd)
      };
    } catch (_) {
      return null;
    }
  }

  function buildSenderFrame(sequence) {
    if (!senderState) return null;
    const seq = sequence >>> 0;
    const block = senderState.encoder.encode(seq);
    return WF.packFrame({ ...senderState.header, seq }, block);
  }

  function drawFrame(index) {
    if (!senderState) return;
    const sequence = Math.max(0, Math.trunc(Number(index)) || 0) >>> 0;

    try {
      const frame = buildSenderFrame(sequence);
      if (!frame) return;
      window.drawQrBytesToCanvas(frame, $('transferQrCanvas'));
      frameIndex = sequence;
      $('transferFrameNumber').value = String(sequence + 1);
      $('transferFrameNumber').max = String(0xffffffff);
      $('transferFrameTotal').textContent = '∞';
      $('transferSendProgress').value = 0;
    } catch (error) {
      pauseFrames();
      setStatus('transferSendStatus', error.message || tr('badFile'), 'error');
    }
  }

  function playFrames() {
    if (!senderState) return;
    pauseFrames();
    const interval = 1000 / frameRate();
    nextFrameAt = performance.now();

    const tick = (now) => {
      if (!senderState || !playTimer) return;
      playTimer = requestAnimationFrame(tick);
      if (now < nextFrameAt) return;
      drawFrame((frameIndex + 1) >>> 0);
      nextFrameAt += interval;
      if (now - nextFrameAt > 3 * interval) nextFrameAt = now + interval;
    };

    playTimer = requestAnimationFrame(tick);
    updatePlaybackButton();
  }

  async function downloadQrZip() {
    setStatus('transferSendStatus', language() === 'fa'
      ? 'در حالت WayFold جریان QR نامحدود است و ZIP همه فریم‌ها وجود ندارد.'
      : 'WayFold uses an unbounded QR stream; there is no finite ZIP of all frames.');
  }

  async function scanTransferImages() {
    setStatus('transferReceiveStatus', language() === 'fa'
      ? 'دریافت WayFold از دوربین زنده انجام می‌شود.'
      : 'WayFold receiving uses the live camera stream.');
  }

  function pauseFrames() {
    if (playTimer !== null) cancelAnimationFrame(playTimer);
    playTimer = null;
    updatePlaybackButton();
  }

  function toggleFrames() {
    if (playTimer !== null) pauseFrames();
    else playFrames();
  }

  function jumpToTypedFrame() {
    clearTimeout(frameJumpTimer);
    if (!$('transferFrameNumber').value || !senderState) return;
    const requested = Math.max(1, Math.min(0x100000000, Math.trunc(Number($('transferFrameNumber').value)) || 1));
    pauseFrames();
    drawFrame(requested - 1);
  }

  async function prepareFile(file) {
    pauseFrames();
    frames = [];
    senderState = null;
    updateSendControls(false);
    $('transferDownloadZip').disabled = true;
    $('transferQrStage').hidden = true;
    if (!file) return;

    setStatus('transferSendStatus', tr('preparing'));

    try {
      const plainBytes = new Uint8Array(await file.arrayBuffer());
      if (plainBytes.length < 1 || plainBytes.length > WF.MAX_FILE_BYTES) {
        throw new Error(language() === 'fa' ? 'حداکثر اندازه فایل ۵۰ MiB است.' : 'Maximum file size is 50 MiB.');
      }

      if (plainBytes.length > WF.LARGE_TRANSFER_BYTES) {
        const accepted = window.confirm(language() === 'fa'
          ? `فایل بزرگ است: ${(plainBytes.length / WF.MiB).toFixed(1)} MiB. انتقال نوری ممکن است طول بکشد. ادامه می‌دهید؟`
          : `Large file: ${(plainBytes.length / WF.MiB).toFixed(1)} MiB. Optical transfer may take a long time. Continue?`);
        if (!accepted) {
          setStatus('transferSendStatus', language() === 'fa' ? 'انتقال لغو شد.' : 'Transfer cancelled.');
          return;
        }
      }

      const password = $('transferSendPassword').value;
      if (password && password.length < MIN_FILE_PASSWORD_LENGTH) {
        throw new Error(tr('shortPassword', MIN_FILE_PASSWORD_LENGTH - password.length));
      }

      const sourceMime = file.type || 'application/octet-stream';
      const opticalFileBytes = password
        ? await packSecretEncryptedPayload(plainBytes, password, sourceMime)
        : plainBytes;
      const opticalMime = password ? SECRET_ENCRYPTED_MIME : sourceMime;

      const wrapped = await WF.wrapFile(opticalFileBytes, file.name, opticalMime);
      const frameBytes = Number($('transferChunkSize').value);
      const blockLen = frameBytes - WF.FRAME_HEADER_BYTES;
      if (!Number.isInteger(blockLen) || blockLen <= 0 || blockLen > WF.MAX_BLOCK_BYTES) {
        throw new Error('INVALID_FRAME_BYTES');
      }

      const sessionId = WF.randomSessionId();
      const fountain = new WF.FountainEncoder(wrapped.bytes, blockLen, sessionId);
      if (fountain.k > WF.MAX_BLOCKS) {
        throw new Error(language() === 'fa'
          ? `این تنظیم به ${fountain.k} بلوک نیاز دارد؛ حداکثر ${WF.MAX_BLOCKS} است.`
          : `This setting needs ${fountain.k} blocks; maximum is ${WF.MAX_BLOCKS}.`);
      }

      senderState = {
        wrapped,
        encoder: fountain,
        header: {
          sessionId,
          seq: 0,
          k: fountain.k,
          blockLen,
          totalLen: wrapped.bytes.length,
          payloadFnv: WF.fnv1a(wrapped.bytes)
        }
      };
      frames = [true];

      frameIndex = 0;
      $('transferQrStage').hidden = false;
      updateSendControls(true);
      $('transferDownloadZip').disabled = true;
      drawFrame(0);

      const saved = wrapped.originalLen - wrapped.wireFileLen;
      const compression = wrapped.compressed && saved > 0
        ? `gzip −${(saved / wrapped.originalLen * 100).toFixed(1)}%`
        : 'raw';
      setStatus(
        'transferSendStatus',
        `${(wrapped.originalLen / WF.MiB).toFixed(2)} MiB · ${compression} · ${Math.ceil(wrapped.bytes.length / 1024)} KiB · ${frameRate()} fps`,
        'ok'
      );
    } catch (error) {
      senderState = null;
      frames = [];
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

  function asUint8Array(value) {
    if (!value) return null;
    if (value instanceof Uint8Array) return value;
    if (value instanceof Uint8ClampedArray) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (Array.isArray(value)) return Uint8Array.from(value);
    return null;
  }

  function concatByteSegments(segments) {
    if (!Array.isArray(segments) || !segments.length) return null;
    const normalized = segments.map(asUint8Array).filter(Boolean);
    if (!normalized.length) return null;
    const total = normalized.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(total);
    let offset = 0;
    for (const part of normalized) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }

  function bytesFromZxingResult(result) {
    if (!result) return null;

    try {
      const metadata = result.getResultMetadata?.() || result.resultMetadata;
      if (metadata?.get) {
        const key = window.ZXing?.ResultMetadataType?.BYTE_SEGMENTS ?? 2;
        const segments = metadata.get(key) || metadata.get(2);
        const bytes = concatByteSegments(segments);
        if (bytes?.length) return bytes;
      }
    } catch (_) {}

    const raw = asUint8Array(result.getRawBytes?.() || result.rawBytes);
    return raw?.length ? raw : null;
  }

  function bytesFromHtml5Result(decodedResult) {
    const inner = decodedResult?.result;
    const bytes = bytesFromZxingResult(inner);
    return bytes?.length ? bytes : null;
  }

  function bytesFromJsQr(result) {
    const bytes = asUint8Array(result?.binaryData);
    return bytes?.length ? bytes : null;
  }

  function receiveHeaderKey(header) {
    return WF.headerKey(header);
  }

  function sameReceiveStream(a, b) {
    return WF.sameStream(a, b);
  }

  function resetWayFoldDecoder(clearIgnored = false) {
    received.decoder = null;
    received.header = null;
    received.startedAt = 0;
    received.lastProgressAt = 0;
    received.assembling = false;
    if (clearIgnored) ignoredStreams.clear();
  }

  function formatTransferRate(bytesPerSecond) {
    if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '…';
    return bytesPerSecond < 1024
      ? `${Math.round(bytesPerSecond)} B/s`
      : `${(bytesPerSecond / 1024).toFixed(1)} KiB/s`;
  }

  function updateWayFoldProgress() {
    if (!received.decoder || !received.header || !received.startedAt) return;

    const now = performance.now();
    const decoderState = received.decoder;
    const header = received.header;
    const k = Math.max(1, decoderState.k);
    const solved = decoderState.solvedCount;
    const framesNew = decoderState.framesNew;
    const targetFrames = k * 1.12;
    const completeTarget = k * 1.06;
    const solvedRatio = solved / k;
    const frameRatio = Math.min(1.05, framesNew / targetFrames);
    const percent = Math.min(99, Math.max(solvedRatio, frameRatio) * 100);
    const elapsedSeconds = Math.max(0.08, (now - received.startedAt) / 1000);
    const estimatedBytes = Math.min(
      header.totalLen,
      Math.max(
        solvedRatio * header.totalLen,
        Math.min(1, framesNew / targetFrames) * header.totalLen
      )
    );
    const rate = framesNew > 0 ? framesNew * decoderState.blockLen / elapsedSeconds : 0;
    const frameRateNow = framesNew > 0 ? framesNew / elapsedSeconds : 0;
    const remainingFrames = Math.max(0, completeTarget - framesNew);
    const eta = frameRateNow > 0 ? remainingFrames / frameRateNow : Infinity;

    $('transferReceiveProgress').value = Math.min(1, percent / 100);
    const etaText = !Number.isFinite(eta)
      ? '…'
      : eta < 1.25 ? '< 1 s'
      : eta < 90 ? `${Math.ceil(eta)} s`
      : eta < 180 ? `${Math.round(eta / 5) * 5} s`
      : `${Math.max(1, Math.round(eta / 60))} min`;

    const progressText = language() === 'fa'
      ? `${Math.min(99, Math.round(percent))}٪ · ${formatTransferRate(rate)} · حدود ${etaText} باقی‌مانده`
      : `${Math.min(99, Math.round(percent))}% · ${formatTransferRate(rate)} · ~${etaText} left`;

    setStatus('transferReceiveStatus', progressText);
    updateScannerProgress(progressText);
  }

  function startReceiveWatchdog() {
    if (receiveWatchdog !== null) clearInterval(receiveWatchdog);
    receiveWatchdog = setInterval(() => {
      if (!transferScannerRunning || !received.decoder || !received.header || !received.lastProgressAt) return;
      if (performance.now() - received.lastProgressAt > WF.RECEIVE_TIMEOUT_MS) {
        setStatus(
          'transferReceiveStatus',
          language() === 'fa'
            ? '۱۲۰ ثانیه فریم جدیدی دریافت نشد. دوباره شروع کنید.'
            : 'Timed out after 120s without a new frame. Start again.',
          'error'
        );
        closeTransferScanner();
      } else {
        updateWayFoldProgress();
      }
    }, 200);
  }

  async function acquireWakeLock() {
    try {
      receiveWakeLock = await navigator.wakeLock?.request('screen');
    } catch (_) {
      receiveWakeLock = null;
    }
  }

  async function releaseWakeLock() {
    try { await receiveWakeLock?.release?.(); } catch (_) {}
    receiveWakeLock = null;
  }

  function cameraConstraints() {
    return {
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 960 },
        frameRate: { ideal: 60 }
      }
    };
  }

  async function openCameraStream() {
    try {
      return await navigator.mediaDevices.getUserMedia(cameraConstraints());
    } catch (originalError) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' } }
        });
      } catch (_) {
        throw originalError;
      }
    }
  }

  function createTransferVideo() {
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.setAttribute('playsinline', '');
    $('transferScannerTarget').replaceChildren(video);
    return video;
  }

  async function stopTransferScanner() {
    const scanner = transferScanner;
    transferScanner = null;
    transferScannerStarting = false;

    try { if (scanner) await scanner.stop?.(); } catch (_) {}
    try { if (scanner) await scanner.clear?.(); } catch (_) {}

    transferScannerRunning = false;
    if (receiveWatchdog !== null) {
      clearInterval(receiveWatchdog);
      receiveWatchdog = null;
    }
    await releaseWakeLock();
    $('transferScannerTarget').replaceChildren();
  }

  async function closeTransferScanner() {
    $('transferScannerModal').classList.remove('active');
    await stopTransferScanner();
  }

  async function startJsQrWorkerScanner() {
    const video = createTransferVideo();
    const stream = await openCameraStream();
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const workers = [];
    const busy = [];
    let stopped = false;
    let frameId = 0;

    for (let index = 0; index < 2; index += 1) {
      const worker = new Worker(new URL('./wayfold-jsqr-worker.js', document.baseURI));
      workers.push(worker);
      busy.push(false);
      worker.onmessage = (event) => {
        const { id, bytes, error } = event.data || {};
        busy[index] = false;
        if (stopped) return;
        if (error) {
          updateScannerProgress(`${tr('scannerError')} ${error}`);
          return;
        }
        if (id !== -1 && bytes) receiveWayFoldBytes(asUint8Array(bytes));
      };
    }

    const capture = () => {
      if (stopped) return;
      const next = () => {
        if (stopped) return;
        if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(capture);
        else requestAnimationFrame(capture);
      };

      const slot = busy.indexOf(false);
      if (slot < 0 || !video.videoWidth || !video.videoHeight) {
        next();
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      context.drawImage(video, 0, 0);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      busy[slot] = true;
      workers[slot].postMessage({
        id: frameId++,
        buf: image.data.buffer,
        w: canvas.width,
        h: canvas.height
      }, [image.data.buffer]);

      next();
    };

    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(capture);
    else requestAnimationFrame(capture);

    return {
      stop: async () => {
        stopped = true;
        workers.forEach((worker) => worker.terminate());
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      },
      clear: async () => $('transferScannerTarget').replaceChildren()
    };
  }

  async function startZxingScanner() {
    const video = createTransferVideo();
    const reader = new ZXing.BrowserMultiFormatReader();
    let controls = null;

    const maybeControls = await reader.decodeFromConstraints(
      cameraConstraints(),
      video,
      (result) => {
        if (!result) return;
        const bytes = bytesFromZxingResult(result);
        if (bytes?.length) receiveWayFoldBytes(bytes);
      }
    );
    controls = maybeControls || null;

    return {
      stop: async () => {
        try { controls?.stop?.(); } catch (_) {}
        try { reader.reset(); } catch (_) {}
      },
      clear: async () => $('transferScannerTarget').replaceChildren()
    };
  }

  async function startHtml5QrScanner() {
    const qrFormat = window.Html5QrcodeSupportedFormats?.QR_CODE;
    const config = Number.isInteger(qrFormat) ? { formatsToSupport: [qrFormat] } : {};
    const scanner = new Html5Qrcode('transferScannerTarget', config, false);

    await scanner.start(
      cameraConstraints().video,
      {
        fps: 60,
        aspectRatio: 4 / 3,
        disableFlip: true
      },
      (_decodedText, decodedResult) => {
        const bytes = bytesFromHtml5Result(decodedResult);
        if (bytes?.length) receiveWayFoldBytes(bytes);
      },
      () => {}
    );

    return {
      stop: async () => scanner.stop(),
      clear: async () => scanner.clear()
    };
  }

  async function startQrScannerRawAdapter() {
    if (!(await loadTransferScannerEngine('jsqr'))) throw new Error('JSQR_RAW_ADAPTER_MISSING');

    const video = createTransferVideo();
    const stream = await openCameraStream();
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const qrEngine = await QrScanner.createQrEngine();
    let stopped = false;
    let busy = false;

    const capture = async () => {
      if (stopped) return;

      const schedule = () => {
        if (stopped) return;
        if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(capture);
        else requestAnimationFrame(capture);
      };

      if (busy || !video.videoWidth || !video.videoHeight) {
        schedule();
        return;
      }

      busy = true;
      try {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        context.drawImage(video, 0, 0);
        const image = context.getImageData(0, 0, canvas.width, canvas.height);

        await QrScanner.scanImage(canvas, {
          qrEngine,
          canvas,
          disallowCanvasResizing: true,
          returnDetailedScanResult: true
        });

        const raw = window.jsQR(image.data, image.width, image.height, {
          inversionAttempts: 'attemptBoth'
        });
        const bytes = bytesFromJsQr(raw);
        if (bytes?.length) receiveWayFoldBytes(bytes);
      } catch (_) {
        // No QR in this frame.
      } finally {
        busy = false;
        schedule();
      }
    };

    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(capture);
    else requestAnimationFrame(capture);

    return {
      stop: async () => {
        stopped = true;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        if (qrEngine instanceof Worker) qrEngine.terminate();
      },
      clear: async () => $('transferScannerTarget').replaceChildren()
    };
  }

  async function startScannerEngine(engine) {
    if (!(await loadTransferScannerEngine(engine))) throw new Error(`${engine.toUpperCase()}_MISSING`);
    if (engine === 'jsqr') return startJsQrWorkerScanner();
    if (engine === 'zxing') return startZxingScanner();
    if (engine === 'html5qrcode') return startHtml5QrScanner();
    if (engine === 'qrscanner') return startQrScannerRawAdapter();
    throw new Error('UNKNOWN_SCANNER_ENGINE');
  }

  async function openTransferScanner(attemptedEngines = new Set()) {
    if (transferScannerStarting || transferScannerRunning) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('transferReceiveStatus', language() === 'fa'
        ? 'دوربین فقط در HTTPS یا محیط امن قابل استفاده است.'
        : 'Camera access requires HTTPS or another secure context.', 'error');
      return;
    }

    $('transferScannerModal').classList.add('active');
    $('transferCameraStatus').textContent = tr('scannerStarting');
    $('transferCameraStatus').className = 'transfer-status';
    transferScannerStarting = true;

    try {
      resetWayFoldDecoder(false);
      const candidates = [
        selectedScannerEngine,
        ...SCANNER_ENGINE_VALUES.filter((engine) => engine !== selectedScannerEngine)
      ].filter((engine) => !attemptedEngines.has(engine));

      let startedEngine = '';
      let scanner = null;

      for (const engine of candidates) {
        attemptedEngines.add(engine);
        try {
          scanner = await startScannerEngine(engine);
          startedEngine = engine;
          break;
        } catch (error) {
          const permissionError = /NotAllowedError|Permission denied|PermissionDismissed|SecurityError/iu
            .test(`${error?.name || ''} ${error?.message || error || ''}`);
          if (permissionError) throw error;
        }
      }

      if (!scanner || !startedEngine) throw new Error('NO_SCANNER_ENGINE');
      if (!$('transferScannerModal').classList.contains('active')) {
        await scanner.stop?.();
        await scanner.clear?.();
        return;
      }

      transferScanner = scanner;
      transferScannerRunning = true;
      transferScannerStarting = false;
      selectedScannerEngine = startedEngine;
      $('transferScannerEngine').value = startedEngine;
      localStorage.setItem(SCANNER_ENGINE_KEY, startedEngine);
      $('transferCameraStatus').textContent = tr('scannerReady');
      startReceiveWatchdog();
      await acquireWakeLock();
    } catch (error) {
      transferScannerStarting = false;
      await stopTransferScanner();
      $('transferCameraStatus').textContent = `${tr('scannerError')} ${error?.message || error || ''}`.trim();
      $('transferCameraStatus').className = 'transfer-status error';
    }
  }

  async function receiveWayFoldBytes(bytes) {
    if (!(bytes instanceof Uint8Array) || !bytes.length) return;

    const parsed = WF.parseFrame(bytes);
    if (!parsed) return;

    const { header, block } = parsed;

    if (received.header?.sessionId === header.sessionId && !sameReceiveStream(received.header, header)) {
      return;
    }

    if (!received.decoder || received.header?.sessionId !== header.sessionId) {
      const key = receiveHeaderKey(header);
      if (ignoredStreams.has(key)) return;

      if (header.totalLen > WF.LARGE_TRANSFER_BYTES) {
        const accepted = window.confirm(language() === 'fa'
          ? `حجم payload نوری ${(header.totalLen / WF.MiB).toFixed(1)} MiB است و می‌تواند حافظه زیادی مصرف کند. ادامه می‌دهید؟`
          : `Large optical payload: ${(header.totalLen / WF.MiB).toFixed(1)} MiB. It may use significant memory. Continue?`);
        if (!accepted) {
          ignoredStreams.add(key);
          setStatus(
            'transferReceiveStatus',
            language() === 'fa' ? 'این جریان رد شد؛ در انتظار جریان دیگری…' : 'Stream declined; looking for another stream…'
          );
          return;
        }
      }

      received.decoder = new WF.FountainDecoder(
        header.k,
        header.blockLen,
        header.sessionId,
        header.totalLen
      );
      received.header = { ...header };
      received.startedAt = performance.now();
      received.lastProgressAt = received.startedAt;
    }

    if (!received.decoder || !received.header) return;

    const previousFrames = received.decoder.framesNew;
    const previousSolved = received.decoder.solvedCount;
    received.decoder.addFrame(header.seq, block);

    if (
      received.decoder.framesNew > previousFrames ||
      received.decoder.solvedCount > previousSolved
    ) {
      received.lastProgressAt = performance.now();
    }

    updateWayFoldProgress();

    if (!received.decoder.isComplete || received.assembling) return;
    received.assembling = true;

    const payload = received.decoder.assemble();
    const elapsedSeconds = (performance.now() - received.startedAt) / 1000;
    await finishWayFoldReceive(payload, elapsedSeconds, received.header);
  }

  async function finishWayFoldReceive(payload, elapsedSeconds, header) {
    try {
      if (!payload || WF.fnv1a(payload) !== header.payloadFnv) {
        throw new Error('FNV');
      }

      const unpacked = await WF.unwrapFile(payload);
      if (!unpacked) throw new Error('ENVELOPE_SHA256');

      $('transferReceiveProgress').value = 1;
      await closeTransferScanner();

      received.manifest = {
        name: unpacked.filename,
        type: unpacked.mime
      };

      if (unpacked.mime === SECRET_ENCRYPTED_MIME) {
        const encrypted = unpackSecretEncryptedPayload(unpacked.file);
        if (!encrypted) throw new Error('SECRET_ENVELOPE');
        received.encryptedBytes = encrypted.encryptedBytes;
        received.encryptedMeta = encrypted.metadata;
        received.manifest.type = encrypted.metadata.mime || 'application/octet-stream';
        $('transferPasswordUnlock').hidden = false;
        setStatus('transferReceiveStatus', tr('passwordRequired'), 'ok');
        updateScannerProgress(tr('scannerComplete'));
        $('transferReceivePassword').focus();
        return;
      }

      showReceivedFile(unpacked.file);
      const stats = language() === 'fa'
        ? `${Math.round(unpacked.file.length / 1024)} KiB در ${elapsedSeconds.toFixed(1)} ثانیه · FNV + SHA-256 تأیید شد ✓`
        : `${Math.round(unpacked.file.length / 1024)} KiB in ${elapsedSeconds.toFixed(1)} s · FNV + SHA-256 verified ✓`;
      setStatus('transferReceiveStatus', stats, 'ok');
    } catch (error) {
      await closeTransferScanner();
      resetWayFoldDecoder(false);
      setStatus(
        'transferReceiveStatus',
        language() === 'fa'
          ? `خطای صحت انتقال: ${error.message || error}`
          : `Transfer integrity error: ${error.message || error}`,
        'error'
      );
    }
  }

  function showReceivedFile(bytes) {
    received.bytes = bytes;
    received.blob = new Blob([bytes], { type: received.manifest.type });

    if (received.manifest.type.startsWith('image/')) {
      if (received.previewUrl) URL.revokeObjectURL(received.previewUrl);
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
    if (!received.encryptedBytes || !received.encryptedMeta || !received.manifest) return;

    try {
      const bytes = await decryptFileBytes(
        received.encryptedBytes,
        $('transferReceivePassword').value,
        received.encryptedMeta
      );

      if (
        bytes.length !== received.encryptedMeta.plainSize ||
        await sha256(bytes) !== received.encryptedMeta.plainHash
      ) {
        throw new Error('BAD_PASSWORD');
      }

      $('transferPasswordUnlock').hidden = true;
      $('transferReceivePassword').value = '';
      received.manifest.type = received.encryptedMeta.mime || 'application/octet-stream';
      showReceivedFile(bytes);
    } catch (_) {
      setStatus('transferReceiveStatus', tr('wrongPassword'), 'error');
    }
  }

  function resetReceive() {
    if (received.previewUrl) URL.revokeObjectURL(received.previewUrl);
    received = freshReceiveState();
    ignoredStreams.clear();
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
