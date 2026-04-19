// Layout shells — Sidebar, Header, Shell

const { useState: useStateL } = React;

function Sidebar({ active = 'dashboard', onNav }) {
  const items = [
    { k: 'dashboard', kanji: '道', lbl: 'Path' },
    { k: 'lessons',   kanji: '学', lbl: 'Study' },
    { k: 'kana',      kanji: '練', lbl: 'Train' },
    { k: 'bestiary',  kanji: '績', lbl: 'Spirits' },
    { k: 'profile',   kanji: '栄', lbl: 'Honor' },
  ];
  return (
    <aside style={{
      width: 96, flexShrink: 0,
      borderRight: '1px solid hsl(var(--foreground) / 0.08)',
      background: 'hsl(var(--background) / 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 18, paddingBottom: 18, gap: 0,
      position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh',
    }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 2, marginBottom: 18 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'hsl(var(--foreground))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'hsl(var(--primary-foreground))',
          fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22,
        }}>狐</div>
        <div style={{ fontSize: 8, letterSpacing: '.3em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>Kitsune-dō</div>
      </div>
      <div style={{ height: 1, width: 40, background: 'hsl(var(--foreground) / 0.1)', marginBottom: 10 }} />
      <nav style={{ display:'flex', flexDirection:'column', gap: 4 }}>
        {items.map(it => (
          <button key={it.k} className={`nav-item ${active === it.k ? 'active' : ''}`} onClick={() => onNav && onNav(it.k)}>
            <span className="kanji">{it.kanji}</span>
            <span className="lbl">{it.lbl}</span>
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', display:'flex', flexDirection:'column', gap: 6, alignItems:'center' }}>
        <button className="nav-item" style={{width:48,height:48}} title="Settings"><Icon name="settings" size={18} /></button>
        <button className="nav-item" style={{width:48,height:48}} title="Sign out"><Icon name="log-out" size={18} /></button>
      </div>
    </aside>
  );
}

function Header({ title, kanji, subtitle }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'hsl(var(--background) / 0.82)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid hsl(var(--foreground) / 0.08)',
      padding: '18px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div className="eyebrow" style={{marginBottom: 6}}>{subtitle}</div>
        <div style={{display:'flex',alignItems:'baseline',gap: 14}}>
          <h2 className="serif-jp" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '.02em' }}>{kanji}</h2>
          <span className="yotei-title" style={{fontSize: 13}}>{title}</span>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap: 16}}>
        <div style={{display:'flex',alignItems:'center',gap: 8, color: 'hsl(var(--muted-foreground))'}}>
          <Icon name="flame" size={16} />
          <span style={{fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 500, color: 'hsl(var(--foreground))'}}>12</span>
          <span style={{fontSize: 10, letterSpacing: '.25em', textTransform:'uppercase'}}>日</span>
        </div>
        <div style={{height: 20, width: 1, background: 'hsl(var(--foreground) / 0.15)'}} />
        <button className="btn-ghost" style={{display:'flex',alignItems:'center',gap: 6}}>
          <Icon name="search" size={14} /><span>Search</span>
        </button>
        <div style={{
          width: 36, height: 36, borderRadius:'50%',
          background: 'hsl(var(--muted))', display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:'var(--font-serif)', fontSize: 15, fontWeight: 500,
          boxShadow: 'inset 0 0 0 1px hsl(var(--border))',
        }}>幸</div>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Header });
