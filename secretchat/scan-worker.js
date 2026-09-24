'use strict';

const secretChatFetch = self.fetch.bind(self);
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

// Prefer the bundled high-speed decoder. The repository previously contained
// a binary/truncated scan-decoder-runtime.js, which made importScripts throw a
// SyntaxError before the worker could install its message handler. Keep this
// guarded so a bad decoder asset can never take down SecretChat file receive.
let decoderReady = false;
try {
  importScripts('./scan-decoder-runtime.js');
  decoderReady = typeof self.onmessage === 'function';
} catch (_) {
  decoderReady = false;
  self.onmessage = null;
}

// Local, offline fallback. This keeps the exact { id, bytes } protocol used by
// file-transfer.js and requires no network/CDN access.
if (!decoderReady) {
  try {
    importScripts('./vendor/jsQR.min.js');
  } catch (error) {
    self.onmessage = event => {
      const id = event?.data?.id;
      self.postMessage({ id, bytes: null, error: `QR decoder unavailable: ${error?.message || error}` });
    };
    throw error;
  }

  self.onmessage = event => {
    const msg = event?.data || {};
    const id = msg.id;
    const width = Number(msg.width);
    const height = Number(msg.height);

    try {
      if (!msg.data || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        self.postMessage({ id, bytes: null });
        return;
      }

      const pixels = msg.data instanceof Uint8ClampedArray
        ? msg.data
        : new Uint8ClampedArray(msg.data);

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
}
