import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, Check, CircleHelp, Clapperboard, Download, FileArchive, Film, Gauge, Grid2X2, Home, Link2, Menu, Play, Plus, Radio, RefreshCw, Search, Settings, ShieldCheck, Sparkles, UploadCloud, Wifi, WifiOff, X } from 'lucide-react';
import './styles.css';

const apps = [
  { id: 'stream', title: 'استریم باکس', subtitle: 'پخش همزمان با دانلود', icon: Clapperboard, color: 'violet', active: true },
  { id: 'empty-1', title: 'اپلیکیشن بعدی', subtitle: 'فضای آماده برای ایده شما', icon: Plus, color: 'blue' },
  { id: 'empty-2', title: 'اپلیکیشن بعدی', subtitle: 'فضای آماده برای ایده شما', icon: Plus, color: 'pink' },
  { id: 'empty-3', title: 'اپلیکیشن بعدی', subtitle: 'فضای آماده برای ایده شما', icon: Plus, color: 'green' },
];

function App() {
  const [page, setPage] = useState('home');
  const [query, setQuery] = useState('');
  const [uploadedApps, setUploadedApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const loadApps = async () => {
    try {
      const response = await fetch('/api/apps');
      if (response.ok) setUploadedApps((await response.json()).apps || []);
    } catch { /* The built-in apps remain available when the cloud endpoint is offline. */ }
  };
  useEffect(() => { loadApps(); }, []);
  const openUploaded = (app) => { setSelectedApp(app); setPage('uploaded'); };
  return <div className="shell">
    <Sidebar page={page} onNavigate={setPage} />
    <main>
      <header className="topbar">
        <button className="mobile-menu" aria-label="منو"><Menu /></button>
        <div className="search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو بین اپلیکیشن‌ها..."/></div>
        <div className="profile"><div><strong>کاربر مهمان</strong><span>فضای شخصی شما</span></div><div className="avatar">م</div></div>
      </header>
      {page === 'stream' ? <StreamBox onBack={() => setPage('home')} /> : page === 'uploaded' ? <HostedApp app={selectedApp} onBack={() => setPage('home')} /> : <Dashboard query={query} onOpen={setPage} uploadedApps={uploadedApps} onOpenUploaded={openUploaded} onUploaded={loadApps} />}
    </main>
  </div>;
}

function Sidebar({ page, onNavigate }) {
  return <aside>
    <div className="brand"><div className="brand-mark"><Grid2X2 size={20}/></div><div><b>جعبه ابزار</b><small>مرکز اپلیکیشن‌های من</small></div></div>
    <nav>
      <span className="nav-label">فضای کار</span>
      <button className={page === 'home' ? 'selected' : ''} onClick={() => onNavigate('home')}><Home/><span>خانه</span></button>
      <button className={page === 'stream' ? 'selected' : ''} onClick={() => onNavigate('stream')}><Clapperboard/><span>استریم باکس</span><i>۱</i></button>
      <span className="nav-label second">مدیریت</span>
      <button><Settings/><span>تنظیمات</span></button>
      <button><CircleHelp/><span>راهنما و پشتیبانی</span></button>
    </nav>
    <div className="sidebar-card"><Sparkles/><b>فضا برای ایده‌های بیشتر</b><p>اپلیکیشن‌های بعدی شما، همین‌جا کنار هم قرار می‌گیرند.</p><span>نسخه ۱.۰</span></div>
  </aside>;
}

function Dashboard({ query, onOpen, uploadedApps, onOpenUploaded, onUploaded }) {
  const [showUpload, setShowUpload] = useState(false);
  const visible = apps.filter(app => app.title.includes(query) || app.subtitle.includes(query));
  return <div className="page dashboard">
    <section className="welcome">
      <div><span className="eyebrow"><Sparkles size={15}/> همه چیز، یک‌جا</span><h1>سلام، خوش آمدید <span>👋</span></h1><p>اپلیکیشن مورد نظرتان را انتخاب کنید و بی‌وقفه شروع به کار کنید.</p></div>
      <div className="stats"><div><b>۱</b><span>اپلیکیشن فعال</span></div><div className="divider"/><div><b>۴</b><span>فضای آماده</span></div></div>
    </section>
    <div className="section-head"><div><h2>اپلیکیشن‌های من</h2><p>ابزارهایی که برای شما ساخته شده‌اند</p></div><button className="upload-trigger" onClick={() => setShowUpload(true)}><UploadCloud size={18}/> افزودن اپ</button></div>
    <section className="app-grid">
      {visible.map((app, index) => <AppCard key={app.id} app={app} featured={index === 0 && app.active} onOpen={() => app.active && onOpen(app.id)}/>) }
      {uploadedApps.filter(app => app.title.includes(query)).map(app => <UploadedCard key={app.id} app={app} onOpen={() => onOpenUploaded(app)} />)}
    </section>
    <section className="tip"><div className="tip-icon"><ShieldCheck/></div><div><b>مرکز امن و یکپارچه</b><p>هر اپلیکیشن در فضای مستقل خودش اجرا می‌شود؛ بنابراین تغییرات یک اپ روی بقیه اثری ندارد.</p></div><Check className="tip-check"/></section>
    {showUpload && <UploadDialog onClose={() => setShowUpload(false)} onUploaded={async () => { await onUploaded(); setShowUpload(false); }} />}
  </div>;
}

function UploadedCard({ app, onOpen }) {
  return <article className="app-card featured community-card" onClick={onOpen}>
    <span className="new-badge">آپلودی</span><div className="app-icon green"><FileArchive/></div>
    <div className="app-copy"><h3>{app.title}</h3><p>{app.fileCount} فایل · ذخیره دائمی ابری</p></div>
    <div className="tags"><span><ShieldCheck size={13}/> اجرای ایزوله</span><span><Wifi size={13}/> عمومی</span></div>
    <button className="open-btn">اجرای اپ <ArrowLeft size={18}/></button>
  </article>;
}

function UploadDialog({ onClose, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [secret, setSecret] = useState('');
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState({ loading: false, error: '' });
  const choose = (incoming) => setFiles(Array.from(incoming));
  const submit = async () => {
    if (!title.trim() || !files.length) return setState({ loading: false, error: 'نام اپ و حداقل یک فایل را وارد کنید.' });
    const form = new FormData(); form.set('title', title.trim()); files.forEach(file => form.append('files', file));
    setState({ loading: true, error: '' });
    try {
      const response = await fetch('/api/upload', { method: 'POST', headers: secret ? { 'x-upload-secret': secret } : {}, body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'آپلود انجام نشد.');
      await onUploaded();
    } catch (error) { setState({ loading: false, error: error.message }); }
  };
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="upload-dialog" role="dialog" aria-modal="true" aria-labelledby="upload-title">
      <button className="modal-close" onClick={onClose} aria-label="بستن"><X/></button>
      <div className="upload-symbol"><UploadCloud/></div><h2 id="upload-title">افزودن اپلیکیشن جدید</h2><p>فایل ZIP یا فایل‌های پروژه را بکشید و اینجا رها کنید.</p>
      <label className="field-label">نام اپلیکیشن</label><input className="title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثلاً ابزار تبدیل تصویر" />
      <label className={`drop-zone ${dragging ? 'dragging' : ''}`} onDragEnter={e => {e.preventDefault();setDragging(true)}} onDragOver={e => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault();setDragging(false);choose(e.dataTransfer.files)}}>
        <input type="file" multiple accept=".zip,.html,.css,.js,.mjs,.json,.svg,.png,.jpg,.jpeg,.webp,.woff,.woff2" onChange={e => choose(e.target.files)} />
        <FileArchive/><b>{files.length ? `${files.length} فایل انتخاب شد` : 'فایل‌ها را اینجا رها کنید'}</b><span>یا برای انتخاب ZIP / چند فایل کلیک کنید · حداکثر ۵MB</span>
      </label>
      {!!files.length && <div className="file-list">{files.slice(0, 4).map(file => <span key={file.name}>{file.name}<small>{Math.ceil(file.size / 1024)} KB</small></span>)}</div>}
      <label className="field-label">کلید آپلود <small>(اگر در Netlify تنظیم شده)</small></label><input className="title-input" type="password" dir="ltr" value={secret} onChange={e => setSecret(e.target.value)} placeholder="UPLOAD_SECRET" />
      {state.error && <p className="upload-error">{state.error}</p>}
      <button className="publish-btn" disabled={state.loading} onClick={submit}>{state.loading ? <RefreshCw className="spin"/> : <UploadCloud/>}{state.loading ? 'در حال انتشار…' : 'آپلود و انتشار دائمی'}</button>
      <small className="security-note"><ShieldCheck/> اپ داخل قاب ایزوله اجرا می‌شود. فایل index.html الزامی است.</small>
    </section>
  </div>;
}

function HostedApp({ app, onBack }) {
  if (!app) return null;
  return <div className="hosted-page"><div className="hosted-toolbar"><button className="back" onClick={onBack}><ArrowLeft/> بازگشت</button><strong>{app.title}</strong><a href={app.url} target="_blank" rel="noreferrer">بازکردن تمام‌صفحه <ArrowLeft/></a></div><iframe title={app.title} src={app.url} sandbox="allow-scripts allow-forms allow-modals allow-downloads allow-popups" /></div>;
}

function AppCard({ app, featured, onOpen }) {
  const Icon = app.icon;
  return <article className={`app-card ${featured ? 'featured' : ''} ${!app.active ? 'placeholder' : ''}`} onClick={onOpen}>
    {featured && <span className="new-badge">جدید</span>}
    <div className={`app-icon ${app.color}`}><Icon/></div>
    <div className="app-copy"><h3>{app.title}</h3><p>{app.subtitle}</p></div>
    {app.active ? <>
      <div className="tags"><span><Radio size={13}/> پخش زنده</span><span><Wifi size={13}/> اتصال پایدار</span></div>
      <button className="open-btn">ورود به اپلیکیشن <ArrowLeft size={18}/></button>
    </> : <button className="soon"><Plus size={17}/> به‌زودی</button>}
  </article>;
}

function StreamBox({ onBack }) {
  const [url, setUrl] = useState(() => localStorage.getItem('stream-url') || '');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const resumeAt = useRef(Number(localStorage.getItem('stream-position') || 0));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const save = () => { if (video.currentTime) localStorage.setItem('stream-position', String(video.currentTime)); };
    const timer = setInterval(save, 3000);
    return () => { clearInterval(timer); save(); };
  }, [source]);

  const start = () => {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      localStorage.setItem('stream-url', url);
      setError(''); setStatus('loading'); setSource(url);
    } catch { setError('لطفاً یک لینک مستقیم و معتبر با http یا https وارد کنید.'); }
  };
  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    resumeAt.current = video.currentTime;
    video.load(); setStatus('loading');
  };

  return <div className="page stream-page">
    <button className="back" onClick={onBack}><ArrowLeft/> بازگشت به همه اپ‌ها</button>
    <div className="stream-title"><div className="app-icon violet"><Clapperboard/></div><div><span className="eyebrow">اپلیکیشن شماره ۱</span><h1>استریم باکس</h1><p>تماشا را شروع کنید؛ دانلود در پس‌زمینه ادامه پیدا می‌کند.</p></div></div>
    <div className="stream-layout">
      <section className="player-panel">
        <div className={`player ${source ? 'has-source' : ''}`}>
          {source ? <video ref={videoRef} src={source} controls autoPlay preload="auto"
            onCanPlay={e => { if (resumeAt.current > 0 && e.currentTarget.currentTime < 1) e.currentTarget.currentTime = resumeAt.current; setStatus('playing'); }}
            onWaiting={() => setStatus('buffering')} onPlaying={() => setStatus('playing')}
            onError={() => { setStatus('offline'); setError('ارتباط با فایل قطع شد. پس از اتصال، «تلاش دوباره» را بزنید؛ پخش از همین نقطه ادامه می‌یابد.'); }}/>
          : <div className="empty-player"><div><Film/></div><h3>فیلم شما اینجا پخش می‌شود</h3><p>لینک مستقیم فایل ویدیو را در کادر روبه‌رو وارد کنید.</p></div>}
          {status === 'buffering' && <div className="buffer-toast"><RefreshCw className="spin"/> در حال دریافت ادامه فیلم…</div>}
        </div>
        <div className="player-note"><ShieldCheck/><span><b>ادامه هوشمند پخش</b><small>آخرین نقطه تماشا روی همین دستگاه ذخیره می‌شود.</small></span><span className={`connection ${status === 'offline' ? 'bad' : ''}`}>{status === 'offline' ? <WifiOff/> : <Wifi/>}{status === 'offline' ? 'قطع ارتباط' : 'آماده اتصال'}</span></div>
      </section>
      <section className="control-panel">
        <div className="panel-heading"><div><h2>لینک فیلم</h2><p>آدرس مستقیم فایل ویدیویی را وارد کنید</p></div><Link2/></div>
        <label>آدرس دانلود مستقیم</label>
        <div className={`url-box ${error ? 'invalid' : ''}`}><Link2/><input dir="ltr" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/movie.mp4"/><button onClick={() => {setUrl(''); setSource(''); setError('');}} aria-label="پاک کردن"><X/></button></div>
        {error && <p className="error">{error}</p>}
        <button className="start-btn" onClick={start}>{status === 'loading' ? <RefreshCw className="spin"/> : <Play/>}{status === 'loading' ? 'در حال اتصال...' : 'شروع پخش فیلم'}</button>
        {source && <div className="actions"><button onClick={retry}><RefreshCw/> تلاش دوباره</button><a href={source} download><Download/> دانلود جداگانه</a></div>}
        <div className="how"><h3>چطور کار می‌کند؟</h3><div><span>۱</span><p><b>لینک را وارد کنید</b><small>لینک باید مستقیم و قابل پخش باشد.</small></p></div><div><span>۲</span><p><b>همزمان تماشا کنید</b><small>مرورگر هنگام پخش، بخش‌های بعدی را دریافت می‌کند.</small></p></div><div><span>۳</span><p><b>نگران قطعی نباشید</b><small>نقطه پخش ذخیره می‌شود تا از همان‌جا ادامه دهید.</small></p></div></div>
        <div className="format"><Gauge/><span><b>بهترین سازگاری</b><small>MP4 (H.264)، WebM و سرور دارای Range</small></span></div>
      </section>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
