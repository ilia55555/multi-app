'use strict';

importScripts('./vendor/jsQR.min.js');

self.onmessage = (event) => {
  const { id, buf, w, h } = event.data || {};
  try {
    if (!(buf instanceof ArrayBuffer) || !Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) {
      self.postMessage({ id, bytes: null, error: 'Invalid frame' });
      return;
    }
    const pixels = new Uint8ClampedArray(buf);
    const result = self.jsQR(pixels, w, h, {
      inversionAttempts: 'attemptBoth'
    });
    const data = result?.binaryData;
    if (!data?.length) {
      self.postMessage({ id, bytes: null, error: null });
      return;
    }
    const bytes = Uint8Array.from(data);
    self.postMessage({ id, bytes }, [bytes.buffer]);
  } catch (error) {
    self.postMessage({
      id,
      bytes: null,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
