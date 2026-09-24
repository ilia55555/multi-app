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

// Load the bundled high-speed ZXing/WASM worker first. The fetch shim above
// keeps the uploaded hashed WASM reference local and maps it to scan-core.wasm.
let decoderReady = false;
try {
  importScripts('./scan-decoder-runtime.js');
  decoderReady = typeof self.onmessage === 'function';
} catch (error) {
  decoderReady = false;
  self.onmessage = null;
  console.error('[SecretChat transfer] ZXing/WASM decoder failed to load', error);
}

// Offline safety fallback. file-transfer.js sends { id, buf, w, h }, so keep
// exactly the same message contract here.
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
}
