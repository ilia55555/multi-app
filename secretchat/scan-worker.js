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

importScripts('./scan-decoder-runtime.js');
