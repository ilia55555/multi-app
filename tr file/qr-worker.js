let detector = null;
let canvas = null;
let context = null;

function decodeBase64Payload(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i) & 255;
  return bytes;
}

function ensureDetector() {
  if (detector) return detector;
  if (!("BarcodeDetector" in self)) {
    throw new Error("QR decoding is not supported in this browser.");
  }
  detector = new BarcodeDetector({ formats: ["qr_code"] });
  return detector;
}

async function detectQr(imageData, width, height) {
  const qr = ensureDetector();

  try {
    return await qr.detect(imageData);
  } catch (_) {
    if (!("OffscreenCanvas" in self)) throw _;
    if (!canvas || canvas.width !== width || canvas.height !== height) {
      canvas = new OffscreenCanvas(width, height);
      context = canvas.getContext("2d", { willReadFrequently: true });
    }
    context.putImageData(imageData, 0, 0);
    return qr.detect(canvas);
  }
}

self.onmessage = async event => {
  const { id, buf, w, h } = event.data || {};

  try {
    if (!(buf instanceof ArrayBuffer) || !Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) {
      self.postMessage({ id, bytes: null, error: "Invalid frame." });
      return;
    }

    const pixels = new Uint8ClampedArray(buf);
    const imageData = new ImageData(pixels, w, h);
    const results = await detectQr(imageData, w, h);

    let bytes = null;
    for (const result of results || []) {
      const raw = typeof result?.rawValue === "string" ? result.rawValue : "";
      if (!raw.startsWith("WF1:")) continue;

      try {
        bytes = decodeBase64Payload(raw.slice(4));
      } catch (_) {
        bytes = null;
      }

      if (bytes) break;
    }

    if (bytes) {
      self.postMessage({ id, bytes }, [bytes.buffer]);
    } else {
      self.postMessage({ id, bytes: null, error: null });
    }
  } catch (error) {
    self.postMessage({
      id,
      bytes: null,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
