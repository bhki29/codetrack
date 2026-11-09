import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

/* ---------- gaya (meniru desain CodeTrack) ---------- */
const card = 'rounded-xl bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] p-5 shadow-sm'
const inp = 'w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400'
const btn = 'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50'
const sub = 'text-slate-500 dark:text-slate-400'
const cap = 'text-xs font-semibold uppercase tracking-wider text-slate-400'
const DEF = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600'
const LB = {
  Python: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  JavaScript: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  Go: 'bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
  SQL: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  TypeScript: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  Rust: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
}
const LANGS = [...Object.keys(LB), 'Java', 'PHP', 'C#']
const normLang = (v) => { const t = String(v || '').trim().replace(/\s+/g, ' '); return LANGS.find((l) => l.toLowerCase() === t.toLowerCase()) || t }
const Badge = ({ l }) => <span className={`shrink-0 whitespace-nowrap px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold ${LB[l] || DEF}`}>{l}</span>
const Bar = ({ pct, c = 'bg-indigo-600' }) => <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} /></div>
const Check = ({ on, onClick }) => (
  <button onClick={onClick} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${on ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}>
    {on && <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>}
  </button>
)
const Icon = ({ d, cls = 'w-4 h-4' }) => <svg className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: d }} />
const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  daily: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  weekly: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  projects: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
}

/* ---------- tanggal & statistik ---------- */
const ymd = (d) => new Date(d).toLocaleDateString('en-CA')
const today = () => ymd(new Date())
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
function weekDates() {
  const mon = new Date(); mon.setHours(12); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7))
  return DAYS.map((l, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return { l, k: ymd(x), label: `${x.getDate()} ${BLN[x.getMonth()]}` } })
}
function calc(ms) {
  const done = ms.filter((m) => m.status === 'done' && m.completed_at)
  const days = {}
  done.forEach((m) => { const k = ymd(m.completed_at); days[k] = (days[k] || 0) + m.minutes / 60 })
  let streak = 0
  const d = new Date()
  if (!days[ymd(d)]) d.setDate(d.getDate() - 1)
  while (days[ymd(d)]) { streak++; d.setDate(d.getDate() - 1) }
  return { done, days, streak }
}

/* ---------- akses data Supabase ---------- */
function useTable(name) {
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from(name).select('*').order('created_at', { ascending: false })
    error ? setErr(error.message) : setRows(data)
  }, [name])
  useEffect(() => { load() }, [load])
  const run = async (q) => { const { error } = await q; if (error) setErr(error.message); load() }
  return {
    rows, err,
    add: (v) => run(supabase.from(name).insert(v)),
    patch: (id, v) => run(supabase.from(name).update(v).eq('id', id)),
    del: (id) => run(supabase.from(name).delete().eq('id', id)),
  }
}
const toggleDone = (t, m) => t.patch(m.id, { status: m.status === 'done' ? 'todo' : 'done', completed_at: m.status === 'done' ? null : new Date().toISOString() })

/* ---------- login ---------- */
const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25"><Icon cls="w-5 h-5" d='<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' /></div>
    <div><span className="font-bold text-lg tracking-tight">Code<span className="text-indigo-600 dark:text-indigo-400">Track</span></span><span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 -mt-1">progres.dev</span></div>
  </div>
)
function Auth() {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setBusy(false)
    if (error) setMsg(/invalid login/i.test(error.message) ? 'Email atau kata sandi salah.' : error.message)
  }
  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <div className="flex justify-center"><Logo /></div>
      <p className={`mt-3 mb-6 text-sm text-center ${sub}`}>Pantau target belajar coding harian, mingguan, dan proyekmu.</p>
      <form onSubmit={submit} className={card + ' space-y-3'}>
        <input className={inp} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={inp} type="password" placeholder="Kata sandi" value={pw} onChange={(e) => setPw(e.target.value)} required />
        {msg && <p className="text-sm text-rose-600">{msg}</p>}
        <button className={btn + ' w-full'} disabled={busy}>Masuk</button>
      </form>
    </div>
  )
}

/* ---------- dashboard ---------- */
function Dashboard({ t, projects, pms, st, user }) {
  const ms = t.rows, wk = weekDates(), keys = wk.map((w) => w.k)
  const overall = ms.length ? Math.round((st.done.length / ms.length) * 100) : 0
  const weekItems = ms.filter((m) => keys.includes(m.due_date)), weekDone = weekItems.filter((m) => m.status === 'done').length
  const weekPct = weekItems.length ? Math.round((weekDone / weekItems.length) * 100) : 0
  const bars = wk.map((w) => ({ ...w, h: st.days[w.k] || 0 })), maxH = Math.max(3, ...bars.map((b) => b.h))
  const W = 52, SHORT = 17 // 52 minggu (laptop); 17 minggu ≈ 4 bulan (HP)
  const start = new Date(); start.setHours(12); start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (W - 1) * 7)
  const cells = [...Array(W * 7)].map((_, i) => { const x = new Date(start); x.setDate(start.getDate() + i); const k = ymd(x); return { k, h: st.days[k] || 0, future: k > today(), old: i < (W - SHORT) * 7 } })
  const shade = (h) => (h === 0 ? 'bg-slate-100 dark:bg-slate-700/60' : h < 1 ? 'bg-emerald-200 dark:bg-emerald-900/60' : h < 2 ? 'bg-emerald-400 dark:bg-emerald-700' : 'bg-emerald-600 dark:bg-emerald-400')
  const langs = [...new Set(ms.map((m) => normLang(m.lang)).filter(Boolean))].map((l) => { const a = ms.filter((m) => normLang(m.lang) === l); return { l, t: a.length, d: a.filter((m) => m.status === 'done').length } })
  const todayList = ms.filter((m) => m.due_date === today())
  const prog = (p) => { const a = pms.filter((x) => x.project_id === p.id); return { a, pct: a.length ? Math.round((a.filter((x) => x.status === 'done').length / a.length) * 100) : 0 } }
  const active = projects.filter((p) => prog(p).pct < 100)
  const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="space-y-6">
      <div><p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">{date}</p><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Halo, {user.email.split('@')[0]} 👋</h1><p className={`text-sm mt-1 ${sub}`}>Satu target kecil hari ini lebih baik daripada rencana besar yang tertunda.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={card + ' card-hover'}><div className="flex justify-between mb-3"><span className={cap}>Progres Keseluruhan</span></div><div className="flex items-baseline gap-2"><span className="text-3xl font-bold font-mono">{overall}%</span><span className={`text-sm ${sub}`}>target selesai</span></div><div className="mt-3.5"><Bar pct={overall} /></div></div>
        <div className={card + ' card-hover'}><div className="flex justify-between mb-3"><span className={cap}>Streak Saat Ini</span><span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-sm">🔥</span></div><div className="flex items-baseline gap-2"><span className="text-3xl font-bold font-mono">{st.streak}</span><span className={`text-sm ${sub}`}>hari berturut-turut</span></div></div>
        <div className={card + ' card-hover'}><div className="flex justify-between mb-3"><span className={cap}>Selesai Minggu Ini</span><span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">{weekPct}%</span></div><div className="flex items-baseline gap-2"><span className="text-3xl font-bold font-mono">{weekDone}</span><span className={`text-sm ${sub}`}>dari <span className="font-mono">{weekItems.length}</span> target</span></div><div className="mt-3.5"><Bar pct={weekPct} c="bg-emerald-500" /></div></div>
        <div className={card + ' card-hover'}><div className="flex justify-between mb-3"><span className={cap}>Proyek Aktif</span></div><div className="flex items-baseline gap-2"><span className="text-3xl font-bold font-mono">{active.length}</span><span className={`text-sm ${sub}`}>sedang dikerjakan</span></div></div>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className={card + ' lg:col-span-3 h-80 flex flex-col'}>
          <h2 className="text-base font-bold mb-3 shrink-0">Target Hari Ini</h2>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 scroll-thin">
          {todayList.length === 0 && <p className={`text-sm ${sub}`}>Belum ada target untuk hari ini. Klik "Tambah Target" untuk membuat yang pertama.</p>}
          {todayList.map((m) => <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"><Check on={m.status === 'done'} onClick={() => toggleDone(t, m)} /><span className={`flex-1 min-w-0 text-sm ${m.status === 'done' ? 'line-through text-slate-400' : ''}`}>{m.title}</span><Badge l={m.lang} /><span className="text-xs font-mono text-slate-400">{m.minutes} mnt</span></div>)}
          </div>
        </div>
        <div className={card + ' lg:col-span-2 h-80 flex flex-col'}>
          <h2 className="text-base font-bold mb-3 shrink-0">Jam Belajar Mingguan</h2>
          <div className="flex gap-2 flex-1 min-h-0">{bars.map((b) => <div key={b.k} className="flex-1 min-w-0 flex flex-col items-center gap-2 group"><div className="w-full flex-1 min-h-0 flex items-end justify-center rounded-xl p-1.5 dark:bg-slate-800/50"><div className="w-full max-w-[34px] rounded-lg bg-blue-600 dark:bg-indigo-500" style={{ height: `${(b.h / maxH) * 100}%` }} title={`${b.h.toFixed(1)} jam`} /></div><span className="shrink-0 text-xs font-mono text-slate-500 dark:text-slate-400">{b.l}</span></div>)}</div>
        </div>
      </div>
      <div className={card}>
        <h2 className="text-base font-bold mb-3">Heatmap Konsistensi Belajar <span className={`text-xs font-normal ${sub}`}><span className="xl:hidden">(4 bulan terakhir)</span><span className="hidden xl:inline">(52 minggu terakhir)</span></span></h2>
        <div className="grid grid-flow-col grid-rows-7 auto-cols-fr gap-[3px] sm:gap-1">{cells.map((c) => <div key={c.k} title={`${c.k}: ${c.h.toFixed(1)} jam`} className={`w-full aspect-square rounded-[3px] ${c.old ? 'hidden xl:block' : ''} ${c.future ? 'opacity-0' : shade(c.h)}`} />)}</div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="text-base font-bold mb-3">Progres Belajar per Bahasa</h2>
          {langs.length === 0 && <p className={`text-sm ${sub}`}>Progres muncul setelah kamu membuat target.</p>}
          {langs.map((x) => <div key={x.l} className="mb-3.5"><div className="flex justify-between items-center mb-1.5"><Badge l={x.l} /><span className="text-xs font-mono text-slate-500">{x.d}/{x.t} target</span></div><Bar pct={(x.d / x.t) * 100} /></div>)}
        </div>
        <div className={card}>
          <h2 className="text-base font-bold mb-3">Proyek Aktif</h2>
          {active.length === 0 && <p className={`text-sm ${sub}`}>Belum ada proyek aktif.</p>}
          {active.map((p) => <div key={p.id} className="mb-3.5"><div className="flex justify-between text-sm mb-1.5"><span className="font-semibold">{p.name}</span><span className="text-xs font-mono text-slate-500">{prog(p).pct}%</span></div><Bar pct={prog(p).pct} c="bg-emerald-500" />{p.deadline && <p className="text-[11px] text-slate-400 mt-1">Tenggat {p.deadline}</p>}</div>)}
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ title, message, onOk, onClose }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={card + ' w-full max-w-md space-y-3.5 !p-6 shadow-xl'}>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className={`text-sm ${sub}`}>{message}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
          <button type="button" onClick={onOk} autoFocus className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-medium shadow-sm transition-all">Hapus</button>
        </div>
      </div>
    </div>
  )
}

/* ---------- target harian & mingguan ---------- */
function EditModal({ m, onSave, onClose }) {
  const [f, setF] = useState({ title: m.title, lang: m.lang, due_date: m.due_date, minutes: m.minutes })
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  const submit = (e) => { e.preventDefault(); onSave(m.id, { title: f.title.trim(), lang: normLang(f.lang), due_date: f.due_date, minutes: +f.minutes || 0 }) }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className={card + ' w-full max-w-md space-y-3.5 !p-6 shadow-xl'}>
        <h2 className="text-lg font-bold">Edit Target</h2>
        <label className="block"><span className={cap}>Judul</span><input className={inp + ' mt-1.5'} maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required autoFocus /></label>
        <label className="block"><span className={cap}>Bahasa</span><input className={inp + ' mt-1.5'} maxLength={30} placeholder="mis. Python" value={f.lang} onChange={(e) => setF({ ...f, lang: e.target.value })} required /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className={cap}>Tanggal</span><input className={inp + ' mt-1.5'} type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} required /></label>
          <label className="block"><span className={cap}>Menit</span><input className={inp + ' mt-1.5'} type="number" min="5" step="5" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} /></label>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
          <button className={btn}>Simpan</button>
        </div>
      </form>
    </div>
  )
}

function Milestones({ t, scope }) {
  const [f, setF] = useState({ title: '', lang: '', due_date: today(), minutes: 45 })
  const [ed, setEd] = useState(null)
  const saveEdit = (id, v) => { t.patch(id, v); setEd(null) }
  const EditBtn = ({ m }) => <button onClick={() => setEd(m)} className="shrink-0 text-xs text-indigo-600 dark:text-indigo-400">Edit</button>
  const list = t.rows.filter((m) => m.scope === scope).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const wk = weekDates(), keys = wk.map((w) => w.k)
  const submit = (e) => { e.preventDefault(); t.add({ ...f, lang: normLang(f.lang), scope, minutes: +f.minutes }); setF({ ...f, title: '' }) }
  const Row = (m) => (
    <div key={m.id} className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <Check on={m.status === 'done'} onClick={() => toggleDone(t, m)} />
      <div className="flex-1 min-w-0"><p className={`text-sm font-medium ${m.status === 'done' ? 'line-through text-slate-400' : ''}`}>{m.title}</p><p className="text-xs font-mono text-slate-400 mt-0.5">{m.due_date} · {m.minutes} mnt</p></div>
      <Badge l={m.lang} /><EditBtn m={m} /><button onClick={() => t.del(m.id)} className="shrink-0 text-xs text-rose-600 dark:text-rose-400">Hapus</button>
    </div>
  )
  const outside = list.filter((m) => !keys.includes(m.due_date))
  return (
    <div className="space-y-6">
      {ed && <EditModal m={ed} onSave={saveEdit} onClose={() => setEd(null)} />}
      <div><h1 className="text-2xl font-bold tracking-tight">{scope === 'daily' ? 'Target Harian' : 'Target Mingguan'}</h1><p className={`text-sm mt-1 ${sub}`}>{scope === 'daily' ? 'Catat apa yang ingin kamu pelajari hari ini.' : 'Susun target untuk minggu ini, Senin sampai Minggu.'}</p></div>
      <form onSubmit={submit} className={card + ' grid gap-3 sm:grid-cols-5'}>
        <input className={inp + ' sm:col-span-2'} maxLength={120} placeholder="Judul target, mis. Latihan list comprehension" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        <input className={inp} maxLength={30} placeholder="Bahasa, mis. Python" value={f.lang} onChange={(e) => setF({ ...f, lang: e.target.value })} required />
        <input className={inp} type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} required />
        <input className={inp} type="number" min="5" step="5" title="Estimasi menit" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} />
        <button className={btn + ' sm:col-span-5'}>Tambah target {scope === 'daily' ? 'harian' : 'mingguan'}</button>
      </form>
      {scope === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wk.map((w) => (
            <div key={w.k} className={`${card} min-w-0 !p-5 min-h-[240px] ${w.k === today() ? '!border-indigo-400 ring-1 ring-indigo-500/20' : ''}`}>
              <div className="pb-2.5 mb-1.5 border-b border-slate-100 dark:border-slate-800"><span className={`text-sm font-bold ${w.k === today() ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{w.l}{w.k === today() && ' (Hari Ini)'}</span><span className="block text-[11px] font-mono text-slate-400">{w.label}</span></div>
              {list.filter((m) => m.due_date === w.k).map((m) => (
                <div key={m.id} className="py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-start gap-2.5"><Check on={m.status === 'done'} onClick={() => toggleDone(t, m)} /><span className={`text-sm leading-snug ${m.status === 'done' ? 'line-through text-slate-400' : ''}`}>{m.title}</span></div>
                  <div className="flex items-center gap-2 mt-2 pl-[30px]"><Badge l={m.lang} /><span className="text-[11px] font-mono text-slate-400">{m.minutes} mnt</span><span className="ml-auto flex items-center gap-3"><EditBtn m={m} /><button onClick={() => t.del(m.id)} className="shrink-0 text-xs text-rose-600 dark:text-rose-400">Hapus</button></span></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className={card}>
        <h2 className="text-base font-bold mb-1">{scope === 'weekly' ? 'Di luar minggu ini' : 'Daftar Target Harian'}</h2>
        {(scope === 'weekly' ? outside : list).length === 0 && <p className={`text-sm ${sub}`}>{scope === 'weekly' ? 'Tidak ada target di luar minggu ini.' : 'Belum ada target. Isi formulir di atas untuk menambah yang pertama.'}</p>}
        {(scope === 'weekly' ? outside : list).map(Row)}
      </div>
    </div>
  )
}

/* ---------- proyek ---------- */
const COLS = { todo: 'Akan Dikerjakan', doing: 'Sedang Berjalan', review: 'Tinjauan', done: 'Selesai' }
function Projects({ pt, pm }) {
  const [f, setF] = useState({ name: '', stack: '', deadline: '' })
  const [sel, setSel] = useState(null), [title, setTitle] = useState(''), [del, setDel] = useState(null)
  const submit = (e) => { e.preventDefault(); pt.add({ name: f.name, stack: f.stack, deadline: f.deadline || null }); setF({ name: '', stack: '', deadline: '' }) }
  const prog = (p) => { const a = pm.rows.filter((x) => x.project_id === p.id); return { a, pct: a.length ? Math.round((a.filter((x) => x.status === 'done').length / a.length) * 100) : 0 } }
  const p = pt.rows.find((x) => x.id === sel)
  if (p) {
    const { a, pct } = prog(p)
    return (
      <div className="space-y-6">
        <button onClick={() => setSel(null)} className="text-sm text-indigo-600 dark:text-indigo-400">← Semua proyek</button>
        <div><h1 className="text-2xl font-bold tracking-tight">{p.name}</h1><p className={`text-sm mt-1 ${sub}`}>{p.stack || 'Tanpa stack'}{p.deadline && ` · tenggat ${p.deadline}`}</p><div className="mt-4 w-full"><div className="flex justify-between text-xs font-mono mb-1.5"><span>Progres</span><span>{pct}%</span></div><Bar pct={pct} c="bg-emerald-500" /></div></div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); pm.add({ project_id: p.id, title }); setTitle('') }}><input className={inp + ' flex-1 min-w-0'} maxLength={120} placeholder="Milestone baru, mis. Bangun halaman login" value={title} onChange={(e) => setTitle(e.target.value)} required /><button className={btn + ' shrink-0 whitespace-nowrap'}>Tambah</button></form>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(COLS).map(([k, l]) => (
            <div key={k} className="rounded-xl bg-slate-100/70 dark:bg-slate-800/40 p-3 min-h-[160px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">{l} <span className="font-mono text-slate-400">{a.filter((x) => x.status === k).length}</span></h3>
              {a.filter((x) => x.status === k).map((x) => (
                <div key={x.id} className={card + ' !p-3 mb-2.5'}>
                  <p className="text-sm font-medium">{x.title}</p>
                  <div className="flex items-center gap-2 mt-2.5"><select className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs" value={x.status} onChange={(e) => pm.patch(x.id, { status: e.target.value })}>{Object.entries(COLS).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select><button className="shrink-0 text-xs text-rose-600 dark:text-rose-400" onClick={() => pm.del(x.id)}>Hapus</button></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {del && <ConfirmModal title="Hapus Proyek" message={`Hapus proyek "${del.name}" beserta milestone-nya? Tindakan ini tidak bisa dibatalkan.`} onOk={() => { pt.del(del.id); setDel(null) }} onClose={() => setDel(null)} />}
      <div><h1 className="text-2xl font-bold tracking-tight">Proyek & Pengembangan</h1><p className={`text-sm mt-1 ${sub}`}>Pecah proyekmu menjadi milestone kecil dan pantau progresnya.</p></div>
      <form onSubmit={submit} className={card + ' grid gap-3 sm:grid-cols-4'}>
        <input className={inp} maxLength={80} placeholder="Nama proyek" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <input className={inp} placeholder="Tech stack, mis. React, Supabase" value={f.stack} onChange={(e) => setF({ ...f, stack: e.target.value })} />
        <input className={inp} type="date" title="Tenggat" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
        <button className={btn}>+ Proyek Baru</button>
      </form>
      {pt.rows.length === 0 && <p className={`text-sm ${sub}`}>Belum ada proyek. Buat satu untuk mulai mencatat milestone-nya.</p>}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pt.rows.map((x) => {
          const { a, pct } = prog(x)
          const tags = (x.stack || '').split(',').map((s) => s.trim()).filter(Boolean)
          return (
            <div key={x.id} className={card + ' card-hover cursor-pointer min-w-0'} onClick={() => setSel(x.id)}>
              <div className="flex justify-between items-start gap-2"><h3 className="font-bold">{x.name}</h3><button className="shrink-0 text-xs text-rose-600 dark:text-rose-400" onClick={(e) => { e.stopPropagation(); setDel(x) }}>Hapus</button></div>
              {tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{tags.map((s) => <Badge key={s} l={s} />)}</div>}
              <div className={`flex justify-between text-xs font-mono mb-1.5 text-slate-500 ${tags.length ? 'mt-3' : 'mt-2'}`}><span>{a.length} milestone</span><span>{pct}%</span></div><Bar pct={pct} c="bg-emerald-500" />
              {x.deadline && <p className="text-[11px] text-slate-400 mt-2">Tenggat {x.deadline}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- kerangka aplikasi ---------- */
function Shell({ user }) {
  const [tab, setTab] = useState('dashboard'), [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => (localStorage.getItem('codetrack_theme') || 'dark') === 'dark')
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('codetrack_theme', dark ? 'dark' : 'light') }, [dark])
  const ms = useTable('milestones'), pt = useTable('projects'), pm = useTable('project_milestones')
  const st = calc(ms.rows), err = ms.err || pt.err || pm.err
  const GOAL = 3, hrs = st.days[today()] || 0, pending = ms.rows.filter((m) => m.scope === 'daily' && m.status !== 'done').length
  const nav = [['dashboard', 'Dashboard'], ['daily', 'Target Harian'], ['weekly', 'Target Mingguan'], ['projects', 'Proyek']]
  const go = (k) => { setTab(k); setOpen(false) }
  return (
    <div className="flex min-h-screen">
      {open && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-white dark:bg-[#1e293b] border-r border-[#e2e8f0] dark:border-[#334155] flex flex-col justify-between transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          <div className="h-16 px-5 flex items-center border-b border-[#e2e8f0] dark:border-[#334155] cursor-pointer" onClick={() => go('dashboard')}><Logo /></div>
          <nav className="p-3.5 space-y-1">
            {nav.map(([k, l]) => (
              <button key={k} onClick={() => go(k)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === k ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'}`}>
                <Icon d={ICONS[k]} cls={`w-4 h-4 shrink-0 ${tab === k ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} /><span className="truncate">{l}</span>
                {k === 'daily' && pending > 0 && <span className={`ml-auto px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full ${tab === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{pending}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#e2e8f0] dark:border-[#334155]">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
            <div className="flex justify-between text-xs mb-1.5"><span className="font-medium text-slate-600 dark:text-slate-300">Target Belajar Harian</span><span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{hrs.toFixed(1)} / {GOAL.toFixed(1)}j</span></div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (hrs / GOAL) * 100)}%` }} /></div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{hrs >= GOAL ? 'Target hari ini tercapai 🎉' : `${Math.round((GOAL - hrs) * 60)} menit lagi untuk mencapai target`}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/30 transition-all"><Icon d='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' />Keluar</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/85 dark:bg-[#1e293b]/85 backdrop-blur-md border-b border-[#e2e8f0] dark:border-[#334155] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700"><Icon cls="w-5 h-5" d='<path d="M4 6h16M4 12h16M4 18h16"/>' /></button>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button onClick={() => go('daily')} className={btn}>+ <span className="hidden sm:inline">Tambah Target</span></button>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-semibold"><span className="text-sm">🔥</span><span className="font-mono">{st.streak}</span><span>Hari Streak</span></div>
            <button onClick={() => setDark(!dark)} title="Mode terang / gelap" className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">{dark ? '☀️' : '🌙'}</button>
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-semibold text-xs flex items-center justify-center">{user.email.slice(0, 2).toUpperCase()}</div>
                          </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {err && <p className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">Gagal memuat data: {err}. Pastikan schema.sql sudah dijalankan di Supabase.</p>}
          {tab === 'dashboard' && <Dashboard t={ms} projects={pt.rows} pms={pm.rows} st={st} user={user} />}
          {(tab === 'daily' || tab === 'weekly') && <Milestones key={tab} t={ms} scope={tab} />}
          {tab === 'projects' && <Projects pt={pt} pm={pm} />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', (localStorage.getItem('codetrack_theme') || 'dark') === 'dark')
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return null
  return session ? <Shell user={session.user} /> : <Auth />
}
