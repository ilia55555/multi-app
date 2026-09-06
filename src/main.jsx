import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, Check, CircleHelp, Clapperboard, Download, Film, Gauge, Grid2X2, Home, Link2, Menu, Play, Plus, Radio, RefreshCw, Search, Settings, ShieldCheck, Sparkles, Wifi, WifiOff, X } from 'lucide-react';
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
  return <div className="shell">
    <Sidebar page={page} onNavigate={setPage} />
    <main>
      <header className="topbar">
        <button className="mobile-menu" aria-label="منو"><Menu /></button>
        <div className="search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو بین اپلیکیشن‌ها..."/></div>
        <div className="profile"><div><strong>کاربر مهمان</strong><span>فضای شخصی شما</span></div><div className="avatar">م</div></div>
      </header>
      {page === 'stream' ? <StreamBox onBack={() => setPage('home')} /> : <Dashboard query={query} onOpen={setPage} />}
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

function Dashboard({ query, onOpen }) {
  const visible = apps.filter(app => app.title.includes(query) || app.subtitle.includes(query));
  return <div className="page dashboard">
    <section className="welcome">
      <div><span className="eyebrow"><Sparkles size={15}/> همه چیز، یک‌جا</span><h1>سلام، خوش آمدید <span>👋</span></h1><p>اپلیکیشن مورد نظرتان را انتخاب کنید و بی‌وقفه شروع به کار کنید.</p></div>
      <div className="stats"><div><b>۱</b><span>اپلیکیشن فعال</span></div><div className="divider"/><div><b>۴</b><span>فضای آماده</span></div></div>
    </section>
    <div className="section-head"><div><h2>اپلیکیشن‌های من</h2><p>ابزارهایی که برای شما ساخته شده‌اند</p></div><button className="filter"><Grid2X2 size={18}/> نمایش همه</button></div>
    <section className="app-grid">
      {visible.map((app, index) => <AppCard key={app.id} app={app} featured={index === 0 && app.active} onOpen={() => app.active && onOpen(app.id)}/>) }
    </section>
    <section className="tip"><div className="tip-icon"><ShieldCheck/></div><div><b>مرکز امن و یکپارچه</b><p>هر اپلیکیشن در فضای مستقل خودش اجرا می‌شود؛ بنابراین تغییرات یک اپ روی بقیه اثری ندارد.</p></div><Check className="tip-check"/></section>
  </div>;
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
