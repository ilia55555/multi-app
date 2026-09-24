'use strict';

const secretChatFetch = self.fetch.bind(self);
const secretChatPostMessage = self.postMessage.bind(self);
let fallbackInstalled = false;

self.fetch = (input, init) => {
  try {
    const raw = typeof input === 'string' ? input : input?.url;
    if (raw) {
      const url = new URL(raw, self.location.href);
      if (url.pathname.endsWith('.wasm')) {
        return secretChatFetch(new URL('./scan-core.wasm', self.location.href), init);
      }
    }
  } catch {}
  return secretChatFetch(input, init);
};

function installJsQrFallback(reason) {
  if (fallbackInstalled) return true;
  try {
    importScripts('./vendor/jsQR.min.js');
  } catch (error) {
    secretChatPostMessage({
      id: -1,
      bytes: null,
      error: `QR decoder unavailable: ${error?.message || error}`
    });
    return false;
  }

  fallbackInstalled = true;
  if (reason) console.warn('[SecretChat transfer] Using jsQR fallback:', reason);

  self.onmessage = event => {
    const msg = event?.data || {};
    const id = msg.id;
    const width = Number(msg.w);
    const height = Number(msg.h);

    try {
      if (!msg.buf || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        self.postMessage({ id, bytes: null });
        return;
      }

      const pixels = msg.buf instanceof Uint8ClampedArray
        ? msg.buf
        : new Uint8ClampedArray(msg.buf);

      const result = self.jsQR(pixels, width, height, {
        inversionAttempts: 'dontInvert'
      });

      if (!result?.binaryData?.length) {
        self.postMessage({ id, bytes: null });
        return;
      }

      const bytes = Uint8Array.from(result.binaryData);
      self.postMessage({ id, bytes }, [bytes.buffer]);
    } catch (_) {
      self.postMessage({ id, bytes: null });
    }
  };
  return true;
}

// The bundled runtime emits an internal warm-up message with id -1. Do not
// forward successful warm-up messages because file-transfer.js uses worker
// replies as its busy/free signal. If WASM initialization fails asynchronously,
// switch this worker to the local jsQR fallback instead.
self.postMessage = (message, transferOrOptions) => {
  if (message && message.id === -1) {
    if (message.error) installJsQrFallback(message.error);
    return;
  }
  return secretChatPostMessage(message, transferOrOptions);
};

try {
  importScripts('./scan-decoder-runtime.js');
  if (typeof self.onmessage !== 'function') {
    installJsQrFallback('ZXing/WASM runtime did not install a message handler');
  }
} catch (error) {
  console.error('[SecretChat transfer] ZXing/WASM decoder failed to load', error);
  self.onmessage = null;
  installJsQrFallback(error?.message || error);
}
