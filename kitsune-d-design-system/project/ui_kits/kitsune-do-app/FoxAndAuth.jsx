// Fox mascot + misc ornaments

function FoxMascot({ message, jp }) {
  return (
    <div style={{ position:'fixed', bottom: 32, right: 32, zIndex: 30, display:'flex', alignItems:'flex-end', gap: 12, pointerEvents:'none' }}>
      {message && (
        <div className="washi-card" style={{ padding: '12px 16px', maxWidth: 260, pointerEvents:'auto',
          position:'relative', marginBottom: 14,
        }}>
          {jp && <div style={{fontFamily:'var(--font-serif)', fontSize: 13, fontWeight: 500, marginBottom: 2}}>{jp}</div>}
          <div style={{fontSize: 12, color:'hsl(var(--muted-foreground))', lineHeight: 1.45}}>{message}</div>
          <div style={{
            position:'absolute', right: -6, bottom: 14,
            width: 12, height: 12, background: 'hsl(var(--card))',
            transform:'rotate(45deg)', boxShadow:'inset 0 0 0 1px hsl(30 12% 82% / 0.6)'
          }} />
        </div>
      )}
      <div className="animate-float" style={{
        width: 84, height: 84, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 40%, hsl(var(--card)) 0%, hsl(var(--muted)) 75%)',
        border: '1px solid hsl(var(--foreground) / 0.15)',
        display:'flex',alignItems:'center',justifyContent:'center',
        boxShadow: 'var(--shadow-md)', pointerEvents:'auto',
      }}>
        <span style={{fontFamily:'var(--font-serif)', fontSize: 42, fontWeight: 500, color:'hsl(var(--foreground))'}}>狐</span>
      </div>
    </div>
  );
}

function Auth({ onSignIn }) {
  return (
    <div style={{
      minHeight: '100vh', display:'grid', gridTemplateColumns: '1fr 480px',
      background: 'hsl(var(--background))',
    }}>
      {/* Left — hero paper */}
      <div style={{
        position:'relative', overflow:'hidden',
        background:
          'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)',
        display:'flex', alignItems:'flex-end', padding: 56,
      }}>
        <div style={{position:'absolute', inset: 0, overflow:'hidden'}}>
          <div style={{
            position:'absolute', top:'12%', left:'50%', transform:'translateX(-50%)',
            fontFamily:'var(--font-serif)', fontSize: 360, fontWeight: 500,
            color:'hsl(var(--foreground) / 0.08)', lineHeight: 1, userSelect:'none'
          }}>狐</div>
          {/* Mountain brushwork */}
          <svg viewBox="0 0 800 400" style={{position:'absolute', bottom: 0, width:'100%', height:'55%', opacity: 0.35}}>
            <path d="M0 300 Q 120 150 240 240 T 500 220 Q 600 180 800 260 L 800 400 L 0 400 Z" fill="hsl(30 8% 12%)" opacity="0.4"/>
            <path d="M0 340 Q 160 240 340 300 T 640 290 Q 720 270 800 310 L 800 400 L 0 400 Z" fill="hsl(30 8% 12%)" opacity="0.6"/>
          </svg>
        </div>
        <div style={{position:'relative', zIndex: 2, maxWidth: 460}}>
          <div className="eyebrow" style={{marginBottom: 14, color:'hsl(var(--foreground) / 0.7)'}}>狐道 — THE PATH OF THE FOX</div>
          <h1 style={{fontFamily:'var(--font-serif)', fontSize: 48, fontWeight: 400, letterSpacing:'.02em', lineHeight: 1.15, margin: 0}}>
            Let the kitsune spirit guide your brush through the way of Japanese.
          </h1>
          <div style={{marginTop: 24, display:'flex', gap: 10, alignItems:'center'}}>
            <GinkgoSeal size={40}>道</GinkgoSeal>
            <div style={{fontSize: 12, color:'hsl(var(--muted-foreground))'}}>
              Fifty scrolls. Five regions. One path.
            </div>
          </div>
        </div>
      </div>
      {/* Right — auth form */}
      <div style={{padding: 56, display:'flex',flexDirection:'column',justifyContent:'center', borderLeft:'1px solid hsl(var(--foreground) / 0.08)'}}>
        <div style={{marginBottom: 40}}>
          <div className="eyebrow" style={{marginBottom: 10}}>入門 — ENTER</div>
          <h2 className="yotei-title" style={{fontSize: 22}}>Sign into the Dojo</h2>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSignIn && onSignIn(); }} style={{display:'flex', flexDirection:'column', gap: 20}}>
          <div>
            <label className="field-label">Email</label>
            <input className="input" type="email" placeholder="name@example.com" defaultValue="sachiko@kitsune.do" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" defaultValue="kitsune" />
          </div>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 8}}>
            <label style={{display:'flex', alignItems:'center', gap: 8, fontSize: 12, color:'hsl(var(--muted-foreground))'}}>
              <input type="checkbox" defaultChecked /> Remember this scroll
            </label>
            <button type="button" className="btn-ghost">Forgot?</button>
          </div>
          <Button variant="ink" className="" style={{marginTop: 8, width:'100%', justifyContent:'center'}}>
            入る — Enter the Dojo
          </Button>
          <div style={{display:'flex',alignItems:'center',gap: 14, margin: '8px 0'}}>
            <div style={{flex:1, height: 1, background:'hsl(var(--foreground) / 0.1)'}} />
            <span style={{fontSize: 10, letterSpacing:'.3em', textTransform:'uppercase', color:'hsl(var(--muted-foreground))'}}>or</span>
            <div style={{flex:1, height: 1, background:'hsl(var(--foreground) / 0.1)'}} />
          </div>
          <Button variant="outline" style={{width:'100%', justifyContent:'center'}} icon="sparkles">試す — Try the kana primer free</Button>
        </form>
        <div style={{marginTop: 40, fontSize: 12, color:'hsl(var(--muted-foreground))'}}>
          New to the path? <a style={{color:'hsl(var(--foreground))', borderBottom:'1px solid currentColor'}} href="#">Begin a new scroll →</a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FoxMascot, Auth });
