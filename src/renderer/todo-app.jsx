import React, { useEffect, useState, useRef, useCallback } from 'react';

function classNames(...c){return c.filter(Boolean).join(' ')}

const DEFAULT_DURATIONS = { focus: 25, short: 5, long: 15 }; // minutes

function usePomodoro(durations){
  const [mode,setMode]=useState('focus');
  const [secondsLeft,setSecondsLeft]=useState(durations.focus*60);
  const [running,setRunning]=useState(false);
  const intervalRef = useRef(null);

  const reset = useCallback((m=mode)=>{setMode(m); setSecondsLeft(durations[m]*60); setRunning(false);},[mode,durations]);
  useEffect(()=>{ if(running){
    intervalRef.current = setInterval(()=>{
      setSecondsLeft(s=>{ if(s<=1){ clearInterval(intervalRef.current); return 0;} return s-1; });
    },1000);
  } return ()=>intervalRef.current && clearInterval(intervalRef.current); },[running]);

  useEffect(()=>{ // durations change -> reset current mode preserving running? stop for safety
    reset(mode);
  },[durations]);

  const switchMode = (m)=>{reset(m);} ;
  const start=()=>{ if(secondsLeft>0) setRunning(true); };
  const pause=()=>setRunning(false);

  const progress = 1 - (secondsLeft/(durations[mode]*60));
  const mm = String(Math.floor(secondsLeft/60)).padStart(2,'0');
  const ss = String(secondsLeft%60).padStart(2,'0');

  return { mode, running, start, pause, reset, switchMode, progress, display:`${mm}:${ss}`, secondsLeft };
}

const PomodoroClock = React.forwardRef(function PomodoroClock({ durations, setDurations }, ref){
  const { mode, running, start, pause, reset, switchMode, progress, display } = usePomodoro(durations);
  React.useImperativeHandle(ref, ()=>({
    toggle: ()=> running ? pause() : start(),
    reset,
    running
  }),[running,start,pause,reset]);
  const size=170; const stroke=10; const radius=(size/2)-stroke; const circ=2*Math.PI*radius; const offset=circ - progress*circ;

  function handleDurationChange(key,val){
    const minutes = Math.max(1, Math.min(180, parseInt(val||'0',10)));
    const next = { ...durations, [key]: minutes };
    setDurations(next);
    localStorage.setItem('pomodoro_durations', JSON.stringify(next));
  }

  return (
  <div className="pomo card inline">
      <div className="pomo-top">
        {['focus','short','long'].map(k=> (
          <button key={k} className={classNames('pomo-mode-btn', k===mode && 'active')} onClick={()=>switchMode(k)}>{k==='focus'? 'ODAK': k==='short'? 'KISA MOLA':'UZUN MOLA'}</button>
        ))}
      </div>
      <div className="pomo-flex">
        <div className="pomo-circle-wrapper small">
          <svg width={size} height={size} className="pomo-circle">
            <circle cx={size/2} cy={size/2} r={radius} stroke="#1f2733" strokeWidth={stroke} fill="none" />
            <circle cx={size/2} cy={size/2} r={radius} stroke="url(#grad)" strokeWidth={stroke} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="pomo-time">{display}</text>
          </svg>
          <div className="pomo-actions compact">
            {!running ? <button className="btn primary xs" onClick={start}>►</button> : <button className="btn xs" onClick={pause}>II</button>}
            <button className="btn xs" onClick={()=>reset()}>↺</button>
          </div>
        </div>
        <div className="pomo-settings">
          <div className="dur-row"><label>Odak</label><input type="number" min={1} max={180} value={durations.focus} onChange={e=>handleDurationChange('focus',e.target.value)} /></div>
          <div className="dur-row"><label>Kısa</label><input type="number" min={1} max={180} value={durations.short} onChange={e=>handleDurationChange('short',e.target.value)} /></div>
            <div className="dur-row"><label>Uzun</label><input type="number" min={1} max={180} value={durations.long} onChange={e=>handleDurationChange('long',e.target.value)} /></div>
          <div className="shortcut-info">
            <strong>Kısayollar</strong>
            <ul>
              <li><code>Enter</code>: Görev ekle & detaya gir</li>
              <li><code>Ctrl+Alt+S</code>: Başlat / Duraklat</li>
              <li><code>Ctrl+Alt+R</code>: Sıfırla</li>
              <li><code>Esc</code>: Detaydan çık</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

function NoteDetail({ todo, index, back, refresh }){
  const [note,setNote]=useState('');
  const [noteType,setNoteType]=useState('text'); // 'text' | 'task'
  const [saving,setSaving]=useState(false);
  const [banner,setBanner]=useState(todo.banner);
  const [offset,setOffset]=useState(todo.bannerOffset||0);
  const [editingTitle,setEditingTitle]=useState(false);
  const [titleDraft,setTitleDraft]=useState(todo.title);
  const [dueDraft,setDueDraft]=useState(todo.dueDate || '');
  const [priority,setPriority]=useState(todo.priority||'med');
  const textRef = useRef(null);
  useEffect(()=>{ textRef.current && textRef.current.focus(); },[]);

  // Detail specific shortcuts
  useEffect(()=>{
    function detailKeys(e){
      if(e.ctrlKey && e.key==='Enter'){
        e.preventDefault();
        add();
      } else if(e.ctrlKey && e.altKey && (e.key==='c' || e.key==='C')){
        e.preventDefault(); window.api.toggleCompleteTodo(index).then(refresh);
      } else if(e.ctrlKey && e.altKey && (e.key==='d' || e.key==='D')){
        e.preventDefault(); if(confirm('Görev silinsin mi?')) window.api.deleteTodo(index).then(()=>{back(); refresh();});
      } else if(e.ctrlKey && e.altKey && (e.key==='p' || e.key==='P')){
        e.preventDefault(); const next = priority==='low'?'med':priority==='med'?'high':'low'; setPriority(next); window.api.updateTodo(index,{priority:next}).then(refresh);
      } else if(e.ctrlKey && e.altKey && (e.key==='u' || e.key==='U')){
        const dateInput = document.querySelector('input[type="date"]'); dateInput && dateInput.focus();
      } else if(e.altKey && e.key==='ArrowUp'){
        e.preventDefault(); const next = Math.max(-400, offset-5); setOffset(next); window.api.setBannerOffset(index,next).then(refresh);
      } else if(e.altKey && e.key==='ArrowDown'){
        e.preventDefault(); const next = Math.min(400, offset+5); setOffset(next); window.api.setBannerOffset(index,next).then(refresh);
      }
    }
    window.addEventListener('keydown', detailKeys);
    return ()=>window.removeEventListener('keydown', detailKeys);
  },[add,index,priority,offset,refresh]);

  async function add(){
    if(!note.trim()) return;
    setSaving(true);
    const payload = noteType==='task' ? { type:'task', text:note.trim(), done:false } : { type:'text', text:note.trim() };
    await window.api.addNote(index, payload);
    setNote('');
    setNoteType('text');
    await refresh();
    setSaving(false);
    textRef.current?.focus();
  }

  async function toggleTask(i){
    await window.api.toggleNote(index, i);
    await refresh();
  }

  async function deleteNote(i){
    await window.api.deleteNote(index, i);
    await refresh();
  }

  async function chooseBanner(){
    const media = await window.api.selectMedia();
    if(!media) return;
    await window.api.updateBanner(index, media);
    setBanner(media);
    await refresh();
  }

  async function removeBanner(){
    await window.api.removeBanner(index);
    setBanner(null);
    await refresh();
  }

  // Drag to change banner vertical offset
  const dragRef = useRef({dragging:false,startY:0,origOffset:0,raf:null});
  const bannerContainerRef = useRef(null);

  const commitOffset = useCallback(async (v)=>{
    setOffset(v);
    await window.api.setBannerOffset(index, v);
    await refresh();
  },[index,refresh]);

  function onMouseDown(e){
    if(!banner) return;
    dragRef.current.dragging = true;
    dragRef.current.startY = e.clientY;
    dragRef.current.origOffset = offset;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  function onMouseMove(e){
    if(!dragRef.current.dragging) return;
    const delta = e.clientY - dragRef.current.startY;
    let next = dragRef.current.origOffset + delta;
    if(next < -400) next = -400; if(next>400) next=400;
    setOffset(next);
    if(!dragRef.current.raf){
      dragRef.current.raf = requestAnimationFrame(()=>{ dragRef.current.raf=null; commitOffset(next); });
    }
  }
  function onMouseUp(){
    dragRef.current.dragging=false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  return (
    <div className="detail-shell">
      <div className="detail-header">
        <button className="btn" onClick={back}>← Geri</button>
        {!editingTitle ? (
          <h2 onDoubleClick={()=>{setEditingTitle(true); setTitleDraft(todo.title);}} style={{cursor:'text'}}>{todo.title}</h2>
        ) : (
          <input value={titleDraft} onChange={e=>setTitleDraft(e.target.value)} onKeyDown={async e=>{ if(e.key==='Enter'){ await window.api.updateTodo(index,{ title:titleDraft.trim()||todo.title}); await refresh(); setEditingTitle(false);} else if(e.key==='Escape'){ setEditingTitle(false); } }} autoFocus className="input" style={{maxWidth:300}} />
        )}
        <div className="spacer" />
  <button className="btn" onClick={async ()=>{ await window.api.toggleCompleteTodo(index); await refresh(); }}>Tamamla</button>
  <button className="btn" onClick={async ()=>{ const ok= confirm('Görev silinsin mi?'); if(ok){ await window.api.deleteTodo(index); back(); await refresh(); } }}>Sil</button>
        <button className="btn" onClick={chooseBanner}>Banner Seç</button>
        {banner && <button className="btn" onClick={removeBanner}>Kaldır</button>}
      </div>
      <div className="card" style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div className="priority-badges">
          <span className={classNames('prio', priority==='low' && 'low', priority==='med' && 'med', priority==='high' && 'high')}>{priority==='low'?'LOW':'MED'===priority.toUpperCase()? 'MED':'HIGH'}</span>
          <button className="btn xs" onClick={async ()=>{ const next = priority==='low'?'med':priority==='med'?'high':'low'; setPriority(next); await window.api.updateTodo(index,{ priority:next}); await refresh(); }}>Öncelik Döngü</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <input type="date" value={dueDraft} onChange={async e=>{ setDueDraft(e.target.value); await window.api.updateTodo(index,{ dueDate:e.target.value || null}); await refresh(); }} className="input" style={{padding:'4px 8px',fontSize:'.7rem'}} />
          {todo.dueDate && <button className="btn xs" onClick={async ()=>{ setDueDraft(''); await window.api.updateTodo(index,{ dueDate:null}); await refresh(); }}>Temizle</button>}
        </div>
      </div>
      <div className="banner-area card" ref={bannerContainerRef} onMouseDown={onMouseDown} style={{cursor: banner? 'grab':'default'}}>
        {banner ? (
          banner.type==='video' ? <video src={banner.path} className="banner-media" style={{objectPosition:`center ${offset}px`, cursor:'grab'}} autoPlay muted loop /> : <img src={banner.path} alt="banner" className="banner-media" style={{objectPosition:`center ${offset}px`, cursor:'grab'}} />
        ) : (
          <div className="banner-placeholder">Banner yok - medya seç</div>
        )}
        {banner && <div style={{position:'absolute',bottom:6,right:10,fontSize:'.6rem',background:'rgba(0,0,0,.45)',padding:'4px 8px',borderRadius:8}}>Sürükleyerek konumlandır (y: {offset})</div>}
      </div>
      <div className="notes-block card">
        <h3>Notlar</h3>
        {todo.notes?.length? (
          <ul className="notes list">
            {todo.notes.map((n,i)=>(
              <li key={i} className={classNames('note-line', n.type==='task' && 'note-task', n.type==='task' && n.done && 'done')}>
                {n.type==='task' && (
                  <input type="checkbox" className="note-check" checked={!!n.done} onChange={()=>toggleTask(i)} />
                )}
                <span className="note-text" style={{flex:1}}>{n.text || n}</span>
                <button className="btn xs" style={{background:'#331d1d',borderColor:'#442626'}} onClick={()=>deleteNote(i)}>Sil</button>
              </li>
            ))}
          </ul>
        ) : <div className="empty small">Henüz not yok.</div>}
        <div className="note-new">
          <div className="note-type-toggle">
            <button type="button" className={classNames('seg-btn', noteType==='text' && 'active')} onClick={()=>setNoteType('text')}>Metin</button>
            <button type="button" className={classNames('seg-btn', noteType==='task' && 'active')} onClick={()=>setNoteType('task')}>Görev</button>
          </div>
          <textarea ref={textRef} className="textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder={noteType==='task'? 'Görev maddesi...' : 'Not yaz...'} rows={3} />
          <div className="note-actions">
            <button className="btn primary" disabled={!note.trim()||saving} onClick={add}>{saving? 'Kaydediliyor...' : 'Ekle'}</button>
          </div>
        </div>
      </div>
      <div className="card" style={{fontSize:'.7rem',lineHeight:1.5}}>
        <strong>Kısayollar (Detay)</strong>
        <ul style={{listStyle:'none',margin:'6px 0 0',padding:0,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:6}}>
          <li><code>Ctrl+Enter</code> Not ekle</li>
          <li><code>Ctrl+Alt+P</code> Öncelik döngü</li>
          <li><code>Ctrl+Alt+U</code> Tarihe odak</li>
          <li><code>Ctrl+Alt+C</code> Tamamla/Geri</li>
          <li><code>Ctrl+Alt+D</code> Sil</li>
          <li><code>Alt↑/Alt↓</code> Banner kaydır</li>
          <li><code>Ctrl+Alt+T</code> Tema döngü</li>
          <li><code>Esc</code> Geri</li>
        </ul>
      </div>
    </div>
  );
}

export function TodoApp(){
  const [todos,setTodos]=useState([]);
  const [title,setTitle]=useState('');
  const [newBanner,setNewBanner]=useState(null);
  const [loading,setLoading]=useState(true);
  const [detailIndex,setDetailIndex]=useState(null);
  const [search,setSearch]=useState('');
  // Tema sabit: artık state yok
  const [durations,setDurations]=useState(()=>{
    try {return JSON.parse(localStorage.getItem('pomodoro_durations')) || DEFAULT_DURATIONS;} catch {return DEFAULT_DURATIONS;}
  });
  const titleRef = useRef(null);
  const pomoRef = useRef(null);

  async function load(){
    setLoading(true);
    const list = await window.api.getTodos();
    setTodos(list);
    setLoading(false);
  }
  useEffect(()=>{load();},[]);

  async function addTodo(e){
    e.preventDefault();
    if(!title.trim()) return;
    await window.api.addTodo(title.trim(), newBanner);
    const newIndex = todos.length; // eklenecek index
    setTitle('');
    setNewBanner(null);
    await load();
    setDetailIndex(newIndex);
  }

  async function chooseNewBanner(){
    const media = await window.api.selectMedia();
    if(!media) return;
    setNewBanner(media);
  }

  function removeNewBanner(){ setNewBanner(null); }

  const inDetail = detailIndex!=null && todos[detailIndex];

  // Global shortcuts
  useEffect(()=>{
    function handler(e){
      if(e.key==='Enter' && !inDetail){
        if(title.trim()) addTodo(e);
      } else if(e.key==='Escape' && inDetail){
        setDetailIndex(null); titleRef.current?.focus();
      } else if(e.ctrlKey && e.altKey && (e.key==='s' || e.key==='S')){
        e.preventDefault(); pomoRef.current?.toggle();
      } else if(e.ctrlKey && e.altKey && (e.key==='r' || e.key==='R')){
        e.preventDefault(); pomoRef.current?.reset();
      } else if(e.ctrlKey && e.altKey && (e.key==='k' || e.key==='K')){
        e.preventDefault(); titleRef.current?.focus();
      } else if(e.ctrlKey && e.altKey && (e.key==='f' || e.key==='F')){
        e.preventDefault(); const searchInput = document.querySelector('input[placeholder="Ara (başlık / not)"]'); searchInput?.focus();
      }
    }
    window.addEventListener('keydown', handler);
    return ()=>window.removeEventListener('keydown', handler);
  },[title,inDetail,todos]);

  return (
    <div className={classNames('app-shell','column')}>
      <div className="window-bar" data-drag-region>
        <div className="window-drag" />
        <div className="win-buttons">
          <button className="win-btn" title="Küçült" onClick={()=>window.windowControls.minimize()}>─</button>
          <button className="win-btn" title="Büyüt / Geri" onClick={()=>window.windowControls.toggleMaximize()}>▢</button>
          <button className="win-btn close" title="Kapat" onClick={()=>window.windowControls.close()}>×</button>
        </div>
      </div>
      {!inDetail && (
        <>
          <div className="search-bar-wrapper">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ara (başlık / not)" className="input search-full" />
          </div>
          <div className="top-row">
            <form onSubmit={addTodo} className={classNames('add-form','compact','card','inline', newBanner && 'with-bg')} style={newBanner? { ['--bg-img']: `url(${newBanner.path})`, backgroundImage:`url(${newBanner.path})`, backgroundSize:'cover', backgroundPosition:'center' }: undefined}>
              {newBanner ? (
                <div className="banner-mini">
                  {newBanner.type==='video' ? <video src={newBanner.path} /> : <img src={newBanner.path} alt="banner" />}
                  <button type="button" className="remove-banner-btn" onClick={removeNewBanner}>×</button>
                </div>
              ) : (
                <button type="button" className="btn" onClick={chooseNewBanner}>Banner</button>
              )}
              <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Yeni görev başlığı" className="input" />
              <button className="btn primary" disabled={!title.trim()}>Ekle</button>
            </form>
            <PomodoroClock ref={pomoRef} durations={durations} setDurations={setDurations} />
          </div>
        </>
      )}
      {!inDetail && (
        <div className="list-area">
          {loading ? <div className="loading">Yükleniyor...</div> : (
            todos.length===0 ? <div className="empty">Bugün için hiç görev yok.</div> : (
              <ul className="todo-list">
                {todos.map((t,i)=>({t,i}))
                  .filter(({t})=>{
                    if(!search.trim()) return true;
                    const q = search.toLowerCase();
                    if(t.title.toLowerCase().includes(q)) return true;
                    if(Array.isArray(t.notes) && t.notes.some(n=> (n.text||'').toLowerCase().includes(q))) return true;
                    return false;
                  })
                  .map(({t,i})=>(
                  <li key={i} className={classNames('todo-item','card', t.completed && 'completed')}>
                    <div className="title-row" onClick={()=>setDetailIndex(i)} style={{cursor:'pointer',flex:1}}>
                      <span className="badge">{i+1}</span>
                      <span className="title-text" style={t.completed? {textDecoration:'line-through',opacity:.6}:undefined}>{t.title}</span>
                      <span className={classNames('prio', t.priority==='low' && 'low', t.priority==='med' && 'med', t.priority==='high' && 'high')} style={{marginLeft:8}}>{t.priority}</span>
                      {t.dueDate && <span className={classNames('due', (new Date(t.dueDate) < new Date() && !t.completed) && 'overdue')}>{t.dueDate}</span>}
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn xs" onClick={()=>window.api.toggleCompleteTodo(i).then(load)}>{t.completed? 'Geri Al':'✔'}</button>
                      <button className="btn xs" onClick={()=>{ if(confirm('Silinsin mi?')) window.api.deleteTodo(i).then(load); }}>✕</button>
                    </div>
                    {t.notes?.length>0 && (
                      <ul className="notes">
                        {t.notes.slice(-3).map((n,ni)=>(
                          <li key={ni} className={classNames('note-line', n.type==='task' && 'note-task', n.type==='task' && n.done && 'done')}>
                            {n.type==='task' && <span className="mini-check">{n.done? '✓' : '•'}</span>}
                            <span className="note-text">{n.text || n}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      )}
      {inDetail && (
        <div className="detail-pane">
          <NoteDetail todo={todos[detailIndex]} index={detailIndex} back={()=>setDetailIndex(null)} refresh={load} />
        </div>
      )}
      <footer className="app-footer">Yerel olarak kaydedilir • {new Date().toLocaleDateString('tr-TR')}</footer>
    </div>
  );
}
