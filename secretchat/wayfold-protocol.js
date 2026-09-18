(() => {
  'use strict';

  const MiB = 1024 * 1024;
  const LARGE_TRANSFER_BYTES = 25 * MiB;
  const MAX_FILE_BYTES = 50 * MiB;
  const MAX_FILENAME_BYTES = 255;
  const MAX_MIME_BYTES = 127;
  const ENVELOPE_HEADER_BYTES = 50;
  const MAX_WRAPPED_BYTES = MAX_FILE_BYTES + ENVELOPE_HEADER_BYTES + MAX_FILENAME_BYTES + MAX_MIME_BYTES;
  const MAX_BLOCK_BYTES = 4096;
  const MAX_BLOCKS = 40000;
  const RECEIVE_TIMEOUT_MS = 120000;
  const FRAME_HEADER_BYTES = 20;
  const FRAME_MAGIC_A = 209;
  const FRAME_MAGIC_B = 12;

  const ENVELOPE_MAGIC = new Uint8Array([68, 67, 77, 78]); // DCMN
  const ENVELOPE_VERSION = 1;
  const FLAG_GZIP = 1;
  const ALLOWED_FLAGS = FLAG_GZIP;
  const SHA256_BYTES = 32;
  const textEncoder = new TextEncoder();
  const fatalUtf8 = new TextDecoder('utf-8', { fatal: true });

  function randomSessionId() {
    const value = new Uint16Array(1);
    do crypto.getRandomValues(value); while (value[0] === 0);
    return value[0];
  }

  function validHeader(header) {
    if (
      !Number.isInteger(header.sessionId) || header.sessionId <= 0 || header.sessionId > 65535 ||
      !Number.isInteger(header.seq) || header.seq < 0 || header.seq > 0xffffffff ||
      !Number.isInteger(header.k) || header.k <= 0 || header.k > MAX_BLOCKS ||
      !Number.isInteger(header.blockLen) || header.blockLen <= 0 || header.blockLen > MAX_BLOCK_BYTES ||
      !Number.isInteger(header.totalLen) || header.totalLen <= 0 || header.totalLen > MAX_WRAPPED_BYTES ||
      !Number.isInteger(header.payloadFnv) || header.payloadFnv < 0 || header.payloadFnv > 0xffffffff
    ) return false;

    const max = header.k * header.blockLen;
    const min = (header.k - 1) * header.blockLen + 1;
    return Number.isSafeInteger(max) && Number.isSafeInteger(min) && header.totalLen >= min && header.totalLen <= max;
  }

  function packFrame(header, block) {
    if (!validHeader(header) || block.length !== header.blockLen) {
      throw new RangeError('invalid optical frame header or block length');
    }

    const frame = new Uint8Array(FRAME_HEADER_BYTES + block.length);
    const view = new DataView(frame.buffer);
    view.setUint8(0, FRAME_MAGIC_A);
    view.setUint8(1, FRAME_MAGIC_B);
    view.setUint16(2, header.sessionId, true);
    view.setUint32(4, header.seq, true);
    view.setUint16(8, header.k, true);
    view.setUint16(10, header.blockLen, true);
    view.setUint32(12, header.totalLen, true);
    view.setUint32(16, header.payloadFnv, true);
    frame.set(block, FRAME_HEADER_BYTES);
    return frame;
  }

  function parseFrame(bytes) {
    if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
    if (bytes.length <= FRAME_HEADER_BYTES || bytes[0] !== FRAME_MAGIC_A || bytes[1] !== FRAME_MAGIC_B) return null;

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const header = {
      sessionId: view.getUint16(2, true),
      seq: view.getUint32(4, true),
      k: view.getUint16(8, true),
      blockLen: view.getUint16(10, true),
      totalLen: view.getUint32(12, true),
      payloadFnv: view.getUint32(16, true)
    };

    if (!validHeader(header) || bytes.length !== FRAME_HEADER_BYTES + header.blockLen) return null;
    return { header, block: bytes.subarray(FRAME_HEADER_BYTES) };
  }

  function fnv1a(bytes) {
    let hash = 2166136261;
    for (let i = 0; i < bytes.length; i += 1) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function prng(seed) {
    let state = seed | 0;
    return () => {
      state = (state + 2654435769) | 0;
      let value = state ^ (state >>> 16);
      value = Math.imul(value, 569420461);
      value ^= value >>> 15;
      value = Math.imul(value, 1935289751);
      value ^= value >>> 15;
      return value >>> 0;
    };
  }

  const LN2 = 0.6931471805599453;
  function lnApprox(value) {
    let power = 0;
    let n = value;
    while (n >= 1.5) { n /= 2; power += 1; }
    while (n < 0.75) { n *= 2; power -= 1; }
    const x = (n - 1) / (n + 1);
    const x2 = x * x;
    let term = x;
    let sum = 0;
    for (let divisor = 1; divisor <= 21; divisor += 2) {
      sum += term / divisor;
      term *= x2;
    }
    return power * LN2 + 2 * sum;
  }

  const ROBUST_C = 0.1;
  const ROBUST_DELTA = 0.5;

  function robustCdf(k) {
    const cdf = new Float64Array(k);
    if (k === 1) {
      cdf[0] = 1;
      return cdf;
    }

    const r = Math.max(1, ROBUST_C * lnApprox(k / ROBUST_DELTA) * Math.sqrt(k));
    const spike = Math.min(k, Math.ceil(k / r));
    let total = 0;

    for (let degree = 1; degree <= k; degree += 1) {
      const rho = degree === 1 ? 1 / k : 1 / (degree * (degree - 1));
      let tau = 0;
      if (degree < spike) tau = r / (degree * k);
      else if (degree === spike) tau = r * Math.max(0, lnApprox(r / ROBUST_DELTA)) / k;
      total += rho + tau;
      cdf[degree - 1] = total;
    }

    for (let i = 0; i < k; i += 1) cdf[i] /= total;
    cdf[k - 1] = 1;
    return cdf;
  }

  function mixSeed(sessionId, seq) {
    let value = (Math.imul(sessionId + 1, 2654435761) ^ (seq + 2246822507)) | 0;
    value = Math.imul(value ^ (value >>> 13), 3266489909);
    return (value ^ (value >>> 16)) | 0;
  }

  function selectIndices(k, cdf, sessionId, seq) {
    const random = prng(mixSeed(sessionId, seq));
    const roll = random() * (2 ** -32);

    let low = 0;
    let high = k - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (cdf[mid] >= roll) high = mid;
      else low = mid + 1;
    }

    const degree = Math.min(k, low + 1);

    if (degree > (k >> 3)) {
      const pool = new Uint32Array(k);
      for (let i = 0; i < k; i += 1) pool[i] = i;
      const selected = new Array(degree);
      for (let i = 0; i < degree; i += 1) {
        const j = i + (random() % (k - i));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
        selected[i] = pool[i];
      }
      return selected;
    }

    const selected = new Set();
    while (selected.size < degree) selected.add(random() % k);
    return [...selected];
  }

  function xorWords(target, source) {
    for (let i = 0; i < target.length; i += 1) target[i] = (target[i] ^ source[i]) >>> 0;
  }

  class FountainEncoder {
    constructor(payload, blockLen, sessionId) {
      this.blockLen = blockLen;
      this.sessionId = sessionId;
      this.k = Math.max(1, Math.ceil(payload.length / blockLen));
      this.words = Math.ceil(blockLen / 4);
      this.blocks = new Uint32Array(this.k * this.words);
      const raw = new Uint8Array(this.blocks.buffer);
      for (let index = 0; index < this.k; index += 1) {
        const block = payload.subarray(index * blockLen, Math.min((index + 1) * blockLen, payload.length));
        raw.set(block, index * this.words * 4);
      }
      this.cdf = robustCdf(this.k);
    }

    encode(seq) {
      const indices = selectIndices(this.k, this.cdf, this.sessionId, seq);
      const output = new Uint32Array(this.words);

      for (const index of indices) {
        const offset = index * this.words;
        for (let word = 0; word < this.words; word += 1) {
          output[word] = (output[word] ^ this.blocks[offset + word]) >>> 0;
        }
      }

      return new Uint8Array(output.buffer, 0, this.blockLen);
    }
  }

  class FountainDecoder {
    constructor(k, blockLen, sessionId, totalLen) {
      this.k = k;
      this.blockLen = blockLen;
      this.sessionId = sessionId;
      this.totalLen = totalLen;
      this.words = Math.ceil(blockLen / 4);
      this.cdf = robustCdf(k);
      this.solved = new Array(k).fill(null);
      this.byBlock = new Map();
      this.pending = new Set();
      this.maxPendingFrames = Math.min(60000, Math.max(64, Math.ceil(k * 1.5)));
      this.maxUniqueFrames = Math.min(200000, Math.max(1024, k * 4));
      this.seen = new Set();
      this.solvedCount = 0;
      this.framesNew = 0;
      this.framesDup = 0;
    }

    get isComplete() {
      return this.solvedCount >= this.k;
    }

    get pendingFrameCount() {
      return this.pending.size;
    }

    addFrame(seq, blockBytes) {
      if (this.seen.has(seq)) {
        this.framesDup += 1;
        return;
      }

      if (this.seen.size >= this.maxUniqueFrames) return;
      this.seen.add(seq);
      this.framesNew += 1;
      if (this.isComplete) return;

      const indices = new Set(selectIndices(this.k, this.cdf, this.sessionId, seq));
      const words = new Uint32Array(this.words);
      new Uint8Array(words.buffer).set(blockBytes.subarray(0, this.blockLen));

      for (const index of [...indices]) {
        const solved = this.solved[index];
        if (solved) {
          xorWords(words, solved);
          indices.delete(index);
        }
      }

      if (indices.size === 0) return;
      if (indices.size === 1) {
        this.resolve(indices.values().next().value, words);
        return;
      }

      if (this.pending.size >= this.maxPendingFrames) return;
      const equation = { idx: indices, words };
      this.pending.add(equation);

      for (const index of indices) {
        let set = this.byBlock.get(index);
        if (!set) {
          set = new Set();
          this.byBlock.set(index, set);
        }
        set.add(equation);
      }
    }

    resolve(index, words) {
      const stack = [[index, words]];

      while (stack.length > 0) {
        const [resolvedIndex, resolvedWords] = stack.pop();
        if (this.solved[resolvedIndex]) continue;

        this.solved[resolvedIndex] = resolvedWords;
        this.solvedCount += 1;

        const equations = this.byBlock.get(resolvedIndex);
        if (!equations) continue;
        this.byBlock.delete(resolvedIndex);

        for (const equation of equations) {
          xorWords(equation.words, resolvedWords);
          equation.idx.delete(resolvedIndex);

          if (equation.idx.size === 1) {
            const nextIndex = equation.idx.values().next().value;
            this.byBlock.get(nextIndex)?.delete(equation);
            this.pending.delete(equation);
            if (!this.solved[nextIndex]) stack.push([nextIndex, equation.words]);
          }
        }
      }
    }

    assemble() {
      if (!this.isComplete) return null;
      const output = new Uint8Array(this.totalLen);

      for (let index = 0; index < this.k; index += 1) {
        const offset = index * this.blockLen;
        const length = Math.min(this.blockLen, this.totalLen - offset);
        if (length > 0) output.set(new Uint8Array(this.solved[index].buffer, 0, length), offset);
      }

      return output;
    }
  }

  function sanitizeFilename(value) {
    const name = (String(value).split(/[\\/]/).pop() ?? '').replace(/[\0-\x1f\x7f]/g, '').trim();
    if (!name || name === '.' || name === '..') return null;
    return textEncoder.encode(name).length <= MAX_FILENAME_BYTES ? name : null;
  }

  function sanitizeMime(value) {
    if (/[\0-\x1f\x7f]/.test(value)) return null;
    const mime = String(value).trim().toLowerCase() || 'application/octet-stream';
    return textEncoder.encode(mime).length <= MAX_MIME_BYTES ? mime : null;
  }

  function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  async function sha256(bytes) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', Uint8Array.from(bytes)));
  }

  async function readStreamWithLimit(stream, limit) {
    const reader = stream.getReader();
    const chunks = [];
    let total = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > limit) {
          await reader.cancel('output limit exceeded');
          return null;
        }
        chunks.push(value);
      }
    } catch (_) {
      return null;
    } finally {
      reader.releaseLock();
    }

    const output = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.length;
    }
    return output;
  }

  async function maybeGzip(bytes) {
    if (typeof CompressionStream === 'undefined') return null;
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
      const compressed = await readStreamWithLimit(stream, bytes.length);
      return compressed && compressed.length < bytes.length ? compressed : null;
    } catch (_) {
      return null;
    }
  }

  async function gunzipExact(bytes, expectedLength) {
    if (typeof DecompressionStream === 'undefined') return null;
    const output = new Uint8Array(expectedLength);
    let offset = 0;
    let reader = null;

    try {
      reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (offset + value.length > expectedLength || offset + value.length > MAX_FILE_BYTES) {
          await reader.cancel('decompressed output exceeds declared length');
          return null;
        }
        output.set(value, offset);
        offset += value.length;
      }
    } catch (_) {
      return null;
    } finally {
      reader?.releaseLock();
    }

    return offset === expectedLength ? output : null;
  }

  async function wrapFile(fileBytes, filename, mime) {
    if (fileBytes.length === 0 || fileBytes.length > MAX_FILE_BYTES) {
      throw new RangeError('file size is outside the supported range');
    }

    const safeName = sanitizeFilename(filename);
    const safeMime = sanitizeMime(mime);
    if (!safeName || !safeMime) throw new TypeError('invalid file metadata');

    const nameBytes = textEncoder.encode(safeName);
    const mimeBytes = textEncoder.encode(safeMime);
    const compressed = await maybeGzip(fileBytes);
    const wireFile = compressed ?? fileBytes;
    const flags = compressed ? FLAG_GZIP : 0;
    const totalLength = ENVELOPE_HEADER_BYTES + nameBytes.length + mimeBytes.length + wireFile.length;

    if (!Number.isSafeInteger(totalLength) || totalLength > MAX_WRAPPED_BYTES) {
      throw new RangeError('wrapped payload is too large');
    }

    const output = new Uint8Array(totalLength);
    const view = new DataView(output.buffer);
    output.set(ENVELOPE_MAGIC, 0);
    view.setUint8(4, ENVELOPE_VERSION);
    view.setUint8(5, flags);
    view.setUint16(6, nameBytes.length, true);
    view.setUint16(8, mimeBytes.length, true);
    view.setUint32(10, wireFile.length, true);
    view.setUint32(14, fileBytes.length, true);
    output.set(await sha256(fileBytes), 18);

    let offset = ENVELOPE_HEADER_BYTES;
    output.set(nameBytes, offset);
    offset += nameBytes.length;
    output.set(mimeBytes, offset);
    offset += mimeBytes.length;
    output.set(wireFile, offset);

    return {
      bytes: output,
      compressed: Boolean(compressed),
      originalLen: fileBytes.length,
      wireFileLen: wireFile.length
    };
  }

  async function unwrapFile(bytes) {
    try {
      if (bytes.length < ENVELOPE_HEADER_BYTES || bytes.length > MAX_WRAPPED_BYTES) return null;
      for (let i = 0; i < ENVELOPE_MAGIC.length; i += 1) {
        if (bytes[i] !== ENVELOPE_MAGIC[i]) return null;
      }

      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      if (view.getUint8(4) !== ENVELOPE_VERSION) return null;

      const flags = view.getUint8(5);
      if ((flags & ~ALLOWED_FLAGS) !== 0) return null;

      const filenameLength = view.getUint16(6, true);
      const mimeLength = view.getUint16(8, true);
      const wireLength = view.getUint32(10, true);
      const originalLength = view.getUint32(14, true);

      if (
        filenameLength === 0 || filenameLength > MAX_FILENAME_BYTES ||
        mimeLength > MAX_MIME_BYTES ||
        wireLength === 0 ||
        originalLength === 0 || originalLength > MAX_FILE_BYTES
      ) return null;

      const expectedLength = ENVELOPE_HEADER_BYTES + filenameLength + mimeLength + wireLength;
      if (!Number.isSafeInteger(expectedLength) || expectedLength !== bytes.length) return null;

      const compressed = (flags & FLAG_GZIP) !== 0;
      if ((!compressed && wireLength !== originalLength) || (compressed && wireLength >= originalLength)) return null;

      const expectedHash = bytes.subarray(18, 18 + SHA256_BYTES);
      let offset = ENVELOPE_HEADER_BYTES;
      const filename = sanitizeFilename(fatalUtf8.decode(bytes.subarray(offset, offset + filenameLength)));
      offset += filenameLength;
      const mime = sanitizeMime(fatalUtf8.decode(bytes.subarray(offset, offset + mimeLength)));
      offset += mimeLength;

      if (!filename || !mime) return null;

      const wireFile = bytes.subarray(offset, offset + wireLength);
      const file = compressed ? await gunzipExact(wireFile, originalLength) : Uint8Array.from(wireFile);
      if (!file || file.length !== originalLength || !timingSafeEqual(await sha256(file), expectedHash)) return null;

      return { filename, mime, file, compressed };
    } catch (_) {
      return null;
    }
  }

  function headerKey(header) {
    return [header.sessionId, header.k, header.blockLen, header.totalLen, header.payloadFnv].join(':');
  }

  function sameStream(a, b) {
    return a.sessionId === b.sessionId &&
      a.k === b.k &&
      a.blockLen === b.blockLen &&
      a.totalLen === b.totalLen &&
      a.payloadFnv === b.payloadFnv;
  }

  window.WayFoldProtocol = Object.freeze({
    MiB,
    LARGE_TRANSFER_BYTES,
    MAX_FILE_BYTES,
    MAX_FILENAME_BYTES,
    MAX_MIME_BYTES,
    MAX_BLOCK_BYTES,
    MAX_BLOCKS,
    MAX_WRAPPED_BYTES,
    RECEIVE_TIMEOUT_MS,
    FRAME_HEADER_BYTES,
    randomSessionId,
    validHeader,
    packFrame,
    parseFrame,
    fnv1a,
    FountainEncoder,
    FountainDecoder,
    wrapFile,
    unwrapFile,
    headerKey,
    sameStream
  });
})();