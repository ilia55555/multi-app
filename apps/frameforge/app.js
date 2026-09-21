const $ = selector => document.querySelector(selector);

const state = {
  frames: [],
  layers: [{ id: 'character', name: 'کاراکتر', type: 'character', visible: true, x: 480, y: 270, scale: 1, rotation: 0, opacity: 1 }],
  activeLayerId: 'character',
  currentFrame: 0,
  fps: 12,
  loop: true,
  playing: false,
  zoom: 1,
  animationTimer: null
};

const stage = $('#stage');
const context = stage.getContext('2d');
const frameInput = $('#frameInput');
const layerInput = $('#layerInput');
const frameGrid = $('#frameGrid');
const timelineTrack = $('#timelineTrack');
const layerList = $('#layerList');
const toast = $('#toast');

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function fa(value, digits = 0) {
  return Number(value).toLocaleString('fa-IR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function selectedFrames() {
  return state.frames.filter(frame => frame.selected);
}

async function addFrameFiles(files) {
  const images = [...files].filter(file => file.type.startsWith('image/'));
  if (!images.length) return showToast('فایل تصویری معتبری انتخاب نشده است.');
  const room = 36 - state.frames.length;
  if (room <= 0) return showToast('حداکثر ۳۶ فریم قابل افزودن است.');

  for (const file of images.slice(0, room)) {
    const src = await fileToDataUrl(file);
    const image = await loadImage(src);
    state.frames.push({ id: uid('frame'), name: file.name, src, image, selected: true });
  }
  state.currentFrame = Math.min(state.currentFrame, Math.max(0, selectedFrames().length - 1));
  renderAll();
  showToast(`${fa(Math.min(images.length, room))} تصویر به فریم‌ها اضافه شد.`);
  if (images.length > room) showToast('فقط ۳۶ فریم نخست نگه داشته شد.');
}

async function cutSelectedSheet() {
  const source = state.frames.find(frame => frame.id === state.sheetFrameId) || state.frames.at(-1);
  if (!source) return;
  const cols = Math.max(1, Math.min(6, Number($('#sheetCols').value) || 1));
  const rows = Math.max(1, Math.min(6, Number($('#sheetRows').value) || 1));
  const cells = cols * rows;
  const room = 36 - state.frames.length + 1;
  if (cells > room) return showToast(`برای این برش فقط ${fa(room)} جای خالی دارید.`);

  const width = Math.floor(source.image.naturalWidth / cols);
  const height = Math.floor(source.image.naturalHeight / rows);
  const pieces = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(source.image, col * width, row * height, width, height, 0, 0, width, height);
      const src = canvas.toDataURL('image/png');
      pieces.push({ id: uid('frame'), name: `${source.name} — ${row + 1}-${col + 1}`, src, image: await loadImage(src), selected: true });
    }
  }
  const index = state.frames.indexOf(source);
  state.frames.splice(index, 1, ...pieces);
  state.sheetFrameId = null;
  state.currentFrame = 0;
  renderAll();
  showToast(`تصویر به ${fa(cells)} فریم مساوی برش خورد.`);
}

function addLayer(file) {
  return fileToDataUrl(file).then(async src => {
    const image = await loadImage(src);
    const layer = { id: uid('layer'), name: file.name.replace(/\.[^.]+$/, ''), type: 'image', src, image, visible: true, x: 480, y: 270, scale: 1, rotation: 0, opacity: 1 };
    state.layers.unshift(layer);
    state.activeLayerId = layer.id;
    renderAll();
    showToast('لایه جدید به صحنه اضافه شد.');
  });
}

function renderFrames() {
  frameGrid.replaceChildren();
  state.frames.forEach((frame, index) => {
    const item = document.createElement('div');
    item.className = `frame-card${frame.selected ? ' selected' : ''}`;
    item.draggable = true;
    item.innerHTML = `<img src="${frame.src}" alt="فریم ${index + 1}"><span class="check">✓</span><b>${fa(index + 1)}</b><button type="button" aria-label="حذف فریم">×</button>`;
    item.addEventListener('click', event => {
      if (event.target.tagName === 'BUTTON') return;
      frame.selected = !frame.selected;
      state.sheetFrameId = frame.id;
      state.currentFrame = Math.min(state.currentFrame, Math.max(0, selectedFrames().length - 1));
      renderAll();
    });
    item.querySelector('button').addEventListener('click', () => {
      state.frames.splice(index, 1);
      state.currentFrame = 0;
      renderAll();
    });
    item.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', frame.id));
    item.addEventListener('dragover', event => event.preventDefault());
    item.addEventListener('drop', event => {
      event.preventDefault();
      const from = state.frames.findIndex(entry => entry.id === event.dataTransfer.getData('text/plain'));
      if (from < 0 || from === index) return;
      const [moved] = state.frames.splice(from, 1);
      state.frames.splice(index, 0, moved);
      renderAll();
    });
    frameGrid.append(item);
  });
  $('#emptyFrames').hidden = state.frames.length > 0;
  $('#frameCount').textContent = `${fa(state.frames.length)} / ۳۶`;
  $('#cutSheet').disabled = state.frames.length === 0;
  $('#canvasWrap').classList.toggle('has-content', state.frames.length > 0 || state.layers.some(layer => layer.type === 'image'));
}

function renderTimeline() {
  timelineTrack.replaceChildren();
  const frames = selectedFrames();
  if (!frames.length) {
    timelineTrack.innerHTML = '<div class="timeline-empty">فریم‌های انتخاب‌شده در اینجا و به ترتیب پخش می‌شوند</div>';
  } else {
    frames.forEach((frame, index) => {
      const item = document.createElement('div');
      item.className = `timeline-frame${index === state.currentFrame ? ' active' : ''}`;
      item.innerHTML = `<img src="${frame.src}" alt=""><b>${fa(index + 1)}</b>`;
      item.addEventListener('click', () => { state.currentFrame = index; renderAll(); });
      timelineTrack.append(item);
    });
  }
  const duration = frames.length / state.fps;
  $('#summaryFrames').textContent = fa(frames.length);
  $('#summaryDuration').textContent = `${fa(duration, 2)} ثانیه`;
  $('#currentTime').textContent = timecode(frames.length ? state.currentFrame / state.fps : 0);
  $('#totalTime').textContent = timecode(duration);
}

function timecode(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${fa(minutes).padStart(2, '۰')}:${fa(rest, 2).padStart(5, '۰')}`;
}

function renderLayers() {
  layerList.replaceChildren();
  state.layers.forEach((layer, index) => {
    const item = document.createElement('div');
    item.className = `layer-item${layer.id === state.activeLayerId ? ' active' : ''}`;
    const thumb = layer.type === 'character' ? '<span>◇</span>' : `<img src="${layer.src}" alt="">`;
    item.innerHTML = `<div class="layer-thumb">${thumb}</div><div class="layer-info"><b>${layer.name}</b><small>${layer.type === 'character' ? 'همه فریم‌ها' : 'تصویر ثابت'}</small></div><button class="visibility" title="نمایش/مخفی">${layer.visible ? '◉' : '○'}</button>${layer.type === 'character' ? '' : '<button class="delete-layer" title="حذف">×</button>'}`;
    item.addEventListener('click', event => { if (!event.target.closest('button')) { state.activeLayerId = layer.id; renderAll(); } });
    item.querySelector('.visibility').addEventListener('click', () => { layer.visible = !layer.visible; renderAll(); });
    item.querySelector('.delete-layer')?.addEventListener('click', () => { state.layers.splice(index, 1); state.activeLayerId = 'character'; renderAll(); });
    layerList.append(item);
  });
  syncProperties();
}

function activeLayer() {
  return state.layers.find(layer => layer.id === state.activeLayerId) || state.layers.find(layer => layer.type === 'character');
}

function syncProperties() {
  const layer = activeLayer();
  $('#activeLayerName').textContent = layer.name;
  $('#posX').value = Math.round(layer.x);
  $('#posY').value = Math.round(layer.y);
  $('#scale').value = Math.round(layer.scale * 100);
  $('#rotation').value = Math.round(layer.rotation);
  $('#opacity').value = Math.round(layer.opacity * 100);
  $('#opacityValue').textContent = `${fa(layer.opacity * 100)}٪`;
}

function drawImageLayer(layer, image) {
  if (!image || !layer.visible) return;
  const fit = Math.min(stage.width / image.naturalWidth, stage.height / image.naturalHeight);
  const width = image.naturalWidth * fit * layer.scale;
  const height = image.naturalHeight * fit * layer.scale;
  context.save();
  context.globalAlpha = layer.opacity;
  context.translate(layer.x, layer.y);
  context.rotate(layer.rotation * Math.PI / 180);
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();
}

function drawStage() {
  context.clearRect(0, 0, stage.width, stage.height);
  context.fillStyle = '#101816';
  context.fillRect(0, 0, stage.width, stage.height);
  const frames = selectedFrames();
  [...state.layers].reverse().forEach(layer => {
    const image = layer.type === 'character' ? frames[state.currentFrame]?.image : layer.image;
    drawImageLayer(layer, image);
  });
  stage.style.transform = `scale(${state.zoom})`;
  $('#zoomLabel').textContent = `${fa(state.zoom * 100)}٪`;
}

function renderAll() {
  renderFrames();
  renderTimeline();
  renderLayers();
  drawStage();
}

function stopPlayback() {
  state.playing = false;
  clearInterval(state.animationTimer);
  state.animationTimer = null;
  $('#playPause span').textContent = '▶';
}

function togglePlayback() {
  const frames = selectedFrames();
  if (!frames.length) return showToast('ابتدا دست‌کم یک فریم را انتخاب کنید.');
  if (state.playing) return stopPlayback();
  state.playing = true;
  $('#playPause span').textContent = 'Ⅱ';
  state.animationTimer = setInterval(() => {
    if (state.currentFrame >= frames.length - 1) {
      if (!state.loop) return stopPlayback();
      state.currentFrame = 0;
    } else state.currentFrame += 1;
    renderTimeline();
    drawStage();
  }, 1000 / state.fps);
}

function changeFrame(delta) {
  const count = selectedFrames().length;
  if (!count) return;
  stopPlayback();
  state.currentFrame = (state.currentFrame + delta + count) % count;
  renderAll();
}

function exportProject() {
  const frames = selectedFrames();
  const data = {
    application: 'FrameFlow', version: 1, exportedAt: new Date().toISOString(),
    canvas: { width: stage.width, height: stage.height },
    playback: { fps: state.fps, loop: state.loop, selectedFrameCount: frames.length, durationSeconds: Number((frames.length / state.fps).toFixed(3)) },
    frames: state.frames.map((frame, index) => ({ order: index + 1, name: frame.name, selected: frame.selected })),
    layers: state.layers.map((layer, index) => ({ order: index + 1, name: layer.name, type: layer.type, visible: layer.visible, transform: { x: layer.x, y: layer.y, scale: layer.scale, rotation: layer.rotation, opacity: layer.opacity } }))
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'frameflow-project.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('اطلاعات پروژه با فرمت JSON ذخیره شد.');
}

frameInput.addEventListener('change', event => { addFrameFiles(event.target.files); event.target.value = ''; });
layerInput.addEventListener('change', event => { if (event.target.files[0]) addLayer(event.target.files[0]); event.target.value = ''; });
$('#addLayer').addEventListener('click', () => layerInput.click());
$('#cutSheet').addEventListener('click', cutSelectedSheet);
$('#selectAll').addEventListener('click', () => { const allSelected = state.frames.every(frame => frame.selected); state.frames.forEach(frame => { frame.selected = !allSelected; }); state.currentFrame = 0; renderAll(); });
$('#playPause').addEventListener('click', togglePlayback);
$('#prevFrame').addEventListener('click', () => changeFrame(-1));
$('#nextFrame').addEventListener('click', () => changeFrame(1));
$('#exportJson').addEventListener('click', exportProject);
$('#loop').addEventListener('change', event => { state.loop = event.target.checked; });
$('#fps').addEventListener('input', event => { state.fps = Number(event.target.value); $('#fpsValue').textContent = fa(state.fps); if (state.playing) { stopPlayback(); togglePlayback(); } renderTimeline(); });
$('#zoomIn').addEventListener('click', () => { state.zoom = Math.min(1.5, state.zoom + .1); drawStage(); });
$('#zoomOut').addEventListener('click', () => { state.zoom = Math.max(.4, state.zoom - .1); drawStage(); });
$('#fitStage').addEventListener('click', () => { state.zoom = 1; drawStage(); });
$('#newProject').addEventListener('click', () => {
  if (state.frames.length && !confirm('همه فریم‌ها و لایه‌های پروژه پاک شوند؟')) return;
  stopPlayback();
  state.frames = [];
  state.layers = [{ id: 'character', name: 'کاراکتر', type: 'character', visible: true, x: 480, y: 270, scale: 1, rotation: 0, opacity: 1 }];
  state.activeLayerId = 'character'; state.currentFrame = 0; renderAll();
});

['posX', 'posY', 'scale', 'rotation', 'opacity'].forEach(id => {
  $(`#${id}`).addEventListener('input', event => {
    const layer = activeLayer();
    const value = Number(event.target.value);
    if (id === 'posX') layer.x = value;
    if (id === 'posY') layer.y = value;
    if (id === 'scale') layer.scale = value / 100;
    if (id === 'rotation') layer.rotation = value;
    if (id === 'opacity') { layer.opacity = value / 100; $('#opacityValue').textContent = `${fa(value)}٪`; }
    drawStage();
  });
});

$('#resetTransform').addEventListener('click', () => {
  Object.assign(activeLayer(), { x: 480, y: 270, scale: 1, rotation: 0, opacity: 1 });
  syncProperties(); drawStage();
});

['dragenter', 'dragover'].forEach(type => $('#dropzone').addEventListener(type, event => { event.preventDefault(); $('#dropzone').classList.add('dragging'); }));
['dragleave', 'drop'].forEach(type => $('#dropzone').addEventListener(type, event => { event.preventDefault(); $('#dropzone').classList.remove('dragging'); }));
$('#dropzone').addEventListener('drop', event => addFrameFiles(event.dataTransfer.files));

window.addEventListener('keydown', event => {
  if (event.code === 'Space' && !event.target.matches('input')) { event.preventDefault(); togglePlayback(); }
  if (event.key === 'ArrowLeft') changeFrame(-1);
  if (event.key === 'ArrowRight') changeFrame(1);
});

renderAll();
