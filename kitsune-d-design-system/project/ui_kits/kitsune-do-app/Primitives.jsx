// Core primitives for the Kitsune-dō UI kit
// Usage: after React + Babel, this file registers components on window.

const { useState, useEffect, useRef } = React;

// =====================================================
// Icon — thin Lucide-style SVG at strokeWidth 1.5
// =====================================================
const ICONS = {
  'book-open':    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  'pen-tool':     'm12 19 7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.586 7.586M11 11l-.01 0',
  'scroll':       'M19 17V5a2 2 0 0 0-2-2H4M8 21h13a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3',
  'graduation':   'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5',
  'trophy':       'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z',
  'flame':        'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  'home':         'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  'search':       'm21 21-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
  'chevron-right':'m9 18 6-6-6-6',
  'chevron-left': 'm15 18-6-6 6-6',
  'check':        'M20 6 9 17l-5-5',
  'lock':         'M5 11h14v10H5zM7 11V7a5 5 0 0 1 10 0v4',
  'play':         'M6 3v18l14-9z',
  'star':         'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z',
  'sparkles':     'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
  'clock':        'M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  'volume':       'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298zM16 9a5 5 0 0 1 0 6M19 5a9 9 0 0 1 0 14',
  'target':       'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'feather':      'M12.67 19a2 2 0 0 0 1.416-.586l6.154-6.111a5 5 0 0 0-7.07-7.071L5.116 11.25A2 2 0 0 0 4.5 12.672V18a1 1 0 0 0 1 1zM16 8 2 22M17.5 15H9',
  'x':            'M18 6 6 18M6 6l12 12',
  'arrow-right':  'M5 12h14M12 5l7 7-7 7',
  'user':         'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'log-out':      'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  'languages':    'm5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6',
  'settings':     'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'sunrise':      'M12 2v8M5.2 11.2l1.4 1.4M2 18h2M20 18h2M17.4 12.6l1.4-1.4M22 22H2M16 18a4 4 0 0 0-8 0M6 6l1 1',
};

function Icon({ name, size = 16, strokeWidth = 1.5, className = '', style = {} }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}
    >
      <path d={d} />
    </svg>
  );
}

// =====================================================
// Button
// =====================================================
function Button({ variant = 'ink', children, onClick, type = 'button', className = '', style = {}, icon }) {
  const cls = {
    ink: 'btn-ink',
    vermillion: 'btn-vermillion',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  }[variant] || 'btn-ink';
  return (
    <button type={type} onClick={onClick} className={`${cls} ${className}`} style={{display:'inline-flex',alignItems:'center',gap:10,...style}}>
      {icon && <Icon name={icon} size={14} />}
      <span>{children}</span>
    </button>
  );
}

// =====================================================
// Ginkgo seal (round) + Hanko stamp (square)
// =====================================================
function GinkgoSeal({ children, size = 48, style = {} }) {
  return (
    <span className="ginkgo-seal" style={{ width: size, height: size, fontSize: size * 0.4, ...style }}>
      {children}
    </span>
  );
}
function HankoStamp({ children, size = 44, rotate = -4, style = {} }) {
  return (
    <span className="hanko-sq" style={{ width: size, height: size, fontSize: size * 0.45, transform:`rotate(${rotate}deg)`, ...style }}>
      {children}
    </span>
  );
}

// =====================================================
// Washi card — the canonical container
// =====================================================
function WashiCard({ children, className = '', style = {}, onClick }) {
  return (
    <div className={`washi-card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

// =====================================================
// Kanji watermark drifting behind hero content
// =====================================================
function KanjiWatermark({ children, style = {} }) {
  return (
    <div className="kanji-watermark" style={{ fontSize: 180, ...style }}>
      {children}
    </div>
  );
}

// =====================================================
// Progress ring (SVG)
// =====================================================
function ProgressRing({ value = 0, size = 72, stroke = 3, color = 'hsl(var(--primary))' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const o = c * (1 - value / 100);
  return (
    <svg width={size} height={size} style={{ display:'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--foreground) / 0.1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
              strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round"
              transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset .6s ease' }} />
    </svg>
  );
}

Object.assign(window, { Icon, Button, GinkgoSeal, HankoStamp, WashiCard, KanjiWatermark, ProgressRing });
