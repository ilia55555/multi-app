(() => {
  'use strict';

  const SAMPLE_ELEMENT_STYLE = "\n    :root {\n      --bg: #0b1020;\n      --panel: #121a2d;\n      --panel-2: #18233b;\n      --panel-3: #24314b;\n      --text: #f3f7ff;\n      --muted: #a7b4cc;\n      --line: rgba(216, 232, 255, .14);\n      --brand: #61d1ff;\n      --brand-strong: #1998d1;\n      --success: #4ade80;\n      --warning: #fbbf24;\n      --danger: #fb7185;\n      --violet: #c084fc;\n      --radius: 16px;\n      --shadow: 0 18px 55px rgba(0,0,0,.35);\n    }\n\n    * { box-sizing: border-box; }\n    html { scroll-behavior: smooth; }\n    body {\n      margin: 0;\n      min-height: 100vh;\n      color: var(--text);\n      background:\n        radial-gradient(circle at 12% 0%, rgba(41, 131, 208, .32), transparent 34rem),\n        radial-gradient(circle at 100% 18%, rgba(146, 79, 210, .18), transparent 30rem),\n        var(--bg);\n      font-family: Tahoma, Vazirmatn, Arial, sans-serif;\n      line-height: 1.75;\n    }\n\n    button, input, select, textarea { font: inherit; }\n    button { cursor: pointer; }\n    button:disabled { opacity: .48; cursor: not-allowed; }\n    a { color: var(--brand); }\n    code, kbd, pre { direction: ltr; font-family: Consolas, monospace; }\n    code { color: #d7f5ff; }\n\n    .topbar {\n      position: sticky; top: 0; z-index: 30;\n      padding: 16px max(18px, calc((100% - 1400px)/2));\n      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;\n      background: rgba(11,16,32,.86);\n      border-bottom: 1px solid var(--line);\n      backdrop-filter: blur(14px);\n    }\n    .brand { margin-left: auto; }\n    .brand strong { display: block; font-size: 18px; }\n    .brand span { display: block; font-size: 12px; color: var(--muted); }\n    .search-box { position: relative; min-width: min(340px, 100%); flex: 1 1 340px; }\n    .search-box input { width: 100%; padding-right: 42px; }\n    .search-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }\n    .topbar .count { color: var(--muted); font-size: 13px; white-space: nowrap; }\n\n    main { width: min(1400px, calc(100% - 30px)); margin: 30px auto 90px; }\n    .hero { padding: 28px; border: 1px solid var(--line); background: rgba(18,26,45,.75); border-radius: 24px; box-shadow: var(--shadow); }\n    .hero h1 { margin: 0 0 8px; font-size: clamp(25px, 4vw, 42px); }\n    .hero p { margin: 0; color: var(--muted); max-width: 950px; }\n    .hero-note { margin-top: 16px; display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; border: 1px solid rgba(97,209,255,.3); color: #c6f2ff; background: rgba(97,209,255,.1); border-radius: 999px; font-size: 13px; }\n\n    .section-title { margin: 38px 0 14px; padding: 13px 16px; font-size: 20px; border-right: 4px solid var(--brand); background: rgba(18,26,45,.62); border-radius: 12px; }\n    .section-title small { display: block; margin-top: 2px; font-size: 13px; font-weight: normal; color: var(--muted); }\n\n    .grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }\n    .element-card { grid-column: span 4; min-width: 0; background: rgba(18,26,45,.88); border: 1px solid var(--line); border-radius: var(--radius); overflow: visible; box-shadow: 0 8px 28px rgba(0,0,0,.16); }\n    .element-card.wide { grid-column: span 8; }\n    .element-card.full { grid-column: 1 / -1; }\n    .element-card.hidden-card { display: none; }\n    .element-head { padding: 13px 15px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--line); background: rgba(255,255,255,.025); border-radius: var(--radius) var(--radius) 0 0; }\n    .element-head h3 { margin: 0; font-size: 16px; }\n    .tag-name { direction: ltr; white-space: nowrap; color: #b9ebff; background: #0a2232; border: 1px solid rgba(97,209,255,.25); border-radius: 7px; padding: 2px 8px; font-family: Consolas, monospace; font-size: 12px; }\n    .component-name { white-space: nowrap; color: #e3d1ff; background: #261a3a; border: 1px solid rgba(192,132,252,.24); border-radius: 7px; padding: 2px 8px; font-size: 12px; }\n    .element-body { padding: 18px; min-height: 150px; display: flex; flex-direction: column; justify-content: center; gap: 13px; }\n    .element-body p { margin: 0; color: var(--muted); font-size: 13px; }\n    .muted { color: var(--muted); }\n    .stack { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }\n    .stack.column { align-items: stretch; flex-direction: column; }\n    .spacer { flex: 1; }\n\n    .btn { border: 1px solid transparent; border-radius: 11px; padding: 9px 14px; color: white; background: var(--brand-strong); box-shadow: 0 5px 14px rgba(25,152,209,.2); transition: transform .16s ease, filter .16s ease, background .16s ease; }\n    .btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }\n    .btn:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, a:focus-visible, summary:focus-visible { outline: 3px solid rgba(97,209,255,.55); outline-offset: 3px; }\n    .btn.secondary { background: #26334d; border-color: rgba(255,255,255,.13); box-shadow: none; }\n    .btn.ghost { background: transparent; color: #d4edff; border-color: rgba(97,209,255,.36); box-shadow: none; }\n    .btn.success { background: #15803d; }\n    .btn.warning { background: #b45309; }\n    .btn.danger { background: #be123c; }\n    .btn.small { padding: 5px 10px; font-size: 12px; border-radius: 9px; }\n    .btn.large { padding: 12px 18px; font-size: 16px; }\n    .icon-btn { width: 40px; height: 40px; display: inline-grid; place-items: center; padding: 0; border-radius: 50%; }\n    .button-group { display: inline-flex; border: 1px solid var(--line); border-radius: 11px; overflow: hidden; }\n    .button-group .btn { border-radius: 0; border: 0; box-shadow: none; border-left: 1px solid var(--line); }\n    .button-group .btn:last-child { border-left: 0; }\n    .toggle-btn.is-active { color: white; background: var(--brand-strong); }\n\n    .badge, .chip, .tag { display: inline-flex; align-items: center; gap: 6px; line-height: 1.3; border-radius: 999px; font-size: 12px; }\n    .badge { min-width: 22px; justify-content: center; padding: 3px 8px; color: white; background: #dc2626; }\n    .badge.success { background: #16a34a; }\n    .badge.warning { color: #241700; background: var(--warning); }\n    .chip, .tag { padding: 6px 10px; color: #caedff; background: rgba(97,209,255,.11); border: 1px solid rgba(97,209,255,.25); }\n    .tag { border-radius: 7px; color: #f0dbff; background: rgba(192,132,252,.1); border-color: rgba(192,132,252,.23); }\n    .chip button { border: 0; padding: 0 2px; background: transparent; color: inherit; font-size: 16px; line-height: 1; }\n\n    .alert { border-radius: 12px; padding: 12px 14px; border-right: 4px solid; display: flex; gap: 10px; align-items: start; }\n    .alert .alert-close { border: 0; background: transparent; color: inherit; margin-right: auto; font-size: 18px; padding: 0 5px; }\n    .alert.info { border-color: var(--brand); color: #d1f1ff; background: rgba(97,209,255,.12); }\n    .alert.success { border-color: var(--success); color: #d7ffe4; background: rgba(74,222,128,.11); }\n    .alert.warning { border-color: var(--warning); color: #ffeac1; background: rgba(251,191,36,.12); }\n    .alert.danger { border-color: var(--danger); color: #ffd6de; background: rgba(251,113,133,.12); }\n    .banner { padding: 14px; border-radius: 12px; border: 1px solid rgba(192,132,252,.35); background: linear-gradient(115deg, rgba(192,132,252,.18), rgba(97,209,255,.12)); }\n\n    .status-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 4px rgba(74,222,128,.12); }\n    .avatar { display: inline-grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; font-weight: bold; color: #082033; background: linear-gradient(135deg, #81e6ff, #bda5ff); border: 2px solid var(--panel); }\n    .avatar.large { width: 68px; height: 68px; font-size: 22px; }\n    .avatar-group { display: flex; flex-direction: row-reverse; padding: 0 8px; }\n    .avatar-group .avatar { margin-right: -9px; }\n\n    .card-ui { border: 1px solid var(--line); background: #16213a; border-radius: 14px; overflow: hidden; }\n    .card-banner { height: 82px; background: linear-gradient(120deg, #076799, #6651bb); }\n    .card-content { padding: 14px; }\n    .card-content h4 { margin: 0 0 4px; }\n    .card-content p { margin: 0; color: var(--muted); font-size: 13px; }\n    .card-footer { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid var(--line); }\n    .profile-row { display: flex; align-items: center; gap: 12px; }\n\n    .floating-root { position: relative; display: inline-flex; }\n    .floating-menu, .popover {\n      display: none; position: absolute; z-index: 70; min-width: 210px; top: calc(100% + 8px); right: 0;\n      color: var(--text); background: #18243d; border: 1px solid rgba(216,232,255,.2); border-radius: 12px; box-shadow: 0 18px 45px rgba(0,0,0,.45); overflow: hidden;\n    }\n    .floating-root.is-open .floating-menu, .floating-root.is-open .popover { display: block; animation: popup .14s ease both; }\n    @keyframes popup { from { opacity: 0; transform: translateY(-5px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }\n    .floating-menu button, .floating-menu a { width: 100%; display: block; padding: 10px 13px; text-align: right; color: var(--text); text-decoration: none; background: transparent; border: 0; }\n    .floating-menu button:hover, .floating-menu a:hover { background: rgba(97,209,255,.12); }\n    .menu-separator { height: 1px; background: var(--line); margin: 5px 0; }\n    .popover { width: min(290px, calc(100vw - 45px)); padding: 13px; }\n    .popover strong { display: block; margin-bottom: 3px; }\n    .popover p { margin: 0; color: var(--muted); font-size: 13px; }\n    .tooltip-wrap { position: relative; display: inline-flex; }\n    .tooltip-wrap[data-tooltip]::after { content: attr(data-tooltip); position: absolute; pointer-events: none; bottom: calc(100% + 10px); right: 50%; transform: translateX(50%) translateY(5px); opacity: 0; white-space: nowrap; padding: 5px 9px; border-radius: 7px; font-size: 12px; color: white; background: #020617; border: 1px solid rgba(255,255,255,.15); transition: .16s; }\n    .tooltip-wrap:hover::after, .tooltip-wrap:focus-within::after { opacity: 1; transform: translateX(50%) translateY(0); }\n\n    .overlay { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; padding: 18px; background: rgba(2,6,23,.72); backdrop-filter: blur(4px); }\n    .overlay.is-open { display: flex; }\n    .modal { width: min(500px, 100%); max-height: calc(100vh - 36px); overflow: auto; background: #17223a; border: 1px solid rgba(216,232,255,.2); border-radius: 18px; box-shadow: var(--shadow); animation: modalIn .18s ease; }\n    @keyframes modalIn { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }\n    .modal-header, .modal-footer { padding: 15px 17px; display: flex; align-items: center; gap: 10px; }\n    .modal-header { border-bottom: 1px solid var(--line); }\n    .modal-header h3 { margin: 0; }\n    .modal-body { padding: 17px; color: var(--muted); }\n    .modal-footer { justify-content: flex-start; border-top: 1px solid var(--line); }\n    .close-btn { margin-right: auto; border: 0; color: var(--muted); background: transparent; font-size: 24px; line-height: 1; }\n\n    .drawer-overlay { position: fixed; inset: 0; z-index: 90; display: none; background: rgba(2,6,23,.62); }\n    .drawer-overlay.is-open { display: block; }\n    .drawer { position: absolute; top: 0; right: 0; width: min(360px, 88vw); height: 100%; padding: 18px; background: #17223a; border-left: 1px solid var(--line); box-shadow: -12px 0 34px rgba(0,0,0,.36); transform: translateX(105%); transition: transform .22s ease; }\n    .drawer-overlay.is-open .drawer { transform: translateX(0); }\n    .drawer-nav { margin-top: 18px; display: grid; gap: 6px; }\n    .drawer-nav a { padding: 9px 11px; text-decoration: none; color: #d8e7ff; border-radius: 9px; }\n    .drawer-nav a:hover { background: rgba(97,209,255,.12); }\n    body.no-scroll { overflow: hidden; }\n\n    .tabs { border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 4px; }\n    .tab-btn { padding: 8px 12px; color: var(--muted); background: transparent; border: 0; border-bottom: 2px solid transparent; }\n    .tab-btn.is-active { color: #dff6ff; border-color: var(--brand); }\n    .tab-panel { display: none; padding-top: 13px; color: var(--muted); }\n    .tab-panel.is-active { display: block; }\n    details { border: 1px solid var(--line); border-radius: 11px; padding: 9px 12px; background: rgba(255,255,255,.025); }\n    details + details { margin-top: 8px; }\n    summary { cursor: pointer; color: #dff6ff; }\n    details p { margin: 9px 0 2px; }\n    .breadcrumb { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; font-size: 13px; }\n    .breadcrumb a { text-decoration: none; }\n    .breadcrumb span { color: var(--muted); }\n    .pagination { display: flex; gap: 6px; direction: ltr; }\n    .page { min-width: 35px; height: 35px; display: grid; place-items: center; padding: 0 8px; color: #d5eaff; border: 1px solid var(--line); border-radius: 9px; background: #1c2944; }\n    .page.active { background: var(--brand-strong); border-color: var(--brand-strong); color: white; }\n    .stepper { display: flex; gap: 4px; align-items: center; overflow: auto; padding-bottom: 3px; }\n    .step { min-width: 96px; text-align: center; color: var(--muted); font-size: 12px; }\n    .step::before { content: attr(data-num); display: grid; place-items: center; margin: 0 auto 6px; width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--line); background: #1b2944; }\n    .step.done::before, .step.current::before { background: var(--brand-strong); border-color: var(--brand); color: white; }\n    .step-line { width: 38px; height: 1px; background: var(--line); flex: 0 0 38px; }\n\n    .field { display: grid; gap: 6px; width: 100%; }\n    .field label { color: #dce9ff; font-size: 13px; }\n    input, select, textarea { width: 100%; color: var(--text); border: 1px solid rgba(216,232,255,.19); border-radius: 10px; background: #0d172b; padding: 9px 11px; }\n    input::placeholder, textarea::placeholder { color: #71809b; }\n    textarea { min-height: 90px; resize: vertical; }\n    select option { background: #101a2e; }\n    input[type=\"color\"] { padding: 3px; min-height: 42px; }\n    input[type=\"range\"] { padding: 0; accent-color: var(--brand); }\n    input[type=\"file\"] { padding: 7px; }\n    .input-group { display: flex; width: 100%; }\n    .input-group input { border-radius: 0 10px 10px 0; }\n    .input-group .addon { display: grid; place-items: center; padding: 0 12px; color: var(--muted); white-space: nowrap; background: #202d48; border: 1px solid rgba(216,232,255,.19); border-right: 0; border-radius: 10px 0 0 10px; }\n    .password-wrap { position: relative; }\n    .password-wrap input { padding-left: 46px; }\n    .password-toggle { position: absolute; left: 6px; top: 50%; transform: translateY(-50%); padding: 5px 8px; color: var(--muted); background: transparent; border: 0; font-size: 12px; }\n    .helper { color: var(--muted); font-size: 12px; }\n    .field-error { color: #ff9db0; font-size: 12px; }\n    fieldset { min-width: 0; border: 1px solid var(--line); border-radius: 11px; }\n    legend { padding: 0 6px; color: #cfeeff; }\n    .choice { display: inline-flex; align-items: center; gap: 7px; color: #d8e6fb; font-size: 13px; }\n    .choice input { width: auto; accent-color: var(--brand); }\n    .switch { display: inline-flex; gap: 8px; align-items: center; cursor: pointer; color: #d8e6fb; font-size: 13px; }\n    .switch input { position: absolute; opacity: 0; pointer-events: none; }\n    .switch-track { position: relative; width: 44px; height: 24px; border-radius: 999px; background: #40506a; transition: .18s; }\n    .switch-track::after { content: ''; position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: .18s; }\n    .switch input:checked + .switch-track { background: var(--brand-strong); }\n    .switch input:checked + .switch-track::after { transform: translateX(-20px); }\n    .switch input:focus-visible + .switch-track { outline: 3px solid rgba(97,209,255,.55); outline-offset: 3px; }\n    .drop-zone { padding: 22px 14px; text-align: center; border: 2px dashed rgba(97,209,255,.38); border-radius: 12px; color: #ccefff; background: rgba(97,209,255,.06); transition: .16s; cursor: pointer; }\n    .drop-zone.dragging { transform: scale(1.01); border-color: var(--brand); background: rgba(97,209,255,.14); }\n    .drop-zone small { display: block; color: var(--muted); }\n    .range-output { min-width: 40px; text-align: center; color: #d7f4ff; background: #17364b; border-radius: 7px; padding: 3px 7px; }\n    .counter-line { display: flex; justify-content: space-between; color: var(--muted); font-size: 12px; }\n    .form-demo.was-validated input:invalid { border-color: var(--danger); }\n\n    .data-table-wrap { overflow: auto; border: 1px solid var(--line); border-radius: 11px; }\n    table { width: 100%; min-width: 530px; border-collapse: collapse; font-size: 13px; }\n    th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: right; }\n    tr:last-child td { border-bottom: 0; }\n    th { color: #d8efff; background: #182640; }\n    th button { padding: 0; border: 0; color: inherit; background: transparent; }\n    tbody tr:hover { background: rgba(97,209,255,.05); }\n    .list-group { border: 1px solid var(--line); border-radius: 11px; overflow: hidden; }\n    .list-item { padding: 11px 13px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--line); }\n    .list-item:last-child { border-bottom: 0; }\n    .list-item:hover { background: rgba(97,209,255,.06); }\n    .list-item small { color: var(--muted); }\n    .timeline { position: relative; margin-right: 7px; padding-right: 22px; border-right: 2px solid rgba(97,209,255,.35); }\n    .timeline-item { position: relative; padding: 0 0 18px; }\n    .timeline-item:last-child { padding-bottom: 0; }\n    .timeline-item::before { content: ''; position: absolute; right: -29px; top: 8px; width: 12px; height: 12px; border: 3px solid #111a2d; border-radius: 50%; background: var(--brand); }\n    .timeline-item h5 { margin: 0; }\n    .timeline-item p { margin: 3px 0 0; }\n    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n    .stat { padding: 12px; text-align: center; border: 1px solid var(--line); border-radius: 11px; background: #17233b; }\n    .stat strong { display: block; font-size: 22px; color: #dff5ff; }\n    .stat span { color: var(--muted); font-size: 12px; }\n    .rating { display: flex; gap: 4px; direction: ltr; }\n    .star { padding: 0; color: #53617b; background: transparent; border: 0; font-size: 27px; line-height: 1; }\n    .star.selected { color: var(--warning); }\n\n    .progress { height: 11px; overflow: hidden; border-radius: 999px; background: #26344f; }\n    .progress > span { display: block; height: 100%; width: var(--value, 40%); background: linear-gradient(90deg, var(--brand-strong), #7ee3ff); }\n    .meter { height: 12px; appearance: none; width: 100%; }\n    meter::-webkit-meter-bar { background: #26344f; border-radius: 999px; }\n    meter::-webkit-meter-optimum-value { background: var(--success); border-radius: 999px; }\n    .spinner { width: 34px; height: 34px; border: 4px solid rgba(97,209,255,.18); border-left-color: var(--brand); border-radius: 50%; animation: spin .8s linear infinite; }\n    @keyframes spin { to { transform: rotate(360deg); } }\n    .skeleton { overflow: hidden; position: relative; border-radius: 7px; background: #26334d; }\n    .skeleton::after { content: ''; position: absolute; inset: 0; transform: translateX(100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent); animation: shimmer 1.3s infinite; }\n    @keyframes shimmer { to { transform: translateX(-100%); } }\n    .skeleton.line { height: 12px; }\n    .skeleton.line.short { width: 58%; }\n    .skeleton.avatar-skel { width: 42px; height: 42px; border-radius: 50%; flex: 0 0 auto; }\n    .empty-state { text-align: center; padding: 12px; }\n    .empty-state .empty-icon { font-size: 38px; }\n    .empty-state h4 { margin: 4px 0; }\n    .empty-state p { margin-bottom: 12px; }\n\n    .carousel { position: relative; overflow: hidden; border-radius: 13px; border: 1px solid var(--line); }\n    .carousel-track { display: flex; direction: ltr; transition: transform .28s ease; }\n    .slide { flex: 0 0 100%; min-height: 165px; display: grid; align-content: center; justify-items: center; padding: 20px; text-align: center; }\n    .slide:nth-child(1) { background: linear-gradient(135deg, #134d73, #182f69); }\n    .slide:nth-child(2) { background: linear-gradient(135deg, #3c276f, #176180); }\n    .slide:nth-child(3) { background: linear-gradient(135deg, #3d4b14, #176158); }\n    .slide strong { font-size: 23px; }\n    .carousel-controls { position: absolute; inset: auto 10px 10px; display: flex; justify-content: space-between; direction: ltr; }\n    .carousel-controls .btn { padding: 4px 10px; }\n    .carousel-dots { position: absolute; bottom: 11px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; }\n    .carousel-dot { width: 8px; height: 8px; border: 0; border-radius: 50%; background: rgba(255,255,255,.42); padding: 0; }\n    .carousel-dot.active { background: white; }\n    figure { margin: 0; border: 1px solid var(--line); padding: 10px; border-radius: 12px; }\n    .placeholder-image { min-height: 120px; display: grid; place-items: center; font-size: 40px; border-radius: 8px; background: linear-gradient(135deg, #1b5473, #765db1); }\n    figcaption { padding-top: 8px; color: var(--muted); font-size: 12px; }\n    .quote { margin: 0; border-right: 4px solid var(--violet); padding: 6px 13px; color: #efe6ff; background: rgba(192,132,252,.08); }\n    .quote footer { margin-top: 7px; color: var(--muted); font-size: 12px; }\n    .definition-list { margin: 0; display: grid; grid-template-columns: 92px 1fr; gap: 8px 12px; }\n    .definition-list dt { color: #d7f2ff; font-weight: bold; }\n    .definition-list dd { margin: 0; color: var(--muted); }\n    pre { margin: 0; overflow: auto; padding: 12px; color: #d8f5ff; background: #081321; border: 1px solid var(--line); border-radius: 11px; font-size: 12px; }\n    kbd { padding: 2px 6px; color: #fff; background: #33405a; border: 1px solid #63718a; border-bottom-width: 3px; border-radius: 5px; font-size: 11px; }\n    .context-box { position: relative; min-height: 110px; display: grid; place-items: center; color: var(--muted); text-align: center; border: 2px dashed rgba(192,132,252,.4); border-radius: 12px; background: rgba(192,132,252,.05); user-select: none; }\n    .context-menu { display: none; position: fixed; z-index: 120; min-width: 170px; padding: 5px; background: #18243d; border: 1px solid rgba(216,232,255,.2); border-radius: 10px; box-shadow: var(--shadow); }\n    .context-menu.is-open { display: block; }\n    .context-menu button { width: 100%; padding: 8px 10px; text-align: right; color: var(--text); background: transparent; border: 0; border-radius: 7px; }\n    .context-menu button:hover { background: rgba(97,209,255,.12); }\n\n    #toast-area { position: fixed; left: 18px; bottom: 18px; z-index: 130; display: grid; gap: 9px; width: min(340px, calc(100vw - 36px)); }\n    .toast { padding: 11px 13px; display: flex; align-items: center; gap: 8px; color: #ecfbff; background: #18304a; border: 1px solid rgba(97,209,255,.4); border-radius: 11px; box-shadow: var(--shadow); animation: toastIn .2s ease both; }\n    @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }\n    .toast .toast-x { margin-right: auto; padding: 0; color: inherit; background: transparent; border: 0; }\n    .live-status { color: var(--muted); font-size: 12px; min-height: 1.6em; }\n    .empty-search { display: none; margin-top: 22px; padding: 20px; text-align: center; color: var(--muted); border: 1px dashed var(--line); border-radius: 14px; }\n\n    @media (max-width: 1000px) { .element-card, .element-card.wide { grid-column: span 6; } }\n    @media (max-width: 650px) {\n      main { width: min(100% - 20px, 1400px); margin-top: 18px; }\n      .topbar { padding: 11px 12px; }\n      .brand { width: 100%; }\n      .search-box { min-width: 0; }\n      .element-card, .element-card.wide { grid-column: 1 / -1; }\n      .hero { padding: 20px; }\n      .stat-grid { grid-template-columns: 1fr; }\n      .step-line { width: 18px; flex-basis: 18px; }\n      .step { min-width: 78px; }\n    }\n  ";
  const SAMPLE_ELEMENT_TEMPLATES = [
  {
    "title": "دکمه‌ها",
    "search": "button دکمه primary secondary ghost disabled",
    "body": "<div class=\"stack\"><button class=\"btn\">دکمه اصلی</button><button class=\"btn secondary\">ثانویه</button><button class=\"btn ghost\">خطی</button><button class=\"btn danger\">حذف</button><button class=\"btn\" disabled>غیرفعال</button></div><p>با حالت‌های مختلف دکمه.</p>"
  },
  {
    "title": "دکمه آیکونی و گروه دکمه",
    "search": "button icon button group toggle split دکمه آیکون گروه",
    "body": "<div class=\"stack\"><button class=\"btn icon-btn\" aria-label=\"اعلان‌ها\">🔔</button><div class=\"button-group\"><button class=\"btn secondary small\">چپ</button><button class=\"btn secondary small\">وسط</button><button class=\"btn secondary small\">راست</button></div></div><div class=\"button-group\" data-toggle-group><button class=\"btn secondary small toggle-btn is-active\">روز</button><button class=\"btn secondary small toggle-btn\">هفته</button><button class=\"btn secondary small toggle-btn\">ماه</button></div>"
  },
  {
    "title": "لینک",
    "search": "link anchor لینک a",
    "body": "<p>یک لینک واقعی با <code>href</code>:</p><div class=\"stack\"><a href=\"#forms\">برو به بخش فرم‌ها ←</a><a href=\"#\" class=\"btn ghost\" onclick=\"event.preventDefault(); showToast('لینک دکمه‌ای کلیک شد')\">لینک شبیه دکمه</a></div>"
  },
  {
    "title": "Badge، Chip و Tag",
    "search": "badge chip tag برچسب بج نشان",
    "body": "<div class=\"stack\"><span class=\"badge\">5</span><span class=\"badge success\">✓</span><span class=\"badge warning\">جدید</span><span class=\"chip removable-chip\">جاوااسکریپت <button aria-label=\"حذف\">×</button></span><span class=\"tag\">نسخه 2.0</span></div><p>روی × چیپ بزن تا حذف شود.</p>"
  },
  {
    "title": "Avatar و وضعیت آنلاین",
    "search": "avatar profile status آواتار پروفایل",
    "body": "<div class=\"profile-row\"><div class=\"avatar large\">ع</div><div><strong>علی رضایی</strong><div class=\"muted\"><span class=\"status-dot\"></span> آنلاین</div></div></div><div class=\"avatar-group\"><span class=\"avatar\">س</span><span class=\"avatar\">م</span><span class=\"avatar\">ن</span><span class=\"avatar\">+8</span></div>"
  },
  {
    "title": "هشدار و بنر",
    "search": "alert banner notification هشدار اطلاع رسانی",
    "body": "<div class=\"alert info dismissible\"><span>ⓘ</span><span>این یک پیام اطلاعاتی است.</span><button class=\"alert-close\" aria-label=\"بستن\">×</button></div><div class=\"banner\">🎉 تخفیف ویژه تا پایان هفته فعال است.</div>"
  },
  {
    "title": "منوی کشویی",
    "search": "dropdown menu منو کشویی",
    "body": "<div class=\"floating-root\" data-floating><button class=\"btn\" type=\"button\" aria-expanded=\"false\" data-floating-toggle>عملیات ▾</button><div class=\"floating-menu\" role=\"menu\"><button type=\"button\" role=\"menuitem\" data-toast=\"فایل باز شد\">📂 باز کردن</button><button type=\"button\" role=\"menuitem\" data-toast=\"یک نسخه ذخیره شد\">💾 ذخیره</button><div class=\"menu-separator\"></div><button type=\"button\" role=\"menuitem\" data-toast=\"مورد حذف شد\">🗑 حذف</button></div></div><p>کلیک کن؛ بیرون از منو یا کلید Escape هم آن را می‌بندد.</p>"
  },
  {
    "title": "Popover",
    "search": "popover popup pop over پنجره کوچک",
    "body": "<div class=\"floating-root\" data-floating><button class=\"btn success\" type=\"button\" aria-expanded=\"false\" data-floating-toggle>نمایش Popover</button><div class=\"popover\" role=\"dialog\" aria-label=\"اطلاعات\"><strong>این یک Popover است</strong><p>یک باکس کوچک است که کنار یا زیر کنترل باز می‌شود. مثل Dropdown، با کلیک بیرون بسته می‌شود.</p><button class=\"btn small ghost\" type=\"button\" data-floating-close>بستن</button></div></div><p>این نمونه با کد خود فایل کار می‌کند، بنابراین مشکل سازگاری API مرورگر ندارد.</p>"
  },
  {
    "title": "Tooltip",
    "search": "tooltip راهنما تولتیپ hover",
    "body": "<div class=\"stack\"><span class=\"tooltip-wrap\" data-tooltip=\"این متن راهنماست\"><button class=\"btn ghost\">ماوس را نگه دار</button></span><span class=\"tooltip-wrap\" data-tooltip=\"یک توضیح کوتاه\"><button class=\"btn icon-btn secondary\" aria-label=\"اطلاعات\">?</button></span></div><p>Tooltip با hover و focus نمایش داده می‌شود.</p>"
  },
  {
    "title": "Modal / Dialog",
    "search": "modal dialog مودال دیالوگ",
    "body": "<button class=\"btn\" type=\"button\" data-open-overlay=\"example-modal\">باز کردن مودال</button><p>برای نمایش کارهای مهم مثل تأیید حذف یا ورود.</p>"
  },
  {
    "title": "Drawer / Sidebar",
    "search": "drawer sidebar offcanvas سایدبار کشویی",
    "body": "<button class=\"btn secondary\" type=\"button\" data-open-drawer>باز کردن منوی کناری</button><p>یک پنل از کنار صفحه وارد می‌شود.</p>"
  },
  {
    "title": "Toast / Snackbar",
    "search": "toast snackbar اعلان کوچک",
    "body": "<div class=\"stack\"><button class=\"btn\" type=\"button\" data-show-toast=\"فایل با موفقیت ذخیره شد\">نمایش Toast</button><button class=\"btn warning\" type=\"button\" data-show-toast=\"اتصال اینترنت بررسی شود\">Toast هشدار</button></div><p>اعلان پایین صفحه ظاهر می‌شود و خودکار می‌رود.</p>"
  },
  {
    "title": "Context Menu",
    "search": "context menu راست کلیک منوی زمینه",
    "body": "<div class=\"context-box\" id=\"context-target\">اینجا راست‌کلیک کن<br><small>یا روی دکمه‌ی زیر بزن</small></div><button class=\"btn small ghost\" type=\"button\" id=\"open-context-button\">نمایش منوی نمونه</button>"
  },
  {
    "title": "تب‌ها",
    "search": "tabs تب ها tab navigation",
    "body": "<div class=\"tabs\" data-tabs><button class=\"tab-btn is-active\" data-tab=\"tab-one\">مشخصات</button><button class=\"tab-btn\" data-tab=\"tab-two\">فعالیت‌ها</button><button class=\"tab-btn\" data-tab=\"tab-three\">تنظیمات</button></div><div id=\"tab-one\" class=\"tab-panel is-active\">اطلاعات کاربر در این تب نمایش داده می‌شود.</div><div id=\"tab-two\" class=\"tab-panel\">آخرین فعالیت: امروز ساعت ۱۰:۴۵ وارد شد.</div><div id=\"tab-three\" class=\"tab-panel\">تنظیمات عمومی در این بخش قرار می‌گیرد.</div>"
  },
  {
    "title": "آکاردئون",
    "search": "accordion details summary آکاردئون",
    "body": "<details open><summary>سؤال اول</summary><p>این بخش به‌صورت پیش‌فرض باز است.</p></details><details><summary>سؤال دوم</summary><p>با کلیک روی summary باز و بسته می‌شود.</p></details><details><summary>سؤال سوم</summary><p>بدون JavaScript هم کار می‌کند.</p></details>"
  },
  {
    "title": "Breadcrumb",
    "search": "breadcrumb مسیر راهنما",
    "body": "<nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\"><a href=\"#\">خانه</a><span>‹</span><a href=\"#\">محصولات</a><span>‹</span><span>جزئیات محصول</span></nav><p>برای نشان دادن مسیر فعلی کاربر.</p>"
  },
  {
    "title": "صفحه‌بندی",
    "search": "pagination صفحه بندی",
    "body": "<div class=\"pagination\" data-pagination><button class=\"page\">‹</button><button class=\"page active\">1</button><button class=\"page\">2</button><button class=\"page\">3</button><button class=\"page\">…</button><button class=\"page\">9</button><button class=\"page\">›</button></div><p class=\"live-status\">روی شماره صفحه کلیک کن.</p>"
  },
  {
    "title": "Step / Stepper",
    "search": "stepper steps مراحل",
    "body": "<div class=\"stepper\"><div class=\"step done\" data-num=\"✓\">سبد خرید</div><span class=\"step-line\"></span><div class=\"step current\" data-num=\"2\">آدرس</div><span class=\"step-line\"></span><div class=\"step\" data-num=\"3\">پرداخت</div><span class=\"step-line\"></span><div class=\"step\" data-num=\"4\">پایان</div></div>"
  },
  {
    "title": "Text, Email و Password",
    "search": "input text email password ورودی متن ایمیل رمز",
    "body": "<div class=\"field\"><label for=\"name-demo\">نام</label><input id=\"name-demo\" type=\"text\" placeholder=\"مثلاً علی رضایی\" /></div><div class=\"field\"><label for=\"email-demo\">ایمیل</label><input id=\"email-demo\" type=\"email\" placeholder=\"name@example.com\" /></div><div class=\"field\"><label for=\"pass-demo\">رمز عبور</label><div class=\"password-wrap\"><input id=\"pass-demo\" type=\"password\" value=\"12345678\" /><button class=\"password-toggle\" type=\"button\" data-password-toggle=\"#pass-demo\">نمایش</button></div></div>"
  },
  {
    "title": "Input Group",
    "search": "input group addon prefix ورودی گروهی",
    "body": "<div class=\"field\"><label for=\"site-demo\">آدرس وب‌سایت</label><div class=\"input-group\"><input id=\"site-demo\" type=\"text\" placeholder=\"my-site\" /><span class=\"addon\">.com</span></div></div><div class=\"field\"><label for=\"money-demo\">مبلغ</label><div class=\"input-group\"><input id=\"money-demo\" type=\"number\" value=\"250000\" /><span class=\"addon\">تومان</span></div></div>"
  },
  {
    "title": "Select و Datalist",
    "search": "select datalist option لیست انتخاب",
    "body": "<div class=\"field\"><label for=\"city-select\">انتخاب شهر</label><select id=\"city-select\"><option>تهران</option><option>اصفهان</option><option>شیراز</option><option>تبریز</option></select></div><div class=\"field\"><label for=\"browser-list\">مرورگر مورد علاقه</label><input id=\"browser-list\" list=\"browsers\" placeholder=\"شروع به تایپ کن\" /><datalist id=\"browsers\"><option value=\"Chrome\"></option><option value=\"Firefox\"></option><option value=\"Edge\"></option><option value=\"Safari\"></option></datalist></div>"
  },
  {
    "title": "Textarea و شمارنده",
    "search": "textarea character counter متن چند خطی",
    "body": "<div class=\"field\"><label for=\"message-demo\">پیام</label><textarea id=\"message-demo\" maxlength=\"160\" placeholder=\"پیام خود را بنویس...\"></textarea><div class=\"counter-line\"><span>حداکثر ۱۶۰ کاراکتر</span><span><b id=\"char-count\">0</b>/160</span></div></div>"
  },
  {
    "title": "Checkbox، Radio و Switch",
    "search": "checkbox radio switch toggle checkbox چک باکس رادیو سوئیچ",
    "body": "<fieldset><legend>روش ارسال</legend><div class=\"stack\"><label class=\"choice\"><input type=\"radio\" name=\"delivery\" checked /> پست</label><label class=\"choice\"><input type=\"radio\" name=\"delivery\" /> پیک</label></div></fieldset><label class=\"choice\"><input type=\"checkbox\" checked /> قوانین را می‌پذیرم</label><label class=\"switch\"><input type=\"checkbox\" checked /><span class=\"switch-track\"></span> دریافت اعلان‌ها</label>"
  },
  {
    "title": "Date، Time، Color و Range",
    "search": "date time color range date picker رنگ اسلایدر",
    "body": "<div class=\"stack\"><div class=\"field\"><label for=\"date-demo\">تاریخ</label><input id=\"date-demo\" type=\"date\" /></div><div class=\"field\"><label for=\"time-demo\">ساعت</label><input id=\"time-demo\" type=\"time\" /></div></div><div class=\"stack\"><div class=\"field\"><label for=\"color-demo\">رنگ</label><input id=\"color-demo\" type=\"color\" value=\"#61d1ff\" /></div><div class=\"field\"><label for=\"range-demo\">شدت</label><div class=\"stack\"><input id=\"range-demo\" type=\"range\" min=\"0\" max=\"100\" value=\"45\" /><output id=\"range-output\" class=\"range-output\">45</output></div></div></div>"
  },
  {
    "title": "File Upload / Drag & Drop",
    "search": "file upload drag drop بارگذاری فایل درگ دراپ",
    "body": "<input id=\"file-input-demo\" type=\"file\" hidden multiple /><label for=\"file-input-demo\" class=\"drop-zone\" data-drop-zone>📁 فایل را اینجا رها کن یا کلیک کن<small id=\"file-status\">هنوز فایلی انتخاب نشده</small></label>"
  },
  {
    "title": "Form Validation",
    "search": "form validation required form فرم اعتبار سنجی",
    "body": "<form class=\"form-demo\" id=\"validation-form\" novalidate><div class=\"grid\" style=\"gap:10px\"><div class=\"field\" style=\"grid-column:span 6\"><label for=\"valid-name\">نام (اجباری)</label><input id=\"valid-name\" required minlength=\"3\" placeholder=\"حداقل ۳ حرف\" /><span class=\"field-error\">نام معتبر وارد کن.</span></div><div class=\"field\" style=\"grid-column:span 6\"><label for=\"valid-email\">ایمیل (اجباری)</label><input id=\"valid-email\" required type=\"email\" placeholder=\"name@example.com\" /><span class=\"field-error\">ایمیل معتبر وارد کن.</span></div></div><div class=\"stack\"><button class=\"btn\" type=\"submit\">بررسی فرم</button><span class=\"live-status\" id=\"form-result\"></span></div></form>"
  },
  {
    "title": "Card",
    "search": "card کارت پروفایل",
    "body": "<article class=\"card-ui\"><div class=\"card-banner\"></div><div class=\"card-content\"><h4>عنوان کارت</h4><p>کارت برای دسته‌بندی اطلاعات یا محصول استفاده می‌شود.</p></div><footer class=\"card-footer\"><button class=\"btn small\">مشاهده</button><button class=\"btn small secondary\">ذخیره</button></footer></article>"
  },
  {
    "title": "Stat Cards",
    "search": "stat statistics آمار",
    "body": "<div class=\"stat-grid\"><div class=\"stat\"><strong>۱۲۸</strong><span>سفارش</span></div><div class=\"stat\"><strong>۹.۸M</strong><span>فروش</span></div><div class=\"stat\"><strong>۹۴٪</strong><span>رضایت</span></div></div>"
  },
  {
    "title": "جدول با مرتب‌سازی",
    "search": "table sort جدول مرتب سازی",
    "body": "<div class=\"data-table-wrap\"><table id=\"sort-table\"><thead><tr><th><button data-sort-col=\"0\">نام ↕</button></th><th><button data-sort-col=\"1\" data-sort-type=\"number\">تعداد ↕</button></th><th>وضعیت</th></tr></thead><tbody><tr><td>کیبورد</td><td>12</td><td><span class=\"badge success\">فعال</span></td></tr><tr><td>موس</td><td>7</td><td><span class=\"badge warning\">کم</span></td></tr><tr><td>مانیتور</td><td>24</td><td><span class=\"badge success\">فعال</span></td></tr></tbody></table></div><p>روی عنوان ستون «نام» یا «تعداد» کلیک کن.</p>"
  },
  {
    "title": "List Group",
    "search": "list list group لیست",
    "body": "<div class=\"list-group\"><div class=\"list-item\"><span class=\"avatar\">م</span><div><strong>پیام جدید</strong><small>۲ دقیقه پیش</small></div><span class=\"spacer\"></span><span class=\"badge\">2</span></div><div class=\"list-item\"><span>📌</span><div><strong>کارهای امروز</strong><small>۳ مورد باقی مانده</small></div></div><div class=\"list-item\"><span>✓</span><div><strong>پرداخت کامل شد</strong><small>دیروز</small></div></div></div>"
  },
  {
    "title": "Timeline",
    "search": "timeline خط زمان",
    "body": "<div class=\"timeline\"><div class=\"timeline-item\"><h5>سفارش ثبت شد</h5><p>امروز، ۱۰:۳۰</p></div><div class=\"timeline-item\"><h5>بسته‌بندی شد</h5><p>امروز، ۱۲:۱۵</p></div><div class=\"timeline-item\"><h5>تحویل پست شد</h5><p>در انتظار</p></div></div>"
  },
  {
    "title": "Rating",
    "search": "rating star امتیاز ستاره",
    "body": "<div class=\"rating\" id=\"rating-demo\" aria-label=\"امتیاز دهی\"><button class=\"star\" data-rate=\"1\" aria-label=\"1 ستاره\">★</button><button class=\"star\" data-rate=\"2\" aria-label=\"2 ستاره\">★</button><button class=\"star\" data-rate=\"3\" aria-label=\"3 ستاره\">★</button><button class=\"star\" data-rate=\"4\" aria-label=\"4 ستاره\">★</button><button class=\"star\" data-rate=\"5\" aria-label=\"5 ستاره\">★</button></div><p id=\"rating-text\">هنوز امتیازی ثبت نشده.</p>"
  },
  {
    "title": "Progress، Meter و Loading",
    "search": "progress meter spinner loading skeleton پیشرفت بارگذاری",
    "body": "<div><div class=\"stack\"><span>دانلود</span><span class=\"spacer\"></span><span>۷۲٪</span></div><div class=\"progress\" aria-label=\"پیشرفت 72 درصد\"><span style=\"--value:72%\"></span></div></div><div><span class=\"muted\">سلامت حساب:</span><meter class=\"meter\" min=\"0\" max=\"100\" value=\"82\">82%</meter></div><div class=\"stack\"><span class=\"spinner\" aria-label=\"درحال بارگذاری\"></span><div style=\"flex:1\"><div class=\"skeleton line\"></div><div class=\"skeleton line short\" style=\"margin-top:8px\"></div></div></div>"
  },
  {
    "title": "Empty State",
    "search": "empty state حالت خالی",
    "body": "<div class=\"empty-state\"><div class=\"empty-icon\">🗂️</div><h4>هنوز پروژه‌ای نداری</h4><p>اولین پروژه‌ات را بساز تا اینجا نمایش داده شود.</p><button class=\"btn small\" data-show-toast=\"پروژه جدید ساخته شد (نمونه)\">ساخت پروژه</button></div>"
  },
  {
    "title": "تصویر و توضیح",
    "search": "figure figcaption image تصویر کپشن",
    "body": "<figure><div class=\"placeholder-image\" role=\"img\" aria-label=\"تصویر نمونه\">🏔️</div><figcaption>توضیحی که زیر تصویر با <code>&lt;figcaption&gt;</code> آمده است.</figcaption></figure>"
  },
  {
    "title": "نقل‌قول",
    "search": "blockquote quote نقل قول",
    "body": "<blockquote class=\"quote\">طراحی خوب فقط زیبا نیست؛ باید استفاده از محصول را آسان‌تر کند.<footer>— نمونه‌ی نقل‌قول</footer></blockquote><p>برای نقل‌قول‌های بلند به‌کار می‌رود.</p>"
  },
  {
    "title": "لیست تعریفی",
    "search": "definition list dl dt dd تعریف",
    "body": "<dl class=\"definition-list\"><dt>HTML</dt><dd>ساختار صفحه‌ی وب</dd><dt>CSS</dt><dd>ظاهر و چیدمان</dd><dt>JS</dt><dd>رفتار و تعامل</dd></dl>"
  },
  {
    "title": "کد و کلید کیبورد",
    "search": "code pre kbd code block کد کیبورد",
    "body": "<pre>&lt;button&gt;ذخیره&lt;/button&gt;</pre><p>برای ذخیره سریع: <kbd>Ctrl</kbd> + <kbd>S</kbd></p>"
  },
  {
    "title": "متن برجسته",
    "search": "mark highlight متن برجسته",
    "body": "<p>این بخش برای <mark>هایلایت کردن متن مهم</mark> است. همچنین می‌توان از <strong>strong</strong> و <em>em</em> استفاده کرد.</p>"
  },
  {
    "title": "Number Stepper",
    "search": "counter number stepper شمارنده عددی",
    "body": "<div class=\"stack\"><button class=\"btn secondary\" id=\"decrease-counter\" type=\"button\">−</button><output id=\"number-output\" class=\"range-output\">1</output><button class=\"btn secondary\" id=\"increase-counter\" type=\"button\">+</button></div><p>یک نمونه برای تعداد کالا، نفر یا مبلغ.</p>"
  },
  {
    "title": "Carousel / Slider",
    "search": "carousel gallery اسلایدر گالری",
    "body": "<div class=\"carousel\" id=\"carousel-demo\"><div class=\"carousel-track\"><div class=\"slide\"><strong>اسلاید اول</strong><span>یک معرفی کوتاه برای بخش اول</span></div><div class=\"slide\"><strong>اسلاید دوم</strong><span>محتوا می‌تواند عکس، متن یا محصول باشد</span></div><div class=\"slide\"><strong>اسلاید سوم</strong><span>با دکمه‌ها بین اسلایدها حرکت کن</span></div></div><div class=\"carousel-controls\"><button class=\"btn secondary\" type=\"button\" data-carousel=\"next\">‹</button><button class=\"btn secondary\" type=\"button\" data-carousel=\"prev\">›</button></div><div class=\"carousel-dots\"><button class=\"carousel-dot active\" data-slide=\"0\" aria-label=\"اسلاید 1\"></button><button class=\"carousel-dot\" data-slide=\"1\" aria-label=\"اسلاید 2\"></button><button class=\"carousel-dot\" data-slide=\"2\" aria-label=\"اسلاید 3\"></button></div></div>"
  }
];

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    openBtn: $('#sampleElementBtn'),
    dialog: $('#sampleElementDialog'),
    form: $('#sampleElementForm'),
    closeBtn: $('#sampleElementCloseBtn'),
    cancelBtn: $('#sampleElementCancelBtn'),
    insertBtn: $('#sampleElementInsertBtn'),
    select: $('#sampleElementSelect'),
    previewFrame: $('#sampleElementPreviewFrame'),
    tagInput: $('#builderTagInput'),
    nameInput: $('#builderNameInput'),
    idInput: $('#builderIdInput'),
    classInput: $('#builderClassInput'),
    textInput: $('#builderTextInput'),
    attrNameInput: $('#builderAttrNameInput'),
    attrValueInput: $('#builderAttrValueInput'),
    attributeList: $('#builderAttributeList'),
    stylePropSelect: $('#builderStylePropSelect'),
    styleValueInput: $('#builderStyleValueInput'),
    animationSelect: $('#builderAnimationSelect'),
    stylePresetSelect: $('#builderStylePresetSelect'),
    styleList: $('#builderStyleList'),
    logicSelect: $('#builderLogicSelect'),
    targetSelectorInput: $('#builderTargetSelectorInput'),
    logicList: $('#builderLogicList'),
    htmlOutput: $('#builderHtmlOutput'),
    cssOutput: $('#builderCssOutput'),
    jsOutput: $('#builderJsOutput')
  };


  const STYLE_PRESETS = {
    'canvas-dark': [['background', 'linear-gradient(135deg, #020617, #111827)'], ['color', '#f8fafc'], ['border', '1px solid rgba(148, 163, 184, .18)']],
    'canvas-soft': [['background', 'linear-gradient(135deg, #f8fafc, #e0f2fe)'], ['color', '#0f172a']],
    'canvas-grid': [['background-image', 'linear-gradient(rgba(148,163,184,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.16) 1px, transparent 1px)'], ['background-size', '24px 24px']],
    'canvas-dots': [['background-image', 'radial-gradient(circle, rgba(96,165,250,.35) 1px, transparent 1px)'], ['background-size', '18px 18px']],
    'canvas-radial': [['background', 'radial-gradient(circle at 20% 10%, rgba(56,189,248,.32), transparent 28rem), #020617']],
    'canvas-aurora': [['background', 'linear-gradient(120deg, rgba(14,165,233,.28), rgba(168,85,247,.22), rgba(34,197,94,.18))'], ['filter', 'saturate(1.15)']],
    'canvas-noise': [['background-image', 'linear-gradient(135deg, rgba(255,255,255,.04), transparent), radial-gradient(circle at 30% 20%, rgba(255,255,255,.08), transparent 18rem)']],
    'canvas-vignette': [['box-shadow', 'inset 0 0 120px rgba(0,0,0,.42)'], ['background', '#0f172a']],
    'box-glass': [['background', 'rgba(255,255,255,.12)'], ['backdrop-filter', 'blur(18px)'], ['border', '1px solid rgba(255,255,255,.22)']],
    'box-nested': [['padding', '18px'], ['border', '1px solid rgba(148,163,184,.22)'], ['box-shadow', 'inset 0 0 0 8px rgba(255,255,255,.04)']],
    'box-card': [['background', '#111827'], ['border-radius', '18px'], ['box-shadow', '0 18px 45px rgba(0,0,0,.24)']],
    'box-soft': [['background', '#e8eef8'], ['box-shadow', '10px 10px 24px #c7cfdb, -10px -10px 24px #ffffff'], ['color', '#172033']],
    'box-brutal': [['background', '#facc15'], ['border', '3px solid #111827'], ['box-shadow', '8px 8px 0 #111827'], ['color', '#111827']],
    'box-outline': [['background', 'transparent'], ['border', '1px solid currentColor']],
    'box-inset': [['box-shadow', 'inset 0 2px 18px rgba(0,0,0,.35)'], ['background', 'rgba(15,23,42,.65)']],
    'box-layered': [['box-shadow', '0 1px 0 rgba(255,255,255,.2), 0 18px 50px rgba(15,23,42,.35)']],
    'box-floating': [['transform', 'translateY(-4px)'], ['box-shadow', '0 24px 60px rgba(15,23,42,.32)']],
    'box-sticky': [['position', 'sticky'], ['top', '12px'], ['z-index', '5']],
    'box-ratio': [['aspect-ratio', '16 / 9'], ['display', 'grid'], ['place-items', 'center']],
    'box-center': [['display', 'grid'], ['place-items', 'center'], ['text-align', 'center']],
    'shadow-soft': [['box-shadow', '0 12px 30px rgba(15,23,42,.16)']],
    'shadow-deep': [['box-shadow', '0 35px 80px rgba(2,6,23,.42)']],
    'shadow-hard': [['box-shadow', '10px 10px 0 rgba(15,23,42,.92)']],
    'shadow-layered': [['box-shadow', '0 4px 12px rgba(15,23,42,.14), 0 20px 55px rgba(15,23,42,.22)']],
    'shadow-inset': [['box-shadow', 'inset 0 0 28px rgba(15,23,42,.32)']],
    'shadow-card': [['box-shadow', '0 1px 2px rgba(0,0,0,.08), 0 14px 34px rgba(0,0,0,.18)']],
    'shadow-top': [['box-shadow', '0 -18px 44px rgba(15,23,42,.22)']],
    'shadow-bottom': [['box-shadow', '0 18px 44px rgba(15,23,42,.22)']],
    'shadow-color-blue': [['box-shadow', '0 18px 48px rgba(59,130,246,.32)']],
    'shadow-color-pink': [['box-shadow', '0 18px 48px rgba(236,72,153,.32)']],
    'glow-blue': [['box-shadow', '0 0 0 1px rgba(59,130,246,.38), 0 0 34px rgba(59,130,246,.42)']],
    'glow-cyan': [['box-shadow', '0 0 0 1px rgba(34,211,238,.38), 0 0 34px rgba(34,211,238,.42)']],
    'glow-violet': [['box-shadow', '0 0 0 1px rgba(168,85,247,.38), 0 0 34px rgba(168,85,247,.42)']],
    'glow-green': [['box-shadow', '0 0 0 1px rgba(34,197,94,.38), 0 0 34px rgba(34,197,94,.42)']],
    'glow-gold': [['box-shadow', '0 0 0 1px rgba(250,204,21,.42), 0 0 34px rgba(250,204,21,.42)']],
    'glow-red': [['box-shadow', '0 0 0 1px rgba(248,113,113,.42), 0 0 34px rgba(248,113,113,.42)']],
    'glow-border': [['border-color', 'rgba(96,165,250,.85)'], ['box-shadow', '0 0 18px rgba(96,165,250,.45)']],
    'glow-text': [['color', '#e0f2fe'], ['text-shadow', '0 0 18px rgba(56,189,248,.75)']],
    'glow-hover': [['transition', 'box-shadow .2s ease, transform .2s ease'], ['box-shadow', '0 0 0 rgba(59,130,246,0)']],
    'glow-pulse': [['animation', 'sample-glow-pulse 1.4s ease-in-out infinite alternate']],
    'border-gradient': [['border', '1px solid transparent'], ['background-image', 'linear-gradient(#0f172a,#0f172a), linear-gradient(135deg,#38bdf8,#a855f7)'], ['background-origin', 'border-box'], ['background-clip', 'padding-box, border-box']],
    'border-dashed': [['border', '1px dashed rgba(148,163,184,.65)']],
    'border-double': [['border', '4px double rgba(148,163,184,.65)']],
    'radius-xl': [['border-radius', '28px']],
    'radius-pill': [['border-radius', '999px']],
    'blur-bg': [['backdrop-filter', 'blur(22px) saturate(1.2)'], ['background', 'rgba(15,23,42,.58)']],
    'blend-screen': [['mix-blend-mode', 'screen']],
    'clip-diamond': [['clip-path', 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)']],
    'clip-ticket': [['clip-path', 'polygon(0 0, 100% 0, 100% 38%, 96% 50%, 100% 62%, 100% 100%, 0 100%, 0 62%, 4% 50%, 0 38%)']],
    'perspective-card': [['transform', 'perspective(900px) rotateX(4deg) rotateY(-6deg)'], ['transform-style', 'preserve-3d']],
    'layout-grid': [['display', 'grid'], ['grid-template-columns', 'repeat(auto-fit, minmax(160px, 1fr))'], ['gap', '14px']],
    'layout-stack': [['display', 'grid'], ['gap', '12px']],
    'layout-cluster': [['display', 'flex'], ['flex-wrap', 'wrap'], ['gap', '10px'], ['align-items', 'center']],
    'layout-sidebar': [['display', 'grid'], ['grid-template-columns', 'minmax(180px,.35fr) 1fr'], ['gap', '16px']],
    'layout-scroll-snap': [['overflow-x', 'auto'], ['scroll-snap-type', 'x mandatory']],
    'state-active': [['outline', '2px solid rgba(96,165,250,.75)'], ['background', 'rgba(59,130,246,.16)']],
    'state-loading': [['cursor', 'progress'], ['opacity', '.72']],
    'state-disabled': [['pointer-events', 'none'], ['opacity', '.48']],
    'state-selected': [['box-shadow', '0 0 0 3px rgba(96,165,250,.32)']],
    'state-focus-ring': [['outline', '3px solid rgba(56,189,248,.65)'], ['outline-offset', '3px']]
  };

  let builderAttributes = [];
  let builderStyles = [];
  let builderLogics = [];
  let previewDirty = false;
  let previewClearTimer = 0;
  const nameCounters = Object.create(null);

  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const safeToken = (value, fallback = 'sample-element') => String(value || fallback).trim().replace(/[^\w؀-ۿ-]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
  const selectedTemplate = () => SAMPLE_ELEMENT_TEMPLATES[Number(elements.select.value) || 0] || SAMPLE_ELEMENT_TEMPLATES[0];

  const baseNameForTemplate = (template) => {
    const source = `${template?.search || ''} ${template?.title || ''}`;
    const english = source.match(/[a-z][a-z0-9-]*/i)?.[0];
    return safeToken(english || 'element', 'element').toLowerCase();
  };

  const nextUniqueName = (template) => {
    const base = baseNameForTemplate(template);
    nameCounters[base] = (nameCounters[base] || 0) + 1;
    return `${base}${nameCounters[base]}`;
  };

  const setPreviewSource = (html, css = '', js = '') => {
    elements.previewFrame.srcdoc = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>${SAMPLE_ELEMENT_STYLE}
body{margin:0;padding:18px;background:#0b1020;color:#f3f7ff;min-height:100vh}.preview-wrap{display:grid;place-items:center;min-height:260px}.preview-empty{display:grid;place-items:center;min-height:260px;color:#9fb0cf;border:1px dashed rgba(148,163,184,.32);border-radius:16px;background:rgba(15,23,42,.42);font:700 13px Tahoma,sans-serif}</style><style>${css}</style></head><body><div class="preview-wrap">${html}</div><script>${js.replace(/<\/script/gi, '<\\/script')}<\/script></body></html>`;
  };

  const clearDefaultPreviewLater = () => {
    window.clearTimeout(previewClearTimer);
    previewClearTimer = window.setTimeout(() => {
      if (!previewDirty) {
        setPreviewSource('<div class="preview-empty">نمونه پاک شد؛ تنظیمات را اضافه کن تا خروجی ساخته‌شده همین‌جا نمایش داده شود.</div>');
      }
    }, 10000);
  };

  const englishLabelForTemplate = (template) => template?.search?.match(/[a-z][a-z0-9-]*/i)?.[0]?.toLowerCase() || baseNameForTemplate(template);

  const populateSelector = () => {
    elements.select.innerHTML = SAMPLE_ELEMENT_TEMPLATES.map((item, index) =>
      `<option value="${index}">${escapeHtml(item.title)}  ${escapeHtml(englishLabelForTemplate(item))}</option>`
    ).join('');
  };

  const tagForTemplate = (template) => {
    const source = `${template?.search || ''} ${template?.title || ''}`.toLowerCase();
    if (source.includes('button')) return 'button';
    if (source.includes('link') || source.includes('anchor')) return 'a';
    if (source.includes('form')) return 'form';
    if (source.includes('input')) return 'input';
    if (source.includes('textarea')) return 'textarea';
    if (source.includes('select')) return 'select';
    if (source.includes('table')) return 'table';
    if (source.includes('list')) return 'ul';
    if (source.includes('figure')) return 'figure';
    if (source.includes('blockquote')) return 'blockquote';
    if (source.includes('badge') || source.includes('chip') || source.includes('tag')) return 'span';
    return 'div';
  };

  const rawContentForTemplate = (template, tag) => {
    if (['input'].includes(tag)) return '';
    if (tag === 'textarea') return 'متن نمونه';
    if (tag === 'select') return '<option>گزینه نمونه</option>';
    if (tag === 'ul') return '<li>آیتم نمونه</li>';
    if (tag === 'table') return '<tr><td>داده نمونه</td></tr>';
    return template?.title || 'المان';
  };

  const makeSelector = () => {
    const id = safeToken(elements.idInput.value, '');
    const className = String(elements.classInput.value || '').trim().split(/\s+/).filter(Boolean)[0];
    if (id) return `#${id}`;
    if (className) return `.${className}`;
    return `.${safeToken(elements.nameInput.value || selectedTemplate()?.title, 'sample-element')}`;
  };

  const makeLogicSnippet = (logic, selector) => {
    const label = elements.nameInput.value || selectedTemplate()?.title || 'المان';
    const targetSelector = String(elements.targetSelectorInput?.value || '').trim();
    const target = targetSelector || selector;
    if (logic === 'toggle-class') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('is-active');
});`;
    if (logic === 'counter') return `(() => {
  let count = 0;
  const target = document.querySelector('${selector}');
  target?.addEventListener('click', () => {
    count += 1;
    target.dataset.count = String(count);
    target.setAttribute('aria-label', 'کلیک‌ها: ' + count);
  });
})();`;
    if (logic === 'dismiss') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  event.currentTarget.remove();
});`;
    if (logic === 'copy-text') return `document.querySelector('${selector}')?.addEventListener('click', async (event) => {
  await navigator.clipboard?.writeText(event.currentTarget.textContent.trim());
});`;
    if (logic === 'toggle-hidden') return `document.querySelector('${selector}')?.addEventListener('click', () => {
  document.querySelector('${target}')?.toggleAttribute('hidden');
});`;
    if (logic === 'toggle-expanded') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  const current = event.currentTarget.getAttribute('aria-expanded') === 'true';
  event.currentTarget.setAttribute('aria-expanded', String(!current));
});`;
    if (logic === 'toggle-disabled') return `document.querySelector('${selector}')?.addEventListener('click', () => {
  document.querySelector('${target}')?.querySelectorAll('button, input, select, textarea').forEach((control) => {
    control.disabled = !control.disabled;
  });
});`;
    if (logic === 'add-loading') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  event.currentTarget.classList.add('is-loading');
  window.setTimeout(() => event.currentTarget.classList.remove('is-loading'), 1200);
});`;
    if (logic === 'confirm-action') return `document.querySelector('${selector}')?.addEventListener('click', () => {
  if (confirm('این عملیات انجام شود؟')) alert('تأیید شد');
});`;
    if (logic === 'random-color') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  event.currentTarget.style.setProperty('--dynamic-color', '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'));
  event.currentTarget.style.background = 'var(--dynamic-color)';
});`;
    if (logic === 'increment-number') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  const value = Number(event.currentTarget.dataset.value || event.currentTarget.textContent.match(/-?\\d+/)?.[0] || 0) + 1;
  event.currentTarget.dataset.value = String(value);
  event.currentTarget.textContent = String(value);
});`;
    if (logic === 'decrement-number') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  const value = Number(event.currentTarget.dataset.value || event.currentTarget.textContent.match(/-?\\d+/)?.[0] || 0) - 1;
  event.currentTarget.dataset.value = String(value);
  event.currentTarget.textContent = String(value);
});`;
    if (logic === 'form-validate') return `document.querySelector('${selector}')?.addEventListener('submit', (event) => {
  if (!event.currentTarget.checkValidity()) {
    event.preventDefault();
    event.currentTarget.classList.add('was-validated');
  }
});`;
    if (logic === 'tabs-basic') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-tab]');
  if (!tab) return;
  event.currentTarget.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
  event.currentTarget.querySelectorAll('[data-panel]').forEach((panel) => panel.hidden = panel.dataset.panel !== tab.dataset.tab);
});`;
    if (logic === 'accordion-basic') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-accordion-trigger]');
  if (!trigger) return;
  const panel = trigger.nextElementSibling;
  if (panel) panel.hidden = !panel.hidden;
});`;
    if (logic === 'dropdown-basic') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-dropdown-toggle]');
  if (toggle) event.currentTarget.classList.toggle('is-open');
});`;
    if (logic === 'modal-open') return `document.querySelector('${selector}')?.addEventListener('click', () => {
  document.querySelector('${targetSelector || '[data-modal]'}')?.showModal?.();
});`;
    if (logic === 'toast-message') return `document.querySelector('${selector}')?.addEventListener('click', () => {
  const toast = document.createElement('div');
  toast.textContent = 'پیام نمونه';
  toast.className = 'sample-toast';
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2200);
});`;
    if (logic === 'local-save') return `document.querySelector('${selector}')?.addEventListener('input', (event) => {
  localStorage.setItem('${selector}-value', event.target.value || event.currentTarget.textContent.trim());
});`;
    if (logic === 'scroll-into-view') return `document.querySelector('${selector}')?.addEventListener('click', () => {
  document.querySelector('${target}')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});`;
    if (logic === 'focus-first-input') return `document.querySelector('${selector}')?.addEventListener('click', (event) => {
  (document.querySelector('${target}') || event.currentTarget).querySelector('input, textarea, select, button')?.focus();
});`;
    return `document.querySelector('${selector}')?.addEventListener('click', () => {
  alert(${JSON.stringify(`${label} کلیک شد`)});
});`;
  };

  const renderPills = () => {
    elements.attributeList.innerHTML = builderAttributes.map((item, index) => `<button class="builder-pill" type="button" data-remove-builder-attribute="${index}">${escapeHtml(item.name)}="${escapeHtml(item.value)}" ×</button>`).join('');
    elements.styleList.innerHTML = builderStyles.map((item, index) => `<button class="builder-pill" type="button" data-remove-builder-style="${index}">${escapeHtml(item.prop)}: ${escapeHtml(item.value)} ×</button>`).join('');
    elements.logicList.innerHTML = builderLogics.map((item, index) => `<button class="builder-pill" type="button" data-remove-builder-logic="${index}">${escapeHtml(item)} ×</button>`).join('');
  };

  const buildOutput = () => {
    const template = selectedTemplate();
    const tag = safeToken(elements.tagInput.value, 'div').toLowerCase();
    const id = safeToken(elements.idInput.value, '');
    const classValue = String(elements.classInput.value || safeToken(elements.nameInput.value || template?.title, 'sample-element')).trim();
    const attrs = [id ? `id="${escapeHtml(id)}"` : '', classValue ? `class="${escapeHtml(classValue)}"` : '', ...builderAttributes.map((item) => `${escapeHtml(item.name)}="${escapeHtml(item.value)}"`)].filter(Boolean).join(' ');
    const content = elements.textInput.value.trim() || (previewDirty ? rawContentForTemplate(template, tag) : template?.body) || 'المان جدید';
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
    const html = voidTags.has(tag)
      ? `<${tag}${attrs ? ` ${attrs}` : ''} />`
      : `<${tag}${attrs ? ` ${attrs}` : ''}>
${content}
</${tag}>`;
    const selector = makeSelector();
    const animation = elements.animationSelect.value;
    const keyName = selector.slice(1) || 'sample-element';
    const animationFrames = {
      'fade-up': 'from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }',
      'fade-in': 'from { opacity: 0; } to { opacity: 1; }',
      'slide-right': 'from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); }',
      'slide-left': 'from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); }',
      'zoom-in': 'from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); }',
      pulse: '50% { transform: scale(1.03); }',
      float: '50% { transform: translateY(-6px); }',
      shake: '20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); }',
      glow: '50% { box-shadow: 0 0 26px rgba(97, 209, 255, .55); }',
      spin: 'to { transform: rotate(360deg); }',
      bounce: '50% { transform: translateY(-10px); }'
    };
    const animationCss = animation && animationFrames[animation]
      ? `
@keyframes ${keyName}-${animation} { ${animationFrames[animation]} }`
      : builderStyles.some((item) => String(item.value).includes('sample-glow-pulse'))
        ? `
@keyframes sample-glow-pulse { from { box-shadow: 0 0 14px rgba(59,130,246,.28); } to { box-shadow: 0 0 34px rgba(59,130,246,.72); } }`
        : '';
    const cssLines = builderStyles.map((item) => `  ${item.prop}: ${item.value};`);
    if (animation) cssLines.push(`  animation: ${keyName}-${animation} 700ms ease both;`);
    const css = cssLines.length ? `${selector} {
${cssLines.join('\n')}
}${animationCss}` : '';
    const js = builderLogics.map((logic) => makeLogicSnippet(logic, selector)).join('\n\n');
    return { html, css, js, name: elements.nameInput.value || template.title };
  };

  const render = () => {
    const output = buildOutput();
    elements.htmlOutput.value = output.html;
    elements.cssOutput.value = output.css;
    elements.jsOutput.value = output.js;
    setPreviewSource(output.html, output.css, output.js);
    renderPills();
  };

  const selectTemplate = () => {
    const template = selectedTemplate();
    const uniqueName = nextUniqueName(template);
    elements.nameInput.value = template.title;
    elements.tagInput.value = tagForTemplate(template);
    elements.idInput.value = uniqueName;
    elements.classInput.value = uniqueName;
    elements.textInput.value = '';
    builderAttributes = [];
    builderStyles = [];
    builderLogics = [];
    previewDirty = false;
    const output = buildOutput();
    elements.htmlOutput.value = output.html;
    elements.cssOutput.value = output.css;
    elements.jsOutput.value = output.js;
    setPreviewSource(template.body);
    renderPills();
    clearDefaultPreviewLater();
  };

  const openDialog = () => {
    if (!elements.dialog.open) elements.dialog.showModal();
    if (!elements.select.value) selectTemplate();
    if (previewDirty) render();
  };
  const closeDialog = () => elements.dialog.close();

  const openFromSelection = (descriptor = {}) => {
    openDialog();
    const id = safeToken(descriptor.id || '', '');
    const className = safeToken(descriptor.classes?.[0] || descriptor.selector || descriptor.tag || 'selected-element', 'selected-element');
    elements.nameInput.value = descriptor.selector || descriptor.tag || selectedTemplate()?.title || 'المان انتخاب‌شده';
    elements.idInput.value = id || className;
    elements.classInput.value = className;
    elements.textInput.value = descriptor.outerHTML || '';
    previewDirty = true;
    render();
  };

  const handleAdd = (type) => {
    previewDirty = true;
    if (type === 'attribute') {
      const name = elements.attrNameInput.value.trim();
      if (name) builderAttributes.push({ name, value: elements.attrValueInput.value.trim() });
      elements.attrNameInput.value = '';
      elements.attrValueInput.value = '';
    }
    if (type === 'style') {
      const preset = STYLE_PRESETS[elements.stylePresetSelect?.value || ''];
      if (preset) preset.forEach(([prop, value]) => builderStyles.push({ prop, value }));
      const prop = elements.stylePropSelect.value;
      const value = elements.styleValueInput.value.trim();
      if (prop && value) builderStyles.push({ prop, value });
    }
    if (type === 'logic') builderLogics.push(elements.logicSelect.value);
    render();
  };

  if (!elements.dialog) return;
  populateSelector();
  selectTemplate();
  elements.openBtn?.addEventListener('click', openDialog);
  window.addEventListener('sample-element-open-from-selection', (event) => openFromSelection(event.detail || {}));
  elements.closeBtn?.addEventListener('click', closeDialog);
  elements.cancelBtn?.addEventListener('click', closeDialog);
  elements.select.addEventListener('change', selectTemplate);
  elements.form.addEventListener('input', () => {
    previewDirty = true;
    render();
  });
  elements.insertBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sample-element-insert', { detail: buildOutput() }));
    closeDialog();
  });
  elements.form.addEventListener('click', (event) => {
    const add = event.target.closest('[data-builder-add]');
    if (add) { event.preventDefault(); handleAdd(add.dataset.builderAdd); return; }
    const attrRemove = event.target.closest('[data-remove-builder-attribute]');
    const styleRemove = event.target.closest('[data-remove-builder-style]');
    const logicRemove = event.target.closest('[data-remove-builder-logic]');
    if (attrRemove) { previewDirty = true; builderAttributes.splice(Number(attrRemove.dataset.removeBuilderAttribute), 1); render(); }
    if (styleRemove) { previewDirty = true; builderStyles.splice(Number(styleRemove.dataset.removeBuilderStyle), 1); render(); }
    if (logicRemove) { previewDirty = true; builderLogics.splice(Number(logicRemove.dataset.removeBuilderLogic), 1); render(); }
  });
})();
