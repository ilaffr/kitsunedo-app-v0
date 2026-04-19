// App — routes between Auth, Dashboard, Lesson, Kana, Bestiary

const { useState: useStateA } = React;

function Dashboard({ onOpen }) {
  return (
    <div style={{padding: 40, display:'flex', flexDirection:'column', gap: 24}}>
      <HeroBanner name="幸子" />
      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap: 20}}>
        <DailyGoalCard />
        <StatCard kanji="習" label="WORDS LEARNED" value="427" sub="+12 this week" icon="book-open" />
        <StatCard kanji="筆" label="KANJI WRITTEN" value="89" sub="SRS queue: 14" icon="feather" />
        <StatCard kanji="霊" label="SPIRITS MET" value="6 / 50" sub="Yōkai bestiary" icon="sparkles" />
      </div>

      <div style={{marginTop: 8}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 16}}>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>稽古 — PRACTICE</div>
            <h3 className="yotei-title" style={{fontSize: 16}}>Today's Training</h3>
          </div>
          <button className="btn-ghost">All categories →</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 20}}>
          <StudyCategoryCard kanji="仮" jp="KANA" label="Kana Primer" sub="Hiragana · Katakana · stroke order." accent="vermillion" icon="feather" onClick={() => onOpen('kana')} />
          <StudyCategoryCard kanji="語" jp="VOCAB" label="Vocabulary" sub="AI flashcards with SRS review." icon="book-open" onClick={() => onOpen('lesson')} />
          <StudyCategoryCard kanji="文" jp="GRAMMAR" label="Grammar Scrolls" sub="Patterns, particles, examples." icon="scroll" onClick={() => onOpen('lesson')} />
          <StudyCategoryCard kanji="書" jp="WRITING" label="Kanji Brushwork" sub="Stroke-order canvas, self-grade." icon="pen-tool" onClick={() => onOpen('lesson')} />
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 20}}>
        <WashiCard>
          <div style={{padding: '20px 24px', borderBottom: '1px solid hsl(var(--foreground) / 0.06)', display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>道のり — THE PATH</div>
              <h3 className="yotei-title" style={{fontSize: 15}}>Edo · Scrolls 1 – 10</h3>
            </div>
            <button className="btn-ghost">Map →</button>
          </div>
          <LessonRow number={3} jp="買い物" title="Shopping & numbers" status="in-progress" duration={14} region="Edo" onClick={() => onOpen('lesson')} />
          <LessonRow number={4} jp="時間" title="Telling the hour" status="in-progress" duration={12} region="Edo" />
          <LessonRow number={5} jp="家族" title="Family & counters" status="complete" duration={18} region="Edo" />
          <LessonRow number={6} jp="週末" title="Days & weekends" status="complete" duration={16} region="Edo" />
          <LessonRow number={7} jp="旅行" title="Travel verbs" status="locked" duration={15} region="Edo" />
          <LessonRow number={8} jp="電車" title="Transport" status="locked" duration={14} region="Edo" />
        </WashiCard>

        <WashiCard style={{padding: 22, position:'relative', overflow:'hidden'}}>
          <KanjiWatermark style={{position:'absolute', right: -20, top: -20, fontSize: 200}}>霊</KanjiWatermark>
          <div style={{position:'relative'}}>
            <div className="eyebrow" style={{marginBottom: 6}}>NEW SPIRIT</div>
            <div style={{fontFamily:'var(--font-serif)', fontSize: 20, fontWeight: 500, marginBottom: 4}}>The Ink-Smudge Kitsune</div>
            <div style={{fontSize: 12, color:'hsl(var(--muted-foreground))', marginBottom: 16}}>
              Born from your struggle with 難しい. It will appear every time the word returns.
            </div>
            <div style={{
              aspectRatio: '4 / 3', borderRadius: 2, marginBottom: 16,
              background: 'radial-gradient(ellipse at 50% 45%, hsl(var(--muted)) 0%, hsl(var(--card)) 70%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              border:'1px solid hsl(var(--border))',
            }}>
              <span style={{fontFamily:'var(--font-serif)', fontSize: 100, fontWeight: 400, color:'hsl(var(--foreground) / 0.5)'}}>狐</span>
            </div>
            <Button variant="vermillion" style={{width:'100%', justifyContent:'center'}}>押印 — Stamp into bestiary</Button>
          </div>
        </WashiCard>
      </div>
    </div>
  );
}

function LessonView({ onBack }) {
  const [step, setStep] = useStateA(0);
  const [picked, setPicked] = useStateA(null);
  const words = [
    { word:'難しい', reading:'muzukashii', meaning:'difficult', example:'この漢字は難しいです。' },
    { word:'旅行',   reading:'ryokō',      meaning:'travel, trip', example:'旅行は楽しいですね。' },
    { word:'思い出', reading:'omoide',     meaning:'memory, recollection', example:'いい思い出になりました。' },
  ];
  const options = [
    { letter:'A', jp:'難しい', en:'difficult', key:'A' },
    { letter:'B', jp:'楽しい', en:'fun', key:'B' },
    { letter:'C', jp:'悲しい', en:'sad', key:'C' },
    { letter:'D', jp:'優しい', en:'kind', key:'D' },
  ];

  return (
    <div style={{padding: '32px 40px', maxWidth: 900, margin: '0 auto', display:'flex', flexDirection:'column', gap: 24}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button className="btn-ghost" onClick={onBack} style={{display:'flex',alignItems:'center',gap:6}}>
          <Icon name="chevron-left" size={14} /> Back to path
        </button>
        <div style={{flex:1, margin:'0 32px', display:'flex', alignItems:'center', gap: 10}}>
          <span className="eyebrow">Scroll 03</span>
          <div style={{flex:1, height: 3, background:'hsl(var(--foreground) / 0.08)', borderRadius: 1}}>
            <div style={{width: `${(step+1)*25}%`, height:'100%', background:'hsl(var(--primary))', borderRadius: 1, transition:'width .4s ease'}} />
          </div>
          <span style={{fontSize: 11, color:'hsl(var(--muted-foreground))', fontFamily:'var(--font-serif)'}}>{step+1} / 4</span>
        </div>
        <button className="btn-ghost"><Icon name="x" size={14} /></button>
      </div>

      {step === 0 && (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 24}}>
          <div style={{textAlign:'center'}}>
            <div className="eyebrow" style={{marginBottom: 6}}>LEARN</div>
            <h2 className="yotei-title" style={{fontSize: 18}}>New Vocabulary — 1 of 3</h2>
          </div>
          <div style={{width:'100%', maxWidth: 560}}>
            <VocabFlashcard {...words[0]} />
          </div>
          <div style={{display:'flex', gap: 12}}>
            <Button variant="outline" icon="volume">読み上げ</Button>
            <Button variant="ink" icon="arrow-right" onClick={() => setStep(1)}>Next word</Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div style={{textAlign:'center'}}>
            <div className="eyebrow" style={{marginBottom: 6}}>小テスト — MINI QUIZ</div>
            <h2 style={{fontFamily:'var(--font-serif)', fontSize: 30, fontWeight: 500}}>Which word means "difficult"?</h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, maxWidth: 680, margin:'0 auto', width:'100%'}}>
            {options.map(o => (
              <QuizOption key={o.key} {...o} status={picked === o.key ? (o.key === 'A' ? 'correct' : 'wrong') : null}
                          onClick={() => setPicked(o.key)} />
            ))}
          </div>
          <div style={{display:'flex', justifyContent:'center', gap: 12, marginTop: 8}}>
            <Button variant="ghost">Skip</Button>
            <Button variant="vermillion" icon="arrow-right" onClick={() => setStep(2)}>Check</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{textAlign:'center', padding: '40px 0', display:'flex', flexDirection:'column', alignItems:'center', gap: 20}}>
          <GinkgoSeal size={96} style={{fontSize: 44}}>完</GinkgoSeal>
          <div>
            <div className="eyebrow" style={{marginBottom: 6}}>見事 — SPLENDID</div>
            <h2 className="yotei-title" style={{fontSize: 22}}>Scroll 03 complete</h2>
          </div>
          <p style={{color:'hsl(var(--muted-foreground))', maxWidth: 440, lineHeight: 1.55}}>
            Eighteen minutes of honor. Three new words rest in your memory; a new spirit waits in the bestiary.
          </p>
          <div style={{display:'flex', gap: 12}}>
            <Button variant="outline" onClick={onBack}>Return to path</Button>
            <Button variant="ink" icon="arrow-right" onClick={() => { setStep(0); setPicked(null); }}>Next scroll</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function KanaView() {
  const hiragana = [
    ['あ','い','う','え','お'],
    ['か','き','く','け','こ'],
    ['さ','し','す','せ','そ'],
    ['た','ち','つ','て','と'],
    ['な','に','ぬ','ね','の'],
    ['は','ひ','ふ','へ','ほ'],
    ['ま','み','む','め','も'],
  ];
  const romaji = { あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo' };
  const [active, setActive] = useStateA('か');
  const learned = new Set(['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ']);

  return (
    <div style={{padding: '32px 40px', display:'grid', gridTemplateColumns:'1fr 420px', gap: 32, alignItems:'flex-start'}}>
      <div>
        <div className="eyebrow" style={{marginBottom: 6}}>平仮名 — HIRAGANA</div>
        <h2 className="yotei-title" style={{fontSize: 18, marginBottom: 24}}>The First Forty-Six</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 8}}>
          {hiragana.flat().map(k => (
            <KanaTile key={k} kana={k} romaji={romaji[k]}
                      active={active === k}
                      learned={learned.has(k)}
                      onClick={() => setActive(k)} />
          ))}
        </div>
      </div>
      <WashiCard style={{padding: 24, position:'sticky', top: 100}}>
        <div className="eyebrow" style={{marginBottom: 10}}>書き順 — STROKE ORDER</div>
        <div style={{
          aspectRatio: '1', background: 'hsl(var(--card))',
          border:'1px solid hsl(var(--border))', borderRadius: 2,
          backgroundImage: 'linear-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.08) 1px, transparent 1px), linear-gradient(hsl(var(--foreground) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.15) 1px, transparent 1px)',
          backgroundSize: 'calc(50% - .5px) calc(50% - .5px), calc(50% - .5px) calc(50% - .5px), 100% 100%, 100% 100%',
          backgroundPosition: '0 0, 0 0, 50% 50%, 50% 50%',
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
        }}>
          <span style={{fontFamily:'var(--font-serif)', fontSize: 220, fontWeight: 500, lineHeight: 1}}>{active}</span>
          <div style={{position:'absolute', top: 10, left: 10, fontSize: 10, letterSpacing:'.25em', color:'hsl(var(--muted-foreground))'}}>
            {romaji[active]?.toUpperCase()}
          </div>
        </div>
        <div style={{marginTop: 16, display:'flex', gap: 8}}>
          <Button variant="outline" icon="play" style={{flex:1, justifyContent:'center'}}>Animate</Button>
          <Button variant="ink" icon="pen-tool" style={{flex:1, justifyContent:'center'}}>Practice</Button>
        </div>
        <div style={{marginTop: 20, padding: 14, background:'hsl(var(--muted) / 0.5)', borderLeft:'2px solid hsl(var(--primary))', fontSize: 12, lineHeight: 1.55}}>
          <b style={{fontFamily:'var(--font-serif)'}}>Mnemonic.</b> A crooked tree branch, caught mid-fall — the sound of surprise, <i>ka!</i>
        </div>
      </WashiCard>
    </div>
  );
}

function BestiaryView() {
  const spirits = [
    { name:'Bakeneko',  jp:'化け猫',  region:'Edo',     rarity:'common',    locked:false },
    { name:'Tengu',     jp:'天狗',    region:'Kyōto',   rarity:'uncommon',  locked:false },
    { name:'Kappa',     jp:'河童',    region:'Kyūshū',  rarity:'uncommon',  locked:false },
    { name:'Yuki-onna', jp:'雪女',    region:'Tōhoku',  rarity:'rare',      locked:true  },
    { name:'Kamuy',     jp:'カムイ',  region:'Hokkaidō',rarity:'legendary', locked:true  },
    { name:'Oni',       jp:'鬼',      region:'???',     rarity:'legendary', locked:true  },
  ];
  return (
    <div style={{padding: '32px 40px'}}>
      <div style={{marginBottom: 24}}>
        <div className="eyebrow" style={{marginBottom: 6}}>妖怪図鑑 — BESTIARY</div>
        <h2 className="yotei-title" style={{fontSize: 18}}>Spirits You Have Met</h2>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 20}}>
        {spirits.map(s => <YokaiCard key={s.name} {...s} />)}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, LessonView, KanaView, BestiaryView });
