(() => {
  'use strict';

  const GITHUB_API_BASE = 'https://api.github.com';

  const DEFAULT_FILES = [
    {
      name: 'index.html',
      type: 'html',
      content: `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>پروژه‌ی من</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="card">
    <p class="tag">LIVE PREVIEW</p>
    <h1>سلام، توسعه‌دهنده!</h1>
    <p>کد را در پایین صفحه تغییر بده تا این بخش همان لحظه به‌روزرسانی شود.</p>
    <button id="helloBtn">کلیک کن</button>
  </main>
  <script src="app.js"><\/script>
</body>
</html>`
    },
    {
      name: 'styles.css',
      type: 'css',
      content: `:root {
  font-family: system-ui, sans-serif;
  color: #10213d;
}

body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #eff5ff, #e3fcf6);
}

.card {
  width: min(520px, calc(100% - 40px));
  padding: 38px;
  border-radius: 24px;
  background: rgba(255, 255, 255, .86);
  box-shadow: 0 24px 60px rgba(33, 80, 130, .16);
}

.tag {
  color: #306fe8;
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .12em;
}

h1 { margin: 8px 0 12px; }
p { line-height: 1.9; }

button {
  margin-top: 12px;
  border: 0;
  border-radius: 10px;
  padding: 11px 18px;
  color: white;
  background: #306fe8;
  font: inherit;
  cursor: pointer;
}`
    },
    {
      name: 'app.js',
      type: 'js',
      content: `document.querySelector('#helloBtn').addEventListener('click', () => {
  alert('کد جاوااسکریپت هم زنده اجرا می‌شود!');
});`
    }
  ];

  const elements = {
    studioShell: document.querySelector('.studio-shell'),
    layoutStage: document.querySelector('#layoutStage'),
    layoutScrollArea: document.querySelector('#layoutScrollArea'),
    layoutEditorBtn: document.querySelector('#layoutEditorBtn'),
    layoutDialog: document.querySelector('#layoutDialog'),
    layoutList: document.querySelector('#layoutList'),
    layoutTemplateGrid: document.querySelector('#layoutTemplateGrid'),
    layoutPanelPalette: document.querySelector('#layoutPanelPalette'),
    layoutBoard: document.querySelector('#layoutBoard'),
    layoutResetBtn: document.querySelector('#layoutResetBtn'),
    layoutCloseBtn: document.querySelector('#layoutCloseBtn'),
    layoutHorizontalScrollToggle: document.querySelector('#layoutHorizontalScrollToggle'),
    input: document.querySelector('#projectFiles'),
    folderInput: document.querySelector('#projectFolder'),
    uploadMenuBtn: document.querySelector('#uploadMenuBtn'),
    uploadMenu: document.querySelector('#uploadMenu'),
    previewFrame: document.querySelector('#previewFrame'),
    previewSection: document.querySelector('.preview-section'),
    previewDot: document.querySelector('#previewDot'),
    previewStatus: document.querySelector('#previewStatus'),
    errorPanel: document.querySelector('#errorPanel'),
    consolePanel: document.querySelector('#consolePanel'),
    consoleOutput: document.querySelector('#consoleOutput'),
    clearConsoleBtn: document.querySelector('#clearConsoleBtn'),
    deviceButtons: [...document.querySelectorAll('.device-btn')],
    openPreviewBtn: document.querySelector('#openPreviewBtn'),
    fileList: document.querySelector('#fileList'),
    fileCount: document.querySelector('#fileCount'),
    editorTabs: document.querySelector('#editorTabs'),
    codeEditor: document.querySelector('#codeEditor'),
    codeHighlight: document.querySelector('#codeHighlight'),
    lineNumbers: document.querySelector('#lineNumbers'),
    lineMarkers: document.querySelector('#lineMarkers'),
    editorPanel: document.querySelector('#editorPanel'),
    workspace: document.querySelector('#workspace'),
    developerSection: document.querySelector('#developerSection'),
    previewResizer: document.querySelector('#previewResizer'),
    sidebarResizer: document.querySelector('#sidebarResizer'),
    inspectToggleBtn: document.querySelector('#inspectToggleBtn'),
    sampleElementBtn: document.querySelector('#sampleElementBtn'),
    sampleElementDialog: document.querySelector('#sampleElementDialog'),
    autoPreviewToggle: document.querySelector('#autoPreviewToggle'),
    applyPreviewBtn: document.querySelector('#applyPreviewBtn'),
    debugBtn: document.querySelector('#debugBtn'),
    editorFullscreenBtn: document.querySelector('#editorFullscreenBtn'),
    addFileBtn: document.querySelector('#addFileBtn'),
    createMenu: document.querySelector('#createMenu'),
    fileSidebar: document.querySelector('.file-sidebar'),
    fileSelectionModeBtn: document.querySelector('#fileSelectionModeBtn'),
    selectionToolbar: document.querySelector('#selectionToolbar'),
    selectedCount: document.querySelector('#selectedCount'),
    moveDestinationSelect: document.querySelector('#moveDestinationSelect'),
    moveSelectedBtn: document.querySelector('#moveSelectedBtn'),
    clearSelectionBtn: document.querySelector('#clearSelectionBtn'),
    inspectorBar: document.querySelector('#inspectorBar'),
    selectedElementLabel: document.querySelector('#selectedElementLabel'),
    relatedSources: document.querySelector('#relatedSources'),
    extractSelectionBtn: document.querySelector('#extractSelectionBtn'),
    activeFileLabel: document.querySelector('#activeFileLabel'),
    lineInfo: document.querySelector('#lineInfo'),
    fileDialog: document.querySelector('#fileDialog'),
    fileForm: document.querySelector('#fileForm'),
    fileDialogTitle: document.querySelector('#fileDialogTitle'),
    fileDialogText: document.querySelector('#fileDialogText'),
    fileTypeField: document.querySelector('#fileTypeField'),
    fileTypeSelect: document.querySelector('#fileTypeSelect'),
    fileNameFieldLabel: document.querySelector('#fileNameFieldLabel'),
    fileNameInput: document.querySelector('#fileNameInput'),
    fileDialogStatus: document.querySelector('#fileDialogStatus'),
    fileDialogSubmitBtn: document.querySelector('#fileDialogSubmitBtn'),
    fileDialogCancelBtn: document.querySelector('#fileDialogCancelBtn'),
    extractDialog: document.querySelector('#extractDialog'),
    extractForm: document.querySelector('#extractForm'),
    extractTypeSelect: document.querySelector('#extractTypeSelect'),
    extractFileNameInput: document.querySelector('#extractFileNameInput'),
    extractDialogStatus: document.querySelector('#extractDialogStatus'),
    extractDialogCancelBtn: document.querySelector('#extractDialogCancelBtn'),
    downloadProjectBtn: document.querySelector('#downloadProjectBtn'),
    githubPanelOpenBtn: document.querySelector('#githubPanelOpenBtn'),
    githubPanelDialog: document.querySelector('#githubPanelDialog'),
    githubPanelRepository: document.querySelector('#githubPanelRepository'),
    githubPanelRef: document.querySelector('#githubPanelRef'),
    githubPanelToken: document.querySelector('#githubPanelToken'),
    githubPanelSaveBtn: document.querySelector('#githubPanelSaveBtn'),
    githubPanelCloseBtn: document.querySelector('#githubPanelCloseBtn'),
    githubPanelStatus: document.querySelector('#githubPanelStatus'),
    githubImportBtn: document.querySelector('#githubImportBtn'),
    githubImportDialog: document.querySelector('#githubImportDialog'),
    githubImportForm: document.querySelector('#githubImportForm'),
    githubImportRepository: document.querySelector('#githubImportRepository'),
    githubImportRef: document.querySelector('#githubImportRef'),
    githubImportToken: document.querySelector('#githubImportToken'),
    githubImportStatus: document.querySelector('#githubImportStatus'),
    githubImportSubmitBtn: document.querySelector('#githubImportSubmitBtn'),
    githubImportCancelBtn: document.querySelector('#githubImportCancelBtn'),
    githubConnectBtn: document.querySelector('#githubConnectBtn'),
    githubDialog: document.querySelector('#githubDialog'),
    githubForm: document.querySelector('#githubForm'),
    githubToken: document.querySelector('#githubToken'),
    githubRepository: document.querySelector('#githubRepository'),
    githubBaseBranch: document.querySelector('#githubBaseBranch'),
    githubHeadBranch: document.querySelector('#githubHeadBranch'),
    githubCommitMessage: document.querySelector('#githubCommitMessage'),
    githubPrTitle: document.querySelector('#githubPrTitle'),
    githubPrBody: document.querySelector('#githubPrBody'),
    githubDraft: document.querySelector('#githubDraft'),
    githubStatus: document.querySelector('#githubStatus'),
    githubPrLink: document.querySelector('#githubPrLink'),
    githubSubmitBtn: document.querySelector('#githubSubmitBtn'),
    githubVerifyBtn: document.querySelector('#githubVerifyBtn'),
    githubCancelBtn: document.querySelector('#githubCancelBtn'),
    globalTooltip: document.querySelector('#globalTooltip'),
    toast: document.querySelector('#toast'),
    replaceDialog: document.querySelector('#replaceProjectDialog'),
    replaceProjectText: document.querySelector('#replaceProjectText'),
    replaceCancelBtn: document.querySelector('#replaceCancelBtn'),
    replaceWithoutDownloadBtn: document.querySelector('#replaceWithoutDownloadBtn'),
    downloadAndReplaceBtn: document.querySelector('#downloadAndReplaceBtn'),
    dragDropShield: document.querySelector('#dragDropShield')
  };

  let files = [];
  let activeFileName = '';
  let projectName = 'پروژه-نمونه';
  let projectHasBeenOpened = false;
  let projectHasEdits = false;
  let updateTimer = null;
  let toastTimer = null;
  let currentPreviewUrl = null;
  let replacementResolver = null;
  let dragLeaveTimer = null;
  let dragDropDepth = 0;
  let isReadingDroppedProject = false;
  let activeTooltipTarget = null;
  let isGitHubSyncing = false;
  let isGitHubImporting = false;
  let autoPreview = true;
  let inspectMode = false;
  let selectedPreviewElement = null;
  let selectedSourceLocation = null;
  let relatedSourceLocations = new Map();
  let relatedSourceMatches = new Map();
  let fileSelectionMode = false;
  let layoutOrder = ['preview', 'files', 'editor', 'console'];
  let layoutConfig = {
    template: 'big-top',
    slots: { large: 'preview', smallA: 'files', smallB: 'editor', smallC: 'console' },
    horizontalScroll: false
  };
  let consoleEntries = [];
  let selectedLayoutPanel = '';
  let draggedLayoutPanel = '';
  let activeFileDialogMode = 'add';
  let activeFileDialogSourceName = '';
  // File Explorer state: explicit folders, selected files, expanded folders and only opened editor tabs.
  let explicitFolders = new Set();
  let openFileNames = new Set();
  let selectedFileNames = new Set();
  let collapsedFolders = new Set();
  const diagnostics = new Map();
  const breakpoints = new Map();
  // توکن GitHub فقط در حافظه‌ی همین تب می‌ماند و هرگز وارد فایل پروژه یا ZIP نمی‌شود.
  const githubSession = {
    token: '',
    repository: '',
    owner: '',
    repo: '',
    defaultBranch: ''
  };
  // حافظه‌ی ذخیره‌سازی پروژه در پیش‌نمایش ایزوله نگه داشته می‌شود.
  // پروژه‌هایی که localStorage دارند، بدون دسترسی به صفحه‌ی اصلی اجرا می‌شوند.
  let previewStorage = Object.create(null);

  const TEXT_EXTENSIONS = new Set([
    'html', 'htm', 'css', 'js', 'mjs', 'cjs', 'json', 'webmanifest',
    'txt', 'md', 'xml', 'svg', 'java', 'kt', 'kts', 'gradle', 'properties',
    'yml', 'yaml', 'toml', 'ini', 'conf', 'gitignore', 'csv'
  ]);
  const FONT_EXTENSIONS = new Set(['ttf', 'otf', 'woff', 'woff2', 'eot']);
  const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'bmp']);
  const EXTRA_TEXT_FILE_NAMES = new Set([
    '.gitignore', '.gitattributes', '.editorconfig', '.npmrc', '.prettierrc',
    'license', 'copying', 'makefile', 'dockerfile', 'procfile'
  ]);
  const EXTRA_TEXT_EXTENSIONS = new Set([
    'ts', 'tsx', 'jsx', 'vue', 'svelte', 'scss', 'sass', 'less', 'sh', 'bash',
    'zsh', 'bat', 'cmd', 'ps1', 'py', 'php', 'rb', 'go', 'rs', 'c', 'h', 'cpp',
    'hpp', 'cs', 'swift', 'dart', 'sql', 'lock', 'map', 'log'
  ]);

  const getExtension = (name) => {
    const leaf = String(name || '').replace(/\\/g, '/').split('/').pop() || '';
    const dotIndex = leaf.lastIndexOf('.');
    return dotIndex > -1 ? leaf.slice(dotIndex + 1).toLowerCase() : '';
  };

  const getType = (name) => {
    const extension = getExtension(name);
    const leaf = String(name || '').replace(/\\/g, '/').split('/').pop().toLowerCase();
    if (extension === 'html' || extension === 'htm') return 'html';
    if (extension === 'css') return 'css';
    if (['js', 'mjs', 'cjs'].includes(extension)) return 'js';
    if (FONT_EXTENSIONS.has(extension)) return 'font';
    if (IMAGE_EXTENSIONS.has(extension) || extension === 'svg') return 'image';
    return TEXT_EXTENSIONS.has(extension) || EXTRA_TEXT_EXTENSIONS.has(extension) || EXTRA_TEXT_FILE_NAMES.has(leaf)
      ? 'text'
      : 'asset';
  };

  const isEditableType = (type) => ['html', 'css', 'js', 'text'].includes(type);

  const getMimeType = (name, fallback = '') => {
    const extension = getExtension(name);
    const map = {
      html: 'text/html;charset=utf-8', htm: 'text/html;charset=utf-8', css: 'text/css;charset=utf-8',
      js: 'text/javascript;charset=utf-8', mjs: 'text/javascript;charset=utf-8', cjs: 'text/javascript;charset=utf-8',
      json: 'application/json;charset=utf-8', webmanifest: 'application/manifest+json;charset=utf-8',
      txt: 'text/plain;charset=utf-8', md: 'text/markdown;charset=utf-8', xml: 'application/xml;charset=utf-8',
      svg: 'image/svg+xml;charset=utf-8', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', ico: 'image/x-icon', bmp: 'image/bmp',
      ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2', eot: 'application/vnd.ms-fontobject',
      mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4', webm: 'video/webm', pdf: 'application/pdf'
    };
    const leaf = String(name || '').replace(/\\/g, '/').split('/').pop().toLowerCase();
    if (TEXT_EXTENSIONS.has(extension) || EXTRA_TEXT_EXTENSIONS.has(extension) || EXTRA_TEXT_FILE_NAMES.has(leaf)) {
      return fallback || 'text/plain;charset=utf-8';
    }
    return map[extension] || fallback || 'application/octet-stream';
  };

  const bytesToBase64 = (bytes) => {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  };

  const base64ToBytes = (value) => {
    const normalized = String(value || '').replace(/\s/g, '');
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  };

  const decodeUtf8 = (bytes) => new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '');

  const getFileBytes = (file) => {
    if (file?.bytes instanceof Uint8Array) return file.bytes;
    return new TextEncoder().encode(String(file?.content ?? ''));
  };

  const getFileDataUrl = (file) => {
    if (!file) return '';
    if (file.dataUrl) return file.dataUrl;
    const mime = file.mime || getMimeType(file.name);
    return `data:${mime};base64,${bytesToBase64(getFileBytes(file))}`;
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const safeScript = (source) => String(source)
    // در iframe ایزوله، localStorage واقعی به خاطر origin ناشناس در دسترس نیست.
    // این ارجاع‌ها به storage مجازیِ پروژه تبدیل می‌شوند.
    .replace(/\b(?:window|globalThis|self)\s*\.\s*localStorage\b/g, 'window.__liveWebStorage')
    .replace(/(^|[^\w$.])localStorage\b/g, '$1window.__liveWebStorage')
    // reload در srcdoc به file:// والد برمی‌گردد و Chrome آن را ناامن می‌داند.
    // این فراخوانی به یک رفرش امن همان پیش‌نمایش تبدیل می‌شود.
    .replace(/\b(?:window\s*\.\s*)?location\s*\.\s*reload\s*\(\s*\)/g, 'window.__liveWebStudioReload()')
    .replace(/<\/script/gi, '<\\/script');

  const toSafeScriptJson = (value) => JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  const normalizePath = (value) => {
    try {
      return decodeURIComponent(String(value || ''))
        .replace(/^[./]+/, '')
        .split('?')[0]
        .split('#')[0]
        .toLowerCase();
    } catch {
      return String(value || '').replace(/^[./]+/, '').split('?')[0].split('#')[0].toLowerCase();
    }
  };

  const cleanRelativePath = (value) => String(value || '')
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .join('/');

  const showToast = (message) => {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    toastTimer = window.setTimeout(() => elements.toast.classList.remove('show'), 2400);
  };

  const positionGlobalTooltip = () => {
    if (!elements.globalTooltip || !activeTooltipTarget || elements.globalTooltip.hidden) return;
    const targetRect = activeTooltipTarget.getBoundingClientRect();
    const tooltipRect = elements.globalTooltip.getBoundingClientRect();
    const gap = 10;
    const margin = 8;
    const topSpace = targetRect.top;
    const bottomSpace = window.innerHeight - targetRect.bottom;
    const placeAbove = topSpace >= tooltipRect.height + gap || topSpace > bottomSpace;
    const unclampedLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    const left = Math.min(
      Math.max(margin, unclampedLeft),
      Math.max(margin, window.innerWidth - tooltipRect.width - margin)
    );
    const top = placeAbove
      ? Math.max(margin, targetRect.top - tooltipRect.height - gap)
      : Math.min(window.innerHeight - tooltipRect.height - margin, targetRect.bottom + gap);
    elements.globalTooltip.style.left = `${left}px`;
    elements.globalTooltip.style.top = `${top}px`;
    elements.globalTooltip.dataset.placement = placeAbove ? 'top' : 'bottom';
  };

  const showGlobalTooltip = (target) => {
    if (!elements.globalTooltip || !target) return;
    const message = target.dataset.tooltip || target.getAttribute('aria-label') || target.title || '';
    if (!message) return;
    activeTooltipTarget = target;
    elements.globalTooltip.textContent = message;
    elements.globalTooltip.hidden = false;
    elements.globalTooltip.classList.add('is-visible');
    window.requestAnimationFrame(positionGlobalTooltip);
  };

  const hideGlobalTooltip = (target = activeTooltipTarget) => {
    if (!elements.globalTooltip || (target && activeTooltipTarget && target !== activeTooltipTarget)) return;
    activeTooltipTarget = null;
    elements.globalTooltip.classList.remove('is-visible');
    elements.globalTooltip.hidden = true;
  };

  const setStatus = (message, hasError = false) => {
    elements.previewStatus.textContent = message;
    elements.previewDot.classList.toggle('is-error', hasError);
  };

  const getActiveFile = () => files.find((file) => file.name === activeFileName) || null;

  const getHtmlFile = (sourceFiles = files) => {
    const indexFile = sourceFiles.find((file) => /(^|\/)index\.html?$/i.test(file.name));
    return indexFile || sourceFiles.find((file) => file.type === 'html') || null;
  };

  const inferProjectName = (sourceFiles) => {
    const names = sourceFiles.map((file) => cleanRelativePath(file.name)).filter(Boolean);
    const rootedNames = names.filter((name) => name.includes('/'));
    const roots = [...new Set(rootedNames.map((name) => name.split('/')[0]))];
    if (roots.length === 1 && roots[0]) return roots[0];

    const htmlTitle = sourceFiles
      .find((file) => file.type === 'html')?.content
      ?.match(/<title[^>]*>\s*([^<]+?)\s*<\/title>/i)?.[1]
      ?.trim();
    return htmlTitle || 'web-project';
  };

  const safeArchiveName = (name) => String(name || 'web-project')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80) || 'web-project';

  const parentFolderOf = (path) => {
    const normalized = cleanRelativePath(path);
    const position = normalized.lastIndexOf('/');
    return position >= 0 ? normalized.slice(0, position) : '';
  };

  const addFolderAndParents = (folderPath) => {
    const folder = cleanRelativePath(String(folderPath || '').replace(/\/+$/, ''));
    if (!folder) return;
    const segments = folder.split('/');
    for (let index = 1; index <= segments.length; index += 1) {
      explicitFolders.add(segments.slice(0, index).join('/'));
    }
  };

  const deriveFoldersFromFiles = () => {
    files.forEach((file) => addFolderAndParents(parentFolderOf(file.name)));
  };

  const getAllFolders = () => [...explicitFolders]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'en'));

  const LAYOUT_PANELS = Object.freeze({
    preview: { label: 'نمایشگر زنده', detail: 'Preview و خروجی پروژه', icon: '▣' },
    files: { label: 'فایل‌های پروژه', detail: 'File Explorer و پوشه‌ها', icon: '▤' },
    editor: { label: 'ویرایشگر کد', detail: 'تب‌ها، کد و دیباگ', icon: '</>' },
    console: { label: 'کنسول', detail: 'لاگ‌ها و خطاهای Preview', icon: 'CON' }
  });

  const SNAP_LAYOUT_TEMPLATES = Object.freeze({
    'big-top': {
      label: 'باکس بزرگ بالا',
      detail: 'یک پنل عریض بالا و سه پنل پایین',
      visual: 'top'
    },
    'big-bottom': {
      label: 'باکس بزرگ پایین',
      detail: 'سه پنل بالا و یک پنل عریض پایین',
      visual: 'bottom'
    },
    'big-left': {
      label: 'باکس بزرگ سمت چپ',
      detail: 'یک پنل بلند چپ و سه پنل راست',
      visual: 'left'
    },
    'big-right': {
      label: 'باکس بزرگ سمت راست',
      detail: 'سه پنل چپ و یک پنل بلند راست',
      visual: 'right'
    },
    'columns': {
      label: 'چهار ستون',
      detail: 'چهار پنل کنار هم',
      visual: 'columns'
    },
    'rows': {
      label: 'چهار ردیف',
      detail: 'چهار پنل روی هم',
      visual: 'rows'
    }
  });

  const SNAP_SLOTS = Object.freeze(['large', 'smallA', 'smallB', 'smallC']);

  const normalizeLayoutConfig = (config) => {
    const validTemplates = Object.keys(SNAP_LAYOUT_TEMPLATES);
    const base = config && typeof config === 'object' ? config : {};
    const template = validTemplates.includes(base.template) ? base.template : 'big-top';
    const providedSlots = base.slots && typeof base.slots === 'object' ? base.slots : {};
    const panelIds = Object.keys(LAYOUT_PANELS);
    const slots = {
      large: panelIds.includes(providedSlots.large) ? providedSlots.large : 'preview',
      smallA: panelIds.includes(providedSlots.smallA) ? providedSlots.smallA : 'files',
      smallB: panelIds.includes(providedSlots.smallB) ? providedSlots.smallB : 'editor',
      smallC: panelIds.includes(providedSlots.smallC) ? providedSlots.smallC : 'console'
    };
    const used = new Set();
    SNAP_SLOTS.forEach((slot) => {
      if (used.has(slots[slot])) {
        slots[slot] = panelIds.find((panel) => !used.has(panel)) || slots[slot];
      }
      used.add(slots[slot]);
    });
    panelIds.forEach((panel) => {
      if (used.has(panel)) return;
      const replaceSlot = SNAP_SLOTS.find((slot) => slots[slot] === panel) || 'smallC';
      slots[replaceSlot] = panel;
      used.add(panel);
    });
    return { template, slots, horizontalScroll: Boolean(base.horizontalScroll) };
  };

  const persistLayoutConfig = () => {
    try {
      window.localStorage.setItem('live-web-studio-snap-layout', JSON.stringify(layoutConfig));
    } catch (_) {
      // اجرای فایل با file:// یا مرورگرهای محدود نباید باعث خرابی برنامه شود.
    }
  };

  const restoreLayoutConfig = () => {
    try {
      const saved = window.localStorage.getItem('live-web-studio-snap-layout');
      if (saved) layoutConfig = normalizeLayoutConfig(JSON.parse(saved));
    } catch (_) {
      layoutConfig = normalizeLayoutConfig(layoutConfig);
    }
  };

  const getSlotForPanel = (panelId) => SNAP_SLOTS.find((slot) => layoutConfig.slots[slot] === panelId) || 'smallC';

  const clearSnapTrackSizes = () => {
    const stage = elements.layoutStage;
    if (!stage) return;
    [
      '--snap-col-a', '--snap-col-b', '--snap-col-c', '--snap-col-d',
      '--snap-row-a', '--snap-row-b', '--snap-row-c', '--snap-row-d',
      '--snap-stage-width'
    ].forEach((property) => stage.style.removeProperty(property));
  };

  const getGridTrackTotal = (axis = 'column') => {
    const stage = elements.layoutStage;
    if (!stage) return 0;
    const computed = window.getComputedStyle(stage);
    const trackValue = axis === 'row' ? computed.gridTemplateRows : computed.gridTemplateColumns;
    const trackSizes = (trackValue.match(/-?\d+(?:\.\d+)?px/g) || [])
      .map((value) => Number.parseFloat(value))
      .filter(Number.isFinite);
    const gap = Number.parseFloat(axis === 'row' ? computed.rowGap : computed.columnGap) || 0;
    return trackSizes.reduce((total, size) => total + size, 0) + Math.max(0, trackSizes.length - 1) * gap;
  };

  const syncHorizontalScrollState = () => {
    const stage = elements.layoutStage;
    const scrollArea = elements.layoutScrollArea;
    if (!stage || !scrollArea) return;
    const enabled = Boolean(layoutConfig.horizontalScroll);
    scrollArea.classList.toggle('is-horizontal-scroll-enabled', enabled);
    if (elements.layoutHorizontalScrollToggle) {
      elements.layoutHorizontalScrollToggle.checked = enabled;
    }
    if (!enabled) {
      stage.style.removeProperty('--snap-stage-width');
      return;
    }
    window.requestAnimationFrame(() => {
      const availableWidth = Math.max(0, scrollArea.clientWidth);
      const trackWidth = getGridTrackTotal('column');
      const requiredWidth = Math.ceil(Math.max(availableWidth, trackWidth, stage.scrollWidth || 0));
      const currentWidth = Number.parseFloat(stage.style.getPropertyValue('--snap-stage-width')) || 0;
      if (Math.abs(currentWidth - requiredWidth) >= 1) {
        stage.style.setProperty('--snap-stage-width', `${requiredWidth}px`);
      }
    });
  };

  const applyLayoutOrder = () => {
    layoutConfig = normalizeLayoutConfig(layoutConfig);
    const stage = elements.layoutStage;
    if (!stage) return;

    stage.dataset.layoutTemplate = layoutConfig.template;
    stage.style.setProperty('--files-slot', getSlotForPanel('files'));
    stage.style.setProperty('--editor-slot', getSlotForPanel('editor'));
    stage.style.setProperty('--preview-slot', getSlotForPanel('preview'));
    stage.style.setProperty('--console-slot', getSlotForPanel('console'));

    if (elements.previewSection) elements.previewSection.style.gridArea = getSlotForPanel('preview');
    if (elements.fileSidebar) elements.fileSidebar.style.gridArea = getSlotForPanel('files');
    if (elements.editorPanel) elements.editorPanel.style.gridArea = getSlotForPanel('editor');
    if (elements.consolePanel) elements.consolePanel.style.gridArea = getSlotForPanel('console');

    // دو ریسایزر فقط روی مرز واقعی باکس‌های مجاور قرار می‌گیرند.
    elements.previewResizer?.removeAttribute('aria-hidden');
    elements.sidebarResizer?.removeAttribute('aria-hidden');
    syncHorizontalScrollState();
    persistLayoutConfig();
    window.requestAnimationFrame(() => {
      syncPreviewFrameHeight();
      positionSnapResizers();
      elements.codeEditor?.dispatchEvent(new Event('scroll'));
    });
  };

  const getSlotLabel = (slot) => ({
    large: 'باکس بزرگ',
    smallA: 'باکس کوچک ۱',
    smallB: 'باکس کوچک ۲',
    smallC: 'باکس کوچک ۳'
  }[slot] || slot);

  const getPanelChipMarkup = (panelId, { draggable = true, inSlot = false } = {}) => {
    const panel = LAYOUT_PANELS[panelId];
    if (!panel) return '';
    return `<button class="layout-panel-chip${selectedLayoutPanel === panelId && !inSlot ? ' is-selected' : ''}${inSlot ? ' in-slot' : ''}" type="button" draggable="${draggable ? 'true' : 'false'}" data-layout-panel="${panelId}" aria-pressed="${selectedLayoutPanel === panelId ? 'true' : 'false'}">
      <span class="layout-panel-chip-icon" aria-hidden="true">${panel.icon}</span>
      <span>${panel.label}</span>
    </button>`;
  };

  const renderLayoutTemplateGrid = () => {
    if (!elements.layoutTemplateGrid) return;
    elements.layoutTemplateGrid.innerHTML = Object.entries(SNAP_LAYOUT_TEMPLATES).map(([id, template]) => `
      <button class="layout-template-card${layoutConfig.template === id ? ' is-active' : ''}" type="button" role="listitem" data-layout-template-choice="${id}" aria-pressed="${layoutConfig.template === id ? 'true' : 'false'}">
        <span class="layout-template-mini layout-template-mini-${template.visual}" aria-hidden="true">
          <i class="mini-large"></i><i class="mini-small-a"></i><i class="mini-small-b"></i><i class="mini-small-c"></i>
        </span>
        <span class="layout-template-copy"><b>${template.label}</b><small>${template.detail}</small></span>
      </button>`).join('');
  };

  const renderLayoutPanelPalette = () => {
    if (!elements.layoutPanelPalette) return;
    elements.layoutPanelPalette.innerHTML = Object.keys(LAYOUT_PANELS).map((panelId) => getPanelChipMarkup(panelId)).join('');
  };

  const renderLayoutBoard = () => {
    if (!elements.layoutBoard) return;
    const template = SNAP_LAYOUT_TEMPLATES[layoutConfig.template] || SNAP_LAYOUT_TEMPLATES['big-top'];
    elements.layoutBoard.className = `layout-board layout-board-${template.visual}`;
    elements.layoutBoard.innerHTML = SNAP_SLOTS.map((slot) => {
      const panelId = layoutConfig.slots[slot];
      const label = getSlotLabel(slot);
      return `<div class="layout-slot layout-slot-${slot}" data-layout-slot="${slot}" tabindex="0" role="button" aria-label="${label}: ${LAYOUT_PANELS[panelId].label}">
        <span class="layout-slot-label">${label}</span>
        ${getPanelChipMarkup(panelId, { draggable: true, inSlot: true })}
      </div>`;
    }).join('');
  };

  const renderLayoutBuilder = () => {
    layoutConfig = normalizeLayoutConfig(layoutConfig);
    renderLayoutTemplateGrid();
    renderLayoutPanelPalette();
    renderLayoutBoard();
  };

  const appendConsoleEntry = (level = 'log', message = '', meta = {}) => {
    const normalizedLevel = ['log', 'info', 'warn', 'error'].includes(level) ? level : 'log';
    consoleEntries.push({
      level: normalizedLevel,
      message: String(message || '').trim() || '(بدون پیام)',
      time: new Date(),
      fileName: meta.fileName || '',
      line: meta.line || 0,
      column: meta.column || 0
    });
    if (consoleEntries.length > 250) consoleEntries = consoleEntries.slice(-250);
    renderConsoleOutput();
  };

  const renderConsoleOutput = () => {
    if (!elements.consoleOutput) return;
    if (!consoleEntries.length) {
      elements.consoleOutput.innerHTML = '<div class="console-empty">لاگ‌ها و خطاهای اجرای Preview اینجا نمایش داده می‌شود.</div>';
      return;
    }
    elements.consoleOutput.innerHTML = consoleEntries.map((entry) => {
      const stamp = entry.time instanceof Date ? entry.time.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
      const location = entry.fileName ? ` <span class="console-location">${escapeHtml(entry.fileName)}${entry.line ? `:${entry.line}${entry.column ? `:${entry.column}` : ''}` : ''}</span>` : '';
      return `<div class="console-entry console-entry-${entry.level}">
        <span class="console-level">${entry.level}</span>
        <span class="console-time">${stamp}</span>
        <span class="console-message">${escapeHtml(entry.message)}</span>${location}
      </div>`;
    }).join('');
    elements.consoleOutput.scrollTop = elements.consoleOutput.scrollHeight;
  };

  const clearConsoleOutput = ({ silent = false } = {}) => {
    consoleEntries = [];
    renderConsoleOutput();
    if (!silent) showToast('کنسول پاک شد.');
  };

  const openLayoutDialog = () => {
    renderLayoutBuilder();
    openDialog(elements.layoutDialog);
  };

  const setLayoutTemplate = (template) => {
    if (!SNAP_LAYOUT_TEMPLATES[template]) return;
    if (layoutConfig.template !== template) clearSnapTrackSizes();
    layoutConfig.template = template;
    applyLayoutOrder();
    renderLayoutBuilder();
  };

  const assignPanelToLayoutSlot = (panelId, destinationSlot) => {
    if (!LAYOUT_PANELS[panelId] || !SNAP_SLOTS.includes(destinationSlot)) return;
    const sourceSlot = getSlotForPanel(panelId);
    const destinationPanel = layoutConfig.slots[destinationSlot];
    if (sourceSlot !== destinationSlot) {
      layoutConfig.slots[sourceSlot] = destinationPanel;
      layoutConfig.slots[destinationSlot] = panelId;
    }
    selectedLayoutPanel = '';
    applyLayoutOrder();
    renderLayoutBuilder();
  };

  const renderFileSelectionControls = () => {
    const fileNames = files.map((file) => file.name);
    const allSelected = fileNames.length > 0 && fileNames.every((name) => selectedFileNames.has(name));
    elements.fileSidebar?.classList.toggle('is-selection-mode', fileSelectionMode);
    if (elements.fileSelectionModeBtn) {
      elements.fileSelectionModeBtn.classList.toggle('is-active', fileSelectionMode);
      elements.fileSelectionModeBtn.setAttribute('aria-pressed', String(fileSelectionMode));
      elements.fileSelectionModeBtn.title = fileSelectionMode ? 'خروج از حالت انتخاب فایل' : 'فعال کردن انتخاب چندفایل';
      elements.fileSelectionModeBtn.setAttribute('aria-label', elements.fileSelectionModeBtn.title);
    }
  };

  const setFileSelectionMode = (enabled) => {
    fileSelectionMode = Boolean(enabled);
    if (!fileSelectionMode) selectedFileNames = new Set();
    renderFileNavigation();
  };

  const toggleAllFiles = () => {
    if (!fileSelectionMode) return;
    const allNames = files.map((file) => file.name);
    const allSelected = allNames.length > 0 && allNames.every((name) => selectedFileNames.has(name));
    selectedFileNames = allSelected ? new Set() : new Set(allNames);
    renderFileNavigation();
  };

  const pruneExplorerState = () => {
    const names = new Set(files.map((file) => file.name));
    openFileNames = new Set([...openFileNames].filter((name) => names.has(name)));
    selectedFileNames = new Set([...selectedFileNames].filter((name) => names.has(name)));
    collapsedFolders = new Set([...collapsedFolders].filter((folder) => explicitFolders.has(folder)));
    if (activeFileName && !names.has(activeFileName)) activeFileName = '';
  };

  const setFiles = (nextFiles, preferredActiveName) => {
    const unique = new Map();
    nextFiles.forEach((file) => {
      const name = cleanRelativePath(file.name) || String(file.name || 'untitled.txt');
      const type = file.type || getType(name);
      const isBinary = Boolean(file.isBinary) || !isEditableType(type);
      unique.set(name, {
        ...file,
        name,
        type,
        isBinary,
        mime: file.mime || getMimeType(name),
        bytes: file.bytes instanceof Uint8Array ? file.bytes : null,
        content: isBinary ? '' : String(file.content ?? '')
      });
    });
    files = [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
    deriveFoldersFromFiles();
    pruneExplorerState();

    const wanted = preferredActiveName && files.some((file) => file.name === preferredActiveName)
      ? preferredActiveName
      : (getHtmlFile()?.name || files[0]?.name || '');
    activeFileName = wanted;
    if (wanted) openFileNames.add(wanted);

    renderFileNavigation();
    syncEditor();
    schedulePreview(true);
  };

  const activateProject = (nextFiles, options = {}) => {
    const normalizedFiles = nextFiles.map((file) => ({ ...file }));
    previewStorage = Object.create(null);
    diagnostics.clear();
    breakpoints.clear();
    explicitFolders = new Set();
    openFileNames = new Set();
    selectedFileNames = new Set();
    collapsedFolders = new Set();
    selectedPreviewElement = null;
    selectedSourceLocation = null;
    relatedSourceLocations = new Map();
    relatedSourceMatches = new Map();
    fileSelectionMode = false;
    if (elements.inspectorBar) elements.inspectorBar.hidden = true;
    const htmlName = getHtmlFile(normalizedFiles)?.name;
    setFiles(normalizedFiles, options.preferredActiveName || htmlName);
    projectName = options.projectName || inferProjectName(normalizedFiles);
    projectHasBeenOpened = Boolean(options.openedByUser);
    projectHasEdits = false;
  };

  const iconFor = (type) => ({ html: 'HTML', css: 'CSS', js: 'JS', text: 'TXT', font: 'FONT', image: 'IMG', asset: 'BIN' }[type] || 'BIN');

  const pencilIcon = `<span class="material-symbols-rounded file-action-symbol" aria-hidden="true">edit</span>`;
  const cloneIcon = `<span class="material-symbols-rounded file-action-symbol" aria-hidden="true">content_copy</span>`;
  const trashIcon = `<span class="material-symbols-rounded file-action-symbol" aria-hidden="true">delete</span>`;
  const downloadIcon = `<span class="material-symbols-rounded file-action-symbol" aria-hidden="true">download</span>`;
  const folderIcon = `<span class="material-symbols-rounded tree-folder-icon" aria-hidden="true">folder</span>`;

  const renderSelectionToolbar = () => {
    if (!elements.selectionToolbar) return;
    selectedFileNames = new Set([...selectedFileNames].filter((name) => files.some((file) => file.name === name)));
    const total = selectedFileNames.size;
    elements.selectionToolbar.hidden = !fileSelectionMode || !total;
    renderFileSelectionControls();
    if (!fileSelectionMode || !total) return;
    elements.selectedCount.textContent = `${total} انتخاب`;
    const previous = elements.moveDestinationSelect.value;
    const folderOptions = getAllFolders().map((folder) => `<option value="${escapeHtml(folder)}">${escapeHtml(folder)}/</option>`).join('');
    elements.moveDestinationSelect.innerHTML = `<option value="">انتقال به پوشه…</option><option value="__root__">/ ریشه پروژه</option>${folderOptions}`;
    if ([...elements.moveDestinationSelect.options].some((option) => option.value === previous)) {
      elements.moveDestinationSelect.value = previous;
    }
  };

  const renderFileNavigation = () => {
    elements.fileCount.textContent = String(files.length);
    const allFolders = getAllFolders();
    const foldersByParent = new Map();
    allFolders.forEach((folder) => {
      const parent = parentFolderOf(folder);
      if (!foldersByParent.has(parent)) foldersByParent.set(parent, []);
      foldersByParent.get(parent).push(folder);
    });
    const filesByParent = new Map();
    files.forEach((file) => {
      const parent = parentFolderOf(file.name);
      if (!filesByParent.has(parent)) filesByParent.set(parent, []);
      filesByParent.get(parent).push(file);
    });
    foldersByParent.forEach((items) => items.sort((a, b) => a.localeCompare(b, 'en')));
    filesByParent.forEach((items) => items.sort((a, b) => a.name.localeCompare(b.name, 'en')));

    const renderFile = (file, depth) => {
      const escapedName = escapeHtml(file.name);
      const leaf = escapeHtml(file.name.split('/').pop() || file.name);
      const isActive = file.name === activeFileName;
      const isSelected = selectedFileNames.has(file.name);
      const hasRelated = relatedSourceLocations.has(file.name);
      const selectionControl = fileSelectionMode
        ? `<input class="file-select" type="checkbox" data-file-select="${escapedName}" ${isSelected ? 'checked' : ''} aria-label="انتخاب ${escapedName}" />`
        : '';
      return `
        <div class="tree-row file-row ${isActive ? 'active' : ''} ${hasRelated ? 'has-related' : ''}" style="--tree-depth:${depth}" data-file-row="${escapedName}">
          ${selectionControl}
          <div class="file-item-row ${isActive ? 'active' : ''}">
            <button class="file-item ${isActive ? 'active' : ''}" type="button" data-file="${escapedName}" role="treeitem" aria-selected="${isActive}">
              <span class="file-icon">${iconFor(file.type)}</span>
              <span class="file-name" title="${escapedName}">${leaf}</span>
            </button>
            <span class="file-item-actions" aria-label="عملیات فایل ${escapedName}">
              <button class="file-action-icon download" type="button" data-file-action="download" data-file-name="${escapedName}" title="دانلود ${escapedName}" aria-label="دانلود ${escapedName}">${downloadIcon}</button>
              <button class="file-action-icon clone" type="button" data-file-action="clone" data-file-name="${escapedName}" title="کلون ${escapedName}" aria-label="کلون ${escapedName}">${cloneIcon}</button>
              <button class="file-action-icon rename" type="button" data-file-action="rename" data-file-name="${escapedName}" title="تغییر نام ${escapedName}" aria-label="تغییر نام ${escapedName}">${pencilIcon}</button>
              <button class="file-action-icon delete" type="button" data-file-action="delete" data-file-name="${escapedName}" title="حذف ${escapedName}" aria-label="حذف ${escapedName}">${trashIcon}</button>
            </span>
          </div>
        </div>`;
    };

    const renderFolder = (folder, depth) => {
      const escapedFolder = escapeHtml(folder);
      const leaf = escapeHtml(folder.split('/').pop() || folder);
      const collapsed = collapsedFolders.has(folder);
      const childFolders = foldersByParent.get(folder) || [];
      const childFiles = filesByParent.get(folder) || [];
      const children = collapsed ? '' : `${childFolders.map((item) => renderFolder(item, depth + 1)).join('')}${childFiles.map((item) => renderFile(item, depth + 1)).join('')}`;
      return `
        <div class="file-tree-group" data-folder-group="${escapedFolder}">
          <div class="tree-row folder-row" style="--tree-depth:${depth}" data-folder-row="${escapedFolder}">
            <button class="tree-folder-toggle" type="button" data-folder-toggle="${escapedFolder}" aria-expanded="${!collapsed}" title="${collapsed ? 'باز کردن' : 'بستن'} پوشه">${collapsed ? '›' : '⌄'}</button>
            ${folderIcon}
            <button class="tree-folder-name" type="button" data-folder-toggle="${escapedFolder}" title="${escapedFolder}">${leaf}</button>
            <span class="file-item-actions" aria-label="عملیات پوشه ${escapedFolder}">
              <button class="file-action-icon folder-delete" type="button" data-folder-action="delete" data-folder-name="${escapedFolder}" title="حذف پوشه ${escapedFolder}" aria-label="حذف پوشه ${escapedFolder}">${trashIcon}</button>
            </span>
          </div>
          ${children}
        </div>`;
    };

    const rootFolders = foldersByParent.get('') || [];
    const rootFiles = filesByParent.get('') || [];
    const fileNames = files.map((file) => file.name);
    const allSelected = fileNames.length > 0 && fileNames.every((name) => selectedFileNames.has(name));
    const selectionRowText = allSelected ? 'برداشتن انتخاب همه فایل‌ها' : 'انتخاب همه فایل‌ها';
    const selectionRow = fileSelectionMode
      ? `<div class="file-list-selection-row">
          <button class="selection-all-button file-list-select-all" type="button" data-toggle-all-files title="${selectionRowText}" aria-label="${selectionRowText}">
            <span class="material-symbols-rounded inline-icon" aria-hidden="true">${allSelected ? 'check_box' : 'select_check_box'}</span>
            <span>${selectionRowText}</span>
          </button>
        </div>`
      : '';
    const tree = `${rootFolders.map((folder) => renderFolder(folder, 0)).join('')}${rootFiles.map((file) => renderFile(file, 0)).join('')}`;
    elements.fileList.innerHTML = selectionRow + (tree || '<div class="drop-hint">فایل یا پوشه را روی هر بخش از برنامه رها کن.</div>');

    const tabs = [...openFileNames].filter((name) => files.some((file) => file.name === name));
    elements.editorTabs.innerHTML = tabs.length
      ? tabs.map((name) => {
        const active = name === activeFileName;
        const escaped = escapeHtml(name);
        const related = relatedSourceLocations.has(name);
        return `<div class="editor-tab ${active ? 'active' : ''} ${related ? 'has-related' : ''}" role="presentation"><button class="editor-tab-open" type="button" data-file="${escaped}" role="tab" aria-selected="${active}" title="${escaped}">${escapeHtml(name.split('/').pop() || name)}</button><button class="editor-tab-close" type="button" data-close-file="${escaped}" aria-label="بستن ${escaped}" title="بستن ${escaped}">×</button></div>`;
      }).join('')
      : '<div class="empty-tabs">برای باز کردن فایل، روی آن در File Explorer کلیک کن.</div>';
    renderSelectionToolbar();
  };

  const closeEditorTab = (name) => {
    if (!openFileNames.has(name)) return;
    const before = [...openFileNames];
    const index = before.indexOf(name);
    openFileNames.delete(name);
    if (activeFileName === name) {
      const remaining = [...openFileNames].filter((item) => files.some((file) => file.name === item));
      activeFileName = remaining[index - 1] || remaining[index] || remaining.at(-1) || '';
    }
    renderFileNavigation();
    syncEditor();
  };

  const setActiveFile = (name) => {
    if (!files.some((file) => file.name === name)) return;
    activeFileName = name;
    openFileNames.add(name);
    renderFileNavigation();
    syncEditor();
    elements.codeEditor.focus();
  };

  const syncEditor = () => {
    const activeFile = getActiveFile();
    const isEditable = Boolean(activeFile) && !activeFile.isBinary && isEditableType(activeFile.type);
    elements.codeEditor.disabled = !isEditable;
    elements.codeEditor.value = activeFile
      ? (isEditable
        ? activeFile.content
        : `این فایل باینری است و داخل ویرایشگر متن باز نمی‌شود.\n\n${activeFile.name}\n${activeFile.mime || getMimeType(activeFile.name)}\n${getFileBytes(activeFile).length.toLocaleString('en-US')} bytes`)
      : '';
    elements.activeFileLabel.textContent = activeFile
      ? `${activeFile.name}${isEditable ? '' : ' (asset)'}`
      : 'فایلی انتخاب نشده';
    updateLineInfo();
    renderEditorDecorations();
  };

  const updateLineInfo = () => {
    const editor = elements.codeEditor;
    const selectionStart = editor.selectionStart || 0;
    const before = editor.value.slice(0, selectionStart);
    const line = before.split('\n').length;
    const column = before.length - before.lastIndexOf('\n');
    elements.lineInfo.textContent = `خط ${line}، ستون ${column}`;
  };
  const diagnosticsFor = (fileName) => diagnostics.get(fileName) || [];

  const lineFromOffset = (source, offset) => String(source || '').slice(0, Math.max(0, offset)).split('\n').length;

  const scrollEditorToLine = (line) => {
    const safeLine = Math.max(1, Number(line) || 1);
    const lineHeight = parseFloat(getComputedStyle(elements.codeEditor).lineHeight) || 23.8;
    elements.codeEditor.scrollTop = Math.max(0, (safeLine - 3) * lineHeight);
    syncEditorScroll();
  };

  const focusCodeLocation = (fileName, start = 0, end = start, message = '') => {
    const file = files.find((item) => item.name === fileName);
    if (!file || file.isBinary || !isEditableType(file.type)) {
      if (message) showToast(message);
      return false;
    }
    activeFileName = fileName;
    openFileNames.add(fileName);
    renderFileNavigation();
    syncEditor();
    const safeStart = Math.max(0, Math.min(Number(start) || 0, elements.codeEditor.value.length));
    const safeEnd = Math.max(safeStart, Math.min(Number(end) || safeStart, elements.codeEditor.value.length));
    elements.codeEditor.focus();
    elements.codeEditor.setSelectionRange(safeStart, safeEnd);
    selectedSourceLocation = { fileName, line: lineFromOffset(elements.codeEditor.value, safeStart) };
    updateLineInfo();
    renderEditorDecorations();
    scrollEditorToLine(selectedSourceLocation.line);
    if (message) showToast(message);
    return true;
  };

  const keywordSet = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue',
    'new', 'class', 'extends', 'import', 'from', 'export', 'default', 'async', 'await', 'try', 'catch', 'throw',
    'typeof', 'instanceof', 'true', 'false', 'null', 'undefined'
  ]);

  const tokenise = (source, pattern, getClassName) => {
    const text = String(source || '');
    let result = '';
    let cursor = 0;
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text))) {
      result += escapeHtml(text.slice(cursor, match.index));
      const token = match[0];
      const className = getClassName(token, match);
      result += className ? `<span class="${className}">${escapeHtml(token)}</span>` : escapeHtml(token);
      cursor = match.index + token.length;
    }
    return result + escapeHtml(text.slice(cursor));
  };

  const highlightJs = (source) => tokenise(
    source,
    /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|throw|typeof|instanceof|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/g,
    (token) => {
      if (token.startsWith('//') || token.startsWith('/*')) return 'token-comment';
      if (/^["'`]/.test(token)) return 'token-string';
      if (/^\d/.test(token)) return 'token-number';
      return keywordSet.has(token) ? 'token-keyword' : '';
    }
  );

  const highlightCss = (source) => tokenise(
    source,
    /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|deg)?\b/g,
    (token) => {
      if (token.startsWith('/*')) return 'token-comment';
      if (/^["']/.test(token)) return 'token-string';
      return 'token-number';
    }
  );

  const highlightHtml = (source) => tokenise(
    source,
    /<!--[\s\S]*?-->|<\/?[A-Za-z][\w:-]*(?:\s[^<>]*?)?\/?\s*>/g,
    (token) => token.startsWith('<!--') ? 'token-comment' : 'token-tag'
  );

  const highlightText = (source, type) => {
    if (type === 'html') return highlightHtml(source);
    if (type === 'css') return highlightCss(source);
    if (type === 'js') return highlightJs(source);
    return escapeHtml(source);
  };

  const renderEditorDecorations = () => {
    if (!elements.codeHighlight || !elements.lineNumbers || !elements.lineMarkers) return;
    const file = getActiveFile();
    const source = String(elements.codeEditor.value || '');
    const lineCount = Math.max(1, source.split('\n').length);
    const errorLines = new Set(diagnosticsFor(file?.name).map((item) => Math.max(1, Number(item.line) || 1)));
    const breakpointLines = breakpoints.get(file?.name) || new Set();
    const relatedLines = relatedSourceLocations.get(file?.name) || new Set();
    const selectedLine = selectedSourceLocation?.fileName === file?.name ? selectedSourceLocation.line : 0;
    const highlighted = highlightText(source, file?.type || 'text').split('\n');

    elements.codeHighlight.innerHTML = highlighted.map((line, index) => {
      const number = index + 1;
      const classes = ['code-line'];
      if (errorLines.has(number)) classes.push('is-error');
      if (relatedLines.has(number)) classes.push('is-related');
      if (selectedLine === number) classes.push('is-selected');
      return `<span class="${classes.join(' ')}" data-line="${number}">${line || '&nbsp;'}</span>`;
    }).join('\n');

    elements.lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, index) => {
      const number = index + 1;
      const classes = ['line-number'];
      if (errorLines.has(number)) classes.push('is-error');
      if (relatedLines.has(number)) classes.push('is-related');
      if (selectedLine === number) classes.push('is-selected');
      return `<div class="${classes.join(' ')}">${number}</div>`;
    }).join('');

    elements.lineMarkers.innerHTML = Array.from({ length: lineCount }, (_, index) => {
      const number = index + 1;
      const classes = ['line-marker'];
      if (breakpointLines.has(number)) classes.push('is-breakpoint');
      if (errorLines.has(number)) classes.push('is-error');
      if (relatedLines.has(number)) classes.push('is-related');
      return `<button class="${classes.join(' ')}" type="button" data-breakpoint-line="${number}" aria-label="نشانگر خط ${number}" title="نشانگر خط ${number}"></button>`;
    }).join('');
    syncEditorScroll();
  };

  const syncEditorScroll = () => {
    if (!elements.codeHighlight) return;
    const editor = elements.codeEditor;
    elements.codeHighlight.scrollTop = editor.scrollTop;
    elements.codeHighlight.scrollLeft = editor.scrollLeft;
    const translate = `translateY(${-editor.scrollTop}px)`;
    elements.lineNumbers.style.transform = translate;
    elements.lineMarkers.style.transform = translate;
  };

  const setDiagnosticsForFile = (fileName, entries = []) => {
    const normalized = entries.filter(Boolean).map((entry) => ({
      line: Math.max(1, Number(entry.line) || 1),
      column: Math.max(0, Number(entry.column) || 0),
      message: String(entry.message || 'خطای نامشخص'),
      severity: entry.severity || 'error'
    }));
    if (normalized.length) diagnostics.set(fileName, normalized);
    else diagnostics.delete(fileName);
    if (fileName === activeFileName) renderEditorDecorations();
  };

  const getSyntaxLineFromError = (error, source) => {
    const stack = String(error?.stack || '');
    const match = stack.match(/<anonymous>:(\d+):(\d+)/) || stack.match(/:(\d+):(\d+)\)?$/m);
    if (match) return Math.max(1, Number(match[1]) - 1);
    const messageLine = String(error?.message || '').match(/line\s+(\d+)/i);
    if (messageLine) return Math.max(1, Number(messageLine[1]));
    return findUnclosedDelimiterLine(source) || 1;
  };

  const findUnclosedDelimiterLine = (source) => {
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };
    let quote = '';
    let escaped = false;
    let inLineComment = false;
    let inBlockComment = false;
    const text = String(source || '');
    for (let index = 0; index < text.length; index += 1) {
      const ch = text[index];
      const next = text[index + 1];
      if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
      if (inBlockComment) { if (ch === '*' && next === '/') { inBlockComment = false; index += 1; } continue; }
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === quote) quote = '';
        continue;
      }
      if (ch === '/' && next === '/') { inLineComment = true; index += 1; continue; }
      if (ch === '/' && next === '*') { inBlockComment = true; index += 1; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if ('([{'.includes(ch)) stack.push({ ch, line: lineFromOffset(text, index) });
      else if (pairs[ch]) {
        const last = stack.pop();
        if (!last || last.ch !== pairs[ch]) return lineFromOffset(text, index);
      }
    }
    return stack.length ? stack.at(-1).line : 0;
  };

  const lintHtmlInlineBlocks = (source) => {
    const diagnosticsList = [];
    const text = String(source || '');

    const stylePattern = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
    let styleMatch;
    while ((styleMatch = stylePattern.exec(text))) {
      const css = styleMatch[1] || '';
      const line = findUnclosedDelimiterLine(css);
      if (line) {
        const styleContentStart = styleMatch.index + styleMatch[0].indexOf(css);
        diagnosticsList.push({
          line: lineFromOffset(text, styleContentStart) + line - 1,
          message: 'خطای CSS داخل <style>: براکت، پرانتز یا کوتیشن درست بسته نشده است.'
        });
      }
    }

    const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptPattern.exec(text))) {
      const attributes = scriptMatch[1] || '';
      if (/\bsrc\s*=/i.test(attributes)) continue;
      const script = scriptMatch[2] || '';
      try {
        new Function(`\n${script}`);
      } catch (error) {
        const relativeLine = getSyntaxLineFromError(error, script);
        const scriptContentStart = scriptMatch.index + scriptMatch[0].indexOf(script);
        diagnosticsList.push({
          line: lineFromOffset(text, scriptContentStart) + relativeLine - 1,
          message: `خطای JavaScript داخل <script>: ${error.message || 'خطای سینتکس'}`
        });
      }
    }
    return diagnosticsList;
  };

  const lintHtml = (source) => {
    const diagnosticsList = [];
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    const stack = [];
    const tagPattern = /<\/?([A-Za-z][\w:-]*)(?:\s[^<>]*?)?>/g;
    let match;
    while ((match = tagPattern.exec(source))) {
      const raw = match[0];
      const tag = match[1].toLowerCase();
      const line = lineFromOffset(source, match.index);
      if (raw.startsWith('</')) {
        const last = stack.pop();
        if (!last || last.tag !== tag) {
          diagnosticsList.push({ line, message: `تگ بسته‌شونده </${tag}> با ساختار HTML هماهنگ نیست.` });
          if (last) stack.push(last);
          break;
        }
      } else if (!voidTags.has(tag) && !raw.endsWith('/>')) {
        stack.push({ tag, line });
      }
    }
    if (!diagnosticsList.length && stack.length) {
      const last = stack.at(-1);
      diagnosticsList.push({ line: last.line, message: `تگ <${last.tag}> بسته نشده است.` });
    }
    return diagnosticsList.concat(lintHtmlInlineBlocks(source));
  };

  const lintCss = (source) => {
    const line = findUnclosedDelimiterLine(source);
    return line ? [{ line, message: 'براکت، پرانتز یا کوتیشن CSS درست بسته نشده است.' }] : [];
  };

  const lintJs = (source) => {
    try {
      new Function(`\n${source}`);
      return [];
    } catch (error) {
      return [{ line: getSyntaxLineFromError(error, source), message: error.message || 'خطای سینتکس JavaScript' }];
    }
  };

  const runDiagnostics = ({ focusFirst = true } = {}) => {
    diagnostics.clear();
    const all = [];
    files.filter((file) => !file.isBinary && isEditableType(file.type)).forEach((file) => {
      let entries = [];
      if (file.type === 'js') entries = lintJs(file.content);
      else if (file.type === 'css') entries = lintCss(file.content);
      else if (file.type === 'html') entries = lintHtml(file.content);
      if (entries.length) {
        setDiagnosticsForFile(file.name, entries);
        entries.forEach((entry) => all.push({ ...entry, fileName: file.name }));
      }
    });
    renderEditorDecorations();
    if (!all.length) {
      elements.errorPanel.hidden = true;
      elements.errorPanel.textContent = '';
      setStatus('دیباگ بدون خطا');
      showToast('خطای سینتکس پیدا نشد.');
      return [];
    }
    const first = all[0];
    elements.errorPanel.textContent = all.slice(0, 8).map((entry) => `${entry.fileName}:${entry.line} — ${entry.message}`).join('\n');
    elements.errorPanel.hidden = false;
    setStatus(`${all.length} خطا در دیباگ`, true);
    if (focusFirst) {
      const source = files.find((file) => file.name === first.fileName)?.content || '';
      const lines = source.split('\n');
      const start = lines.slice(0, Math.max(0, first.line - 1)).join('\n').length + (first.line > 1 ? 1 : 0);
      focusCodeLocation(first.fileName, start, Math.min(source.length, start + (lines[first.line - 1] || '').length));
    }
    showToast(`${all.length} خطا پیدا شد.`);
    return all;
  };

  const toggleBreakpointAtLine = (line) => {
    const file = getActiveFile();
    if (!file || file.isBinary || !isEditableType(file.type)) return;
    const set = new Set(breakpoints.get(file.name) || []);
    if (set.has(line)) set.delete(line);
    else set.add(line);
    if (set.size) breakpoints.set(file.name, set);
    else breakpoints.delete(file.name);
    renderEditorDecorations();
  };

  const openDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  const closeDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  const setFileDialogStatus = (message = '', type = '') => {
    elements.fileDialogStatus.textContent = message;
    elements.fileDialogStatus.hidden = !message;
    elements.fileDialogStatus.classList.toggle('is-error', type === 'error');
    elements.fileDialogStatus.classList.toggle('is-success', type === 'success');
  };

  const setExtractDialogStatus = (message = '', type = '') => {
    elements.extractDialogStatus.textContent = message;
    elements.extractDialogStatus.hidden = !message;
    elements.extractDialogStatus.classList.toggle('is-error', type === 'error');
    elements.extractDialogStatus.classList.toggle('is-success', type === 'success');
  };

  const validateProjectFilePath = (value, { exceptName = '' } = {}) => {
    const raw = String(value || '').trim().replace(/\\/g, '/');
    if (!raw) throw new Error('نام فایل را وارد کن.');
    if (raw.startsWith('/') || raw.includes('../') || raw.split('/').includes('..')) throw new Error('مسیر فایل باید نسبی باشد و نمی‌تواند شامل .. باشد.');
    if (/[<>:"|?*]/.test(raw)) throw new Error('نام فایل شامل کاراکتر غیرمجاز است.');
    const name = cleanRelativePath(raw);
    if (!name || name.endsWith('/')) throw new Error('نام فایل معتبر نیست.');
    if (/^(?:\.git|node_modules)(?:\/|$)/i.test(name)) throw new Error('این مسیر برای پروژه قابل استفاده نیست.');
    if (files.some((file) => file.name.toLowerCase() === name.toLowerCase() && file.name !== exceptName)) {
      throw new Error('فایلی با همین نام یا مسیر از قبل وجود دارد.');
    }
    return name;
  };

  const validateFolderPath = (value) => {
    const raw = String(value || '').trim().replace(/\\/g, '/').replace(/\/+$/, '');
    if (!raw) throw new Error('نام فولدر را وارد کن.');
    if (raw.startsWith('/') || raw.includes('../') || raw.split('/').includes('..')) throw new Error('مسیر فولدر باید نسبی باشد و نمی‌تواند شامل .. باشد.');
    if (/[<>:"|?*]/.test(raw)) throw new Error('نام فولدر شامل کاراکتر غیرمجاز است.');
    const folder = cleanRelativePath(raw);
    if (!folder) throw new Error('نام فولدر معتبر نیست.');
    if (/^(?:\.git|node_modules)(?:\/|$)/i.test(folder)) throw new Error('این مسیر برای پروژه قابل استفاده نیست.');
    if (files.some((file) => file.name.toLowerCase() === folder.toLowerCase())) throw new Error('یک فایل با همین مسیر وجود دارد.');
    if (explicitFolders.has(folder)) throw new Error('فولدری با همین مسیر از قبل وجود دارد.');
    return folder;
  };

  const creationTypeFromName = (name) => {
    const ext = getExtension(name);
    if (['html', 'htm'].includes(ext)) return 'html';
    if (ext === 'css') return 'css';
    if (['js', 'mjs', 'cjs'].includes(ext)) return 'js';
    if (ext === 'json') return 'json';
    return 'other';
  };

  const extensionForCreationType = (type) => ({ html: 'html', css: 'css', js: 'js', json: 'json' }[type] || '');

  const syncCreationTypeFromName = () => {
    if (activeFileDialogMode !== 'add' || !elements.fileTypeSelect) return;
    elements.fileTypeSelect.value = creationTypeFromName(elements.fileNameInput.value);
  };

  const applyCreationTypeExtension = () => {
    if (activeFileDialogMode !== 'add' || !elements.fileTypeSelect) return;
    const type = elements.fileTypeSelect.value;
    const extension = extensionForCreationType(type);
    if (!extension) return;
    const current = elements.fileNameInput.value.trim().replace(/\\/g, '/');
    const slash = current.lastIndexOf('/');
    const folder = slash >= 0 ? current.slice(0, slash + 1) : '';
    const leaf = slash >= 0 ? current.slice(slash + 1) : current;
    const base = (leaf.replace(/\.[^.]*$/, '') || 'new-file').replace(/\s+/g, '-');
    elements.fileNameInput.value = `${folder}${base}.${extension}`;
  };

  const defaultContentForFile = (name) => {
    const type = getType(name);
    const base = name.split('/').pop().replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').toLowerCase() || 'component';
    if (type === 'html') return `<!-- ${base}: created in Live Web Studio -->\n<section class="${base}">\n  \n</section>\n`;
    if (type === 'css') return `/* ${base}: created in Live Web Studio */\n.${base} {\n  \n}\n`;
    if (type === 'js') return `// ${base}: created in Live Web Studio\n\n`;
    if (getExtension(name) === 'json') return '{\n  \n}\n';
    return '';
  };

  const renameExplorerState = (oldName, newName) => {
    if (diagnostics.has(oldName)) {
      diagnostics.set(newName, diagnostics.get(oldName));
      diagnostics.delete(oldName);
    }
    if (breakpoints.has(oldName)) {
      breakpoints.set(newName, breakpoints.get(oldName));
      breakpoints.delete(oldName);
    }
    if (openFileNames.has(oldName)) { openFileNames.delete(oldName); openFileNames.add(newName); }
    if (selectedFileNames.has(oldName)) { selectedFileNames.delete(oldName); selectedFileNames.add(newName); }
    if (activeFileName === oldName) activeFileName = newName;
  };

  const refreshProjectAfterFileMutation = (preferredName, { forcePreview = false } = {}) => {
    files.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    deriveFoldersFromFiles();
    pruneExplorerState();
    activeFileName = preferredName || activeFileName || files[0]?.name || '';
    if (activeFileName) openFileNames.add(activeFileName);
    projectHasBeenOpened = true;
    projectHasEdits = true;
    renderFileNavigation();
    syncEditor();
    if (autoPreview || forcePreview) schedulePreview(true);
    else setStatus('تغییر ذخیره شد؛ برای اعمال روی بروزرسانی بزن.');
  };

  const ensureTextProjectFile = (name, type, initialContent = '') => {
    let file = files.find((item) => item.name === name);
    if (!file) {
      file = { name, type, mime: getMimeType(name), isBinary: false, content: initialContent, bytes: null };
      files.push(file);
    }
    return file;
  };

  const insertBuiltSampleElement = ({ html = '', css = '', js = '', name = 'Sample element' } = {}) => {
    if (!html.trim()) { showToast('کد HTML المان آماده نیست.'); return; }
    const htmlFile = getHtmlFile() || ensureTextProjectFile('index.html', 'html', '<!doctype html>\n<html lang="fa" dir="rtl">\n<head>\n  <meta charset="UTF-8" />\n  <title>پروژه من</title>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n</body>\n</html>');
    const cssFile = files.find((file) => file.name === 'styles.css') || ensureTextProjectFile('styles.css', 'css', '');
    const jsFile = files.find((file) => file.name === 'app.js') || ensureTextProjectFile('app.js', 'js', '');
    htmlFile.content = /<\/body>/i.test(htmlFile.content)
      ? htmlFile.content.replace(/<\/body>/i, `\n${html}\n</body>`)
      : `${htmlFile.content}\n${html}\n`;
    if (css.trim()) cssFile.content = `${cssFile.content.trimEnd()}\n\n/* ${name || 'Sample element'} */\n${css}\n`;
    if (js.trim()) jsFile.content = `${jsFile.content.trimEnd()}\n\n// ${name || 'Sample element'}\n${js}\n`;
    refreshProjectAfterFileMutation(htmlFile.name, { forcePreview: true });
    showToast('المان نمونه به پروژه اضافه شد.');
  };

  const openFileDialog = (mode, sourceFileName = activeFileName) => {
    const active = files.find((file) => file.name === sourceFileName) || getActiveFile();
    activeFileDialogMode = mode;
    activeFileDialogSourceName = active?.name || '';
    setFileDialogStatus();
    const folder = active?.name?.includes('/') ? `${active.name.split('/').slice(0, -1).join('/')}/` : '';
    const showType = mode === 'add';
    if (elements.fileTypeField) elements.fileTypeField.hidden = !showType;
    if (elements.fileNameFieldLabel) elements.fileNameFieldLabel.textContent = mode === 'folder' ? 'مسیر و نام فولدر' : 'مسیر و نام فایل';
    if (mode === 'add') {
      elements.fileDialogTitle.textContent = 'افزودن فایل جدید';
      elements.fileDialogText.textContent = 'نوع فایل را انتخاب کن یا پسوند را خودت بنویس. در صورت هم‌خوانی پسوند، انتخاب‌گر خودکار به‌روز می‌شود.';
      elements.fileDialogSubmitBtn.textContent = 'ساخت فایل';
      elements.fileTypeSelect.value = 'html';
      elements.fileNameInput.value = `${folder}new-file.html`;
      elements.fileNameInput.placeholder = 'components/button.html';
    } else if (mode === 'folder') {
      elements.fileDialogTitle.textContent = 'ساخت فولدر جدید';
      elements.fileDialogText.textContent = 'نام فولدر یا مسیر آن را وارد کن؛ پوشه‌های میانی هم خودکار ساخته می‌شوند.';
      elements.fileDialogSubmitBtn.textContent = 'ساخت فولدر';
      elements.fileNameInput.value = `${folder}new-folder`;
      elements.fileNameInput.placeholder = 'components/ui';
    } else if (mode === 'rename') {
      if (!active) { showToast('ابتدا یک فایل انتخاب کن.'); return; }
      elements.fileDialogTitle.textContent = 'تغییر نام فایل';
      elements.fileDialogText.textContent = 'تغییر نام ارجاع‌های HTML/CSS/JS را خودکار اصلاح نمی‌کند؛ بعد از ثبت، importها و لینک‌ها را بررسی کن.';
      elements.fileDialogSubmitBtn.textContent = 'ثبت نام جدید';
      elements.fileNameInput.value = active.name;
      elements.fileNameInput.placeholder = 'components/button.js';
    } else {
      if (!active) { showToast('ابتدا یک فایل انتخاب کن.'); return; }
      const ext = getExtension(active.name);
      const stem = active.name.replace(new RegExp(`\\.${ext}$`, 'i'), '');
      elements.fileDialogTitle.textContent = 'کلون فایل';
      elements.fileDialogText.textContent = 'نام کلون را تعیین کن؛ محتوا، فونت یا داده‌ی باینری عیناً کپی می‌شود.';
      elements.fileDialogSubmitBtn.textContent = 'ساخت کلون';
      elements.fileNameInput.value = `${stem}-copy${ext ? `.${ext}` : ''}`;
      elements.fileNameInput.placeholder = active.name;
    }
    openDialog(elements.fileDialog);
    window.setTimeout(() => { elements.fileNameInput.focus(); elements.fileNameInput.select(); }, 0);
  };

  const submitFileDialog = () => {
    try {
      if (activeFileDialogMode === 'folder') {
        const folder = validateFolderPath(elements.fileNameInput.value);
        addFolderAndParents(folder);
        refreshProjectAfterFileMutation(activeFileName, { forcePreview: false });
        closeDialog(elements.fileDialog);
        showToast('فولدر جدید ساخته شد.');
        return;
      }
      const name = validateProjectFilePath(elements.fileNameInput.value, {
        exceptName: activeFileDialogMode === 'rename' ? activeFileDialogSourceName : ''
      });
      if (activeFileDialogMode === 'add') {
        const extension = getExtension(name);
        const inferredType = getType(name);
        const isKnownBinary = FONT_EXTENSIONS.has(extension) || IMAGE_EXTENSIONS.has(extension);
        if (isKnownBinary) throw new Error('برای ساخت فایل باینری مانند فونت یا تصویر، آن را از طریق آپلود وارد کن.');
        const selectedType = elements.fileTypeSelect?.value || creationTypeFromName(name);
        const type = isEditableType(inferredType) ? inferredType : (selectedType === 'other' ? 'text' : inferredType);
        if (!isEditableType(type)) throw new Error('برای نوع «سایر» پسوند متنی وارد کن؛ فایل‌های باینری را با آپلود اضافه کن.');
        files.push({ name, type, mime: type === 'text' ? 'text/plain;charset=utf-8' : getMimeType(name), isBinary: false, content: defaultContentForFile(name), bytes: null });
        addFolderAndParents(parentFolderOf(name));
        refreshProjectAfterFileMutation(name);
        showToast('فایل جدید ساخته شد.');
      } else if (activeFileDialogMode === 'rename') {
        const file = files.find((item) => item.name === activeFileDialogSourceName);
        if (!file) throw new Error('فایل انتخاب‌شده دیگر وجود ندارد.');
        const nextType = getType(name);
        if (isEditableType(file.type) !== isEditableType(nextType)) throw new Error('تغییر پسوند بین فایل متنی و فایل باینری مجاز نیست؛ برای این کار فایل جدید بساز.');
        const oldName = file.name;
        file.name = name;
        file.type = nextType;
        file.mime = getMimeType(name);
        addFolderAndParents(parentFolderOf(name));
        renameExplorerState(oldName, name);
        refreshProjectAfterFileMutation(name);
        showToast('نام فایل تغییر کرد؛ ارجاع‌ها را بررسی کن.');
      } else {
        const source = files.find((item) => item.name === activeFileDialogSourceName);
        if (!source) throw new Error('فایل انتخاب‌شده دیگر وجود ندارد.');
        files.push({
          ...source,
          name,
          bytes: source.bytes instanceof Uint8Array ? new Uint8Array(source.bytes) : null,
          content: source.isBinary ? '' : String(source.content || '')
        });
        addFolderAndParents(parentFolderOf(name));
        refreshProjectAfterFileMutation(name);
        showToast('کلون فایل ساخته شد.');
      }
      closeDialog(elements.fileDialog);
    } catch (error) {
      setFileDialogStatus(error.message || 'ثبت فایل ناموفق بود.', 'error');
    }
  };

  const deleteProjectFile = (fileName = activeFileName) => {
    const target = files.find((file) => file.name === fileName) || getActiveFile();
    if (!target) { showToast('فایلی برای حذف انتخاب نشده است.'); return; }
    if (!window.confirm(`فایل «${target.name}» حذف شود؟ این کار قابل بازگشت نیست.`)) return;
    const removedName = target.name;
    files = files.filter((file) => file.name !== removedName);
    diagnostics.delete(removedName);
    breakpoints.delete(removedName);
    openFileNames.delete(removedName);
    selectedFileNames.delete(removedName);
    const nextActive = activeFileName === removedName
      ? ([...openFileNames].find((name) => files.some((file) => file.name === name)) || getHtmlFile()?.name || files[0]?.name || '')
      : activeFileName;
    activeFileName = nextActive;
    refreshProjectAfterFileMutation(nextActive, { forcePreview: true });
    showToast(files.length ? 'فایل حذف شد.' : 'آخرین فایل هم حذف شد.');
  };

  const deleteFolder = (folder) => {
    const normalized = cleanRelativePath(folder);
    if (!normalized || !explicitFolders.has(normalized)) return;
    const prefix = `${normalized}/`;
    const matchingFiles = files.filter((file) => file.name.startsWith(prefix));
    const notice = matchingFiles.length
      ? `پوشه «${normalized}» و ${matchingFiles.length} فایل داخل آن حذف شوند؟ این کار قابل بازگشت نیست.`
      : `پوشه خالی «${normalized}» حذف شود؟`;
    if (!window.confirm(notice)) return;
    const removed = new Set(matchingFiles.map((file) => file.name));
    files = files.filter((file) => !removed.has(file.name));
    removed.forEach((name) => {
      diagnostics.delete(name);
      breakpoints.delete(name);
      openFileNames.delete(name);
      selectedFileNames.delete(name);
    });
    explicitFolders = new Set([...explicitFolders].filter((item) => item !== normalized && !item.startsWith(prefix)));
    collapsedFolders = new Set([...collapsedFolders].filter((item) => item !== normalized && !item.startsWith(prefix)));
    if (removed.has(activeFileName)) activeFileName = [...openFileNames].find((name) => files.some((file) => file.name === name)) || getHtmlFile()?.name || files[0]?.name || '';
    refreshProjectAfterFileMutation(activeFileName, { forcePreview: true });
    showToast(matchingFiles.length ? 'پوشه و فایل‌های داخل آن حذف شدند.' : 'فولدر حذف شد.');
  };

  const moveSelectedFiles = () => {
    const selected = files.filter((file) => selectedFileNames.has(file.name));
    const destination = String(elements.moveDestinationSelect?.value || '');
    if (!selected.length) { showToast('فایلی برای انتقال انتخاب نشده است.'); return; }
    if (!destination) { showToast('پوشه مقصد را انتخاب کن.'); return; }
    const targetFolder = destination === '__root__' ? '' : cleanRelativePath(destination);
    if (targetFolder && !explicitFolders.has(targetFolder)) { showToast('پوشه مقصد پیدا نشد.'); return; }
    const selectedNames = new Set(selected.map((file) => file.name));
    const renameMap = new Map();
    const occupied = new Set(files.filter((file) => !selectedNames.has(file.name)).map((file) => file.name.toLowerCase()));
    for (const file of selected) {
      const leaf = file.name.split('/').pop();
      const nextName = targetFolder ? `${targetFolder}/${leaf}` : leaf;
      if (occupied.has(nextName.toLowerCase()) || [...renameMap.values()].some((value) => value.toLowerCase() === nextName.toLowerCase())) {
        showToast(`انتقال انجام نشد؛ «${nextName}» از قبل وجود دارد.`);
        return;
      }
      renameMap.set(file.name, nextName);
    }
    if (targetFolder) addFolderAndParents(targetFolder);
    files.forEach((file) => {
      const nextName = renameMap.get(file.name);
      if (nextName) {
        const oldName = file.name;
        file.name = nextName;
        renameExplorerState(oldName, nextName);
      }
    });
    selectedFileNames = new Set();
    refreshProjectAfterFileMutation(activeFileName, { forcePreview: true });
    showToast(`${selected.length} فایل منتقل شد.`);
  };

  const deleteActiveFile = () => deleteProjectFile(activeFileName);

  const sourceKindForFile = (file) => {
    if (!file) return 'text';
    return getExtension(file.name) === 'json' ? 'json' : file.type;
  };

  const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const selectorSearchTerms = (descriptor, kind = 'any') => {
    const terms = [];
    const id = String(descriptor?.id || '').trim();
    const classes = (descriptor?.classes || []).map((value) => String(value || '').trim()).filter(Boolean);
    const selector = String(descriptor?.selector || '').trim();
    const attrs = Array.isArray(descriptor?.attributes) ? descriptor.attributes : [];

    if (kind === 'html' || kind === 'any') {
      if (id) terms.push(`id="${id}"`, `id='${id}'`, `#${id}`);
      classes.forEach((name) => terms.push(`class="${name}`, `class='${name}`, `.${name}`));
      attrs.forEach((attr) => {
        if (!attr?.name || /^(id|class)$/i.test(attr.name)) return;
        terms.push(`${attr.name}="${attr.value}"`, `${attr.name}='${attr.value}'`, `[${attr.name}`);
      });
      if (descriptor?.outerHTML) terms.push(String(descriptor.outerHTML).slice(0, 120));
      if (!id && !classes.length && descriptor?.tag) terms.push(`<${descriptor.tag}`);
    }
    if (kind === 'css' || kind === 'any') {
      if (selector) terms.push(selector);
      if (id) terms.push(`#${id}`);
      classes.forEach((name) => terms.push(`.${name}`));
      attrs.forEach((attr) => {
        if (attr?.name && attr?.value) terms.push(`[${attr.name}="${attr.value}"]`, `[${attr.name}='${attr.value}']`);
      });
    }
    if (kind === 'js' || kind === 'any') {
      if (selector) terms.push(selector, `'${selector}'`, `"${selector}"`);
      if (id) terms.push(`getElementById('${id}')`, `getElementById("${id}")`, `'#${id}'`, `"#${id}"`, `'${id}'`, `"${id}"`);
      classes.forEach((name) => terms.push(`'.${name}'`, `".${name}"`, `'${name}'`, `"${name}"`));
      attrs.forEach((attr) => { if (attr?.value) terms.push(`'${attr.value}'`, `"${attr.value}"`); });
    }
    if (kind === 'json' || kind === 'any') {
      if (id) terms.push(`"${id}"`, `'${id}'`, `"#${id}"`, `'${id}'`);
      if (selector) terms.push(`"${selector}"`, `'${selector}'`);
      classes.forEach((name) => terms.push(`"${name}"`, `'${name}'`, `".${name}"`, `'${name}'`));
      attrs.forEach((attr) => { if (attr?.value) terms.push(`"${attr.value}"`, `'${attr.value}'`); });
    }
    return [...new Set(terms.filter(Boolean).sort((a, b) => b.length - a.length))];
  };

  const findAllTermRanges = (source, terms, limit = 18) => {
    const text = String(source || '');
    const ranges = [];
    terms.forEach((term) => {
      if (!term || ranges.length >= limit) return;
      let from = 0;
      let found = 0;
      while (from < text.length && ranges.length < limit && found < 8) {
        const index = text.indexOf(term, from);
        if (index < 0) break;
        if (!ranges.some((entry) => Math.abs(entry.start - index) < Math.max(2, term.length / 2))) {
          ranges.push({ start: index, end: index + term.length, term });
        }
        from = index + Math.max(1, term.length);
        found += 1;
      }
    });
    return ranges.sort((a, b) => a.start - b.start).slice(0, limit);
  };

  const expandRangeToLine = (source, range) => {
    const text = String(source || '');
    const start = Math.max(0, Math.min(Number(range?.start) || 0, text.length));
    const end = Math.max(start, Math.min(Number(range?.end) || start, text.length));
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEndIndex = text.indexOf('\n', end);
    const lineEnd = lineEndIndex >= 0 ? lineEndIndex : text.length;
    return { ...range, start: lineStart, end: Math.max(lineStart, lineEnd) };
  };

  const expandCssRangeToBlock = (source, range) => {
    const text = String(source || '');
    const start = Math.max(0, Math.min(Number(range?.start) || 0, text.length));
    const end = Math.max(start, Math.min(Number(range?.end) || start, text.length));
    const open = text.lastIndexOf('{', start);
    const close = text.indexOf('}', end);
    if (open < 0 || close < 0) return expandRangeToLine(text, range);
    const selectorStart = text.lastIndexOf('\n', open) + 1;
    return { ...range, start: selectorStart, end: close + 1 };
  };

  const rangesToLines = (source, ranges) => {
    const lines = new Set();
    ranges.forEach((range) => {
      const startLine = lineFromOffset(source, range.start);
      const endLine = lineFromOffset(source, range.end);
      for (let line = startLine; line <= endLine; line += 1) lines.add(line);
    });
    return lines;
  };

  const findDescriptorHtmlRange = (descriptor) => {
    const html = getHtmlFile();
    if (!html) return null;
    const source = html.content;
    const outerHTML = String(descriptor?.outerHTML || '').trim();
    if (outerHTML) {
      const exactIndex = source.indexOf(outerHTML);
      if (exactIndex >= 0) {
        return { file: html, start: exactIndex, end: exactIndex + outerHTML.length, term: 'outerHTML' };
      }
    }
    const terms = selectorSearchTerms(descriptor, 'html');
    for (const term of terms) {
      const index = source.indexOf(term);
      if (index >= 0) {
        const start = source.lastIndexOf('<', index);
        const end = source.indexOf('>', index) + 1 || index + term.length;
        return { file: html, start: Math.max(0, start), end: Math.max(start + 1, end), term };
      }
    }
    return null;
  };

  const buildRelatedSourceMap = (descriptor) => {
    const result = new Map();
    files.filter((file) => !file.isBinary && isEditableType(file.type)).forEach((file) => {
      const kind = sourceKindForFile(file);
      const terms = selectorSearchTerms(descriptor, kind);
      const rawRanges = kind === 'html'
        ? (() => { const htmlRange = findDescriptorHtmlRange(descriptor); return htmlRange?.file.name === file.name ? [{ start: htmlRange.start, end: htmlRange.end, term: htmlRange.term }] : []; })()
        : findAllTermRanges(file.content, terms);
      const ranges = rawRanges.map((range) => {
        if (kind === 'css') return expandCssRangeToBlock(file.content, range);
        if (kind === 'js' || kind === 'json') return expandRangeToLine(file.content, range);
        return range;
      });
      if (!ranges.length) return;
      result.set(file.name, {
        file,
        kind,
        ranges,
        lines: rangesToLines(file.content, ranges)
      });
    });
    return result;
  };

  const rebuildRelatedLineMap = () => {
    relatedSourceLocations = new Map([...relatedSourceMatches].map(([fileName, match]) => [fileName, match.lines]));
  };

  const findRelatedRange = (descriptor, type) => {
    const targetKind = type === 'json' ? 'json' : type;
    const matches = buildRelatedSourceMap(descriptor);
    for (const match of matches.values()) {
      if (match.kind !== targetKind) continue;
      const first = match.ranges[0];
      return { file: match.file, start: first.start, end: first.end };
    }
    return null;
  };

  const renderRelatedSources = () => {
    if (!elements.relatedSources) return;
    if (!relatedSourceMatches.size) {
      elements.relatedSources.innerHTML = '<span class="related-empty">اتصال CSS / JS / JSON برای این عنصر پیدا نشد.</span>';
      return;
    }
    const kindLabel = { html: 'HTML', css: 'CSS', js: 'JS', json: 'JSON', text: 'TEXT' };
    elements.relatedSources.innerHTML = [...relatedSourceMatches.values()].map((match) => {
      const safeName = escapeHtml(match.file.name);
      const label = `${kindLabel[match.kind] || match.kind.toUpperCase()} · ${match.ranges.length}`;
      return `<button class="related-source-chip" type="button" data-related-file="${safeName}" title="باز کردن ${safeName}"><span>${label}</span><b>${safeName}</b></button>`;
    }).join('');
  };

  const focusRelatedFile = (fileName) => {
    const match = relatedSourceMatches.get(fileName);
    if (!match) return;
    const first = match.ranges[0];
    focusCodeLocation(fileName, first.start, first.end, `${match.ranges.length} بخش مرتبط با آبی مشخص شد.`);
  };

  const jumpToRelatedSource = (type) => {
    if (!selectedPreviewElement) { showToast('ابتدا یک عنصر را از Preview انتخاب کن.'); return; }
    const target = [...relatedSourceMatches.values()].find((match) => match.kind === type) || (() => {
      const fallback = findRelatedRange(selectedPreviewElement, type);
      return fallback ? { file: fallback.file, kind: type, ranges: [{ start: fallback.start, end: fallback.end }], lines: new Set([lineFromOffset(fallback.file.content, fallback.start)]) } : null;
    })();
    if (!target) {
      showToast(`کد ${type.toUpperCase()} مرتبط با این عنصر پیدا نشد.`);
      return;
    }
    const first = target.ranges[0];
    focusCodeLocation(target.file.name, first.start, first.end, `${type.toUpperCase()} مرتبط باز شد.`);
  };

  const slugFromDescriptor = (descriptor) => {
    const raw = descriptor?.id || descriptor?.classes?.[0] || descriptor?.tag || 'component';
    return String(raw).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'component';
  };

  const getCssRulesForDescriptor = (descriptor) => {
    const terms = selectorSearchTerms(descriptor).filter((term) => term.startsWith('.') || term.startsWith('#') || term === descriptor.selector);
    const result = [];
    files.filter((file) => file.type === 'css' && !file.isBinary).forEach((file) => {
      const blocks = file.content.match(/[^{}]+\{[^{}]*\}/g) || [];
      blocks.forEach((block) => {
        if (terms.some((term) => block.includes(term))) result.push(`/* ${file.name} */\n${block.trim()}`);
      });
    });
    return result.join('\n\n');
  };

  const makeExtractedContent = (type, descriptor) => {
    const selector = descriptor.selector || (descriptor.id ? `#${descriptor.id}` : descriptor.tag || '.component');
    if (type === 'css') {
      const matched = getCssRulesForDescriptor(descriptor);
      return `/* Extracted styles for ${selector} */\n\n${matched || `${selector} {\n  \n}`}\n`;
    }
    if (type === 'js') {
      return `// Extracted behavior scaffold for ${selector}\nconst component = document.querySelector(${JSON.stringify(selector)});\n\nif (component) {\n  // Add component behavior here.\n}\n`;
    }
    return `<!-- Extracted component: ${selector} -->\n${descriptor.outerHTML || `<${descriptor.tag || 'section'}></${descriptor.tag || 'section'}>`}\n`;
  };

  const updateExtractFileSuggestion = () => {
    if (!selectedPreviewElement) return;
    const type = elements.extractTypeSelect.value;
    const slug = slugFromDescriptor(selectedPreviewElement);
    const extension = type === 'html' ? 'html' : type;
    elements.extractFileNameInput.value = `components/${slug}.${extension}`;
  };

  const openExtractDialog = () => {
    if (!selectedPreviewElement) { showToast('ابتدا یک عنصر را از Preview انتخاب کن.'); return; }
    setExtractDialogStatus();
    elements.extractTypeSelect.value = 'html';
    updateExtractFileSuggestion();
    openDialog(elements.extractDialog);
  };

  const submitExtractDialog = () => {
    try {
      if (!selectedPreviewElement) throw new Error('عنصر انتخاب‌شده در دسترس نیست.');
      const name = validateProjectFilePath(elements.extractFileNameInput.value);
      const type = elements.extractTypeSelect.value;
      files.push({ name, type: getType(name), mime: getMimeType(name), isBinary: false, content: makeExtractedContent(type, selectedPreviewElement), bytes: null });
      refreshProjectAfterFileMutation(name);
      closeDialog(elements.extractDialog);
      showToast('فایل استخراج‌شده ساخته شد.');
    } catch (error) {
      setExtractDialogStatus(error.message || 'استخراج فایل ناموفق بود.', 'error');
    }
  };

  const selectPreviewElement = (descriptor) => {
    selectedPreviewElement = descriptor;
    const label = descriptor.selector || descriptor.tag || 'element';
    elements.selectedElementLabel.textContent = label;
    elements.inspectorBar.hidden = false;

    relatedSourceMatches = buildRelatedSourceMap(descriptor);
    rebuildRelatedLineMap();
    [...relatedSourceMatches.keys()].forEach((fileName) => openFileNames.add(fileName));
    renderFileNavigation();
    renderRelatedSources();

    const htmlTarget = findDescriptorHtmlRange(descriptor);
    if (htmlTarget) {
      focusCodeLocation(htmlTarget.file.name, htmlTarget.start, htmlTarget.end, `عنصر انتخاب شد؛ ${relatedSourceMatches.size} فایل مرتبط با آبی مشخص شدند.`);
    } else if (relatedSourceMatches.size) {
      focusRelatedFile([...relatedSourceMatches.keys()][0]);
    } else {
      showToast('عنصر انتخاب شد؛ اتصال متناظر در HTML / CSS / JS / JSON پیدا نشد.');
    }
  };

  const setIconButtonLabel = (button, label) => {
    if (!button) return;
    button.setAttribute('aria-label', label);
    button.dataset.tooltip = label;
    const hiddenLabel = button.querySelector('.visually-hidden');
    if (hiddenLabel) hiddenLabel.textContent = label;
  };

  const setInspectMode = (enabled) => {
    inspectMode = Boolean(enabled);
    elements.inspectToggleBtn.classList.toggle('is-active', inspectMode);
    elements.inspectToggleBtn.setAttribute('aria-pressed', String(inspectMode));
    setIconButtonLabel(elements.inspectToggleBtn, inspectMode ? 'انتخاب فعال است' : 'انتخاب عنصر');
    setStatus(inspectMode ? 'روی عنصر Preview کلیک کن' : 'آماده');
    schedulePreview(true);
  };

  const toggleEditorFullscreen = async () => {
    const target = elements.editorPanel;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else {
        target.classList.toggle('is-fallback-fullscreen');
      }
    } catch {
      target.classList.toggle('is-fallback-fullscreen');
    }
  };

  const syncFullscreenButton = () => {
    const active = document.fullscreenElement === elements.editorPanel || elements.editorPanel.classList.contains('is-fallback-fullscreen');
    setIconButtonLabel(elements.editorFullscreenBtn, active ? 'خروج از تمام صفحه' : 'تمام صفحه کد');
  };

  const getPanelElement = (panelId) => {
    if (panelId === 'preview') return elements.previewSection;
    if (panelId === 'files') return elements.fileSidebar;
    if (panelId === 'editor') return elements.editorPanel;
    if (panelId === 'console') return elements.consolePanel;
    return null;
  };

  // هر ریسایزر با توجه به قالب Snap، مرز واقعی دو باکس مجاور را کنترل می‌کند.
  // previewResizer و sidebarResizer نام قدیمی دارند اما اکنون هر دو Generic هستند.
  const getSnapResizerConfig = (kind) => {
    const template = layoutConfig?.template || 'big-top';
    const maps = {
      'big-top': {
        preview: { axis: 'row', index: 1, firstSlot: 'large', secondSlot: 'smallA' },
        sidebar: { axis: 'column', index: 1, firstSlot: 'smallA', secondSlot: 'smallB' }
      },
      'big-bottom': {
        preview: { axis: 'row', index: 1, firstSlot: 'smallA', secondSlot: 'large' },
        sidebar: { axis: 'column', index: 1, firstSlot: 'smallA', secondSlot: 'smallB' }
      },
      'big-left': {
        preview: { axis: 'column', index: 1, firstSlot: 'large', secondSlot: 'smallA' },
        sidebar: { axis: 'row', index: 1, firstSlot: 'smallA', secondSlot: 'smallB' }
      },
      'big-right': {
        preview: { axis: 'column', index: 1, firstSlot: 'smallA', secondSlot: 'large' },
        sidebar: { axis: 'row', index: 1, firstSlot: 'smallA', secondSlot: 'smallB' }
      },
      columns: {
        preview: { axis: 'column', index: 1, firstSlot: 'smallA', secondSlot: 'large' },
        sidebar: { axis: 'column', index: 2, firstSlot: 'large', secondSlot: 'smallB' }
      },
      rows: {
        preview: { axis: 'row', index: 1, firstSlot: 'smallA', secondSlot: 'large' },
        sidebar: { axis: 'row', index: 2, firstSlot: 'large', secondSlot: 'smallB' }
      }
    };
    return maps[template]?.[kind] || null;
  };

  const getSnapPairElements = (config) => {
    if (!config) return null;
    const firstId = layoutConfig.slots?.[config.firstSlot];
    const secondId = layoutConfig.slots?.[config.secondSlot];
    const first = getPanelElement(firstId);
    const second = getPanelElement(secondId);
    return first && second ? { first, second, firstId, secondId } : null;
  };

  const setSnapTrackSizes = (config, firstSize, secondSize) => {
    if (!elements.layoutStage || !config) return;
    const stage = elements.layoutStage;
    const axisPrefix = config.axis === 'row' ? '--snap-row-' : '--snap-col-';
    const trackKeys = ['a', 'b', 'c', 'd'];
    const firstKey = trackKeys[Math.max(0, config.index - 1)] || 'a';
    const secondKey = trackKeys[Math.max(1, config.index)] || 'b';
    stage.style.setProperty(`${axisPrefix}${firstKey}`, `${Math.round(firstSize)}px`);
    stage.style.setProperty(`${axisPrefix}${secondKey}`, `${Math.round(secondSize)}px`);
  };

  const getSnapMinimum = (axis) => {
    const stage = elements.layoutStage;
    if (!stage) return axis === 'row' ? 180 : 160;
    const computed = window.getComputedStyle(stage);
    const variable = axis === 'row' ? '--snap-min-row-size' : '--snap-min-column-size';
    return Number.parseFloat(computed.getPropertyValue(variable)) || (axis === 'row' ? 180 : 160);
  };

  const getPhysicalSizes = (config) => {
    const pair = getSnapPairElements(config);
    if (!pair) return null;
    const firstRect = pair.first.getBoundingClientRect();
    const secondRect = pair.second.getBoundingClientRect();
    const axis = config.axis;
    const firstStartsEarlier = axis === 'row'
      ? firstRect.top <= secondRect.top
      : firstRect.left <= secondRect.left;
    const firstSize = axis === 'row' ? firstRect.height : firstRect.width;
    const secondSize = axis === 'row' ? secondRect.height : secondRect.width;
    return { pair, firstRect, secondRect, firstStartsEarlier, firstSize, secondSize };
  };

  const calculateSnapPairSizes = (config, startFirst, startSecond, signedDelta) => {
    const minimum = getSnapMinimum(config.axis);
    // ارتفاع همیشه اجازه رشد دارد. عرض فقط زمانی از فضای صفحه عبور می‌کند که
    // سوییچ «اسکرول افقی آزاد» روشن باشد.
    const canGrowPastContainer = config.axis === 'row' || layoutConfig.horizontalScroll;
    if (!canGrowPastContainer) {
      const allowedDelta = Math.max(
        minimum - startFirst,
        Math.min(startSecond - minimum, signedDelta)
      );
      return {
        firstSize: startFirst + allowedDelta,
        secondSize: startSecond - allowedDelta
      };
    }

    // تا وقتی هر دو باکس بالاتر از حداقل‌اند، ریسایزر مثل Split Pane عادی عمل می‌کند.
    // بعد از رسیدن باکس مقابل به حداقل، باکس هدف آزادانه رشد می‌کند و ارتفاع/عرض Stage
    // بزرگ‌تر می‌شود؛ هیچ سقف مصنوعی و هیچ هم‌پوشانی وجود ندارد.
    return {
      firstSize: Math.max(minimum, startFirst + signedDelta),
      secondSize: Math.max(minimum, startSecond - signedDelta)
    };
  };

  const applySnapResize = (config, startFirst, startSecond, signedDelta) => {
    const sizes = calculateSnapPairSizes(config, startFirst, startSecond, signedDelta);
    setSnapTrackSizes(config, sizes.firstSize, sizes.secondSize);
    window.requestAnimationFrame(() => {
      syncHorizontalScrollState();
      positionSnapResizers();
      syncPreviewFrameHeight();
      elements.codeEditor?.dispatchEvent(new Event('scroll'));
    });
  };

  const resizeSnapPair = (kind, rawDelta) => {
    const config = getSnapResizerConfig(kind);
    const sizes = getPhysicalSizes(config);
    if (!config || !sizes) return;
    const signedDelta = sizes.firstStartsEarlier ? rawDelta : -rawDelta;
    applySnapResize(config, sizes.firstSize, sizes.secondSize, signedDelta);
  };

  const positionSnapResizer = (resizer, kind) => {
    if (!resizer || !elements.layoutStage) return;
    const config = getSnapResizerConfig(kind);
    const sizes = getPhysicalSizes(config);
    if (!config || !sizes) {
      resizer.setAttribute('aria-hidden', 'true');
      return;
    }

    const stageRect = elements.layoutStage.getBoundingClientRect();
    const firstRect = sizes.firstRect;
    const secondRect = sizes.secondRect;
    const isRow = config.axis === 'row';
    const intersectionStart = isRow
      ? Math.max(firstRect.left, secondRect.left)
      : Math.max(firstRect.top, secondRect.top);
    const intersectionEnd = isRow
      ? Math.min(firstRect.right, secondRect.right)
      : Math.min(firstRect.bottom, secondRect.bottom);
    const sharedMidpoint = isRow
      ? (firstRect.bottom + secondRect.top) / 2
      : (firstRect.right + secondRect.left) / 2;

    resizer.classList.toggle('snap-axis-row', isRow);
    resizer.classList.toggle('snap-axis-column', !isRow);
    resizer.setAttribute('aria-hidden', 'false');
    resizer.setAttribute('aria-orientation', isRow ? 'horizontal' : 'vertical');
    resizer.setAttribute('aria-label', isRow ? 'تغییر ارتفاع دو باکس مجاور' : 'تغییر عرض دو باکس مجاور');
    resizer.style.display = 'block';
    resizer.style.right = 'auto';
    resizer.style.bottom = 'auto';

    if (isRow) {
      resizer.style.left = `${Math.round(intersectionStart - stageRect.left - 4)}px`;
      resizer.style.top = `${Math.round(sharedMidpoint - stageRect.top - 7)}px`;
      resizer.style.width = `${Math.max(24, Math.round(intersectionEnd - intersectionStart + 8))}px`;
      resizer.style.height = '14px';
    } else {
      resizer.style.left = `${Math.round(sharedMidpoint - stageRect.left - 7)}px`;
      resizer.style.top = `${Math.round(intersectionStart - stageRect.top - 4)}px`;
      resizer.style.width = '14px';
      resizer.style.height = `${Math.max(24, Math.round(intersectionEnd - intersectionStart + 8))}px`;
    }
  };

  const positionSnapResizers = () => {
    positionSnapResizer(elements.previewResizer, 'preview');
    positionSnapResizer(elements.sidebarResizer, 'sidebar');
  };

  const setupPaneResizer = (resizer, kind) => {
    if (!resizer) return;
    const keyStep = 28;

    resizer.addEventListener('keydown', (event) => {
      const config = getSnapResizerConfig(kind);
      if (!config) return;
      const negativeKey = config.axis === 'row' ? 'ArrowUp' : 'ArrowLeft';
      const positiveKey = config.axis === 'row' ? 'ArrowDown' : 'ArrowRight';
      if (event.key === negativeKey) {
        event.preventDefault();
        resizeSnapPair(kind, -keyStep);
      }
      if (event.key === positiveKey) {
        event.preventDefault();
        resizeSnapPair(kind, keyStep);
      }
    });

    resizer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const config = getSnapResizerConfig(kind);
      if (!config) return;
      event.preventDefault();
      resizer.setPointerCapture?.(event.pointerId);
      resizer.classList.add('is-dragging');
      const startX = event.clientX;
      const startY = event.clientY;
      const sizes = getPhysicalSizes(config);
      if (!sizes) return;
      const startFirst = sizes.firstSize;
      const startSecond = sizes.secondSize;
      const firstStartsEarlier = sizes.firstStartsEarlier;

      const move = (moveEvent) => {
        const physicalDelta = config.axis === 'row'
          ? moveEvent.clientY - startY
          : moveEvent.clientX - startX;
        const signedDelta = firstStartsEarlier ? physicalDelta : -physicalDelta;
        applySnapResize(config, startFirst, startSecond, signedDelta);
      };
      const end = () => {
        resizer.classList.remove('is-dragging');
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end, { once: true });
    });
  };

  const syncPreviewFrameHeight = () => {
    const viewport = elements.previewFrame?.parentElement;
    if (!viewport || !elements.previewFrame) return;
    const style = window.getComputedStyle(viewport);
    const paddingY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
    const height = Math.max(120, Math.floor(viewport.clientHeight - paddingY));
    elements.previewFrame.style.height = `${height}px`;
  };

  const isExternalReference = (reference) => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(String(reference || '').trim());

  const resolveRelativeReference = (reference, fromFileName = '') => {
    const raw = String(reference || '').trim().split('?')[0].split('#')[0].replace(/\\/g, '/');
    if (!raw || isExternalReference(raw)) return '';
    const base = String(fromFileName || '').replace(/\\/g, '/').split('/').slice(0, -1);
    const segments = raw.startsWith('/') ? [] : base;
    raw.split('/').forEach((segment) => {
      if (!segment || segment === '.') return;
      if (segment === '..') {
        segments.pop();
      } else {
        segments.push(segment);
      }
    });
    return segments.join('/');
  };

  const findFileByReference = (reference, expectedType, fromFileName = '') => {
    const relativePath = resolveRelativeReference(reference, fromFileName);
    const normalizedReference = normalizePath(relativePath || reference);
    if (!normalizedReference || isExternalReference(reference)) return null;

    const exact = files.find((file) => {
      if (expectedType && file.type !== expectedType) return false;
      return normalizePath(file.name) === normalizedReference;
    });
    if (exact) return exact;

    // برای پروژه‌های ساده‌ای که مسیر را کامل ننوشته‌اند، fallback بر اساس نام فایل باقی می‌ماند.
    return files.find((file) => {
      if (expectedType && file.type !== expectedType) return false;
      const normalizedName = normalizePath(file.name);
      return normalizedName.endsWith(`/${normalizedReference}`)
        || normalizedName.split('/').pop() === normalizedReference.split('/').pop();
    }) || null;
  };

  const rewriteCssAssetUrls = (cssSource, cssFile) => String(cssSource || '').replace(
    /url\(\s*(?:(['"])(.*?)\1|([^'")\s][^)]*))\s*\)/gi,
    (fullMatch, quote, quotedValue, plainValue) => {
      const reference = String(quote ? quotedValue : plainValue || '').trim();
      if (!reference || isExternalReference(reference)) return fullMatch;
      const asset = findFileByReference(reference, undefined, cssFile?.name || '');
      return asset ? `url("${getFileDataUrl(asset)}")` : fullMatch;
    }
  );

  const rewriteHtmlAssetUrls = (htmlSource, htmlFile) => String(htmlSource || '').replace(
    /\b(src|poster|data-src)\s*=\s*(['"])(.*?)\2/gi,
    (fullMatch, attribute, quote, reference) => {
      const asset = findFileByReference(reference, undefined, htmlFile?.name || '');
      if (!asset || ['html', 'css', 'js', 'text'].includes(asset.type)) return fullMatch;
      return `${attribute}=${quote}${getFileDataUrl(asset)}${quote}`;
    }
  );

  const createPreviewGuard = () => {
    const storageSnapshot = toSafeScriptJson(previewStorage);
    const inspectorEnabled = inspectMode ? 'true' : 'false';

    return `
<script>
(function () {
  var storageData = ${storageSnapshot};
  var inspectEnabled = ${inspectorEnabled};

  function own(key) {
    return Object.prototype.hasOwnProperty.call(storageData, String(key));
  }

  function notifyStorageChange() {
    parent.postMessage({
      source: 'live-web-studio',
      kind: 'storage',
      entries: storageData
    }, '*');
  }

  var virtualStorage = {
    get length() { return Object.keys(storageData).length; },
    key: function (index) {
      var keys = Object.keys(storageData);
      return Number.isInteger(Number(index)) && Number(index) >= 0 ? (keys[Number(index)] || null) : null;
    },
    getItem: function (key) { key = String(key); return own(key) ? storageData[key] : null; },
    setItem: function (key, value) { storageData[String(key)] = String(value); notifyStorageChange(); },
    removeItem: function (key) { delete storageData[String(key)]; notifyStorageChange(); },
    clear: function () { storageData = {}; notifyStorageChange(); }
  };

  try {
    Object.defineProperty(window, 'localStorage', { value: virtualStorage, configurable: true });
  } catch (ignore) {}
  Object.defineProperty(window, '__liveWebStorage', { value: virtualStorage, configurable: false });

  window.__liveWebStudioReload = function () {
    parent.postMessage({ source: 'live-web-studio', kind: 'reload' }, '*');
  };

  function report(kind, message, line, column, fileName) {
    parent.postMessage({
      source: 'live-web-studio',
      kind: kind,
      message: String(message || ''),
      line: line || 0,
      column: column || 0,
      fileName: String(fileName || '')
    }, '*');
  }

  function mirrorStandaloneConsole(level, message) {
    if (window.parent !== window) return;
    var box = document.getElementById('__liveWebStandaloneConsole');
    if (!box) {
      box = document.createElement('div');
      box.id = '__liveWebStandaloneConsole';
      box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483647;max-height:34vh;overflow:auto;background:rgba(4,10,22,.94);color:#dbe8ff;border:1px solid rgba(133,165,226,.45);border-radius:12px;padding:10px;font:12px/1.55 Consolas,monospace;box-shadow:0 18px 50px rgba(0,0,0,.45);direction:ltr;text-align:left';
      document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(box); });
      if (document.body) document.body.appendChild(box);
    }
    var row = document.createElement('div');
    row.style.borderBottom = '1px solid rgba(140,170,220,.16)';
    row.style.padding = '4px 0';
    row.style.color = level === 'error' ? '#ff8585' : (level === 'warn' ? '#ffd166' : '#dbe8ff');
    row.textContent = '[' + level + '] ' + message;
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function serializeConsoleValue(value) {
    try {
      if (typeof value === 'string') return value;
      if (value && value.stack) return String(value.stack);
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    } catch (ignore) {
      return Object.prototype.toString.call(value);
    }
  }

  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      parent.postMessage({
        source: 'live-web-studio',
        kind: 'console',
        level: level,
        message: args.map(serializeConsoleValue).join(' ')
      }, '*');
      mirrorStandaloneConsole(level, args.map(serializeConsoleValue).join(' '));
      if (typeof original === 'function') original.apply(console, args);
    };
  });

  function cssName(value) {
    return String(value || '').replace(/[^a-zA-Z0-9_-]/g, function (ch) { return '\\\\' + ch; });
  }

  function selectorFor(element) {
    if (element.id) return '#' + cssName(element.id);
    var classes = Array.prototype.slice.call(element.classList || []).filter(Boolean).slice(0, 2);
    var base = String(element.tagName || 'div').toLowerCase();
    return base + classes.map(function (name) { return '.' + cssName(name); }).join('');
  }

  function describeElement(element) {
    var classes = Array.prototype.slice.call(element.classList || []).filter(Boolean).slice(0, 10);
    var attributes = Array.prototype.slice.call(element.attributes || []).map(function (attr) { return { name: attr.name || '', value: attr.value || '' }; }).filter(function (attr) { return attr.name && attr.value; }).slice(0, 20);
    return {
      tag: String(element.tagName || '').toLowerCase(),
      id: element.id || '',
      classes: classes,
      attributes: attributes,
      selector: selectorFor(element),
      outerHTML: String(element.outerHTML || '').slice(0, 50000)
    };
  }

  if (inspectEnabled) {
    document.addEventListener('click', function (event) {
      var element = event.target && event.target.nodeType === 1 ? event.target : null;
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      var descriptor = describeElement(element);
      var oldOutline = element.style.outline;
      var oldOffset = element.style.outlineOffset;
      element.style.outline = '2px solid #3d7dff';
      element.style.outlineOffset = '2px';
      window.setTimeout(function () { element.style.outline = oldOutline; element.style.outlineOffset = oldOffset; }, 700);
      parent.postMessage({ source: 'live-web-studio', kind: 'element-selected', descriptor: descriptor }, '*');
    }, true);
  }

  window.addEventListener('error', function (event) {
    mirrorStandaloneConsole('error', String(event.message || 'Error'));
    report('error', event.message, event.lineno, event.colno, event.filename);
  });
  window.addEventListener('unhandledrejection', function (event) {
    var message = event.reason && event.reason.message ? event.reason.message : event.reason;
    mirrorStandaloneConsole('error', String(message || 'Unhandled rejection'));
    report('error', message, 0, 0, '');
  });
  parent.postMessage({ source: 'live-web-studio', kind: 'ready' }, '*');
}());
<\/script>`;
};

  const buildPreviewSource = () => {
    const htmlFile = getHtmlFile();
    if (!htmlFile) {
      return '<!doctype html><html lang="fa" dir="rtl"><body style="font-family:system-ui;padding:2rem"><h2>فایل HTML پیدا نشد</h2><p>حداقل یک فایل با پسوند HTML وارد کن.</p></body></html>';
    }

    let source = rewriteHtmlAssetUrls(htmlFile.content, htmlFile);

    source = source.replace(/<link\b([^>]*?)>/gi, (fullTag, attributes) => {
      const hrefMatch = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
      const relMatch = attributes.match(/\brel\s*=\s*(["'])(.*?)\1/i);
      const isStylesheet = !relMatch || /stylesheet/i.test(relMatch[2]);
      if (!hrefMatch || !isStylesheet) return fullTag;
      const localFile = findFileByReference(hrefMatch[2], 'css', htmlFile.name);
      if (!localFile) return fullTag;
      return `<style data-live-source="${escapeHtml(localFile.name)}">\n${rewriteCssAssetUrls(localFile.content, localFile)}\n</style>`;
    });

    source = source.replace(/<script\b([^>]*)\bsrc\s*=\s*(["'])(.*?)\2([^>]*)>\s*<\/script\s*>/gi, (fullTag, before, quote, src, after) => {
      const localFile = findFileByReference(src, 'js', htmlFile.name);
      if (!localFile) return fullTag;
      const preservedAttributes = `${before} ${after}`.replace(/\s+/g, ' ').trim();
      const sourceName = String(localFile.name).replace(/[\r\n]/g, '');
      return `<script ${preservedAttributes}>\n${safeScript(localFile.content)}\n//# sourceURL=${sourceName}\n<\/script>`;
    });

    // اسکریپت‌های inline نیز برای localStorage پروژه‌های مستقل سازگار می‌شوند.
    source = source.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (fullTag, attributes, scriptContent) => {
      if (/\bsrc\s*=/i.test(attributes)) return fullTag;
      return `<script${attributes}>\n${safeScript(scriptContent)}\n<\/script>`;
    });

    const unreferencedCss = files
      .filter((file) => file.type === 'css')
      .filter((file) => !new RegExp(`data-live-source=["']${file.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(source));
    const fallbackCss = unreferencedCss.length
      ? `\n${unreferencedCss.map((file) => `<style data-live-source="${escapeHtml(file.name)}">\n${rewriteCssAssetUrls(file.content, file)}\n</style>`).join('\n')}`
      : '';

    if (/<head\b[^>]*>/i.test(source)) {
      source = source.replace(/<head\b[^>]*>/i, (tag) => `${tag}${createPreviewGuard()}${fallbackCss}`);
    } else if (/<html\b[^>]*>/i.test(source)) {
      source = source.replace(/<html\b[^>]*>/i, (tag) => `${tag}<head><meta charset="UTF-8">${createPreviewGuard()}${fallbackCss}</head>`);
    } else {
      source = `<!doctype html><html><head><meta charset="UTF-8">${createPreviewGuard()}${fallbackCss}</head><body>${source}</body></html>`;
    }

    return source;
  };

  const schedulePreview = (immediate = false) => {
    window.clearTimeout(updateTimer);
    if (immediate) {
      updatePreview();
      return;
    }
    setStatus('در حال به‌روزرسانی…');
    updateTimer = window.setTimeout(updatePreview, 220);
  };

  const updatePreview = () => {
    elements.errorPanel.hidden = true;
    elements.errorPanel.textContent = '';
    clearConsoleOutput({ silent: true });
    setStatus('در حال بارگذاری…');
    elements.previewFrame.srcdoc = buildPreviewSource();
  };

  const openPreviewWindow = () => {
    const html = buildPreviewSource();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = URL.createObjectURL(blob);
    const popup = window.open(currentPreviewUrl, '_blank', 'noopener,noreferrer');
    if (!popup) showToast('مرورگر اجازه‌ی باز شدن پنجره‌ی جدید را نداد.');
  };

  const toUploadEntries = (inputFiles) => [...inputFiles]
    .filter(Boolean)
    .map((file) => ({
      file,
      path: cleanRelativePath(file.webkitRelativePath || file.name)
    }));

  const hasOpenProject = () => projectHasBeenOpened || projectHasEdits;

  const resolveReplacement = (action) => {
    const resolve = replacementResolver;
    replacementResolver = null;
    if (elements.replaceDialog.open) elements.replaceDialog.close();
    resolve?.(action);
  };

  const askBeforeReplacingProject = () => {
    if (!hasOpenProject()) return Promise.resolve('replace');

    const label = projectName || 'پروژه‌ی فعلی';
    elements.replaceProjectText.textContent = `پروژه‌ی «${label}» باز است. با باز کردن پروژه‌ی جدید، فایل‌های فعلی از حافظه‌ی برنامه حذف می‌شوند. آیا می‌خواهی ابتدا یک نسخه ZIP دانلود کنی؟`;

    return new Promise((resolve) => {
      replacementResolver = resolve;
      if (typeof elements.replaceDialog.showModal === 'function') {
        elements.replaceDialog.showModal();
      } else {
        const wantsDownload = window.confirm('پروژه‌ی فعلی جایگزین می‌شود. ابتدا ZIP آن دانلود شود؟');
        resolveReplacement(wantsDownload ? 'download' : 'replace');
      }
    });
  };

  const ensureCanReplaceProject = async () => {
    const action = await askBeforeReplacingProject();
    if (action === 'cancel') return false;
    if (action === 'download') await downloadProjectZip({ silent: true });
    return true;
  };

  const isIgnoredProjectFile = (path) => {
    const normalized = cleanRelativePath(path).toLowerCase();
    return !normalized
      || /(^|\/)\.git(?:\/|$)/.test(normalized)
      || /(^|\/)node_modules(?:\/|$)/.test(normalized)
      || /(^|\/)(?:thumbs\.db|\.ds_store)$/.test(normalized)
      // جلوگیری از انتشار اتفاقی رمز، token و فایل‌های محیطی در ZIP یا GitHub.
      || /(^|\/)(?:\.env(?:\..*)?|.*(?:secret|password|token|credential|api[_-]?key).*|id_rsa)$/i.test(normalized);
  };

  const toProjectFile = async ({ file, path }) => {
    const name = cleanRelativePath(path || file.name);
    const type = getType(name);
    const mime = getMimeType(name, file.type || '');
    const isBinary = !isEditableType(type);
    if (!isBinary) {
      return { name, type, mime, isBinary: false, content: await file.text() };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    return {
      name,
      type,
      mime,
      isBinary: true,
      bytes,
      dataUrl: `data:${mime};base64,${bytesToBase64(bytes)}`
    };
  };

  const readProjectEntries = async (entries) => {
    const accepted = entries.filter(({ file, path }) => file && !isIgnoredProjectFile(path || file.name));
    if (!accepted.length) {
      showToast('فایل قابل‌استفاده‌ای در پوشه پیدا نشد.');
      return;
    }

    if (!await ensureCanReplaceProject()) return;

    const uploaded = await Promise.all(accepted.map(toProjectFile));
    const htmlFiles = uploaded.filter((file) => file.type === 'html');
    if (!htmlFiles.length) {
      showToast('فایل‌ها وارد شدند، ولی برای نمایش زنده یک فایل HTML لازم است.');
    }

    activateProject(uploaded, {
      projectName: inferProjectName(uploaded),
      openedByUser: true
    });
    showToast(`${uploaded.length} فایل وارد شد.`);
  };

  const readUploadedFiles = async (inputFiles) => readProjectEntries(toUploadEntries(inputFiles));

  const readAllDirectoryEntries = async (reader) => {
    const entries = [];
    while (true) {
      const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
      if (!batch.length) return entries;
      entries.push(...batch);
    }
  };

  const getFileFromEntry = (entry) => new Promise((resolve, reject) => entry.file(resolve, reject));

  const collectEntryFiles = async (entry, parentPath = '') => {
    if (!entry) return [];
    const currentPath = cleanRelativePath(`${parentPath}/${entry.name}`);

    if (entry.isFile) {
      const file = await getFileFromEntry(entry);
      return [{ file, path: currentPath }];
    }

    if (!entry.isDirectory) return [];
    const children = await readAllDirectoryEntries(entry.createReader());
    const nested = await Promise.all(children.map((child) => collectEntryFiles(child, currentPath)));
    return nested.flat();
  };

  const collectHandleFiles = async (handle, parentPath = '') => {
    if (!handle) return [];
    const currentPath = cleanRelativePath(`${parentPath}/${handle.name || ''}`);

    if (handle.kind === 'file') {
      const file = await handle.getFile();
      return [{ file, path: currentPath || file.name }];
    }

    if (handle.kind !== 'directory' || typeof handle.entries !== 'function') return [];

    const nested = [];
    for await (const [, childHandle] of handle.entries()) {
      nested.push(...await collectHandleFiles(childHandle, currentPath));
    }
    return nested;
  };

  const collectDroppedFiles = async (dataTransfer) => {
    const items = [...(dataTransfer?.items || [])].filter((item) => item.kind === 'file');

    // Chromium جدید: API استانداردتر File System Access.
    // دراپِ فولدرها و همه‌ی زیرفولدرها را با مسیر اصلی حفظ می‌کند.
    const hasFileSystemHandles = items.some((item) => typeof item.getAsFileSystemHandle === 'function');
    if (hasFileSystemHandles) {
      const handles = await Promise.all(items.map(async (item) => {
        try {
          return await item.getAsFileSystemHandle();
        } catch {
          return null;
        }
      }));
      const validHandles = handles.filter(Boolean);
      if (validHandles.length) {
        const collected = await Promise.all(validHandles.map((handle) => collectHandleFiles(handle)));
        return collected.flat();
      }
    }

    // Chrome / Edge / Safari قدیمی‌تر: API وب‌کیت.
    const directoryEntries = items
      .map((item) => (typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null))
      .filter(Boolean);

    if (directoryEntries.length) {
      const collected = await Promise.all(directoryEntries.map((entry) => collectEntryFiles(entry)));
      return collected.flat();
    }

    // Firefox یا مرورگرهایی که فقط FileList می‌دهند.
    return toUploadEntries(dataTransfer?.files || []);
  };

  const hasFilePayload = (dataTransfer) => {
    if (!dataTransfer) return false;
    if (dataTransfer.files?.length) return true;
    const types = Array.from(dataTransfer.types || []);
    if (types.some((type) => String(type).toLowerCase() === 'files')) return true;
    return Array.from(dataTransfer.items || []).some((item) => item.kind === 'file');
  };

  const showDragDropShield = () => {
    window.clearTimeout(dragLeaveTimer);
    elements.dragDropShield?.classList.add('is-active');
  };

  const hideDragDropShield = () => {
    window.clearTimeout(dragLeaveTimer);
    elements.dragDropShield?.classList.remove('is-active');
  };

  const resetDragDropShield = () => {
    dragDropDepth = 0;
    hideDragDropShield();
  };

  const deferHideDragDropShield = () => {
    window.clearTimeout(dragLeaveTimer);
    dragLeaveTimer = window.setTimeout(() => {
      if (dragDropDepth <= 0) hideDragDropShield();
    }, 90);
  };

  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadFile = (fileName) => {
    const file = state.files.find((candidate) => candidate.name === fileName);
    if (!file) return;
    const blob = new Blob([getFileBytes(file)], { type: file.mime || getMimeType(file.name) });
    triggerDownload(blob, file.name.split('/').pop());
    showToast(`فایل ${file.name.split('/').pop()} دانلود شد.`);
  };

  const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      crc ^= bytes[index];
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const writeUint16 = (view, offset, value) => view.setUint16(offset, value & 0xffff, true);
  const writeUint32 = (view, offset, value) => view.setUint32(offset, value >>> 0, true);

  const dosDateTime = (date = new Date()) => {
    const year = Math.max(1980, date.getFullYear());
    const dateValue = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    const timeValue = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    return { date: dateValue, time: timeValue };
  };

  const concatBytes = (chunks) => {
    const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    chunks.forEach((chunk) => {
      result.set(chunk, offset);
      offset += chunk.length;
    });
    return result;
  };

  const compressForZip = async (bytes) => {
    if (typeof CompressionStream !== 'function' || !bytes.length) {
      return { method: 0, data: bytes };
    }

    try {
      const compressedStream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      const compressed = new Uint8Array(await new Response(compressedStream).arrayBuffer());
      return compressed.length < bytes.length
        ? { method: 8, data: compressed }
        : { method: 0, data: bytes };
    } catch {
      return { method: 0, data: bytes };
    }
  };

  const buildZipArchive = async (sourceFiles, extraFolders = []) => {
    const encoder = new TextEncoder();
    const encoderEntries = [];
    const paths = new Set();

    extraFolders
      .map((folder) => `${cleanRelativePath(folder).replace(/\/+$/, '')}/`)
      .filter((folder) => folder !== '/')
      .forEach((folder) => paths.add(folder));

    sourceFiles
      .map((file) => ({ ...file, name: cleanRelativePath(file.name) }))
      .filter((file) => file.name)
      .sort((a, b) => a.name.localeCompare(b.name, 'en'))
      .forEach((file) => {
        const segments = file.name.split('/');
        for (let index = 1; index < segments.length; index += 1) paths.add(`${segments.slice(0, index).join('/')}/`);
      });

    const archiveFiles = [
      ...[...paths].sort().map((name) => ({ name, content: '', isDirectory: true })),
      ...sourceFiles
        .map((file) => ({ name: cleanRelativePath(file.name), file, isDirectory: false }))
        .filter((file) => file.name)
        .sort((a, b) => a.name.localeCompare(b.name, 'en'))
    ];

    for (const file of archiveFiles) {
      const nameBytes = encoder.encode(file.name);
      const rawBytes = file.isDirectory ? new Uint8Array() : getFileBytes(file.file);
      const packed = file.isDirectory ? { method: 0, data: rawBytes } : await compressForZip(rawBytes);
      encoderEntries.push({
        nameBytes,
        rawBytes,
        compressedBytes: packed.data,
        method: packed.method,
        crc: crc32(rawBytes),
        isDirectory: file.isDirectory
      });
    }

    const localChunks = [];
    const centralChunks = [];
    const timestamp = dosDateTime();
    let offset = 0;

    encoderEntries.forEach((entry) => {
      const localHeader = new Uint8Array(30 + entry.nameBytes.length);
      const localView = new DataView(localHeader.buffer);
      writeUint32(localView, 0, 0x04034b50);
      writeUint16(localView, 4, 20);
      writeUint16(localView, 6, 0x0800);
      writeUint16(localView, 8, entry.method);
      writeUint16(localView, 10, timestamp.time);
      writeUint16(localView, 12, timestamp.date);
      writeUint32(localView, 14, entry.crc);
      writeUint32(localView, 18, entry.compressedBytes.length);
      writeUint32(localView, 22, entry.rawBytes.length);
      writeUint16(localView, 26, entry.nameBytes.length);
      writeUint16(localView, 28, 0);
      localHeader.set(entry.nameBytes, 30);
      localChunks.push(localHeader, entry.compressedBytes);

      const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
      const centralView = new DataView(centralHeader.buffer);
      writeUint32(centralView, 0, 0x02014b50);
      writeUint16(centralView, 4, 0x0314);
      writeUint16(centralView, 6, 20);
      writeUint16(centralView, 8, 0x0800);
      writeUint16(centralView, 10, entry.method);
      writeUint16(centralView, 12, timestamp.time);
      writeUint16(centralView, 14, timestamp.date);
      writeUint32(centralView, 16, entry.crc);
      writeUint32(centralView, 20, entry.compressedBytes.length);
      writeUint32(centralView, 24, entry.rawBytes.length);
      writeUint16(centralView, 28, entry.nameBytes.length);
      writeUint16(centralView, 30, 0);
      writeUint16(centralView, 32, 0);
      writeUint16(centralView, 34, 0);
      writeUint16(centralView, 36, 0);
      writeUint32(centralView, 38, entry.isDirectory ? 0x10 : 0);
      writeUint32(centralView, 42, offset);
      centralHeader.set(entry.nameBytes, 46);
      centralChunks.push(centralHeader);

      offset += localHeader.length + entry.compressedBytes.length;
    });

    const centralDirectory = concatBytes(centralChunks);
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    writeUint32(endView, 0, 0x06054b50);
    writeUint16(endView, 4, 0);
    writeUint16(endView, 6, 0);
    writeUint16(endView, 8, encoderEntries.length);
    writeUint16(endView, 10, encoderEntries.length);
    writeUint32(endView, 12, centralDirectory.length);
    writeUint32(endView, 16, offset);
    writeUint16(endView, 20, 0);

    return new Blob([...localChunks, centralDirectory, endRecord], { type: 'application/zip' });
  };

  const downloadProjectZip = async ({ silent = false } = {}) => {
    if (!files.length) {
      if (!silent) showToast('پروژه‌ای برای دانلود وجود ندارد.');
      return false;
    }

    try {
      const zipBlob = await buildZipArchive(files, getAllFolders());
      triggerDownload(zipBlob, `${safeArchiveName(projectName)}.zip`);
      if (!silent) showToast('ZIP پروژه دانلود شد.');
      return true;
    } catch (error) {
      console.error('Could not create project zip:', error);
      showToast('ساخت ZIP پروژه ناموفق بود.');
      return false;
    }
  };

  class GitHubApiError extends Error {
    constructor(message, status = 0, payload = null) {
      super(message);
      this.name = 'GitHubApiError';
      this.status = status;
      this.payload = payload;
    }
  }

  const setGitHubStatus = (message = '', type = '') => {
    if (!elements.githubStatus) return;
    elements.githubStatus.textContent = message;
    elements.githubStatus.hidden = !message;
    elements.githubStatus.classList.toggle('is-error', type === 'error');
    elements.githubStatus.classList.toggle('is-success', type === 'success');
  };

  const setGitHubPrLink = (url = '', label = '') => {
    if (!elements.githubPrLink) return;
    const visible = Boolean(url);
    elements.githubPrLink.hidden = !visible;
    elements.githubPrLink.href = url || '#';
    elements.githubPrLink.textContent = label || '';
  };

  const setGitHubSyncing = (isSyncing) => {
    isGitHubSyncing = isSyncing;
    elements.githubSubmitBtn.disabled = isSyncing;
    elements.githubVerifyBtn.disabled = isSyncing;
    elements.githubCancelBtn.disabled = isSyncing;
    elements.githubSubmitBtn.textContent = isSyncing
      ? 'در حال ارسال به GitHub…'
      : 'ساخت برنچ، Commit و Pull Request';
  };

  const normalizeGitHubBranch = (value) => String(value || '')
    .trim()
    .replace(/^refs\/heads\//i, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

  const validateGitHubBranch = (value, label) => {
    const branch = normalizeGitHubBranch(value);
    if (!branch) throw new Error(`${label} را وارد کن.`);
    if (
      branch === '@'
      || branch.includes('..')
      || branch.includes('@{')
      || branch.endsWith('.')
      || branch.endsWith('/')
      || /[~^:?*\\[\s]/.test(branch)
    ) {
      throw new Error(`${label} معتبر نیست.`);
    }
    return branch;
  };

  const createSuggestedBranchName = () => {
    const stamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, '')
      .toLowerCase();
    return `live-web-studio/${stamp}`;
  };

  const parseGitHubRepository = (value) => {
    let raw = String(value || '').trim();
    if (!raw) throw new Error('نام یا لینک ریپوی GitHub را وارد کن.');

    raw = raw
      .replace(/^git@github\.com:/i, '')
      .replace(/^ssh:\/\/git@github\.com\//i, '')
      .replace(/^https?:\/\/(?:www\.)?github\.com\//i, '')
      .replace(/^github\.com\//i, '')
      .replace(/[?#].*$/, '')
      .replace(/\/+$/, '')
      .replace(/\.git$/i, '');

    const parts = raw.split('/').filter(Boolean);
    if (parts.length < 2) {
      throw new Error('ریپو را به‌شکل owner/repository یا لینک کامل GitHub وارد کن.');
    }

    const [owner, repo] = parts;
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
      throw new Error('نام owner یا repository معتبر نیست.');
    }

    // لینک https://github.com/owner/repo/tree/branch نیز پذیرفته می‌شود.
    const treeRefHint = parts[2] === 'tree' && parts.length >= 4
      ? parts.slice(3).join('/')
      : '';
    return { owner, repo, fullName: `${owner}/${repo}`, treeRefHint };
  };

  const setGitHubPanelStatus = (message = '', type = '') => {
    if (!elements.githubPanelStatus) return;
    const fallback = githubSession.repository
      ? `آماده برای ${githubSession.repository}${githubSession.defaultBranch ? ` (${githubSession.defaultBranch})` : ''}`
      : 'تنظیم نشده';
    const isReady = type === 'success' || (!type && Boolean(githubSession.repository));
    const isError = type === 'error' || (!type && !githubSession.repository);
    elements.githubPanelStatus.textContent = message || fallback;
    elements.githubPanelStatus.classList.toggle('is-ready', isReady);
    elements.githubPanelStatus.classList.toggle('is-error', isError);
    [elements.githubPanelOpenBtn, elements.githubPanelSaveBtn].forEach((button) => {
      if (!button) return;
      button.classList.add('github-panel-state');
      button.classList.toggle('is-ready', isReady);
      button.classList.toggle('is-error', isError);
    });
  };

  const fillGitHubFormsFromSession = () => {
    if (!githubSession.repository) return;
    elements.githubImportRepository.value = githubSession.repository;
    elements.githubRepository.value = githubSession.repository;
    elements.githubToken.value = '';
    elements.githubImportToken.value = '';
    if (githubSession.defaultBranch) {
      elements.githubImportRef.value = githubSession.defaultBranch;
      elements.githubBaseBranch.value = githubSession.defaultBranch;
    }
  };

  const applyGitHubPanelSettings = ({ silent = false } = {}) => {
    const rawRepository = String(elements.githubPanelRepository?.value || '').trim();
    const rawRef = normalizeGitHubBranch(elements.githubPanelRef?.value || '');
    const rawToken = String(elements.githubPanelToken?.value || '').trim();

    if (!rawRepository && !rawRef && !rawToken && !githubSession.repository) {
      if (!silent) setGitHubPanelStatus('حداقل ریپو یا توکن را وارد کن.', 'error');
      return false;
    }

    if (rawRepository) {
      try {
        const repository = parseGitHubRepository(rawRepository);
        githubSession.repository = repository.fullName;
        githubSession.owner = repository.owner;
        githubSession.repo = repository.repo;
        elements.githubPanelRepository.value = repository.fullName;
      } catch (error) {
        if (!silent) setGitHubPanelStatus(getGitHubErrorMessage(error), 'error');
        return false;
      }
    }

    if (rawRef) {
      githubSession.defaultBranch = rawRef;
      elements.githubPanelRef.value = rawRef;
    }
    if (rawToken) {
      githubSession.token = rawToken;
      elements.githubPanelToken.value = '';
    }

    fillGitHubFormsFromSession();
    setGitHubPanelStatus(silent ? '' : 'تنظیمات GitHub برای دریافت ریپو و Pull Request آماده شد.', 'success');
    return true;
  };

  const requireGitHubHeaderRepository = () => {
    applyGitHubPanelSettings({ silent: true });
    if (githubSession.repository) return true;
    const message = 'اول ریپو را در پنل GitHub هدر وارد و ذخیره کن.';
    setGitHubPanelStatus(message, 'error');
    showToast(message);
    openGitHubPanelDialog();
    elements.githubPanelRepository?.focus();
    return false;
  };

  const requireGitHubHeaderPublishSettings = () => {
    if (!requireGitHubHeaderRepository()) return false;
    if (githubSession.token) return true;
    const message = 'برای ساخت Pull Request، توکن را در پنل GitHub هدر وارد و ذخیره کن.';
    setGitHubPanelStatus(message, 'error');
    showToast(message);
    openGitHubPanelDialog();
    elements.githubPanelToken?.focus();
    return false;
  };

  const openGitHubPanelDialog = () => {
    setGitHubPanelStatus();
    if (elements.githubPanelDialog.open) return;
    if (typeof elements.githubPanelDialog.showModal === 'function') {
      elements.githubPanelDialog.showModal();
    } else {
      elements.githubPanelDialog.setAttribute('open', '');
    }
  };

  const closeGitHubPanelDialog = () => {
    if (elements.githubPanelDialog.open) elements.githubPanelDialog.close();
  };

  const githubPath = (owner, repo, path = '') => `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}${path}`;

  const encodeGitRefPath = (branch) => branch
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');

  const githubRequest = async (path, { method = 'GET', token, body } = {}) => {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    const normalizedToken = String(token || '').trim();
    if (normalizedToken) headers.Authorization = `Bearer ${normalizedToken}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    let response;
    try {
      response = await fetch(`${GITHUB_API_BASE}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch (error) {
      throw new GitHubApiError('اتصال به API گیت‌هاب برقرار نشد. اینترنت یا فیلترشکن را بررسی کن.');
    }

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const details = Array.isArray(payload?.errors)
        ? payload.errors
          .map((item) => item.message || item.code || item.resource)
          .filter(Boolean)
          .join(' · ')
        : '';
      const message = details || payload?.message || `خطای GitHub (${response.status})`;
      throw new GitHubApiError(message, response.status, payload);
    }

    return payload;
  };

  const getGitHubRef = async (owner, repo, branch, token) => githubRequest(
    githubPath(owner, repo, `/git/ref/heads/${encodeGitRefPath(branch)}`),
    { token }
  );

  const tryGetGitHubRef = async (owner, repo, branch, token) => {
    try {
      return await getGitHubRef(owner, repo, branch, token);
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) return null;
      throw error;
    }
  };

  const findOpenPullRequest = async (owner, repo, headBranch, baseBranch, token) => {
    const params = new URLSearchParams({
      state: 'open',
      head: `${owner}:${headBranch}`,
      base: baseBranch,
      per_page: '1'
    });
    const pullRequests = await githubRequest(
      githubPath(owner, repo, `/pulls?${params.toString()}`),
      { token }
    );
    return Array.isArray(pullRequests) && pullRequests.length ? pullRequests[0] : null;
  };

  const getGitHubErrorMessage = (error) => {
    const message = error?.message || 'خطای ناشناخته در ارتباط با GitHub رخ داد.';
    if (error instanceof GitHubApiError) {
      if (error.status === 401) return 'توکن GitHub درست نیست یا منقضی شده است.';
      if (error.status === 403) return 'دسترسی توکن کافی نیست یا GitHub درخواست را محدود کرده است. برای دریافت پروژه Contents: Read و برای Pull Request، Contents و Pull requests: Read and write لازم است.';
      if (error.status === 404) return 'ریپو پیدا نشد یا این توکن به آن دسترسی ندارد. در ساخت توکن، Resource owner و Repository access را بررسی کن.';
      if (error.status === 409) return 'هم‌زمان روی این برنچ تغییر دیگری ثبت شده است. دوباره تلاش کن.';
      if (error.status === 422) return `GitHub این درخواست را نپذیرفت: ${message}`;
    }
    return message;
  };

  const verifyGitHubTarget = async (owner, repo, token) => {
    const user = await githubRequest('/user', { token });
    try {
      const repository = await githubRequest(githubPath(owner, repo), { token });
      return { user, repository };
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        throw new Error(`توکن برای @${user.login || 'GitHub user'} معتبر است، اما به ${owner}/${repo} دسترسی ندارد. توکن را دوباره بساز: Resource owner = ${owner}، Repository access = Only select repositories → ${repo}، سپس Contents و Pull requests را روی Read and write بگذار.`);
      }
      throw error;
    }
  };


  const setGitHubImportStatus = (message = '', type = '') => {
    if (!elements.githubImportStatus) return;
    elements.githubImportStatus.textContent = message;
    elements.githubImportStatus.hidden = !message;
    elements.githubImportStatus.classList.toggle('is-error', type === 'error');
    elements.githubImportStatus.classList.toggle('is-success', type === 'success');
  };

  const setGitHubImporting = (isImporting) => {
    isGitHubImporting = isImporting;
    elements.githubImportSubmitBtn.disabled = isImporting;
    elements.githubImportCancelBtn.disabled = isImporting;
    elements.githubImportSubmitBtn.textContent = isImporting
      ? 'در حال دریافت فایل‌ها…'
      : 'دریافت و باز کردن پروژه';
  };

  const isExcludedFromGitHubImport = (path) => {
    const normalized = cleanRelativePath(path).toLowerCase();
    return !normalized
      || /(^|\/)\.git(?:\/|$)/.test(normalized)
      || /(^|\/)node_modules(?:\/|$)/.test(normalized)
      || /(^|\/)(?:thumbs\.db|\.ds_store)$/.test(normalized);
  };

  const getGitHubTree = async (owner, repo, treeRef, token, recursive = false) => {
    const query = recursive ? '?recursive=1' : '';
    return githubRequest(
      githubPath(owner, repo, `/git/trees/${encodeGitRefPath(treeRef)}${query}`),
      { token }
    );
  };

  const getGitHubBlob = async (owner, repo, sha, token) => githubRequest(
    githubPath(owner, repo, `/git/blobs/${encodeURIComponent(sha)}`),
    { token }
  );

  const readGitHubTreeEntries = async (owner, repo, treeRef, token) => {
    const recursiveTree = await getGitHubTree(owner, repo, treeRef, token, true);
    if (!recursiveTree.truncated) return recursiveTree.tree || [];

    // GitHub برای درخواست recursive سقف تعداد/حجم دارد. در آن حالت پوشه‌ها را
    // جداگانه می‌خوانیم تا پروژه‌های بزرگ نیز ناقص وارد نشوند.
    const entries = [];
    const walk = async (sha, parentPath = '') => {
      const tree = await getGitHubTree(owner, repo, sha, token, false);
      for (const entry of tree.tree || []) {
        const path = cleanRelativePath(`${parentPath}/${entry.path || ''}`);
        if (!path || isExcludedFromGitHubImport(path)) continue;
        if (entry.type === 'tree') {
          await walk(entry.sha, path);
        } else if (entry.type === 'blob') {
          entries.push({ ...entry, path });
        }
      }
    };

    await walk(treeRef);
    return entries;
  };

  const mapWithConcurrency = async (items, concurrency, iteratee) => {
    const results = new Array(items.length);
    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, async () => {
      while (true) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        if (currentIndex >= items.length) return;
        results[currentIndex] = await iteratee(items[currentIndex], currentIndex);
      }
    });
    await Promise.all(workers);
    return results;
  };

  const createProjectFileFromGitHubBlob = (entry, blob) => {
    const name = cleanRelativePath(entry.path);
    const type = getType(name);
    const mime = getMimeType(name);
    const bytes = base64ToBytes(blob.content || '');
    const shouldReadAsText = isEditableType(type);

    if (shouldReadAsText) {
      return { name, type, mime, isBinary: false, content: decodeUtf8(bytes) };
    }

    return {
      name,
      type,
      mime,
      isBinary: true,
      bytes,
      dataUrl: `data:${mime};base64,${bytesToBase64(bytes)}`
    };
  };

  const getGitHubRepositoryForImport = async (owner, repo, token) => {
    const normalizedToken = String(token || '').trim();
    let user = null;
    if (normalizedToken) user = await githubRequest('/user', { token: normalizedToken });

    try {
      const repository = await githubRequest(githubPath(owner, repo), { token: normalizedToken });
      return { repository, user };
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        if (normalizedToken && user?.login) {
          throw new Error(`توکن برای @${user.login} معتبر است، اما به ${owner}/${repo} دسترسی ندارد. برای ریپوی Private، همین ریپو باید در توکن انتخاب شده باشد و Contents حداقل روی Read-only باشد.`);
        }
        throw new Error('ریپو پیدا نشد. اگر Private است، توکن Fine-grained با دسترسی Contents را وارد کن.');
      }
      throw error;
    }
  };

  const downloadProjectFromGitHub = async ({ owner, repo, requestedRef, token }) => {
    setGitHubImportStatus('در حال بررسی ریپو و برنچ…');
    const { repository, user } = await getGitHubRepositoryForImport(owner, repo, token);
    const resolvedRef = validateGitHubBranch(requestedRef || repository.default_branch, 'برنچ / Tag / Commit');

    setGitHubImportStatus(`در حال دریافت فهرست فایل‌های ${repository.full_name} از ${resolvedRef}…`);
    const rawTreeEntries = await readGitHubTreeEntries(owner, repo, resolvedRef, token);
    const entries = rawTreeEntries
      .filter((entry) => entry.type === 'blob' && entry.path && !isExcludedFromGitHubImport(entry.path))
      .sort((a, b) => a.path.localeCompare(b.path, 'en'));

    if (!entries.length) throw new Error('فایلی برای دریافت در این برنچ پیدا نشد.');

    const projectFiles = await mapWithConcurrency(entries, 6, async (entry, index) => {
      setGitHubImportStatus(`در حال دریافت ${index + 1} از ${entries.length}: ${entry.path}`);
      const blob = await getGitHubBlob(owner, repo, entry.sha, token);
      return createProjectFileFromGitHubBlob(entry, blob);
    });

    return {
      projectFiles,
      repository,
      user,
      resolvedRef,
      entryCount: entries.length
    };
  };

  const openGitHubImportDialog = () => {
    if (!requireGitHubHeaderRepository()) return;
    if (githubSession.repository && !elements.githubImportRepository.value.trim()) {
      elements.githubImportRepository.value = githubSession.repository;
    }
    if (githubSession.defaultBranch && !elements.githubImportRef.value.trim()) {
      elements.githubImportRef.value = githubSession.defaultBranch;
    }
    setGitHubImportStatus();
    if (typeof elements.githubImportDialog.showModal === 'function') {
      elements.githubImportDialog.showModal();
    } else {
      elements.githubImportDialog.setAttribute('open', '');
    }
  };

  const importProjectFromGitHub = async () => {
    if (isGitHubImporting) return;
    if (!elements.githubImportForm.reportValidity()) return;

    let repository;
    try {
      repository = parseGitHubRepository(elements.githubImportRepository.value);
    } catch (error) {
      setGitHubImportStatus(getGitHubErrorMessage(error), 'error');
      return;
    }

    const token = String(elements.githubImportToken.value || '').trim() || githubSession.token;
    const requestedRef = normalizeGitHubBranch(elements.githubImportRef.value || repository.treeRefHint);

    // قبل از شروع دانلود حجیم، امکان دانلود ZIP پروژه‌ی فعلی یا لغو جایگزینی داده می‌شود.
    if (!await ensureCanReplaceProject()) return;

    setGitHubImporting(true);
    setGitHubImportStatus('در حال اتصال به GitHub…');
    try {
      const result = await downloadProjectFromGitHub({
        owner: repository.owner,
        repo: repository.repo,
        requestedRef,
        token
      });

      activateProject(result.projectFiles, {
        projectName: result.repository.name || repository.repo,
        openedByUser: true,
        preferredActiveName: getHtmlFile(result.projectFiles)?.name
      });
      githubSession.token = token;
      githubSession.repository = repository.fullName;
      githubSession.owner = repository.owner;
      githubSession.repo = repository.repo;
      githubSession.defaultBranch = result.repository.default_branch || result.resolvedRef;
      elements.githubImportToken.value = '';
      elements.githubImportRef.value = result.resolvedRef;
      elements.githubRepository.value = repository.fullName;
      elements.githubBaseBranch.value = result.repository.default_branch || result.resolvedRef;
      elements.githubPanelRepository.value = repository.fullName;
      elements.githubPanelRef.value = githubSession.defaultBranch;
      setGitHubPanelStatus('', 'success');
      setGitHubImportStatus(`${result.entryCount} فایل از ${result.repository.full_name} (${result.resolvedRef}) وارد شد.`, 'success');
      showToast(`${result.entryCount} فایل از GitHub باز شد.`);

      window.setTimeout(() => {
        if (elements.githubImportDialog.open) elements.githubImportDialog.close();
      }, 650);
    } catch (error) {
      console.error('GitHub import failed:', error);
      setGitHubImportStatus(getGitHubErrorMessage(error), 'error');
    } finally {
      setGitHubImporting(false);
    }
  };

  const buildProjectTree = async (owner, repo, token) => {
    const entries = [];
    for (const file of files) {
      const path = cleanRelativePath(file.name);
      if (!path) continue;
      if (file.isBinary) {
        setGitHubStatus(`در حال آماده‌سازی فایل باینری: ${path}`);
        const blob = await githubRequest(githubPath(owner, repo, '/git/blobs'), {
          method: 'POST',
          token,
          body: {
            content: bytesToBase64(getFileBytes(file)),
            encoding: 'base64'
          }
        });
        entries.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
      } else {
        entries.push({
          path,
          mode: '100644',
          type: 'blob',
          content: String(file.content ?? '')
        });
      }
    }
    return entries;
  };

  const publishProjectToGitHub = async (options) => {
    const {
      token,
      owner,
      repo,
      baseBranch,
      headBranch,
      commitMessage,
      prTitle,
      prBody,
      draft
    } = options;

    setGitHubStatus('در حال بررسی ریپو و برنچ مقصد…');
    const { repository } = await verifyGitHubTarget(owner, repo, token);
    if (repository?.archived) throw new Error('این ریپو Archive شده است و نمی‌توان روی آن Commit ساخت.');

    const resolvedBaseBranch = validateGitHubBranch(baseBranch || repository?.default_branch, 'برنچ مقصد');
    if (headBranch === resolvedBaseBranch) {
      throw new Error('برنچ تغییرات باید با برنچ مقصد متفاوت باشد تا Pull Request ساخته شود.');
    }

    const baseRef = await getGitHubRef(owner, repo, resolvedBaseBranch, token);
    let headRef = await tryGetGitHubRef(owner, repo, headBranch, token);
    let headCommitSha = headRef?.object?.sha;
    let createdBranch = false;

    if (!headCommitSha) {
      setGitHubStatus('در حال ساخت برنچ جدید…');
      await githubRequest(githubPath(owner, repo, '/git/refs'), {
        method: 'POST',
        token,
        body: {
          ref: `refs/heads/${headBranch}`,
          sha: baseRef.object.sha
        }
      });
      headCommitSha = baseRef.object.sha;
      createdBranch = true;
    }

    setGitHubStatus('در حال آماده‌سازی فایل‌ها و ساخت Commit…');
    const parentCommit = await githubRequest(
      githubPath(owner, repo, `/git/commits/${encodeURIComponent(headCommitSha)}`),
      { token }
    );
    const treeEntries = await buildProjectTree(owner, repo, token);
    if (!treeEntries.length) throw new Error('فایلی برای ارسال به GitHub وجود ندارد.');

    const createdTree = await githubRequest(githubPath(owner, repo, '/git/trees'), {
      method: 'POST',
      token,
      body: {
        base_tree: parentCommit.tree.sha,
        tree: treeEntries
      }
    });

    if (createdTree.sha === parentCommit.tree.sha) {
      const existingPr = await findOpenPullRequest(owner, repo, headBranch, resolvedBaseBranch, token);
      return {
        type: 'unchanged',
        createdBranch,
        baseBranch: resolvedBaseBranch,
        headBranch,
        pullRequest: existingPr
      };
    }

    const createdCommit = await githubRequest(githubPath(owner, repo, '/git/commits'), {
      method: 'POST',
      token,
      body: {
        message: commitMessage,
        tree: createdTree.sha,
        parents: [headCommitSha]
      }
    });

    setGitHubStatus('در حال اعمال Commit روی برنچ تغییرات…');
    await githubRequest(
      githubPath(owner, repo, `/git/refs/heads/${encodeGitRefPath(headBranch)}`),
      {
        method: 'PATCH',
        token,
        body: {
          sha: createdCommit.sha,
          force: false
        }
      }
    );

    setGitHubStatus('در حال ساخت یا پیدا کردن Pull Request…');
    let pullRequest = await findOpenPullRequest(owner, repo, headBranch, resolvedBaseBranch, token);
    let pullRequestWasCreated = false;

    if (!pullRequest) {
      pullRequest = await githubRequest(githubPath(owner, repo, '/pulls'), {
        method: 'POST',
        token,
        body: {
          title: prTitle,
          head: headBranch,
          base: resolvedBaseBranch,
          body: prBody || `Created from Live Web Studio.\n\nFiles submitted: ${treeEntries.length}.`,
          draft: Boolean(draft)
        }
      });
      pullRequestWasCreated = true;
    }

    return {
      type: 'synced',
      createdBranch,
      baseBranch: resolvedBaseBranch,
      headBranch,
      commitSha: createdCommit.sha,
      pullRequest,
      pullRequestWasCreated
    };
  };

  const checkGitHubConnection = async () => {
    const token = String(elements.githubToken.value || '').trim() || githubSession.token;
    if (!token) {
      setGitHubStatus('اول توکن Fine-grained را وارد کن.', 'error');
      elements.githubToken.focus();
      return;
    }

    let repository;
    try {
      repository = parseGitHubRepository(elements.githubRepository.value);
    } catch (error) {
      setGitHubStatus(getGitHubErrorMessage(error), 'error');
      return;
    }

    elements.githubVerifyBtn.disabled = true;
    setGitHubStatus('در حال بررسی توکن و دسترسی ریپو…');
    setGitHubPrLink();
    try {
      const result = await verifyGitHubTarget(repository.owner, repository.repo, token);
      elements.githubBaseBranch.value = elements.githubBaseBranch.value.trim() || result.repository.default_branch || '';
      setGitHubStatus(`اتصال برقرار است: @${result.user.login} به ${result.repository.full_name} دسترسی دارد. برنچ پیش‌فرض: ${result.repository.default_branch}.`, 'success');
    } catch (error) {
      setGitHubStatus(getGitHubErrorMessage(error), 'error');
    } finally {
      elements.githubVerifyBtn.disabled = false;
    }
  };

  const openGitHubDialog = () => {
    if (!files.length) {
      showToast('اول یک پروژه وارد کن.');
      return;
    }

    if (!requireGitHubHeaderPublishSettings()) return;
    if (githubSession.repository && !elements.githubRepository.value.trim()) {
      elements.githubRepository.value = githubSession.repository;
    }
    if (githubSession.defaultBranch && !elements.githubBaseBranch.value.trim()) {
      elements.githubBaseBranch.value = githubSession.defaultBranch;
    }
    if (!elements.githubHeadBranch.value.trim()) {
      elements.githubHeadBranch.value = createSuggestedBranchName();
    }
    if (!elements.githubCommitMessage.value.trim()) {
      elements.githubCommitMessage.value = `Update ${projectName} from Live Web Studio`;
    }
    if (!elements.githubPrTitle.value.trim()) {
      elements.githubPrTitle.value = `Update ${projectName}`;
    }

    setGitHubStatus();
    setGitHubPrLink();
    if (typeof elements.githubDialog.showModal === 'function') {
      elements.githubDialog.showModal();
    } else {
      elements.githubDialog.setAttribute('open', '');
    }
  };

  const syncProjectToGitHub = async () => {
    if (isGitHubSyncing) return;

    if (!elements.githubForm.reportValidity()) return;

    const token = String(elements.githubToken.value || '').trim() || githubSession.token;
    if (!token) {
      setGitHubStatus('توکن Fine-grained GitHub را وارد کن. این توکن فقط در حافظه‌ی همین تب نگه داشته می‌شود.', 'error');
      elements.githubToken.focus();
      return;
    }

    let repository;
    let baseBranch;
    let headBranch;
    let commitMessage;
    let prTitle;
    try {
      repository = parseGitHubRepository(elements.githubRepository.value);
      baseBranch = normalizeGitHubBranch(elements.githubBaseBranch.value);
      headBranch = validateGitHubBranch(elements.githubHeadBranch.value, 'برنچ تغییرات');
      commitMessage = String(elements.githubCommitMessage.value || '').trim();
      prTitle = String(elements.githubPrTitle.value || '').trim();
      if (!commitMessage) throw new Error('پیام Commit را وارد کن.');
      if (!prTitle) throw new Error('عنوان Pull Request را وارد کن.');
    } catch (error) {
      setGitHubStatus(getGitHubErrorMessage(error), 'error');
      return;
    }

    setGitHubSyncing(true);
    setGitHubStatus('در حال اتصال امن به GitHub…');
    setGitHubPrLink();

    try {
      const result = await publishProjectToGitHub({
        token,
        owner: repository.owner,
        repo: repository.repo,
        baseBranch,
        headBranch,
        commitMessage,
        prTitle,
        prBody: String(elements.githubPrBody.value || '').trim(),
        draft: elements.githubDraft.checked
      });

      githubSession.token = token;
      githubSession.repository = repository.fullName;
      githubSession.owner = repository.owner;
      githubSession.repo = repository.repo;
      githubSession.defaultBranch = result.baseBranch;
      elements.githubToken.value = '';
      elements.githubBaseBranch.value = result.baseBranch;
      elements.githubPanelRepository.value = repository.fullName;
      elements.githubPanelRef.value = result.baseBranch;
      setGitHubPanelStatus('', 'success');
      projectHasEdits = false;

      if (result.type === 'unchanged') {
        const message = result.pullRequest
          ? 'فایل‌ها نسبت به برنچ تغییرات تفاوتی ندارند؛ Pull Request موجود بدون تغییر باقی ماند.'
          : 'فایل‌ها نسبت به برنچ تغییرات تفاوتی ندارند؛ Commit یا Pull Request جدیدی ساخته نشد.';
        setGitHubStatus(message, 'success');
        if (result.pullRequest?.html_url) {
          setGitHubPrLink(result.pullRequest.html_url, `باز کردن Pull Request #${result.pullRequest.number}`);
        }
        showToast('تغییر جدیدی برای ارسال وجود نداشت.');
        return;
      }

      const action = result.pullRequestWasCreated
        ? `Pull Request #${result.pullRequest.number} ساخته شد و تغییرات روی برنچ ${result.headBranch} اعمال شد.`
        : `Commit جدید روی برنچ ${result.headBranch} اعمال شد و Pull Request #${result.pullRequest.number} به‌روزرسانی شد.`;
      setGitHubStatus(action, 'success');
      setGitHubPrLink(result.pullRequest.html_url, `باز کردن Pull Request #${result.pullRequest.number}`);
      showToast(result.pullRequestWasCreated ? 'Pull Request ساخته شد.' : 'Pull Request به‌روزرسانی شد.');
    } catch (error) {
      console.error('GitHub sync failed:', error);
      setGitHubStatus(getGitHubErrorMessage(error), 'error');
    } finally {
      setGitHubSyncing(false);
    }
  };
  elements.input.addEventListener('change', async (event) => {
    await readUploadedFiles(event.target.files);
    event.target.value = '';
  });

  const closeUploadMenu = () => {
    if (!elements.uploadMenu) return;
    elements.uploadMenu.hidden = true;
    elements.uploadMenuBtn?.setAttribute('aria-expanded', 'false');
  };
  const positionUploadMenu = () => {
    if (!elements.uploadMenu || !elements.uploadMenuBtn || elements.uploadMenu.hidden) return;
    const rect = elements.uploadMenuBtn.getBoundingClientRect();
    const menuWidth = Math.min(260, Math.max(190, elements.uploadMenu.offsetWidth || 210));
    const x = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, rect.right - menuWidth));
    const y = Math.min(window.innerHeight - 10, rect.bottom + 8);
    elements.uploadMenu.style.setProperty('--upload-menu-left', `${Math.round(x)}px`);
    elements.uploadMenu.style.setProperty('--upload-menu-top', `${Math.round(y)}px`);
  };
  const toggleUploadMenu = () => {
    if (!elements.uploadMenu) return;
    const willOpen = elements.uploadMenu.hidden;
    elements.uploadMenu.hidden = !willOpen;
    elements.uploadMenuBtn?.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) window.requestAnimationFrame(positionUploadMenu);
  };

  elements.uploadMenuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleUploadMenu();
  });
  elements.uploadMenu.addEventListener('click', (event) => {
    const action = event.target.closest('[data-upload-action]')?.dataset.uploadAction;
    if (!action) return;
    closeUploadMenu();
    if (action === 'files') elements.input.click();
    if (action === 'folder') elements.folderInput.click();
  });

  elements.folderInput.addEventListener('change', async (event) => {
    await readUploadedFiles(event.target.files);
    event.target.value = '';
  });

  // پوشش نامرئی فقط هنگامی که یک فایل/فولدر در حال Drag است فعال می‌شود.
  // بنابراین افتادن روی iframe نمایشگر هم مثل GitHub به صفحه‌ی اصلی می‌رسد.
  document.addEventListener('dragenter', (event) => {
    event.preventDefault();
    dragDropDepth += 1;
    showDragDropShield();
  }, true);

  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    showDragDropShield();
  }, true);

  document.addEventListener('dragleave', (event) => {
    const leftWindow = event.clientX <= 0
      || event.clientY <= 0
      || event.clientX >= window.innerWidth
      || event.clientY >= window.innerHeight;
    if (leftWindow) {
      resetDragDropShield();
      return;
    }
    dragDropDepth = Math.max(0, dragDropDepth - 1);
    // اندکی تأخیر از پرش overlay موقع عبور بین المان‌ها جلوگیری می‌کند.
    deferHideDragDropShield();
  }, true);

  document.addEventListener('drop', async (event) => {
    const containsFiles = hasFilePayload(event.dataTransfer);
    resetDragDropShield();
    event.preventDefault();
    event.stopPropagation();
    if (!containsFiles) {
      showToast('برای وارد کردن پروژه، فایل یا پوشه را روی صفحه رها کن.');
      return;
    }

    if (isReadingDroppedProject) {
      showToast('در حال خواندن فایل‌های قبلی هستم؛ چند لحظه بعد دوباره رها کن.');
      return;
    }
    isReadingDroppedProject = true;

    try {
      showToast('در حال خواندن فایل‌ها و پوشه‌ها…');
      // قبل از هر await دیگر، محتویات DataTransfer خوانده می‌شود؛
      // بعضی مرورگرها بعد از پایان رویداد به پوشه دسترسی نمی‌دهند.
      const droppedFiles = await collectDroppedFiles(event.dataTransfer);
      if (!droppedFiles.length) {
        showToast('فایل قابل‌خواندنی از Drag & Drop دریافت نشد.');
        return;
      }
      await readProjectEntries(droppedFiles);
    } catch (error) {
      console.error('Could not read dropped project files:', error);
      showToast('خواندن فایل یا پوشه ناموفق بود.');
    } finally {
      isReadingDroppedProject = false;
      resetDragDropShield();
    }
  }, true);

  // در هر مسیر خروج، وضعیت overlay ریست می‌شود تا Drag & Drop بعدی گیر نکند.
  window.addEventListener('blur', resetDragDropShield);
  window.addEventListener('dragend', resetDragDropShield, true);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') resetDragDropShield();
  });

  document.addEventListener('pointerenter', (event) => {
    const target = event.target.closest?.('.has-tooltip[data-tooltip]');
    if (target) showGlobalTooltip(target);
  }, true);
  document.addEventListener('pointerleave', (event) => {
    const target = event.target.closest?.('.has-tooltip[data-tooltip]');
    if (target) hideGlobalTooltip(target);
  }, true);
  document.addEventListener('focusin', (event) => {
    const target = event.target.closest?.('.has-tooltip[data-tooltip]');
    if (target) showGlobalTooltip(target);
  });
  document.addEventListener('focusout', (event) => {
    const target = event.target.closest?.('.has-tooltip[data-tooltip]');
    if (target) hideGlobalTooltip(target);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideGlobalTooltip();
  });
  window.addEventListener('scroll', positionGlobalTooltip, true);
  window.addEventListener('resize', positionGlobalTooltip);

  elements.applyPreviewBtn.addEventListener('click', () => schedulePreview(true));
  elements.autoPreviewToggle.addEventListener('change', () => {
    autoPreview = elements.autoPreviewToggle.checked;
    setStatus(autoPreview ? 'اجرای زنده فعال شد' : 'اجرای زنده خاموش است؛ بروزرسانی را بزن.');
    if (autoPreview) schedulePreview(true);
  });
  elements.inspectToggleBtn.addEventListener('click', () => setInspectMode(!inspectMode));
  elements.debugBtn.addEventListener('click', () => runDiagnostics());
  window.addEventListener('sample-element-insert', (event) => insertBuiltSampleElement(event.detail || {}));
  elements.editorFullscreenBtn.addEventListener('click', toggleEditorFullscreen);
  elements.openPreviewBtn.addEventListener('click', openPreviewWindow);
  elements.downloadProjectBtn.addEventListener('click', () => downloadProjectZip());
  elements.githubPanelOpenBtn.addEventListener('click', openGitHubPanelDialog);
  elements.githubPanelCloseBtn.addEventListener('click', closeGitHubPanelDialog);
  elements.githubPanelSaveBtn.addEventListener('click', () => applyGitHubPanelSettings());
  setGitHubPanelStatus();
  [elements.githubPanelRepository, elements.githubPanelRef, elements.githubPanelToken].forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      applyGitHubPanelSettings();
    });
  });
  const closeCreateMenu = () => {
    if (!elements.createMenu) return;
    elements.createMenu.hidden = true;
    elements.addFileBtn?.setAttribute('aria-expanded', 'false');
  };
  const getLayoutPanelFromEvent = (event) => event.target.closest?.('[data-layout-panel]')?.dataset.layoutPanel || '';

  elements.layoutTemplateGrid?.addEventListener('click', (event) => {
    const choice = event.target.closest('[data-layout-template-choice]')?.dataset.layoutTemplateChoice;
    if (choice) setLayoutTemplate(choice);
  });

  elements.layoutPanelPalette?.addEventListener('click', (event) => {
    const panelId = getLayoutPanelFromEvent(event);
    if (!panelId) return;
    selectedLayoutPanel = selectedLayoutPanel === panelId ? '' : panelId;
    renderLayoutBuilder();
  });

  elements.layoutPanelPalette?.addEventListener('dragstart', (event) => {
    const panelId = getLayoutPanelFromEvent(event);
    if (!panelId) return;
    draggedLayoutPanel = panelId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', panelId);
  });

  elements.layoutBoard?.addEventListener('dragstart', (event) => {
    const panelId = getLayoutPanelFromEvent(event);
    if (!panelId) return;
    draggedLayoutPanel = panelId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', panelId);
  });

  elements.layoutBoard?.addEventListener('dragover', (event) => {
    const slot = event.target.closest('[data-layout-slot]');
    if (!slot) return;
    event.preventDefault();
    slot.classList.add('is-drop-target');
  });

  elements.layoutBoard?.addEventListener('dragleave', (event) => {
    event.target.closest('[data-layout-slot]')?.classList.remove('is-drop-target');
  });

  elements.layoutBoard?.addEventListener('drop', (event) => {
    const slot = event.target.closest('[data-layout-slot]');
    if (!slot) return;
    event.preventDefault();
    const panelId = event.dataTransfer.getData('text/plain') || draggedLayoutPanel;
    slot.classList.remove('is-drop-target');
    assignPanelToLayoutSlot(panelId, slot.dataset.layoutSlot);
    draggedLayoutPanel = '';
  });

  elements.layoutBoard?.addEventListener('dragend', () => {
    draggedLayoutPanel = '';
    elements.layoutBoard.querySelectorAll('.is-drop-target').forEach((slot) => slot.classList.remove('is-drop-target'));
  });

  elements.layoutBoard?.addEventListener('click', (event) => {
    const slot = event.target.closest('[data-layout-slot]');
    if (!slot) return;
    const panelId = getLayoutPanelFromEvent(event);
    if (selectedLayoutPanel) {
      assignPanelToLayoutSlot(selectedLayoutPanel, slot.dataset.layoutSlot);
      return;
    }
    if (panelId) {
      selectedLayoutPanel = panelId;
      renderLayoutBuilder();
    }
  });

  elements.layoutBoard?.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    const slot = event.target.closest('[data-layout-slot]');
    if (!slot) return;
    event.preventDefault();
    if (selectedLayoutPanel) assignPanelToLayoutSlot(selectedLayoutPanel, slot.dataset.layoutSlot);
  });

  elements.layoutEditorBtn?.addEventListener('click', openLayoutDialog);
  elements.layoutResetBtn?.addEventListener('click', () => {
    layoutConfig = {
      template: 'big-top',
      slots: { large: 'preview', smallA: 'files', smallB: 'editor', smallC: 'console' },
      horizontalScroll: false
    };
    clearSnapTrackSizes();
    selectedLayoutPanel = '';
    applyLayoutOrder();
    renderLayoutBuilder();
  });

  elements.layoutHorizontalScrollToggle?.addEventListener('change', () => {
    layoutConfig.horizontalScroll = Boolean(elements.layoutHorizontalScrollToggle.checked);
    syncHorizontalScrollState();
    persistLayoutConfig();
    window.requestAnimationFrame(positionSnapResizers);
  });

  elements.fileSelectionModeBtn?.addEventListener('click', () => setFileSelectionMode(!fileSelectionMode));

  elements.addFileBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = elements.createMenu.hidden;
    elements.createMenu.hidden = !willOpen;
    elements.addFileBtn.setAttribute('aria-expanded', String(willOpen));
  });
  elements.createMenu.addEventListener('click', (event) => {
    const action = event.target.closest('[data-create-action]')?.dataset.createAction;
    if (!action) return;
    closeCreateMenu();
    openFileDialog(action === 'folder' ? 'folder' : 'add');
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.file-create-menu-wrap')) closeCreateMenu();
    if (!event.target.closest('.upload-menu-wrap') && !event.target.closest('#uploadMenu')) closeUploadMenu();
  });
  window.addEventListener('resize', positionUploadMenu);
  window.addEventListener('scroll', positionUploadMenu, true);
  elements.clearConsoleBtn?.addEventListener('click', () => clearConsoleOutput());
  elements.moveSelectedBtn.addEventListener('click', moveSelectedFiles);
  elements.clearSelectionBtn.addEventListener('click', () => {
    selectedFileNames = new Set();
    renderFileNavigation();
  });
  elements.fileDialogCancelBtn.addEventListener('click', () => closeDialog(elements.fileDialog));
  elements.fileTypeSelect.addEventListener('change', applyCreationTypeExtension);
  elements.fileNameInput.addEventListener('input', syncCreationTypeFromName);
  elements.fileForm.addEventListener('submit', (event) => { event.preventDefault(); submitFileDialog(); });
  elements.extractSelectionBtn.addEventListener('click', openExtractDialog);
  elements.extractDialogCancelBtn.addEventListener('click', () => closeDialog(elements.extractDialog));
  elements.extractTypeSelect.addEventListener('change', updateExtractFileSuggestion);
  elements.extractForm.addEventListener('submit', (event) => { event.preventDefault(); submitExtractDialog(); });
  elements.inspectorBar.addEventListener('click', (event) => {
    const related = event.target.closest('[data-related-file]');
    if (related) { focusRelatedFile(related.dataset.relatedFile); return; }
    const builder = event.target.closest('[data-open-builder-from-selection]');
    if (builder && selectedPreviewElement) {
      window.dispatchEvent(new CustomEvent('sample-element-open-from-selection', { detail: selectedPreviewElement }));
      return;
    }
    const button = event.target.closest('[data-jump-source]');
    if (button) jumpToRelatedSource(button.dataset.jumpSource);
  });
  elements.githubImportBtn.addEventListener('click', openGitHubImportDialog);
  elements.githubImportCancelBtn.addEventListener('click', () => elements.githubImportDialog.close());
  elements.githubImportForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await importProjectFromGitHub();
  });
  elements.githubImportDialog.addEventListener('cancel', (event) => {
    if (isGitHubImporting) event.preventDefault();
  });
  elements.githubConnectBtn.addEventListener('click', openGitHubDialog);
  elements.githubVerifyBtn.addEventListener('click', checkGitHubConnection);
  elements.githubCancelBtn.addEventListener('click', () => elements.githubDialog.close());
  elements.githubForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await syncProjectToGitHub();
  });
  elements.githubDialog.addEventListener('cancel', (event) => {
    if (isGitHubSyncing) event.preventDefault();
  });

  elements.replaceCancelBtn.addEventListener('click', () => resolveReplacement('cancel'));
  elements.replaceWithoutDownloadBtn.addEventListener('click', () => resolveReplacement('replace'));
  elements.downloadAndReplaceBtn.addEventListener('click', () => resolveReplacement('download'));
  elements.replaceDialog.addEventListener('cancel', () => resolveReplacement('cancel'));
  elements.replaceDialog.addEventListener('close', () => {
    if (replacementResolver) resolveReplacement('cancel');
  });

  elements.fileList.addEventListener('click', (event) => {
    if (event.target.closest('[data-toggle-all-files]')) {
      event.preventDefault();
      event.stopPropagation();
      toggleAllFiles();
      return;
    }
    const fileSelect = event.target.closest('[data-file-select]');
    if (fileSelect) {
      const name = fileSelect.dataset.fileSelect;
      if (fileSelect.checked) selectedFileNames.add(name);
      else selectedFileNames.delete(name);
      renderFileNavigation();
      return;
    }
    const fileAction = event.target.closest('[data-file-action]');
    if (fileAction) {
      event.preventDefault();
      event.stopPropagation();
      const fileName = fileAction.dataset.fileName;
      if (!fileName) return;
      if (fileAction.dataset.fileAction === 'download') downloadFile(fileName);
      if (fileAction.dataset.fileAction === 'rename') openFileDialog('rename', fileName);
      if (fileAction.dataset.fileAction === 'clone') openFileDialog('clone', fileName);
      if (fileAction.dataset.fileAction === 'delete') deleteProjectFile(fileName);
      return;
    }
    const folderAction = event.target.closest('[data-folder-action]');
    if (folderAction) {
      event.preventDefault();
      event.stopPropagation();
      if (folderAction.dataset.folderAction === 'delete') deleteFolder(folderAction.dataset.folderName);
      return;
    }
    const folderToggle = event.target.closest('[data-folder-toggle]');
    if (folderToggle) {
      const folder = folderToggle.dataset.folderToggle;
      if (collapsedFolders.has(folder)) collapsedFolders.delete(folder);
      else collapsedFolders.add(folder);
      renderFileNavigation();
      return;
    }
    const button = event.target.closest('button[data-file]');
    if (button) setActiveFile(button.dataset.file);
  });

  elements.editorTabs.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-close-file]');
    if (closeButton) { closeEditorTab(closeButton.dataset.closeFile); return; }
    const button = event.target.closest('[data-file]');
    if (button) setActiveFile(button.dataset.file);
  });

  elements.codeEditor.addEventListener('input', () => {
    const file = getActiveFile();
    if (!file || file.isBinary || !isEditableType(file.type)) return;
    file.content = elements.codeEditor.value;
    projectHasEdits = true;
    selectedSourceLocation = null;
    if (relatedSourceMatches.has(file.name)) {
      relatedSourceMatches = new Map();
      relatedSourceLocations = new Map();
      renderRelatedSources();
      renderFileNavigation();
    }
    setDiagnosticsForFile(file.name, []);
    updateLineInfo();
    renderEditorDecorations();
    if (autoPreview) schedulePreview();
    else setStatus('تغییر ذخیره شد؛ برای اعمال روی بروزرسانی بزن.');
  });

  elements.codeEditor.addEventListener('scroll', syncEditorScroll);
  elements.codeEditor.addEventListener('keyup', () => { updateLineInfo(); renderEditorDecorations(); });
  elements.codeEditor.addEventListener('click', () => { updateLineInfo(); renderEditorDecorations(); });
  elements.codeEditor.addEventListener('select', () => { updateLineInfo(); renderEditorDecorations(); });
  elements.lineMarkers.addEventListener('click', (event) => {
    const marker = event.target.closest('[data-breakpoint-line]');
    if (marker) toggleBreakpointAtLine(Number(marker.dataset.breakpointLine));
  });

  elements.codeEditor.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const editor = elements.codeEditor;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText('  ', start, end, 'end');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  });

  elements.deviceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      elements.deviceButtons.forEach((item) => item.classList.toggle('active', item === button));
      const width = button.dataset.width;
      elements.previewFrame.style.maxWidth = width;
      elements.previewFrame.style.width = width;
    });
  });

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.source !== 'live-web-studio') return;
    if (data.kind === 'storage') {
      const entries = data.entries;
      if (entries && typeof entries === 'object' && !Array.isArray(entries)) {
        previewStorage = Object.assign(Object.create(null), entries);
      }
      return;
    }
    if (data.kind === 'ready') {
      setStatus('به‌روز شد');
      return;
    }
    if (data.kind === 'reload') {
      schedulePreview(true);
      return;
    }
    if (data.kind === 'console') {
      appendConsoleEntry(data.level || 'log', data.message || '', data);
      return;
    }
    if (data.kind === 'element-selected' && data.descriptor) {
      selectPreviewElement(data.descriptor);
      return;
    }
    if (data.kind === 'error') {
      const location = data.line ? ` (line ${data.line}${data.column ? `:${data.column}` : ''})` : '';
      const message = `${data.message || 'خطای نامشخص'}${location}`;
      appendConsoleEntry('error', message, data);
      elements.errorPanel.textContent = message;
      elements.errorPanel.hidden = false;
      setStatus('خطا در پیش‌نمایش', true);

      const rawFileName = String(data.fileName || '').replace(/^.*\//, '');
      const target = files.find((file) => file.name === data.fileName || file.name.endsWith(`/${rawFileName}`) || file.name === rawFileName);

      if (target && data.line) {
        const existing = diagnosticsFor(target.name).filter((entry) => entry.message !== message);
        existing.push({ line: data.line, column: data.column, message });
        setDiagnosticsForFile(target.name, existing);
        if (target.name !== activeFileName) renderFileNavigation();
        return;
      }

      // خطاهای inline در srcdoc شماره‌خطِ HTML نهایی را می‌دهند، نه فایل اصلی.
      // بنابراین بلافاصله لِینتر داخلی را اجرا می‌کنیم تا خط واقعی داخل فایل HTML/JS/CSS مارک شود.
      const found = runDiagnostics({ focusFirst: false });
      if (found && found.length) {
        const first = found[0];
        elements.errorPanel.textContent = `${message}\n${first.fileName}:${first.line} — ${first.message}`;
        const source = files.find((file) => file.name === first.fileName)?.content || '';
        const lines = source.split('\n');
        const start = lines.slice(0, Math.max(0, first.line - 1)).join('\n').length + (first.line > 1 ? 1 : 0);
        focusCodeLocation(first.fileName, start, Math.min(source.length, start + (lines[first.line - 1] || '').length));
      }
    }
  });

  setupPaneResizer(elements.previewResizer, 'preview');
  setupPaneResizer(elements.sidebarResizer, 'sidebar');
  if ('ResizeObserver' in window && elements.previewFrame?.parentElement) {
    new ResizeObserver(() => {
      syncPreviewFrameHeight();
      positionSnapResizers();
    }).observe(elements.previewFrame.parentElement);
  }
  if ('ResizeObserver' in window && elements.layoutStage) {
    new ResizeObserver(() => { syncHorizontalScrollState(); positionSnapResizers(); }).observe(elements.layoutStage);
  }
  window.addEventListener('resize', () => {
    syncPreviewFrameHeight();
    syncHorizontalScrollState();
    positionSnapResizers();
  });
  document.addEventListener('fullscreenchange', syncFullscreenButton);

  restoreLayoutConfig();
  applyLayoutOrder();
  activateProject(DEFAULT_FILES, {
    projectName: 'پروژه-نمونه',
    openedByUser: false,
    preferredActiveName: 'index.html'
  });
  window.requestAnimationFrame(syncPreviewFrameHeight);
})();
