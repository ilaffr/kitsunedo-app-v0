// Lesson / vocab flashcard + mini quiz

const { useState: useStateS } = React;

function VocabFlashcard({ word, reading, meaning, example }) {
  const [flipped, setFlipped] = useStateS(false);
  return (
    <WashiCard style={{padding: 0, overflow:'hidden', minHeight: 320, position:'relative', cursor:'pointer'}}
               onClick={() => setFlipped(!flipped)}>
      <KanjiWatermark style={{position:'absolute', right: -20, top: -40, fontSize: 300, opacity: 0.06}}>{word[0]}</KanjiWatermark>
      <div style={{padding: 36, position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight: 320, textAlign:'center'}}>
        {!flipped ? (
          <>
            <div className="eyebrow" style={{marginBottom: 18}}>単語 — VOCABULARY</div>
            <div style={{fontFamily:'var(--font-serif)', fontSize: 72, fontWeight: 500, letterSpacing:'.04em', lineHeight: 1}}>{word}</div>
            <div style={{marginTop: 12, color:'hsl(var(--muted-foreground))', fontSize: 14, letterSpacing:'.2em'}}>{reading}</div>
            <div style={{marginTop: 28, fontSize: 11, letterSpacing:'.25em', textTransform:'uppercase', color:'hsl(var(--muted-foreground))'}}>Tap to reveal</div>
          </>
        ) : (
          <>
            <div className="eyebrow" style={{marginBottom: 12}}>意味 — MEANING</div>
            <div style={{fontFamily:'var(--font-serif)', fontSize: 32, fontWeight: 500, marginBottom: 8}}>{meaning}</div>
            <div style={{color:'hsl(var(--muted-foreground))', fontSize: 14}}>{reading}</div>
            <div style={{marginTop: 24, padding: '14px 18px', background: 'hsl(var(--muted) / 0.5)', borderLeft:'2px solid hsl(var(--primary))', fontSize: 13, fontFamily: 'var(--font-serif)', maxWidth: 420}}>
              {example}
            </div>
          </>
        )}
      </div>
    </WashiCard>
  );
}

function QuizOption({ letter, jp, en, status, onClick }) {
  const bg = {
    correct: 'hsl(var(--success) / 0.1)',
    wrong:   'hsl(var(--destructive) / 0.08)',
  }[status] || 'hsl(var(--card))';
  const border = {
    correct: 'hsl(var(--success))',
    wrong:   'hsl(var(--destructive))',
    selected:'hsl(var(--foreground))',
  }[status] || 'hsl(var(--border))';
  return (
    <button onClick={onClick} style={{
      textAlign:'left', padding: 18, width: '100%',
      background: bg, border: `1px solid ${border}`, borderRadius: 2,
      display:'flex', alignItems:'center', gap: 16, transition:'all .2s ease',
      fontFamily: 'inherit', color:'inherit', cursor:'pointer',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 2,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-serif)', fontWeight: 500, fontSize: 14,
        background: 'hsl(var(--foreground))', color:'hsl(var(--background))'
      }}>{letter}</span>
      <div style={{flex:1}}>
        <div style={{fontFamily:'var(--font-serif)', fontSize: 18, fontWeight: 500}}>{jp}</div>
        <div style={{fontSize: 12, color:'hsl(var(--muted-foreground))', marginTop: 2}}>{en}</div>
      </div>
      {status === 'correct' && <Icon name="check" size={18} style={{color:'hsl(var(--success))'}} />}
      {status === 'wrong' && <Icon name="x" size={18} style={{color:'hsl(var(--destructive))'}} />}
    </button>
  );
}

function YokaiCard({ name, jp, region, rarity, locked, size = 'md', onClick }) {
  const rarityKanji = { common: '初', uncommon: '中', rare: '上', legendary: '極' }[rarity] || '初';
  const rarityColor = rarity === 'legendary' ? 'hsl(var(--primary))' : 'hsl(var(--foreground))';
  return (
    <WashiCard onClick={onClick} style={{padding: 0, overflow:'hidden', cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.5 : 1, position:'relative'}}>
      <div style={{
        aspectRatio: '3 / 4',
        background: locked
          ? 'hsl(var(--muted))'
          : `radial-gradient(ellipse at 50% 45%, hsl(var(--muted)) 0%, hsl(var(--card)) 70%)`,
        position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
        filter: locked ? 'grayscale(1) blur(2px)' : 'none',
      }}>
        <span style={{fontFamily:'var(--font-serif)', fontSize: size === 'lg' ? 140 : 96, fontWeight: 400, color: 'hsl(var(--foreground) / 0.4)', letterSpacing: 0}}>
          {locked ? '？' : jp[0]}
        </span>
        {!locked && (
          <span style={{
            position:'absolute', top: 12, right: 12,
            width: 32, height: 32, display:'flex',alignItems:'center',justifyContent:'center',
            background: rarityColor, color:'hsl(var(--background))',
            fontFamily:'var(--font-serif)', fontSize: 14, fontWeight: 500,
            borderRadius: 2, transform:'rotate(-4deg)',
            boxShadow: '0 2px 6px hsl(0 0% 0% / .2)',
          }}>{rarityKanji}</span>
        )}
      </div>
      <div style={{padding: 14, borderTop:'1px solid hsl(var(--foreground) / 0.06)'}}>
        <div style={{fontFamily:'var(--font-serif)', fontSize: 15, fontWeight: 500}}>{locked ? '???' : name}</div>
        <div style={{fontSize: 10, letterSpacing:'.22em', textTransform:'uppercase', color:'hsl(var(--muted-foreground))', marginTop: 2}}>
          {locked ? '未発見 — Undiscovered' : region}
        </div>
      </div>
    </WashiCard>
  );
}

function KanaTile({ kana, romaji, active, learned, onClick }) {
  return (
    <button onClick={onClick} style={{
      aspectRatio: '1',
      background: active ? 'hsl(var(--foreground))' : (learned ? 'hsl(var(--card))' : 'hsl(var(--muted) / 0.4)'),
      color: active ? 'hsl(var(--background))' : 'hsl(var(--foreground))',
      border: `1px solid ${active ? 'hsl(var(--foreground))' : 'hsl(var(--border))'}`,
      borderRadius: 2,
      display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',
      gap: 4, cursor:'pointer', transition:'all .2s ease',
      fontFamily:'inherit', padding: 8,
      opacity: learned === false && !active ? 0.5 : 1,
    }}>
      <span style={{fontFamily:'var(--font-serif)', fontSize: 26, fontWeight: 500, lineHeight: 1}}>{kana}</span>
      <span style={{fontSize: 9, letterSpacing:'.2em', textTransform:'uppercase', opacity: 0.7}}>{romaji}</span>
    </button>
  );
}

Object.assign(window, { VocabFlashcard, QuizOption, YokaiCard, KanaTile });
