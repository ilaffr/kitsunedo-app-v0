// Dashboard — hero, daily goal, study categories, lesson list, stats

function HeroBanner({ name = '幸' }) {
  return (
    <WashiCard style={{
      padding: 40, position: 'relative', overflow: 'hidden',
      backgroundImage: 'linear-gradient(105deg, hsl(var(--card)) 0%, hsl(var(--card)) 50%, hsl(var(--muted)) 100%)',
    }}>
      <KanjiWatermark style={{ position:'absolute', right: 24, top: -20, fontSize: 260 }}>狐道</KanjiWatermark>
      <div style={{position:'relative', maxWidth: 540}}>
        <div className="eyebrow" style={{marginBottom: 14}}>本日 — TODAY'S PATH</div>
        <h1 style={{ fontSize: 34, fontWeight: 500, letterSpacing: '.04em', lineHeight: 1.2, margin: 0, marginBottom: 12, fontFamily: 'var(--font-serif)' }}>
          お帰りなさい, {name}
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 15, lineHeight: 1.6, maxWidth: 440, marginBottom: 28 }}>
          The path reveals itself to those who walk it. Today — three scrolls wait for your brush, and a new spirit stirs in the bestiary.
        </p>
        <div style={{ display:'flex', gap: 12, alignItems: 'center' }}>
          <Button variant="vermillion" icon="play">続ける — Continue</Button>
          <Button variant="outline">Lesson Plan</Button>
        </div>
      </div>
    </WashiCard>
  );
}

function DailyGoalCard() {
  return (
    <WashiCard style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
      <ProgressRing value={68} size={84} stroke={3} />
      <div style={{flex:1}}>
        <div className="eyebrow" style={{marginBottom: 6}}>DAILY GOAL</div>
        <div style={{display:'flex',alignItems:'baseline',gap:10}}>
          <span style={{fontFamily:'var(--font-serif)', fontSize:30, fontWeight:500}}>17</span>
          <span style={{color:'hsl(var(--muted-foreground))', fontSize: 13}}>/ 25 min</span>
        </div>
        <div style={{fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 4}}>8 minutes remain on today's scroll.</div>
      </div>
      <GinkgoSeal size={56}>12</GinkgoSeal>
    </WashiCard>
  );
}

function StatCard({ kanji, label, value, sub, icon }) {
  return (
    <WashiCard style={{ padding: 20, position:'relative', overflow:'hidden' }}>
      <KanjiWatermark style={{ position:'absolute', right: -14, top: -28, fontSize: 140 }}>{kanji}</KanjiWatermark>
      <div style={{position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',gap: 8, color:'hsl(var(--muted-foreground))', marginBottom: 10}}>
          <Icon name={icon} size={14} />
          <span className="eyebrow">{label}</span>
        </div>
        <div style={{fontFamily:'var(--font-serif)', fontSize: 32, fontWeight: 500, letterSpacing:'.02em'}}>{value}</div>
        <div style={{fontSize: 11, color:'hsl(var(--muted-foreground))', marginTop: 4}}>{sub}</div>
      </div>
    </WashiCard>
  );
}

function StudyCategoryCard({ kanji, jp, label, sub, accent, icon, onClick }) {
  return (
    <WashiCard style={{ padding: 22, cursor:'pointer', position:'relative', overflow:'hidden', transition:'transform .2s ease' }}
               onClick={onClick}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom: 18}}>
        <div style={{
          width: 44, height: 44, borderRadius: 2,
          background: accent === 'vermillion' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--foreground) / 0.05)',
          display:'flex',alignItems:'center',justifyContent:'center',
          color: accent === 'vermillion' ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'
        }}>
          <Icon name={icon} size={20} />
        </div>
        <span style={{fontFamily:'var(--font-serif)', fontSize: 40, fontWeight: 400, color:'hsl(var(--foreground) / 0.12)', lineHeight:1}}>{kanji}</span>
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>{jp}</div>
      <div style={{fontFamily:'var(--font-serif)', fontSize: 20, fontWeight: 500, marginBottom: 6}}>{label}</div>
      <div style={{fontSize: 12, color:'hsl(var(--muted-foreground))', lineHeight: 1.5}}>{sub}</div>
      <div style={{marginTop: 16, display:'flex',alignItems:'center',gap: 6, color:'hsl(var(--muted-foreground))'}}>
        <span style={{fontSize: 10, letterSpacing:'.25em', textTransform:'uppercase'}}>Continue</span>
        <Icon name="chevron-right" size={12} />
      </div>
    </WashiCard>
  );
}

function LessonRow({ number, title, jp, status, duration, region, onClick }) {
  const seal = {
    'in-progress': <GinkgoSeal size={40}>進</GinkgoSeal>,
    'complete':    <span className="hanko-sq" style={{width:40,height:40,fontSize:16,transform:'rotate(-4deg)'}}>完</span>,
    'locked':      <div style={{width:40,height:40,borderRadius:2,background:'hsl(var(--muted))',display:'flex',alignItems:'center',justifyContent:'center',color:'hsl(var(--muted-foreground))'}}><Icon name="lock" size={16} /></div>,
  }[status];
  const dim = status === 'locked';
  return (
    <div onClick={!dim ? onClick : null} style={{
      display:'grid', gridTemplateColumns: '64px 1fr auto auto', gap: 20, alignItems:'center',
      padding: '18px 24px',
      borderBottom: '1px solid hsl(var(--foreground) / 0.06)',
      cursor: dim ? 'default' : 'pointer',
      opacity: dim ? 0.55 : 1,
      transition:'background .2s ease'
    }}
    onMouseEnter={e => !dim && (e.currentTarget.style.background = 'hsl(var(--foreground) / 0.02)')}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'var(--font-serif)', fontSize: 11, letterSpacing:'.3em', color:'hsl(var(--muted-foreground))', textTransform:'uppercase'}}>Scroll</div>
        <div style={{fontFamily:'var(--font-serif)', fontSize: 26, fontWeight: 500, lineHeight: 1}}>{String(number).padStart(2,'0')}</div>
      </div>
      <div>
        <div style={{fontFamily:'var(--font-serif)', fontSize: 18, fontWeight: 500, marginBottom: 4}}>
          {jp} <span style={{color:'hsl(var(--muted-foreground))', fontWeight: 400}}>— {title}</span>
        </div>
        <div style={{display:'flex',gap: 16, color:'hsl(var(--muted-foreground))', fontSize: 12}}>
          <span style={{display:'flex',alignItems:'center',gap: 4}}><Icon name="clock" size={12} />{duration} min</span>
          <span style={{display:'flex',alignItems:'center',gap: 4}}><Icon name="target" size={12} />{region}</span>
        </div>
      </div>
      <div>{seal}</div>
      <Icon name="chevron-right" size={16} style={{color:'hsl(var(--muted-foreground))'}} />
    </div>
  );
}

Object.assign(window, { HeroBanner, DailyGoalCard, StatCard, StudyCategoryCard, LessonRow });
