'use strict';
/* SFX Studio — synth, editor, effects and export for game sound effects */

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dbToGain = db => Math.pow(10, db / 20);
const SR = 44100;

function toast(msg, ms = 2200) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------------------------------------------------------------- audio ctx */
let actx = null;
function ctx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

/* ---------------------------------------------------------------- document */
let doc = { sr: SR, ch: [new Float32Array(1)] };
let recipe = null;
let sel = { s: 0, e: 0 };
let view = { start: 0, len: 1 };
let clipboard = null;
const undoStack = [], redoStack = [];
let lastAction = '';

const docLen = () => doc.ch[0].length;
const hasSel = () => sel.e > sel.s;
function snapshot() {
  return { sr: doc.sr, ch: doc.ch.map(c => c.slice()), recipe, sel: { ...sel } };
}
function pushUndo(tag = '') {
  if (tag && tag === lastAction) return;
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack.length = 0;
  lastAction = tag;
}
function restore(s) {
  doc = { sr: s.sr, ch: s.ch };
  recipe = s.recipe;
  sel = { ...s.sel };
  clampSel();
  fitView();
  refresh();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
  lastAction = '';
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
  lastAction = '';
}
function setDoc(ch, sr, keepView = false) {
  if (!ch.length || !ch[0].length) ch = [new Float32Array(1)];
  doc = { sr, ch };
  clampSel();
  if (!keepView) fitView(); else clampView();
  refresh();
}
function clampSel() {
  const L = docLen();
  sel.s = clamp(Math.round(sel.s), 0, L);
  sel.e = clamp(Math.round(sel.e), sel.s, L);
}
function region(s = 0, e = docLen()) {
  return doc.ch.map(c => c.slice(s, e));
}

/* ---------------------------------------------------------------- DSP utils */
function biquadCoefs(type, f, Q, sr) {
  f = clamp(f, 10, sr * 0.45);
  const w = 2 * Math.PI * f / sr, cs = Math.cos(w), sn = Math.sin(w), a = sn / (2 * Math.max(Q, 0.05));
  let b0, b1, b2;
  const a0 = 1 + a, a1 = -2 * cs, a2 = 1 - a;
  if (type === 'highpass') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
  else if (type === 'bandpass') { b0 = a; b1 = 0; b2 = -a; }
  else { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; }
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
}

function resample(x, ratio) { // ratio > 1 → shorter & higher
  const n = Math.max(1, Math.floor(x.length / ratio));
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * ratio, i0 = Math.floor(p), fr = p - i0;
    const a = x[i0] || 0, b = x[i0 + 1] || 0;
    y[i] = a + (b - a) * fr;
  }
  return y;
}

/* WSOLA time stretch. factor = output length / input length */
function timeStretch(chs, factor, sr) {
  const inLen = chs[0].length;
  const outLen = Math.max(1, Math.round(inLen * factor));
  if (Math.abs(factor - 1) < 1e-3) return chs.map(c => c.slice());
  const N = Math.pow(2, Math.round(Math.log2(sr * 0.04)));
  const Hs = N / 2, tol = N / 4;
  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  const mono = new Float32Array(inLen + N * 2);
  for (const c of chs) for (let i = 0; i < inLen; i++) mono[i] += c[i] / chs.length;
  const outs = chs.map(() => new Float32Array(outLen + N));
  const norm = new Float32Array(outLen + N);
  let prev = 0;
  for (let k = 0; k * Hs < outLen; k++) {
    const nominal = Math.round(k * Hs / factor);
    let best = nominal;
    if (k > 0) {
      const target = prev + Hs;
      let bestC = -Infinity;
      for (let d = -tol; d <= tol; d += 2) {
        const p = nominal + d;
        if (p < 0 || p > inLen) continue;
        let c = 0;
        for (let j = 0; j < Hs; j += 4) c += mono[p + j] * mono[target + j];
        if (c > bestC) { bestC = c; best = p; }
      }
    }
    best = clamp(best, 0, Math.max(0, inLen - 1));
    const o = k * Hs;
    for (let j = 0; j < N; j++) {
      const w = win[j];
      norm[o + j] += w;
      for (let c = 0; c < chs.length; c++) outs[c][o + j] += (chs[c][best + j] || 0) * w;
    }
    prev = best;
  }
  return outs.map(out => {
    const y = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) y[i] = norm[i] > 1e-3 ? out[i] / norm[i] : out[i];
    return y;
  });
}

function pitchShift(chs, semis, keepTime, sr) {
  const ratio = Math.pow(2, semis / 12);
  const shifted = chs.map(c => resample(c, ratio));
  if (!keepTime) return shifted;
  return timeStretch(shifted, ratio, sr).map(c => {
    const y = new Float32Array(chs[0].length);
    y.set(c.subarray(0, y.length));
    return y;
  });
}

/* ---------------------------------------------------------------- synth */
const SYNTH_DEFAULT = {
  wave: 'square', duty: 0.5, freq: 440, freqEnd: 440, slideShape: 1,
  vibDepth: 0, vibRate: 8, arpMult: 1, arpTime: 0,
  attack: 0.005, hold: 0.05, decay: 0.3, punch: 0,
  noiseMix: 0, noiseColor: 'white',
  subAmount: 0, subFreq: 60, subDecay: 0.15,
  filterType: 'none', cutoff: 8000, cutoffEnd: 8000, resonance: 0.8,
  drive: 0, bits: 16, downsample: 1, volume: 0.8
};

const SYNTH_SCHEMA = [
  { title: 'موج و فرکانس', items: [
    { k: 'wave', label: 'نوع موج', type: 'select', options: [['sine', 'سینوسی'], ['square', 'مربعی'], ['saw', 'دندان‌اره'], ['triangle', 'مثلثی'], ['noise', 'نویز پله‌ای']] },
    { k: 'duty', label: 'عرض پالس', min: 0.05, max: 0.95, step: 0.01 },
    { k: 'freq', label: 'فرکانس شروع', min: 20, max: 8000, log: true, unit: 'Hz' },
    { k: 'freqEnd', label: 'فرکانس پایان', min: 20, max: 8000, log: true, unit: 'Hz' },
    { k: 'slideShape', label: 'منحنی اسلاید', min: 0.2, max: 5, step: 0.01 },
    { k: 'vibDepth', label: 'عمق ویبراتو', min: 0, max: 0.5, step: 0.005 },
    { k: 'vibRate', label: 'سرعت ویبراتو', min: 0, max: 60, step: 0.1, unit: 'Hz' },
    { k: 'arpMult', label: 'پرش فرکانس ×', min: 0.25, max: 4, step: 0.01 },
    { k: 'arpTime', label: 'زمان پرش', min: 0, max: 1, step: 0.005, unit: 's' }
  ] },
  { title: 'پوش صدا (Envelope)', items: [
    { k: 'attack', label: 'حمله', min: 0, max: 1, step: 0.001, unit: 's' },
    { k: 'hold', label: 'نگه‌داشت', min: 0, max: 2, step: 0.001, unit: 's' },
    { k: 'decay', label: 'محو شدن', min: 0.005, max: 4, step: 0.001, unit: 's' },
    { k: 'punch', label: 'ضربه (Punch)', min: 0, max: 1, step: 0.01 }
  ] },
  { title: 'نویز', items: [
    { k: 'noiseMix', label: 'میزان نویز', min: 0, max: 1, step: 0.01 },
    { k: 'noiseColor', label: 'رنگ نویز', type: 'select', options: [['white', 'سفید'], ['pink', 'صورتی'], ['brown', 'قهوه‌ای']] }
  ] },
  { title: 'لایه بم (ضربه زیر)', items: [
    { k: 'subAmount', label: 'شدت', min: 0, max: 1, step: 0.01 },
    { k: 'subFreq', label: 'فرکانس', min: 20, max: 300, log: true, unit: 'Hz' },
    { k: 'subDecay', label: 'محو شدن', min: 0.01, max: 2, step: 0.005, unit: 's' }
  ] },
  { title: 'فیلتر', items: [
    { k: 'filterType', label: 'نوع', type: 'select', options: [['none', 'خاموش'], ['lowpass', 'پایین‌گذر'], ['highpass', 'بالاگذر'], ['bandpass', 'میان‌گذر']] },
    { k: 'cutoff', label: 'کات‌آف شروع', min: 40, max: 20000, log: true, unit: 'Hz' },
    { k: 'cutoffEnd', label: 'کات‌آف پایان', min: 40, max: 20000, log: true, unit: 'Hz' },
    { k: 'resonance', label: 'رزونانس', min: 0.3, max: 20, log: true }
  ] },
  { title: 'رنگ و حجم', items: [
    { k: 'drive', label: 'دیستورشن', min: 0, max: 1, step: 0.01 },
    { k: 'bits', label: 'بیت', min: 2, max: 16, step: 1 },
    { k: 'downsample', label: 'کاهش نمونه', min: 1, max: 32, step: 1 },
    { k: 'volume', label: 'بلندی', min: 0, max: 1, step: 0.01 }
  ] }
];

let synth = { ...SYNTH_DEFAULT };

function synthRender(p, sr = SR) {
  const T = Math.max(0.005, p.attack + p.hold + p.decay);
  const len = Math.ceil(T * sr);
  const out = new Float32Array(len);
  let phase = 0, subPhase = 0, shVal = 0, shPhase = 0;
  let pk = [0, 0, 0, 0, 0, 0, 0], brown = 0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, co = null;
  let crushHold = 0;
  const bitsStep = p.bits >= 16 ? 0 : Math.pow(2, p.bits - 1);
  const ds = Math.max(1, Math.round(p.downsample));
  const driveK = 1 + p.drive * 25, driveN = Math.tanh(driveK);
  for (let i = 0; i < len; i++) {
    const t = i / sr, prog = t / T;
    let f = p.freq * Math.pow(p.freqEnd / p.freq, Math.pow(prog, p.slideShape));
    if (p.arpTime > 0 && t >= p.arpTime) f *= p.arpMult;
    if (p.vibDepth > 0) f *= 1 + p.vibDepth * Math.sin(2 * Math.PI * p.vibRate * t);
    phase += f / sr; phase -= Math.floor(phase);
    let osc;
    switch (p.wave) {
      case 'sine': osc = Math.sin(2 * Math.PI * phase); break;
      case 'saw': osc = 2 * phase - 1; break;
      case 'triangle': osc = 1 - 4 * Math.abs(phase - 0.5); break;
      case 'noise':
        shPhase += Math.min(1, f * 16 / sr);
        if (shPhase >= 1) { shPhase -= 1; shVal = Math.random() * 2 - 1; }
        osc = shVal; break;
      default: osc = phase < p.duty ? 1 : -1;
    }
    let s = osc;
    if (p.noiseMix > 0) {
      const w = Math.random() * 2 - 1;
      let n = w;
      if (p.noiseColor === 'pink') {
        pk[0] = 0.99886 * pk[0] + w * 0.0555179; pk[1] = 0.99332 * pk[1] + w * 0.0750759;
        pk[2] = 0.969 * pk[2] + w * 0.153852; pk[3] = 0.8665 * pk[3] + w * 0.3104856;
        pk[4] = 0.55 * pk[4] + w * 0.5329522; pk[5] = -0.7616 * pk[5] - w * 0.016898;
        n = (pk[0] + pk[1] + pk[2] + pk[3] + pk[4] + pk[5] + pk[6] + w * 0.5362) * 0.11;
        pk[6] = w * 0.115926;
      } else if (p.noiseColor === 'brown') {
        brown = (brown + 0.02 * w) / 1.02; n = brown * 3.5;
      }
      s = s * (1 - p.noiseMix) + n * p.noiseMix;
    }
    let env;
    if (t < p.attack) env = t / p.attack;
    else if (t < p.attack + p.hold) env = 1 + p.punch * (1 - (t - p.attack) / Math.max(p.hold, 1e-6));
    else { const d = clamp((t - p.attack - p.hold) / p.decay, 0, 1); env = Math.pow(1 - d, 2); }
    s *= env;
    if (p.subAmount > 0) {
      const sp = Math.min(t / p.subDecay, 1);
      subPhase += p.subFreq * (1 - 0.55 * sp) / sr;
      const se = Math.exp(-t / p.subDecay) * Math.min(1, t / 0.002);
      s += Math.sin(2 * Math.PI * subPhase) * se * p.subAmount;
    }
    if (p.filterType !== 'none') {
      if (i % 16 === 0) {
        const fc = p.cutoff * Math.pow(p.cutoffEnd / p.cutoff, prog);
        co = biquadCoefs(p.filterType, fc, p.resonance, sr);
      }
      const y = co[0] * s + co[1] * x1 + co[2] * x2 - co[3] * y1 - co[4] * y2;
      x2 = x1; x1 = s; y2 = y1; y1 = y; s = y;
    }
    if (p.drive > 0) s = Math.tanh(s * driveK) / driveN;
    if (ds > 1) { if (i % ds === 0) crushHold = s; s = crushHold; }
    if (bitsStep) s = Math.round(s * bitsStep) / bitsStep;
    out[i] = s * p.volume;
  }
  const fade = Math.min(len, Math.round(sr * 0.003));
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
  for (let i = 0; i < len; i++) out[i] = Math.tanh(out[i] * 1.1) / Math.tanh(1.1);
  return out;
}

const PRESETS = {
  'کلت': () => ({ wave: 'noise', freq: rnd(900, 1600), freqEnd: rnd(90, 200), slideShape: rnd(0.4, 0.8), attack: 0.001, hold: rnd(0.01, 0.03), decay: rnd(0.15, 0.3), punch: rnd(0.4, 0.8), noiseMix: rnd(0.3, 0.6), noiseColor: 'white', subAmount: rnd(0.4, 0.7), subFreq: rnd(70, 110), subDecay: rnd(0.05, 0.1), filterType: 'lowpass', cutoff: rnd(5000, 9000), cutoffEnd: rnd(500, 1200), resonance: rnd(0.7, 1.5), drive: rnd(0.2, 0.45) }),
  'تفنگ': () => ({ wave: 'noise', freq: rnd(1500, 2600), freqEnd: rnd(150, 300), slideShape: rnd(0.3, 0.6), attack: 0.001, hold: rnd(0.005, 0.015), decay: rnd(0.1, 0.2), punch: rnd(0.6, 1), noiseMix: rnd(0.4, 0.7), subAmount: rnd(0.3, 0.5), subFreq: rnd(90, 140), subDecay: rnd(0.03, 0.06), filterType: 'lowpass', cutoff: rnd(9000, 14000), cutoffEnd: rnd(900, 2000), resonance: rnd(0.7, 1.2), drive: rnd(0.35, 0.6) }),
  'شات‌گان': () => ({ wave: 'noise', freq: rnd(500, 900), freqEnd: rnd(40, 90), slideShape: rnd(0.4, 0.8), attack: 0.001, hold: rnd(0.02, 0.04), decay: rnd(0.35, 0.6), punch: rnd(0.6, 1), noiseMix: rnd(0.5, 0.75), noiseColor: 'pink', subAmount: rnd(0.7, 0.95), subFreq: rnd(50, 75), subDecay: rnd(0.1, 0.2), filterType: 'lowpass', cutoff: rnd(4000, 7000), cutoffEnd: rnd(250, 500), resonance: 0.8, drive: rnd(0.4, 0.7) }),
  'تک‌تیرانداز': () => ({ wave: 'noise', freq: rnd(2000, 3500), freqEnd: rnd(60, 120), slideShape: rnd(0.25, 0.5), attack: 0.001, hold: rnd(0.008, 0.02), decay: rnd(0.6, 1.1), punch: 1, noiseMix: rnd(0.4, 0.6), noiseColor: 'pink', subAmount: rnd(0.6, 0.85), subFreq: rnd(55, 80), subDecay: rnd(0.12, 0.25), filterType: 'lowpass', cutoff: rnd(12000, 18000), cutoffEnd: rnd(300, 700), resonance: 0.9, drive: rnd(0.5, 0.75) }),
  'لیزر': () => ({ wave: pick(['square', 'saw', 'sine']), duty: rnd(0.2, 0.5), freq: rnd(1000, 2400), freqEnd: rnd(120, 400), slideShape: rnd(0.4, 1.2), attack: 0.001, hold: rnd(0.02, 0.08), decay: rnd(0.1, 0.3), punch: rnd(0, 0.4), vibDepth: Math.random() < 0.4 ? rnd(0.02, 0.1) : 0, vibRate: rnd(15, 40), filterType: 'lowpass', cutoff: rnd(5000, 12000), cutoffEnd: rnd(2000, 6000), resonance: rnd(1, 4) }),
  'انفجار': () => ({ wave: 'noise', freq: rnd(50, 140), freqEnd: rnd(15, 40), slideShape: 1, attack: 0.002, hold: rnd(0.05, 0.12), decay: rnd(0.8, 1.6), punch: rnd(0.5, 1), noiseMix: rnd(0.4, 0.7), noiseColor: 'brown', subAmount: rnd(0.8, 1), subFreq: rnd(40, 60), subDecay: rnd(0.3, 0.6), filterType: 'lowpass', cutoff: rnd(2000, 4000), cutoffEnd: rnd(150, 300), resonance: rnd(0.7, 1.4), drive: rnd(0.3, 0.6) }),
  'برخورد فلز': () => ({ wave: pick(['triangle', 'sine', 'square']), duty: 0.3, freq: rnd(2200, 4500), freqEnd: rnd(1500, 3000), attack: 0.0005, hold: rnd(0.002, 0.01), decay: rnd(0.12, 0.3), punch: 1, vibDepth: rnd(0.01, 0.04), vibRate: rnd(30, 60), noiseMix: rnd(0.3, 0.55), filterType: 'bandpass', cutoff: rnd(2500, 5000), cutoffEnd: rnd(1800, 3500), resonance: rnd(2, 6), drive: rnd(0.1, 0.3) }),
  'برخورد بدن': () => ({ wave: 'noise', freq: rnd(200, 500), freqEnd: rnd(60, 120), attack: 0.001, hold: 0.005, decay: rnd(0.08, 0.16), punch: rnd(0.5, 1), noiseMix: rnd(0.5, 0.8), noiseColor: 'brown', subAmount: rnd(0.4, 0.7), subFreq: rnd(90, 140), subDecay: rnd(0.04, 0.07), filterType: 'lowpass', cutoff: rnd(1200, 2400), cutoffEnd: rnd(200, 500), resonance: 1, drive: rnd(0.2, 0.4) }),
  'برخورد خاک': () => ({ wave: 'noise', freq: rnd(400, 900), freqEnd: rnd(100, 250), attack: 0.001, hold: 0.004, decay: rnd(0.12, 0.25), punch: rnd(0.3, 0.7), noiseMix: rnd(0.6, 0.9), noiseColor: 'pink', subAmount: rnd(0.2, 0.4), subFreq: rnd(70, 110), subDecay: 0.05, filterType: 'bandpass', cutoff: rnd(1000, 2200), cutoffEnd: rnd(400, 900), resonance: rnd(0.6, 1.2) }),
  'کمانه': () => ({ wave: 'sine', freq: rnd(2800, 5000), freqEnd: rnd(700, 1500), slideShape: rnd(0.6, 1.4), attack: 0.001, hold: 0.01, decay: rnd(0.3, 0.55), punch: rnd(0.3, 0.6), vibDepth: rnd(0.01, 0.03), vibRate: rnd(25, 50), noiseMix: rnd(0.05, 0.15), filterType: 'highpass', cutoff: rnd(400, 900), cutoffEnd: rnd(400, 900), resonance: 0.7 }),
  'خشاب': () => ({ wave: 'noise', freq: rnd(3000, 6000), freqEnd: rnd(1500, 3000), attack: 0.0005, hold: 0.003, decay: rnd(0.025, 0.05), punch: 1, noiseMix: 0.3, filterType: 'highpass', cutoff: rnd(1500, 3000), cutoffEnd: rnd(1500, 3000), resonance: rnd(1, 3), subAmount: rnd(0.1, 0.3), subFreq: rnd(150, 250), subDecay: 0.02 }),
  'پوکه': () => ({ wave: 'triangle', freq: rnd(3500, 6000), freqEnd: rnd(3000, 5500), attack: 0.0005, hold: 0.004, decay: rnd(0.15, 0.3), punch: 0.5, vibDepth: rnd(0.02, 0.06), vibRate: rnd(40, 60), noiseMix: rnd(0.05, 0.15), filterType: 'bandpass', cutoff: rnd(4000, 6000), cutoffEnd: rnd(3500, 5500), resonance: rnd(3, 8) }),
  'جمع‌کردن': () => ({ wave: pick(['square', 'sine']), duty: rnd(0.3, 0.5), freq: rnd(600, 1100), freqEnd: 0, attack: 0, hold: rnd(0.05, 0.1), decay: rnd(0.15, 0.3), punch: rnd(0.2, 0.5), arpMult: rnd(1.3, 2), arpTime: rnd(0.04, 0.09) }),
  'قدرت': () => ({ wave: pick(['saw', 'square']), duty: 0.4, freq: rnd(150, 300), freqEnd: rnd(900, 1600), slideShape: rnd(0.8, 1.5), attack: rnd(0, 0.02), hold: rnd(0.1, 0.25), decay: rnd(0.2, 0.4), vibDepth: rnd(0.03, 0.08), vibRate: rnd(10, 20), filterType: 'lowpass', cutoff: rnd(3000, 6000), cutoffEnd: rnd(5000, 10000), resonance: 2 }),
  'پرش': () => ({ wave: 'square', duty: rnd(0.2, 0.5), freq: rnd(200, 350), freqEnd: rnd(500, 900), slideShape: rnd(0.6, 1), attack: 0, hold: rnd(0.03, 0.06), decay: rnd(0.12, 0.22) }),
  'آسیب': () => ({ wave: pick(['saw', 'noise', 'square']), freq: rnd(400, 800), freqEnd: rnd(80, 180), attack: 0, hold: rnd(0.02, 0.05), decay: rnd(0.12, 0.25), punch: rnd(0.3, 0.6), noiseMix: rnd(0, 0.3), drive: rnd(0.3, 0.6), filterType: 'lowpass', cutoff: 5000, cutoffEnd: 1200, resonance: 1 }),
  'کلیک UI': () => ({ wave: pick(['sine', 'square', 'triangle']), duty: 0.5, freq: rnd(700, 1600), freqEnd: 0, attack: 0, hold: rnd(0.01, 0.03), decay: rnd(0.03, 0.08) }),
  'قدم': () => ({ wave: 'noise', freq: rnd(150, 300), freqEnd: rnd(60, 120), attack: 0.002, hold: 0.01, decay: rnd(0.06, 0.12), noiseMix: 0.8, noiseColor: 'brown', subAmount: rnd(0.3, 0.5), subFreq: rnd(70, 100), subDecay: 0.04, filterType: 'lowpass', cutoff: rnd(600, 1200), cutoffEnd: rnd(300, 600), resonance: 0.8 })
};

function applyPreset(name) {
  const p = { ...SYNTH_DEFAULT, ...PRESETS[name]() };
  if (!p.freqEnd) p.freqEnd = p.freq;
  synth = p;
  syncControls(synthCtl);
  $('soundName').value = presetSlug(name) + '_' + String(Math.floor(Math.random() * 90) + 10);
  synthChanged(true);
}
function presetSlug(name) {
  const map = { 'کلت': 'pistol', 'تفنگ': 'rifle', 'شات‌گان': 'shotgun', 'تک‌تیرانداز': 'sniper', 'لیزر': 'laser', 'انفجار': 'explosion', 'برخورد فلز': 'hit_metal', 'برخورد بدن': 'hit_body', 'برخورد خاک': 'hit_dirt', 'کمانه': 'ricochet', 'خشاب': 'reload', 'پوکه': 'shell', 'جمع‌کردن': 'pickup', 'قدرت': 'powerup', 'پرش': 'jump', 'آسیب': 'hurt', 'کلیک UI': 'ui_click', 'قدم': 'footstep' };
  return map[name] || 'sfx';
}
function mutate() {
  for (const g of SYNTH_SCHEMA) for (const it of g.items) {
    if (it.type === 'select' || Math.random() < 0.4) continue;
    const v = synth[it.k];
    let nv = it.log ? v * Math.pow(2, rnd(-0.25, 0.25)) : v + (it.max - it.min) * rnd(-0.05, 0.05);
    if (it.step >= 1) nv = Math.round(nv);
    synth[it.k] = clamp(nv, it.min, it.max);
  }
  syncControls(synthCtl);
  synthChanged(true);
}
function randomSynth() {
  const p = { ...SYNTH_DEFAULT };
  p.wave = pick(['sine', 'square', 'saw', 'triangle', 'noise']);
  p.duty = rnd(0.1, 0.9); p.freq = Math.exp(rnd(Math.log(60), Math.log(4000)));
  p.freqEnd = Math.exp(rnd(Math.log(30), Math.log(4000)));
  p.slideShape = rnd(0.3, 2); p.attack = Math.random() < 0.6 ? rnd(0, 0.01) : rnd(0, 0.2);
  p.hold = rnd(0, 0.2); p.decay = rnd(0.05, 0.8); p.punch = rnd(0, 1);
  p.vibDepth = Math.random() < 0.3 ? rnd(0, 0.15) : 0; p.vibRate = rnd(2, 40);
  p.noiseMix = Math.random() < 0.4 ? rnd(0, 0.8) : 0; p.noiseColor = pick(['white', 'pink', 'brown']);
  p.subAmount = Math.random() < 0.3 ? rnd(0, 0.8) : 0; p.subFreq = rnd(40, 150); p.subDecay = rnd(0.03, 0.4);
  p.filterType = pick(['none', 'lowpass', 'lowpass', 'highpass', 'bandpass']);
  p.cutoff = Math.exp(rnd(Math.log(300), Math.log(16000))); p.cutoffEnd = Math.exp(rnd(Math.log(200), Math.log(16000)));
  p.resonance = rnd(0.5, 5); p.drive = Math.random() < 0.4 ? rnd(0, 0.6) : 0;
  synth = p;
  syncControls(synthCtl);
  synthChanged(true);
}

let synthTimer = 0;
function synthChanged(immediate = false) {
  if (!$('liveSynth').checked) return;
  clearTimeout(synthTimer);
  synthTimer = setTimeout(() => {
    synthPlace('replace', true);
  }, immediate ? 0 : 140);
}
function synthPlace(mode, live = false) {
  const data = synthRender(synth, SR);
  const chs = doc.ch.map(() => data);
  if (mode === 'replace') {
    pushUndo(live ? 'synth-live' : '');
    recipe = { ...synth };
    sel = { s: 0, e: 0 };
    setDoc([data.slice()], SR);
  } else {
    const at = sel.s;
    const conv = matchRate(chs, SR, doc.sr);
    pushUndo();
    recipe = null;
    if (mode === 'insert') insertAt(at, conv);
    else mixAt(at, conv);
    sel = { s: at, e: at + conv[0].length };
    setDoc(doc.ch, doc.sr, true);
  }
  if ($('autoPlay').checked) play();
}

/* ---------------------------------------------------------------- controls */
function fmtVal(it, v) {
  if (it.type === 'select' || it.type === 'check') return '';
  let s;
  if (Math.abs(v) >= 1000) s = Math.round(v).toString();
  else if (Math.abs(v) >= 100) s = v.toFixed(0);
  else if (Math.abs(v) >= 10) s = v.toFixed(1);
  else s = v.toFixed(it.step && it.step >= 1 ? 0 : 3).replace(/\.?0+$/, '') || '0';
  return s + (it.unit ? ' ' + it.unit : '');
}
function toSlider(it, v) {
  return it.log ? 1000 * Math.log(v / it.min) / Math.log(it.max / it.min) : v;
}
function fromSlider(it, s) {
  return it.log ? it.min * Math.pow(it.max / it.min, s / 1000) : +s;
}
function buildControls(host, groups, getState, onChange) {
  host.innerHTML = '';
  const refs = {};
  for (const g of groups) {
    const box = document.createElement('div');
    box.className = 'ctlGroup';
    const h = document.createElement('h4');
    const st = () => g.key ? getState()[g.key] : getState();
    if (g.key) {
      const lab = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = st().on;
      cb.onchange = () => { st().on = cb.checked; box.classList.toggle('off', !cb.checked); onChange(); };
      lab.append(cb, g.title);
      h.append(lab);
      box.classList.toggle('off', !st().on);
      refs[g.key + '.on'] = { el: cb, box, it: { type: 'check' }, st, k: 'on' };
    } else h.textContent = g.title;
    box.append(h);
    for (const it of g.items) {
      const row = document.createElement('div');
      row.className = 'ctl';
      const lab = document.createElement('span');
      lab.textContent = it.label;
      const val = document.createElement('span');
      val.className = 'v';
      let el;
      if (it.type === 'select') {
        el = document.createElement('select');
        for (const [v, l] of it.options) el.add(new Option(l, v));
        el.value = st()[it.k];
        el.onchange = () => { st()[it.k] = el.value; onChange(it); };
      } else if (it.type === 'check') {
        el = document.createElement('input');
        el.type = 'checkbox'; el.checked = st()[it.k];
        el.onchange = () => { st()[it.k] = el.checked; onChange(it); };
      } else {
        el = document.createElement('input');
        el.type = 'range';
        el.min = it.log ? 0 : it.min; el.max = it.log ? 1000 : it.max; el.step = it.log ? 1 : (it.step || 0.01);
        el.value = toSlider(it, st()[it.k]);
        el.oninput = () => {
          st()[it.k] = fromSlider(it, el.value);
          val.textContent = fmtVal(it, st()[it.k]);
          onChange(it);
        };
        el.ondblclick = () => {
          if (it.def === undefined) return;
          st()[it.k] = it.def; el.value = toSlider(it, it.def); val.textContent = fmtVal(it, it.def); onChange(it);
        };
        val.textContent = fmtVal(it, st()[it.k]);
      }
      row.append(lab, el, val);
      box.append(row);
      refs[(g.key ? g.key + '.' : '') + it.k] = { el, val, it, st, k: it.k };
    }
    host.append(box);
  }
  return refs;
}
function syncControls(refs) {
  for (const key in refs) {
    const r = refs[key];
    const v = r.st()[r.k];
    if (r.it.type === 'check') { r.el.checked = v; if (r.box) r.box.classList.toggle('off', !v); }
    else if (r.it.type === 'select') r.el.value = v;
    else { r.el.value = toSlider(r.it, v); r.val.textContent = fmtVal(r.it, v); }
  }
}

/* ---------------------------------------------------------------- effects */
const FX_SCHEMA = [
  { key: 'gain', title: 'بلندی', items: [{ k: 'db', label: 'گین', min: -36, max: 24, step: 0.1, unit: 'dB', def: 0 }] },
  { key: 'pitch', title: 'زیر و بمی (Pitch)', items: [
    { k: 'semis', label: 'نیم‌پرده', min: -24, max: 24, step: 0.01, def: 0 },
    { k: 'keep', label: 'حفظ مدت زمان', type: 'check' }
  ] },
  { key: 'stretch', title: 'سرعت (بدون تغییر پیچ)', items: [{ k: 'speed', label: 'سرعت ×', min: 0.25, max: 4, log: true, def: 1 }] },
  { key: 'filter', title: 'فیلتر', items: [
    { k: 'type', label: 'نوع', type: 'select', options: [['lowpass', 'پایین‌گذر'], ['highpass', 'بالاگذر'], ['bandpass', 'میان‌گذر'], ['notch', 'ناچ'], ['peaking', 'پیک'], ['lowshelf', 'شلف بم'], ['highshelf', 'شلف زیر']] },
    { k: 'freq', label: 'فرکانس', min: 20, max: 20000, log: true, unit: 'Hz', def: 2000 },
    { k: 'q', label: 'Q', min: 0.1, max: 30, log: true, def: 0.7 },
    { k: 'gain', label: 'گین (پیک/شلف)', min: -24, max: 24, step: 0.1, unit: 'dB', def: 0 }
  ] },
  { key: 'eq', title: 'اکولایزر ۳ باند', items: [
    { k: 'low', label: 'بم (200Hz)', min: -24, max: 24, step: 0.1, unit: 'dB', def: 0 },
    { k: 'mid', label: 'میانه (1kHz)', min: -24, max: 24, step: 0.1, unit: 'dB', def: 0 },
    { k: 'high', label: 'زیر (5kHz)', min: -24, max: 24, step: 0.1, unit: 'dB', def: 0 }
  ] },
  { key: 'dist', title: 'دیستورشن', items: [
    { k: 'amount', label: 'شدت', min: 0, max: 1, step: 0.01, def: 0.4 },
    { k: 'mix', label: 'ترکیب', min: 0, max: 1, step: 0.01, def: 1 }
  ] },
  { key: 'crush', title: 'بیت‌کراشر', items: [
    { k: 'bits', label: 'بیت', min: 1, max: 16, step: 1, def: 8 },
    { k: 'down', label: 'کاهش نمونه', min: 1, max: 40, step: 1, def: 1 }
  ] },
  { key: 'chorus', title: 'کورس / فلنجر', items: [
    { k: 'rate', label: 'سرعت', min: 0.05, max: 10, log: true, unit: 'Hz', def: 1.2 },
    { k: 'depth', label: 'عمق', min: 0, max: 15, step: 0.1, unit: 'ms', def: 3 },
    { k: 'delay', label: 'تأخیر پایه', min: 0.5, max: 40, step: 0.1, unit: 'ms', def: 15 },
    { k: 'fb', label: 'فیدبک', min: 0, max: 0.9, step: 0.01, def: 0.2 },
    { k: 'mix', label: 'ترکیب', min: 0, max: 1, step: 0.01, def: 0.5 }
  ] },
  { key: 'echo', title: 'اکو (Delay)', items: [
    { k: 'time', label: 'زمان', min: 10, max: 1500, step: 1, unit: 'ms', def: 180 },
    { k: 'fb', label: 'فیدبک', min: 0, max: 0.92, step: 0.01, def: 0.35 },
    { k: 'mix', label: 'میزان اکو', min: 0, max: 1, step: 0.01, def: 0.4 },
    { k: 'tone', label: 'تیرگی تکرارها', min: 500, max: 20000, log: true, unit: 'Hz', def: 6000 }
  ] },
  { key: 'reverb', title: 'ریورب (فضا)', items: [
    { k: 'size', label: 'اندازه', min: 0.1, max: 8, log: true, unit: 's', def: 1.5 },
    { k: 'decay', label: 'افت', min: 0.5, max: 8, step: 0.1, def: 2.5 },
    { k: 'pre', label: 'پیش‌تأخیر', min: 0, max: 200, step: 1, unit: 'ms', def: 10 },
    { k: 'tone', label: 'روشنی', min: 500, max: 20000, log: true, unit: 'Hz', def: 7000 },
    { k: 'mix', label: 'میزان', min: 0, max: 1, step: 0.01, def: 0.3 }
  ] },
  { key: 'tremolo', title: 'ترمولو', items: [
    { k: 'rate', label: 'سرعت', min: 0.5, max: 40, log: true, unit: 'Hz', def: 8 },
    { k: 'depth', label: 'عمق', min: 0, max: 1, step: 0.01, def: 0.6 }
  ] },
  { key: 'comp', title: 'کمپرسور', items: [
    { k: 'thr', label: 'آستانه', min: -60, max: 0, step: 0.5, unit: 'dB', def: -18 },
    { k: 'ratio', label: 'نسبت', min: 1, max: 20, step: 0.1, def: 4 },
    { k: 'att', label: 'حمله', min: 0, max: 200, step: 0.5, unit: 'ms', def: 5 },
    { k: 'rel', label: 'رهایی', min: 10, max: 1000, step: 1, unit: 'ms', def: 150 },
    { k: 'makeup', label: 'جبران', min: 0, max: 24, step: 0.1, unit: 'dB', def: 4 }
  ] }
];
function fxDefaults() {
  const fx = {};
  for (const g of FX_SCHEMA) {
    fx[g.key] = { on: false };
    for (const it of g.items) fx[g.key][it.k] = it.type === 'check' ? true : it.type === 'select' ? it.options[0][0] : it.def;
  }
  return fx;
}
let fx = fxDefaults();

function makeIR(c, size, decay, sr) {
  const len = Math.max(1, Math.floor(size * sr));
  const ir = c.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return ir;
}
function fxTail(f) {
  let tail = 0;
  if (f.echo.on) tail += Math.min(10, f.echo.time / 1000 * Math.ceil(Math.log(0.001) / Math.log(Math.max(f.echo.fb, 0.05))));
  if (f.reverb.on) tail += f.reverb.size + f.reverb.pre / 1000;
  if (f.chorus.on) tail += 0.1;
  return tail;
}
function anyFx(f) { return Object.values(f).some(g => g.on); }

async function processFx(chs, sr, f) {
  let data = chs.map(c => c.slice());
  if (f.pitch.on && f.pitch.semis) data = pitchShift(data, f.pitch.semis, f.pitch.keep, sr);
  if (f.stretch.on && Math.abs(f.stretch.speed - 1) > 1e-3) data = timeStretch(data, 1 / f.stretch.speed, sr);
  const coreLen = data[0].length;
  const graphOn = ['gain', 'filter', 'eq', 'dist', 'chorus', 'echo', 'reverb', 'comp'].some(k => f[k].on);
  if (graphOn) {
    const tail = fxTail(f);
    const nch = data.length;
    const total = coreLen + Math.ceil(tail * sr) + 1;
    const oc = new OfflineAudioContext(nch, total, sr);
    const buf = oc.createBuffer(nch, coreLen, sr);
    data.forEach((c, i) => buf.copyToChannel(c, i));
    const src = oc.createBufferSource();
    src.buffer = buf;
    let node = src;
    const chain = n => { node.connect(n); node = n; return n; };
    const parallel = (dryAmt, wetAmt, build) => {
      const out = oc.createGain(), dry = oc.createGain(), wet = oc.createGain();
      dry.gain.value = dryAmt; wet.gain.value = wetAmt;
      node.connect(dry).connect(out);
      const [i, o] = build();
      node.connect(i); o.connect(wet).connect(out);
      node = out;
    };
    if (f.gain.on) chain(oc.createGain()).gain.value = dbToGain(f.gain.db);
    if (f.filter.on) {
      const b = chain(oc.createBiquadFilter());
      b.type = f.filter.type; b.frequency.value = Math.min(f.filter.freq, sr * 0.49); b.Q.value = f.filter.q; b.gain.value = f.filter.gain;
    }
    if (f.eq.on) {
      const l = chain(oc.createBiquadFilter()); l.type = 'lowshelf'; l.frequency.value = 200; l.gain.value = f.eq.low;
      const m = chain(oc.createBiquadFilter()); m.type = 'peaking'; m.frequency.value = 1000; m.Q.value = 0.8; m.gain.value = f.eq.mid;
      const h = chain(oc.createBiquadFilter()); h.type = 'highshelf'; h.frequency.value = Math.min(5000, sr * 0.45); h.gain.value = f.eq.high;
    }
    if (f.dist.on) {
      parallel(1 - f.dist.mix, f.dist.mix, () => {
        const ws = oc.createWaveShaper();
        const k = f.dist.amount * 120, n = 2048, curve = new Float32Array(n);
        for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; curve[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
        ws.curve = curve; ws.oversample = '4x';
        return [ws, ws];
      });
    }
    if (f.chorus.on) {
      parallel(1 - f.chorus.mix * 0.5, f.chorus.mix, () => {
        const d = oc.createDelay(0.2), fb = oc.createGain(), lfo = oc.createOscillator(), dep = oc.createGain();
        d.delayTime.value = f.chorus.delay / 1000;
        lfo.frequency.value = f.chorus.rate; dep.gain.value = Math.min(f.chorus.depth, f.chorus.delay - 0.1) / 1000;
        lfo.connect(dep).connect(d.delayTime); lfo.start(0);
        fb.gain.value = f.chorus.fb; d.connect(fb).connect(d);
        return [d, d];
      });
    }
    if (f.echo.on) {
      parallel(1, f.echo.mix, () => {
        const d = oc.createDelay(2), fb = oc.createGain(), lp = oc.createBiquadFilter();
        d.delayTime.value = f.echo.time / 1000; fb.gain.value = f.echo.fb;
        lp.type = 'lowpass'; lp.frequency.value = Math.min(f.echo.tone, sr * 0.49);
        d.connect(lp).connect(fb).connect(d);
        return [d, lp];
      });
    }
    if (f.reverb.on) {
      parallel(1 - f.reverb.mix * 0.5, f.reverb.mix, () => {
        const pd = oc.createDelay(1), cv = oc.createConvolver(), lp = oc.createBiquadFilter();
        pd.delayTime.value = f.reverb.pre / 1000;
        cv.buffer = makeIR(oc, f.reverb.size, f.reverb.decay, sr);
        lp.type = 'lowpass'; lp.frequency.value = Math.min(f.reverb.tone, sr * 0.49);
        pd.connect(cv).connect(lp);
        return [pd, lp];
      });
    }
    if (f.comp.on) {
      const c = chain(oc.createDynamicsCompressor());
      c.threshold.value = f.comp.thr; c.ratio.value = f.comp.ratio; c.knee.value = 6;
      c.attack.value = f.comp.att / 1000; c.release.value = f.comp.rel / 1000;
      chain(oc.createGain()).gain.value = dbToGain(f.comp.makeup);
    }
    node.connect(oc.destination);
    src.start(0);
    const out = await oc.startRendering();
    data = [];
    for (let i = 0; i < nch; i++) data.push(out.getChannelData(i).slice());
    // trim inaudible tail
    let last = coreLen;
    for (const c of data) for (let i = c.length - 1; i >= last; i--) if (Math.abs(c[i]) > 1e-4) { last = i + 1; break; }
    data = data.map(c => c.slice(0, last));
  }
  if (f.crush.on) {
    const step = f.crush.bits >= 16 ? 0 : Math.pow(2, f.crush.bits - 1), ds = Math.max(1, f.crush.down | 0);
    for (const c of data) {
      let h = 0;
      for (let i = 0; i < c.length; i++) {
        if (i % ds === 0) h = c[i];
        c[i] = step ? Math.round(h * step) / step : h;
      }
    }
  }
  if (f.tremolo.on) {
    for (const c of data) for (let i = 0; i < c.length; i++) {
      c[i] *= 1 - f.tremolo.depth * (0.5 - 0.5 * Math.cos(2 * Math.PI * f.tremolo.rate * i / sr));
    }
  }
  return { data, coreLen };
}

function targetRange() { return hasSel() ? [sel.s, sel.e] : [0, docLen()]; }

async function fxPreview() {
  if (!anyFx(fx)) return toast('هیچ افکتی فعال نیست');
  const [s, e] = targetRange();
  const { data } = await processFx(region(s, e), doc.sr, fx);
  playChannels(data, doc.sr);
}
async function fxApply() {
  if (!anyFx(fx)) return toast('هیچ افکتی فعال نیست');
  const [s, e] = targetRange();
  const { data, coreLen } = await processFx(region(s, e), doc.sr, fx);
  pushUndo();
  recipe = null;
  const after = region(e);
  const tailEnd = s + data[0].length;
  const newLen = Math.max(s + coreLen + after[0].length, tailEnd);
  doc.ch = doc.ch.map((c, i) => {
    const n = new Float32Array(newLen);
    n.set(c.subarray(0, s));
    n.set(after[i], s + coreLen);
    const d = data[i] || data[0];
    for (let j = 0; j < d.length; j++) n[s + j] += d[j];
    return n;
  });
  sel = { s, e: s + coreLen };
  setDoc(doc.ch, doc.sr, false);
  toast('افکت‌ها اعمال شد');
}

/* ---------------------------------------------------------------- edit ops */
function matchRate(chs, from, to) {
  if (from === to) return chs;
  return chs.map(c => resample(c, from / to));
}
function matchChannels(chs, n) {
  if (chs.length === n) return chs;
  if (n === 1) {
    const m = new Float32Array(chs[0].length);
    for (const c of chs) for (let i = 0; i < m.length; i++) m[i] += c[i] / chs.length;
    return [m];
  }
  return Array.from({ length: n }, (_, i) => chs[Math.min(i, chs.length - 1)]);
}
function insertAt(at, chs) {
  chs = matchChannels(chs, doc.ch.length);
  doc.ch = doc.ch.map((c, i) => {
    const n = new Float32Array(c.length + chs[i].length);
    n.set(c.subarray(0, at)); n.set(chs[i], at); n.set(c.subarray(at), at + chs[i].length);
    return n;
  });
}
function mixAt(at, chs) {
  chs = matchChannels(chs, doc.ch.length);
  const newLen = Math.max(docLen(), at + chs[0].length);
  doc.ch = doc.ch.map((c, i) => {
    const n = new Float32Array(newLen);
    n.set(c);
    for (let j = 0; j < chs[i].length; j++) n[at + j] += chs[i][j];
    return n;
  });
}
function removeRange(s, e) {
  doc.ch = doc.ch.map(c => {
    const n = new Float32Array(c.length - (e - s));
    n.set(c.subarray(0, s)); n.set(c.subarray(e), s);
    return n;
  });
}
function forRange(fn) {
  const [s, e] = targetRange();
  pushUndo(); recipe = null;
  for (const c of doc.ch) fn(c, s, e);
  setDoc(doc.ch, doc.sr, true);
}

const OPS = {
  selectAll() { sel = { s: 0, e: docLen() }; refresh(); },
  copy() {
    if (!hasSel()) return toast('ابتدا بخشی را انتخاب کن');
    clipboard = { sr: doc.sr, ch: region(sel.s, sel.e) };
    toast('کپی شد');
  },
  cut() {
    if (!hasSel()) return toast('ابتدا بخشی را انتخاب کن');
    clipboard = { sr: doc.sr, ch: region(sel.s, sel.e) };
    OPS.delete();
  },
  delete() {
    if (!hasSel()) return toast('ابتدا بخشی را انتخاب کن');
    pushUndo(); recipe = null;
    removeRange(sel.s, sel.e);
    sel.e = sel.s;
    setDoc(doc.ch, doc.sr, true);
  },
  paste() {
    if (!clipboard) return toast('کلیپ‌بورد خالی است');
    pushUndo(); recipe = null;
    if (hasSel()) { removeRange(sel.s, sel.e); }
    const data = matchRate(clipboard.ch, clipboard.sr, doc.sr);
    insertAt(sel.s, data);
    sel = { s: sel.s, e: sel.s + data[0].length };
    setDoc(doc.ch, doc.sr, true);
  },
  pasteMix() {
    if (!clipboard) return toast('کلیپ‌بورد خالی است');
    pushUndo(); recipe = null;
    const data = matchRate(clipboard.ch, clipboard.sr, doc.sr);
    mixAt(sel.s, data);
    sel = { s: sel.s, e: sel.s + data[0].length };
    setDoc(doc.ch, doc.sr, true);
  },
  crop() {
    if (!hasSel()) return toast('ابتدا بخشی را انتخاب کن');
    pushUndo(); recipe = null;
    const r = region(sel.s, sel.e);
    sel = { s: 0, e: 0 };
    setDoc(r, doc.sr);
  },
  duplicate() {
    if (!hasSel()) return toast('ابتدا بخشی را انتخاب کن');
    pushUndo(); recipe = null;
    const r = region(sel.s, sel.e);
    insertAt(sel.e, r);
    sel = { s: sel.e, e: sel.e + r[0].length };
    setDoc(doc.ch, doc.sr, true);
  },
  silence() { forRange((c, s, e) => c.fill(0, s, e)); },
  insertSilence() {
    const ms = parseFloat(prompt('مدت سکوت (میلی‌ثانیه):', '200'));
    if (!(ms > 0)) return;
    pushUndo(); recipe = null;
    const n = Math.round(ms / 1000 * doc.sr);
    insertAt(sel.s, doc.ch.map(() => new Float32Array(n)));
    setDoc(doc.ch, doc.sr, true);
  },
  trimSilence() {
    const thr = dbToGain(-50);
    let a = docLen(), b = 0;
    for (const c of doc.ch) {
      for (let i = 0; i < c.length; i++) if (Math.abs(c[i]) > thr) { a = Math.min(a, i); break; }
      for (let i = c.length - 1; i >= 0; i--) if (Math.abs(c[i]) > thr) { b = Math.max(b, i + 1); break; }
    }
    if (b <= a) return toast('صدای قابل‌شنیدنی پیدا نشد');
    pushUndo(); recipe = null;
    const r = region(Math.max(0, a - 16), Math.min(docLen(), b + 16));
    sel = { s: 0, e: 0 };
    setDoc(r, doc.sr);
  },
  fadeIn() { forRange((c, s, e) => { const n = e - s; for (let i = 0; i < n; i++) c[s + i] *= Math.sin(i / n * Math.PI / 2) ** 2; }); },
  fadeOut() { forRange((c, s, e) => { const n = e - s; for (let i = 0; i < n; i++) c[s + i] *= Math.cos(i / n * Math.PI / 2) ** 2; }); },
  reverse() { forRange((c, s, e) => c.subarray(s, e).reverse()); },
  invert() { forRange((c, s, e) => { for (let i = s; i < e; i++) c[i] = -c[i]; }); },
  normalize() {
    const [s, e] = targetRange();
    let peak = 0;
    for (const c of doc.ch) for (let i = s; i < e; i++) peak = Math.max(peak, Math.abs(c[i]));
    if (peak < 1e-6) return toast('بخش انتخاب‌شده ساکت است');
    const g = dbToGain(-0.3) / peak;
    forRange((c, s2, e2) => { for (let i = s2; i < e2; i++) c[i] *= g; });
  },
  mono() {
    if (doc.ch.length === 1) return toast('صدا از قبل مونو است');
    pushUndo(); setDoc(matchChannels(doc.ch, 1), doc.sr, true);
  },
  stereo() {
    if (doc.ch.length === 2) return toast('صدا از قبل استریو است');
    pushUndo(); setDoc([doc.ch[0].slice(), doc.ch[0].slice()], doc.sr, true);
  }
};

/* ---------------------------------------------------------------- playback */
let playing = null;
function stop() {
  if (playing) { try { playing.src.stop(); } catch (_) {} playing = null; }
  draw();
}
function playChannels(chs, sr, offsetSample = null, loop = false) {
  stop();
  const c = ctx();
  const buf = c.createBuffer(chs.length, Math.max(1, chs[0].length), sr);
  chs.forEach((d, i) => buf.copyToChannel(d, i));
  const src = c.createBufferSource();
  src.buffer = buf; src.loop = loop;
  const g = c.createGain();
  g.gain.value = +$('monitorVol').value;
  src.connect(g).connect(c.destination);
  src.start();
  const p = { src, start: c.currentTime, offset: offsetSample, len: chs[0].length, sr, loop };
  playing = p;
  src.onended = () => { if (playing === p) { playing = null; draw(); } };
  animate();
}
function play() {
  let s, e;
  if (hasSel()) [s, e] = [sel.s, sel.e];
  else { s = sel.s >= docLen() - 1 ? 0 : sel.s; e = docLen(); }
  playChannels(region(s, e), doc.sr, s, $('loopChk').checked);
}
function animate() {
  if (!playing) return;
  draw();
  requestAnimationFrame(animate);
}

/* ---------------------------------------------------------------- waveform */
const canvas = $('wave'), wrap = $('waveWrap');
function fitView() { view = { start: 0, len: Math.max(1, docLen()) }; syncScroll(); }
function clampView() {
  const L = Math.max(1, docLen());
  view.len = clamp(view.len, Math.min(64, L), L);
  view.start = clamp(view.start, 0, Math.max(0, L - view.len));
  syncScroll();
}
function zoom(factor, centerSample = view.start + view.len / 2) {
  const rel = (centerSample - view.start) / view.len;
  view.len = view.len * factor;
  view.start = centerSample - rel * view.len;
  clampView(); draw();
}
function syncScroll() {
  const L = docLen(), sc = $('scroll');
  sc.disabled = view.len >= L;
  sc.value = L > view.len ? Math.round(view.start / (L - view.len) * 1000) : 0;
}
function xToSample(x) {
  const r = canvas.getBoundingClientRect();
  return clamp(Math.round(view.start + (x - r.left) / r.width * view.len), 0, docLen());
}
function sampleToX(s, W) { return (s - view.start) / view.len * W; }

function draw() {
  const dpr = window.devicePixelRatio || 1;
  const W = Math.max(1, Math.round(wrap.clientWidth * dpr)), H = Math.max(1, Math.round(wrap.clientHeight * dpr));
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  const g = canvas.getContext('2d');
  g.fillStyle = '#0b0d11'; g.fillRect(0, 0, W, H);
  const ruler = 18 * dpr;
  const nch = doc.ch.length, chH = (H - ruler) / nch;
  // selection
  if (hasSel()) {
    const a = sampleToX(sel.s, W), b = sampleToX(sel.e, W);
    g.fillStyle = 'rgba(47,111,237,.28)';
    g.fillRect(a, ruler, b - a, H - ruler);
  }
  // waveform
  for (let c = 0; c < nch; c++) {
    const data = doc.ch[c], top = ruler + c * chH, mid = top + chH / 2, amp = chH / 2 * 0.92;
    g.strokeStyle = '#1d222c'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, mid); g.lineTo(W, mid); g.stroke();
    if (c > 0) { g.strokeStyle = '#2a2f3a'; g.beginPath(); g.moveTo(0, top); g.lineTo(W, top); g.stroke(); }
    const spp = view.len / W;
    g.fillStyle = '#5fd3a6'; g.strokeStyle = '#5fd3a6';
    if (spp >= 1) {
      for (let x = 0; x < W; x++) {
        const i0 = Math.floor(view.start + x * spp), i1 = Math.min(data.length, Math.floor(view.start + (x + 1) * spp) + 1);
        let mn = 1, mx = -1;
        for (let i = i0; i < i1; i++) { const v = data[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
        if (mx < mn) continue;
        const y0 = mid - clamp(mx, -1, 1) * amp, y1 = mid - clamp(mn, -1, 1) * amp;
        g.fillRect(x, y0, 1, Math.max(1, y1 - y0));
      }
    } else {
      g.lineWidth = 1.5 * dpr; g.beginPath();
      const i0 = Math.floor(view.start), i1 = Math.min(data.length - 1, Math.ceil(view.start + view.len));
      for (let i = i0; i <= i1; i++) {
        const x = sampleToX(i, W), y = mid - clamp(data[i], -1, 1) * amp;
        i === i0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
      if (1 / spp > 6) for (let i = i0; i <= i1; i++) g.fillRect(sampleToX(i, W) - 1.5 * dpr, mid - clamp(data[i], -1, 1) * amp - 1.5 * dpr, 3 * dpr, 3 * dpr);
    }
  }
  // ruler
  g.fillStyle = '#12151b'; g.fillRect(0, 0, W, ruler);
  const secs = view.len / doc.sr, target = secs / (W / dpr / 90);
  const steps = [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 30, 60];
  const step = steps.find(s => s >= target) || 60;
  g.fillStyle = '#8f98a8'; g.strokeStyle = '#3a4352'; g.font = `${10 * dpr}px monospace`; g.textBaseline = 'middle';
  const t0 = Math.ceil(view.start / doc.sr / step) * step;
  for (let t = t0; t <= (view.start + view.len) / doc.sr; t += step) {
    const x = sampleToX(t * doc.sr, W);
    g.beginPath(); g.moveTo(x, ruler - 5 * dpr); g.lineTo(x, ruler); g.stroke();
    const dec = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
    g.fillText(t.toFixed(dec) + 's', x + 3 * dpr, ruler / 2);
  }
  // cursor
  const cx = sampleToX(sel.s, W);
  g.fillStyle = '#ffd166'; g.fillRect(cx - dpr / 2, ruler, dpr, H - ruler);
  if (hasSel()) { const ex = sampleToX(sel.e, W); g.fillRect(ex - dpr / 2, ruler, dpr, H - ruler); }
  // playhead
  if (playing && playing.offset !== null) {
    let el = (actx.currentTime - playing.start) * playing.sr;
    if (playing.loop) el %= playing.len;
    if (el <= playing.len) {
      const px = sampleToX(playing.offset + el, W);
      g.fillStyle = '#ff6b7a'; g.fillRect(px - dpr, 0, 2 * dpr, H);
    }
  }
}

function refresh() {
  draw();
  syncScroll();
  const L = docLen(), sr = doc.sr;
  let peak = 0;
  for (const c of doc.ch) for (let i = 0; i < c.length; i++) { const a = Math.abs(c[i]); if (a > peak) peak = a; }
  const peakDb = peak > 0 ? 20 * Math.log10(peak) : -Infinity;
  const t = s => (s / sr).toFixed(3) + 's';
  $('info').innerHTML =
    `<b>Length</b> ${t(L)} · <b>Rate</b> ${sr}Hz · <b>Ch</b> ${doc.ch.length === 1 ? 'mono' : 'stereo'} · ` +
    `<b>Peak</b> <span class="${peak > 1 ? 'clip' : ''}">${isFinite(peakDb) ? peakDb.toFixed(1) : '-∞'} dB</span><br>` +
    (hasSel() ? `<b>Selection</b> ${t(sel.s)} → ${t(sel.e)} (${t(sel.e - sel.s)})` : `<b>Cursor</b> ${t(sel.s)}`);
  $('undoBtn').disabled = !undoStack.length;
  $('redoBtn').disabled = !redoStack.length;
}

let dragAnchor = null;
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  const s = xToSample(e.clientX);
  if (e.shiftKey) {
    const anchor = Math.abs(s - sel.s) < Math.abs(s - sel.e) ? sel.e : sel.s;
    dragAnchor = anchor;
    sel = { s: Math.min(anchor, s), e: Math.max(anchor, s) };
  } else {
    dragAnchor = s;
    sel = { s, e: s };
  }
  refresh();
});
canvas.addEventListener('pointermove', e => {
  if (dragAnchor === null) return;
  const s = xToSample(e.clientX);
  sel = { s: Math.min(dragAnchor, s), e: Math.max(dragAnchor, s) };
  const r = canvas.getBoundingClientRect();
  if (e.clientX < r.left + 10) { view.start -= view.len * 0.02; clampView(); }
  if (e.clientX > r.right - 10) { view.start += view.len * 0.02; clampView(); }
  refresh();
});
const endDrag = () => {
  if (dragAnchor === null) return;
  dragAnchor = null;
  if (sel.e - sel.s < 3) sel.e = sel.s;
  refresh();
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    view.start += (e.deltaX || e.deltaY) / canvas.clientWidth * view.len;
    clampView(); draw();
  } else zoom(e.deltaY > 0 ? 1.25 : 0.8, xToSample(e.clientX));
}, { passive: false });
$('scroll').addEventListener('input', e => {
  view.start = (docLen() - view.len) * e.target.value / 1000;
  clampView(); draw();
});
new ResizeObserver(draw).observe(wrap);

/* ---------------------------------------------------------------- file io */
async function decodeFile(file) {
  if (/\.json$/i.test(file.name) || file.type === 'application/json') {
    const json = JSON.parse(await file.text());
    return importJson(json);
  }
  const ab = await file.arrayBuffer();
  const buf = await ctx().decodeAudioData(ab);
  const chs = [];
  for (let i = 0; i < Math.min(2, buf.numberOfChannels); i++) chs.push(buf.getChannelData(i).slice());
  pushUndo(); recipe = null;
  sel = { s: 0, e: 0 };
  setDoc(chs, buf.sampleRate);
  $('soundName').value = file.name.replace(/\.[^.]+$/, '').replace(/[^\w\-]+/g, '_').slice(0, 40) || 'sfx';
  toast('فایل باز شد: ' + file.name);
}
async function loadSoundJson(s) {
  const res = await fetch(s.audio);
  const buf = await ctx().decodeAudioData(await res.arrayBuffer());
  const chs = [];
  for (let i = 0; i < buf.numberOfChannels; i++) chs.push(buf.getChannelData(i).slice());
  pushUndo();
  recipe = s.recipe || null;
  if (recipe) { synth = { ...SYNTH_DEFAULT, ...recipe }; syncControls(synthCtl); }
  sel = { s: 0, e: 0 };
  setDoc(chs, buf.sampleRate);
  $('soundName').value = s.name || 'sfx';
}
async function importJson(json) {
  if (json.format === 'sfx-studio-bank' || Array.isArray(json.sounds)) {
    let n = 0;
    for (const s of json.sounds) if (s.audio) { await dbPut({ ...s, id: Date.now() + Math.random() }); n++; }
    await renderLib();
    switchTab('lib');
    toast(n + ' صدا به کتابخانه اضافه شد');
  } else if (json.audio) {
    await loadSoundJson(json);
    toast('صدا از JSON بارگذاری شد');
  } else throw new Error('bad json');
}

$('fileInput').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (f) try { await decodeFile(f); } catch (err) { console.error(err); toast('خواندن فایل ممکن نشد'); }
});
['dragenter', 'dragover'].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); wrap.classList.add('drag'); }));
['dragleave', 'drop'].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); wrap.classList.remove('drag'); }));
wrap.addEventListener('drop', async e => {
  const f = e.dataTransfer.files[0];
  if (f) try { await decodeFile(f); } catch (err) { console.error(err); toast('خواندن فایل ممکن نشد'); }
});

/* recording */
let recorder = null;
$('recBtn').addEventListener('click', async () => {
  if (recorder) { recorder.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      recorder = null;
      $('recBtn').classList.remove('on');
      $('recBtn').textContent = '● ضبط میکروفون';
      const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
      try { await decodeFile(new File([blob], 'recording.webm', { type: blob.type })); }
      catch (err) { console.error(err); toast('ضبط قابل خواندن نبود'); }
    };
    recorder.start();
    $('recBtn').classList.add('on');
    $('recBtn').textContent = '■ پایان ضبط';
  } catch (err) {
    console.error(err);
    toast('دسترسی به میکروفون ممکن نشد');
  }
});

/* ---------------------------------------------------------------- export */
function exportChannels() {
  return $('exportSel').checked && hasSel() ? region(sel.s, sel.e) : region();
}
function encodeWav(chs, sr) {
  const n = chs[0].length, nch = chs.length, bytes = n * nch * 2;
  const buf = new ArrayBuffer(44 + bytes), v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + bytes, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nch, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * nch * 2, true); v.setUint16(32, nch * 2, true);
  v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, bytes, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nch; c++) {
    const s = clamp(chs[c][i], -1, 1);
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
  }
  return new Uint8Array(buf);
}
function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function download(data, name, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const fileName = () => ($('soundName').value.trim() || 'sfx').replace(/[\\/:*?"<>|]+/g, '_');

let lamePromise = null;
function loadLame() {
  if (window.lamejs) return Promise.resolve();
  if (!lamePromise) lamePromise = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'vendor/lame.min.js';
    s.onload = () => res(); s.onerror = () => { lamePromise = null; rej(new Error('lame load failed')); };
    document.head.append(s);
  });
  return lamePromise;
}
async function encodeMp3(chs, sr, kbps) {
  await loadLame();
  const supported = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];
  if (!supported.includes(sr)) { chs = matchRate(chs, sr, 44100); sr = 44100; }
  const nch = Math.min(2, chs.length);
  const enc = new lamejs.Mp3Encoder(nch, sr, kbps);
  const ints = chs.slice(0, nch).map(c => {
    const a = new Int16Array(c.length);
    for (let i = 0; i < c.length; i++) { const s = clamp(c[i], -1, 1); a[i] = s < 0 ? s * 0x8000 : s * 0x7fff; }
    return a;
  });
  const parts = [], block = 1152;
  for (let i = 0; i < ints[0].length; i += block) {
    const l = ints[0].subarray(i, i + block);
    const out = nch === 2 ? enc.encodeBuffer(l, ints[1].subarray(i, i + block)) : enc.encodeBuffer(l);
    if (out.length) parts.push(new Uint8Array(out));
  }
  const end = enc.flush();
  if (end.length) parts.push(new Uint8Array(end));
  return new Blob(parts, { type: 'audio/mpeg' });
}
function soundJson(chs = exportChannels()) {
  return {
    format: 'sfx-studio',
    version: 1,
    name: fileName(),
    sampleRate: doc.sr,
    channels: chs.length,
    duration: +(chs[0].length / doc.sr).toFixed(4),
    recipe: recipe ? { type: 'synth', ...recipe } : null,
    audio: 'data:audio/wav;base64,' + toBase64(encodeWav(chs, doc.sr))
  };
}

$('expWav').addEventListener('click', () => download(encodeWav(exportChannels(), doc.sr), fileName() + '.wav', 'audio/wav'));
$('expMp3').addEventListener('click', async () => {
  try {
    toast('در حال ساخت MP3…');
    const blob = await encodeMp3(exportChannels(), doc.sr, +$('mp3Rate').value);
    download(blob, fileName() + '.mp3', 'audio/mpeg');
    toast('MP3 آماده شد');
  } catch (err) { console.error(err); toast('ساخت MP3 ممکن نشد'); }
});
$('expJson').addEventListener('click', () => download(JSON.stringify(soundJson(), null, 2), fileName() + '.json', 'application/json'));
$('copyJson').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(JSON.stringify(soundJson())); toast('JSON کپی شد'); }
  catch (_) { toast('کپی در کلیپ‌بورد ممکن نشد'); }
});

/* ---------------------------------------------------------------- library (IndexedDB) */
let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open('sfx-studio', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('sounds', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function dbTx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const tx = d.transaction('sounds', mode), st = tx.objectStore('sounds');
    const req = fn(st);
    tx.oncomplete = () => res(req && req.result);
    tx.onerror = () => rej(tx.error);
  });
}
const dbPut = v => dbTx('readwrite', st => st.put(v));
const dbDel = id => dbTx('readwrite', st => st.delete(id));
const dbAll = () => dbTx('readonly', st => st.getAll());

async function renderLib() {
  const list = $('libList');
  let items = [];
  try { items = (await dbAll()) || []; } catch (_) { list.innerHTML = '<li class="empty">کتابخانه در این مرورگر در دسترس نیست</li>'; return; }
  items.sort((a, b) => b.id - a.id);
  list.innerHTML = '';
  if (!items.length) { list.innerHTML = '<li class="empty">هنوز صدایی ذخیره نشده</li>'; return; }
  for (const s of items) {
    const li = document.createElement('li');
    const n = document.createElement('span'); n.className = 'n'; n.textContent = s.name;
    const d = document.createElement('span'); d.className = 'd'; d.textContent = s.duration.toFixed(2) + 's';
    const mk = (label, title, fn) => { const b = document.createElement('button'); b.textContent = label; b.title = title; b.onclick = fn; return b; };
    li.append(
      mk('▶', 'پخش', async () => {
        const buf = await ctx().decodeAudioData(await (await fetch(s.audio)).arrayBuffer());
        const chs = []; for (let i = 0; i < buf.numberOfChannels; i++) chs.push(buf.getChannelData(i));
        playChannels(chs, buf.sampleRate);
      }),
      n, d,
      mk('ویرایش', 'باز کردن در ویرایشگر', () => loadSoundJson(s).then(() => toast('بارگذاری شد'))),
      mk('JSON', 'دانلود JSON', () => { const { id, ...rest } = s; download(JSON.stringify(rest, null, 2), s.name + '.json', 'application/json'); }),
      mk('✕', 'حذف', async () => { if (confirm('حذف «' + s.name + '»؟')) { await dbDel(s.id); renderLib(); } })
    );
    list.append(li);
  }
}
$('libSave').addEventListener('click', async () => {
  try { await dbPut({ ...soundJson(region()), id: Date.now() }); await renderLib(); toast('در کتابخانه ذخیره شد'); }
  catch (err) { console.error(err); toast('ذخیره ممکن نشد'); }
});
$('libExport').addEventListener('click', async () => {
  const items = (await dbAll()) || [];
  if (!items.length) return toast('کتابخانه خالی است');
  const sounds = items.sort((a, b) => a.id - b.id).map(({ id, ...rest }) => rest);
  download(JSON.stringify({ format: 'sfx-studio-bank', version: 1, sounds }, null, 2), 'sfx_bank.json', 'application/json');
});
$('libImport').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try { await importJson(JSON.parse(await f.text())); } catch (err) { console.error(err); toast('فایل JSON معتبر نیست'); }
});

/* ---------------------------------------------------------------- UI wiring */
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tabBody').forEach(b => b.classList.toggle('active', b.id === 'tab-' + name));
  if (name === 'lib') renderLib();
}
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

const presetsEl = $('presets');
for (const name of Object.keys(PRESETS)) {
  const b = document.createElement('button');
  b.textContent = name;
  b.onclick = () => applyPreset(name);
  presetsEl.append(b);
}
const synthCtl = buildControls($('synthControls'), SYNTH_SCHEMA, () => synth, () => synthChanged());
const fxCtl = buildControls($('fxControls'), FX_SCHEMA, () => fx, () => {});

$('mutateBtn').onclick = mutate;
$('randomBtn').onclick = randomSynth;
$('synthReplace').onclick = () => synthPlace('replace');
$('synthInsert').onclick = () => synthPlace('insert');
$('synthMix').onclick = () => synthPlace('mix');
$('fxPreview').onclick = () => fxPreview().catch(err => { console.error(err); toast('خطا در پردازش افکت'); });
$('fxApply').onclick = () => fxApply().catch(err => { console.error(err); toast('خطا در پردازش افکت'); });
$('fxReset').onclick = () => {
  const d = fxDefaults();
  for (const k in d) Object.assign(fx[k], d[k]);
  syncControls(fxCtl);
};
$('undoBtn').onclick = undo;
$('redoBtn').onclick = redo;
$('playBtn').onclick = play;
$('stopBtn').onclick = stop;
$('zoomIn').onclick = () => zoom(0.5, hasSel() ? (sel.s + sel.e) / 2 : sel.s);
$('zoomOut').onclick = () => zoom(2, hasSel() ? (sel.s + sel.e) / 2 : sel.s);
$('zoomFit').onclick = () => { fitView(); draw(); };
$('newBtn').onclick = () => {
  const sec = parseFloat(prompt('طول صدای خالی (ثانیه):', '1'));
  if (!(sec > 0)) return;
  pushUndo(); recipe = null; sel = { s: 0, e: 0 };
  setDoc([new Float32Array(Math.round(sec * SR))], SR);
};
document.querySelectorAll('[data-op]').forEach(b => b.addEventListener('click', () => { lastAction = ''; OPS[b.dataset.op](); }));

document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if ((tag === 'INPUT' && !['range', 'checkbox'].includes(e.target.type)) || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  let handled = true;
  if (e.code === 'Space') playing ? stop() : play();
  else if (mod && k === 'z' && !e.shiftKey) undo();
  else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) redo();
  else if (mod && k === 'a') OPS.selectAll();
  else if (mod && k === 'c') OPS.copy();
  else if (mod && k === 'x') { lastAction = ''; OPS.cut(); }
  else if (mod && k === 'v') { lastAction = ''; OPS.paste(); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { lastAction = ''; OPS.delete(); }
  else if (e.key === 'Escape') { sel.e = sel.s; refresh(); }
  else handled = false;
  if (handled) e.preventDefault();
});

/* start with a generated pistol shot */
synth = { ...SYNTH_DEFAULT, ...PRESETS['کلت']() };
syncControls(synthCtl);
recipe = { ...synth };
setDoc([synthRender(synth)], SR);
