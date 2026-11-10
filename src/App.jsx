import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "./supabase";

/* ---------- gaya (meniru desain CodeTrack) ---------- */
const card =
  "rounded-xl bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] p-5 shadow-sm";
const inp =
  "w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400";
const btn =
  "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50";
const sub = "text-slate-500 dark:text-slate-400";
const cap = "text-xs font-semibold uppercase tracking-wider text-slate-400";
const DEF =
  "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600";
const LB = {
  Python:
    "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
  JavaScript:
    "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  Go: "bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
  SQL: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  TypeScript:
    "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  Rust: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
};
const LANGS = [...Object.keys(LB), "Java", "PHP", "C#"];
const normLang = (v) => {
  const t = String(v || "")
    .trim()
    .replace(/\s+/g, " ");
  return LANGS.find((l) => l.toLowerCase() === t.toLowerCase()) || t;
};
const Badge = ({ l }) => (
  <span
    className={`shrink-0 whitespace-nowrap px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold ${LB[l] || DEF}`}
  >
    {l}
  </span>
);
const Bar = ({ pct, c = "bg-indigo-600" }) => (
  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
    <div
      className={`h-full ${c} rounded-full transition-all duration-500`}
      style={{ width: `${pct}%` }}
    />
  </div>
);
const Check = ({ on, onClick }) => (
  <button
    onClick={onClick}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${on ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"}`}
  >
    {on && (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )}
  </button>
);
const Icon = ({ d, cls = "w-4 h-4" }) => (
  <svg
    className={cls}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    dangerouslySetInnerHTML={{ __html: d }}
  />
);
const ICONS = {
  dashboard:
    '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  daily:
    '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  weekly:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  projects:
    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
};

/* ---------- tanggal & statistik ---------- */
const ymd = (d) => new Date(d).toLocaleDateString("en-CA");
const today = () => ymd(new Date());
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const BLN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
function weekDates(off = 0) {
  const mon = new Date();
  mon.setHours(12);
  mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7) + off * 7);
  return DAYS.map((l, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return {
      l,
      k: ymd(x),
      label: `${x.getDate()} ${BLN[x.getMonth()]}`,
      y: x.getFullYear(),
    };
  });
}
const mins = (m) => m.actual_minutes ?? m.minutes;
function calc(ms) {
  const done = ms.filter((m) => m.status === "done" && m.completed_at);
  const days = {};
  done.forEach((m) => {
    const k = ymd(m.completed_at);
    days[k] = (days[k] || 0) + mins(m) / 60;
  });
  let streak = 0;
  const d = new Date();
  if (!days[ymd(d)]) d.setDate(d.getDate() - 1);
  while (days[ymd(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return { done, days, streak };
}

/* ---------- akses data Supabase ---------- */
function useTable(name) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(name)
      .select("*")
      .order("created_at", { ascending: false });
    error ? setErr(error.message) : setRows(data);
  }, [name]);
  useEffect(() => {
    load();
  }, [load]);
  const run = async (q) => {
    const { error } = await q;
    if (error) setErr(error.message);
    load();
  };
  return {
    rows,
    err,
    reload: load,
    add: (v) => run(supabase.from(name).insert(v)),
    patch: (id, v) => run(supabase.from(name).update(v).eq("id", id)),
    del: (id) => run(supabase.from(name).delete().eq("id", id)),
  };
}

/* ---------- login ---------- */
const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
      <Icon
        cls="w-5 h-5"
        d='<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'
      />
    </div>
    <div>
      <span className="font-bold text-lg tracking-tight">
        Code<span className="text-indigo-600 dark:text-indigo-400">Track</span>
      </span>
      <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 -mt-1">
        progres.dev
      </span>
    </div>
  </div>
);
function Auth() {
  const [email, setEmail] = useState(""),
    [pw, setPw] = useState(""),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });
    setBusy(false);
    if (error)
      setMsg(
        /invalid login/i.test(error.message)
          ? "Email atau kata sandi salah."
          : error.message,
      );
  };
  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <div className="flex justify-center">
        <Logo />
      </div>
      <p className={`mt-3 mb-6 text-sm text-center ${sub}`}>
        Pantau target belajar coding harian, mingguan, dan proyekmu.
      </p>
      <form onSubmit={submit} className={card + " space-y-3"}>
        <input
          className={inp}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={inp}
          type="password"
          placeholder="Kata sandi"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        {msg && <p className="text-sm text-rose-600">{msg}</p>}
        <button className={btn + " w-full"} disabled={busy}>
          Masuk
        </button>
      </form>
    </div>
  );
}

/* ---------- dashboard ---------- */
function Dashboard({ t, projects, pms, st, user, onToggle }) {
  const ms = t.rows,
    wk = weekDates(),
    keys = wk.map((w) => w.k);
  const overall = ms.length
    ? Math.round((st.done.length / ms.length) * 100)
    : 0;
  const weekItems = ms.filter((m) => keys.includes(m.due_date)),
    weekDone = weekItems.filter((m) => m.status === "done").length;
  const weekPct = weekItems.length
    ? Math.round((weekDone / weekItems.length) * 100)
    : 0;
  const bars = wk.map((w) => ({ ...w, h: st.days[w.k] || 0 })),
    maxH = Math.max(3, ...bars.map((b) => b.h));
  const W = 52,
    SHORT = 17; // 52 minggu (laptop); 17 minggu ≈ 4 bulan (HP)
  const start = new Date();
  start.setHours(12);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (W - 1) * 7);
  const cells = [...Array(W * 7)].map((_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    const k = ymd(x);
    return {
      k,
      h: st.days[k] || 0,
      future: k > today(),
      old: i < (W - SHORT) * 7,
    };
  });
  const shade = (h) =>
    h === 0
      ? "bg-slate-100 dark:bg-slate-700/60"
      : h < 1
        ? "bg-emerald-200 dark:bg-emerald-900/60"
        : h < 2
          ? "bg-emerald-400 dark:bg-emerald-700"
          : "bg-emerald-600 dark:bg-emerald-400";
  const langs = [
    ...new Set(ms.map((m) => normLang(m.lang)).filter(Boolean)),
  ].map((l) => {
    const a = ms.filter((m) => normLang(m.lang) === l);
    return { l, t: a.length, d: a.filter((m) => m.status === "done").length };
  });
  const todayList = ms.filter((m) => m.due_date === today());
  const prog = (p) => {
    const a = pms.filter((x) => x.project_id === p.id);
    return {
      a,
      pct: a.length
        ? Math.round(
            (a.filter((x) => x.status === "done").length / a.length) * 100,
          )
        : 0,
    };
  };
  const active = projects.filter((p) => prog(p).pct < 100);
  const date = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">
          {date}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Halo, {user.email.split("@")[0]} 👋
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Satu target kecil hari ini lebih baik daripada rencana besar yang
          tertunda.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={card + " card-hover"}>
          <div className="flex justify-between mb-3">
            <span className={cap}>Progres Keseluruhan</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono">{overall}%</span>
            <span className={`text-sm ${sub}`}>target selesai</span>
          </div>
          <div className="mt-3.5">
            <Bar pct={overall} />
          </div>
        </div>
        <div className={card + " card-hover"}>
          <div className="flex justify-between mb-3">
            <span className={cap}>Streak Saat Ini</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-sm">
              🔥
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono">{st.streak}</span>
            <span className={`text-sm ${sub}`}>hari berturut-turut</span>
          </div>
        </div>
        <div className={card + " card-hover"}>
          <div className="flex justify-between mb-3">
            <span className={cap}>Selesai Minggu Ini</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              {weekPct}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono">{weekDone}</span>
            <span className={`text-sm ${sub}`}>
              dari <span className="font-mono">{weekItems.length}</span> target
            </span>
          </div>
          <div className="mt-3.5">
            <Bar pct={weekPct} c="bg-emerald-500" />
          </div>
        </div>
        <div className={card + " card-hover"}>
          <div className="flex justify-between mb-3">
            <span className={cap}>Proyek Aktif</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono">
              {active.length}
            </span>
            <span className={`text-sm ${sub}`}>sedang dikerjakan</span>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className={card + " lg:col-span-3 h-80 flex flex-col"}>
          <h2 className="text-base font-bold mb-3 shrink-0">Target Hari Ini</h2>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 scroll-thin">
            {todayList.length === 0 && (
              <p className={`text-sm ${sub}`}>
                Belum ada target untuk hari ini. Klik "Tambah Target" untuk
                membuat yang pertama.
              </p>
            )}
            {todayList.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <Check on={m.status === "done"} onClick={() => onToggle(m)} />
                <span
                  className={`flex-1 min-w-0 text-sm ${m.status === "done" ? "line-through text-slate-400" : ""}`}
                >
                  {m.title}
                </span>
                <Badge l={m.lang} />
                <span className="text-xs font-mono text-slate-400">
                  {mins(m)} mnt
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className={card + " lg:col-span-2 h-80 flex flex-col"}>
          <h2 className="text-base font-bold mb-3 shrink-0">
            Jam Belajar Mingguan
          </h2>
          <div className="flex gap-2 flex-1 min-h-0">
            {bars.map((b) => (
              <div
                key={b.k}
                className="flex-1 min-w-0 flex flex-col items-center gap-2 group"
              >
                <div className="w-full flex-1 min-h-0 flex items-end justify-center rounded-xl p-1.5 dark:bg-slate-800/50">
                  <div
                    className="w-full max-w-[34px] rounded-lg bg-blue-600 dark:bg-indigo-500"
                    style={{ height: `${(b.h / maxH) * 100}%` }}
                    title={`${b.h.toFixed(1)} jam`}
                  />
                </div>
                <span className="shrink-0 text-xs font-mono text-slate-500 dark:text-slate-400">
                  {b.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={card}>
        <h2 className="text-base font-bold mb-3">
          Heatmap Konsistensi Belajar{" "}
          <span className={`text-xs font-normal ${sub}`}>
            <span className="xl:hidden">(4 bulan terakhir)</span>
            <span className="hidden xl:inline">(52 minggu terakhir)</span>
          </span>
        </h2>
        <div className="grid grid-flow-col grid-rows-7 auto-cols-fr gap-[3px] sm:gap-1">
          {cells.map((c) => (
            <div
              key={c.k}
              title={`${c.k}: ${c.h.toFixed(1)} jam`}
              className={`w-full aspect-square rounded-[3px] ${c.old ? "hidden xl:block" : ""} ${c.future ? "opacity-0" : shade(c.h)}`}
            />
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="text-base font-bold mb-3">
            Progres Belajar per Bahasa
          </h2>
          {langs.length === 0 && (
            <p className={`text-sm ${sub}`}>
              Progres muncul setelah kamu membuat target.
            </p>
          )}
          {langs.map((x) => (
            <div key={x.l} className="mb-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <Badge l={x.l} />
                <span className="text-xs font-mono text-slate-500">
                  {x.d}/{x.t} target
                </span>
              </div>
              <Bar pct={(x.d / x.t) * 100} />
            </div>
          ))}
        </div>
        <div className={card}>
          <h2 className="text-base font-bold mb-3">Proyek Aktif</h2>
          {active.length === 0 && (
            <p className={`text-sm ${sub}`}>Belum ada proyek aktif.</p>
          )}
          {active.map((p) => (
            <div key={p.id} className="mb-3.5">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold">{p.name}</span>
                <span className="text-xs font-mono text-slate-500">
                  {prog(p).pct}%
                </span>
              </div>
              <Bar pct={prog(p).pct} c="bg-emerald-500" />
              {p.deadline && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Tenggat {p.deadline}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onOk, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={card + " w-full max-w-md space-y-3.5 !p-6 shadow-xl"}
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <p className={`text-sm ${sub}`}>{message}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onOk}
            autoFocus
            className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-medium shadow-sm transition-all"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- target harian & mingguan ---------- */
function EditModal({ m, onSave, onClose }) {
  const weekly = m.scope === "weekly";
  const [f, setF] = useState({
    title: m.title,
    lang: m.lang,
    due_date: m.due_date,
    minutes: m.minutes,
    actual: m.actual_minutes ?? "",
    outcome: m.outcome || "",
    notes: m.notes || "",
  });
  const submit = (e) => {
    e.preventDefault();
    const v = {
      title: f.title.trim(),
      lang: normLang(f.lang),
      due_date: f.due_date,
      minutes: +f.minutes || 0,
      actual_minutes: f.actual === "" ? null : Math.max(0, +f.actual || 0),
      notes: f.notes.trim() || null,
    };
    if (weekly) v.outcome = f.outcome.trim() || null;
    onSave(m.id, v);
  };
  return (
    <Dialog title="Edit Target" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <label className="block">
          <span className={cap}>Judul</span>
          <input
            className={inp + " mt-1.5"}
            maxLength={120}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            required
            autoFocus
          />
        </label>
        <label className="block">
          <span className={cap}>Bahasa</span>
          <input
            className={inp + " mt-1.5"}
            maxLength={30}
            placeholder="mis. Python"
            value={f.lang}
            onChange={(e) => setF({ ...f, lang: e.target.value })}
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={cap}>Tanggal</span>
            <input
              className={inp + " mt-1.5"}
              type="date"
              value={f.due_date}
              onChange={(e) => setF({ ...f, due_date: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className={cap}>Menit (rencana)</span>
            <input
              className={inp + " mt-1.5"}
              type="number"
              min="5"
              step="5"
              value={f.minutes}
              onChange={(e) => setF({ ...f, minutes: e.target.value })}
            />
          </label>
        </div>
        <label className="block">
          <span className={cap}>Menit aktual (opsional)</span>
          <input
            className={inp + " mt-1.5"}
            type="number"
            min="0"
            step="1"
            placeholder="Waktu yang benar-benar dipakai"
            value={f.actual}
            onChange={(e) => setF({ ...f, actual: e.target.value })}
          />
        </label>
        {weekly && (
          <label className="block">
            <span className={cap}>Hasil besar yang ingin dicapai</span>
            <input
              className={inp + " mt-1.5"}
              maxLength={160}
              placeholder="mis. Login dan dashboard berjalan"
              value={f.outcome}
              onChange={(e) => setF({ ...f, outcome: e.target.value })}
            />
          </label>
        )}
        <label className="block">
          <span className={cap}>Catatan</span>
          <textarea
            className={inp + " mt-1.5 min-h-[90px] resize-y"}
            maxLength={2000}
            placeholder="Hal yang belum dipahami, pertanyaan, referensi"
            value={f.notes}
            onChange={(e) => setF({ ...f, notes: e.target.value })}
          />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={ghost}>
            Batal
          </button>
          <button className={btn}>Simpan</button>
        </div>
      </form>
    </Dialog>
  );
}

function DoneModal({ m, onSave, onClose }) {
  const [v, setV] = useState(m.actual_minutes ?? m.minutes);
  return (
    <Dialog title="Berapa menit kamu mengerjakannya?" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(Math.max(0, Math.round(+v || 0)));
        }}
        className="space-y-3.5"
      >
        <p className={`text-sm ${sub}`}>
          {m.title} · rencana {m.minutes} menit. Boleh dilewati.
        </p>
        <input
          className={inp}
          type="number"
          min="0"
          step="1"
          value={v}
          onChange={(e) => setV(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => onSave(null)} className={ghost}>
            Lewati
          </button>
          <button className={btn}>Simpan</button>
        </div>
      </form>
    </Dialog>
  );
}

/* ---------- import Excel ---------- */
const TPL_HEAD = [
  "Judul",
  "Bahasa",
  "Tanggal",
  "Menit",
  "Cakupan",
  "Hasil Besar",
  "Catatan",
];
async function downloadTemplate() {
  const { default: writeXlsxFile } = await import("write-excel-file");
  const head = TPL_HEAD.map((value) => ({ value, fontWeight: "bold" }));
  const ex = (a) =>
    a.map((v) =>
      v === ""
        ? null
        : typeof v === "number"
          ? { value: v, type: Number }
          : { value: v, type: String },
    );
  await writeXlsxFile(
    [
      head,
      ex([
        "Belajar async/await",
        "JavaScript",
        today(),
        45,
        "harian",
        "",
        "Belum paham Promise.all",
      ]),
      ex([
        "Bangun halaman login",
        "React",
        today(),
        60,
        "mingguan",
        "Login dan dashboard berjalan",
        "",
      ]),
    ],
    {
      fileName: "template-target-codetrack.xlsx",
      columns: [
        { width: 36 },
        { width: 14 },
        { width: 14 },
        { width: 8 },
        { width: 12 },
        { width: 36 },
        { width: 36 },
      ],
    },
  );
}
const cs = (v) =>
  v == null ? "" : v instanceof Date ? ymd(v) : String(v).trim();
const okDate = (y, mo, d) => {
  const x = new Date(Date.UTC(+y, +mo - 1, +d));
  return x.getUTCMonth() === +mo - 1 && x.getUTCDate() === +d
    ? `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    : null;
};
const parseDate = (v) => {
  if (v == null || v === "") return today();
  if (v instanceof Date) {
    if (isNaN(v)) return null;
    return v.getUTCHours() === 0 && v.getUTCMinutes() === 0
      ? v.toISOString().slice(0, 10)
      : ymd(v);
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return okDate(m[1], m[2], m[3]);
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  return m ? okDate(m[3], m[2], m[1]) : null;
};
const parseSheet = (rows, limit = 500) => {
  const out = [],
    errs = [];
  rows.slice(0, limit + 1).forEach((r, i) => {
    if (i === 0 && /^judul/i.test(cs(r[0]))) return;
    if (r.every((c) => c == null || c === "")) return;
    const n = i + 1,
      title = cs(r[0]).slice(0, 120),
      lang = normLang(cs(r[1])).slice(0, 30),
      due = parseDate(r[2]),
      mn = Number(r[3]);
    const sc = /ming|week/i.test(cs(r[4])) ? "weekly" : "daily";
    const isDone = /^(selesai|done)/i.test(cs(r[7])),
      ac = cs(r[8]) === "" ? null : Number(r[8]),
      ca = cs(r[9]);
    if (!title) return errs.push(`Baris ${n}: judul kosong`);
    if (!lang) return errs.push(`Baris ${n}: bahasa kosong`);
    if (!due)
      return errs.push(
        `Baris ${n}: tanggal tidak valid (pakai format 2026-12-31)`,
      );
    out.push({
      title,
      lang,
      due_date: due,
      minutes: mn > 0 ? Math.round(mn) : 45,
      scope: sc,
      outcome: sc === "weekly" ? cs(r[5]) || null : null,
      notes: cs(r[6]) || null,
      status: isDone ? "done" : "todo",
      actual_minutes: ac != null && ac >= 0 ? Math.round(ac) : null,
      completed_at: isDone
        ? new Date(
            ca && !isNaN(Date.parse(ca)) ? ca : due + "T12:00:00",
          ).toISOString()
        : null,
    });
  });
  return {
    rows: out.slice(0, limit),
    errs: errs.slice(0, 30),
    over: out.length > limit,
  };
};
function ImportModal({ onImport, onClose }) {
  const [res, setRes] = useState(null),
    [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  const pick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    setRes(null);
    try {
      const { default: readXlsxFile } = await import("read-excel-file");
      setRes(parseSheet(await readXlsxFile(file)));
    } catch {
      setErr(
        "Gagal membaca file. Pastikan formatnya .xlsx, sebaiknya dari template.",
      );
    }
    setBusy(false);
  };
  const tpl = async () => {
    try {
      await downloadTemplate();
    } catch {
      setErr("Gagal membuat template.");
    }
  };
  const d = res ? res.rows.filter((r) => r.scope === "daily").length : 0;
  return (
    <Dialog title="Import Target dari Excel" onClose={onClose}>
      <p className={`text-sm ${sub}`}>
        Isi banyak target sekaligus dari file{" "}
        <span className="font-mono">.xlsx</span>. Kolom: {TPL_HEAD.join(", ")}.
        Cakupan diisi <i>harian</i> atau <i>mingguan</i>.
      </p>
      <button type="button" onClick={tpl} className={ghost}>
        Unduh template Excel
      </button>
      <input
        type="file"
        accept=".xlsx"
        onChange={pick}
        className={
          inp +
          " file:mr-3 file:border-0 file:bg-transparent file:text-indigo-600 dark:file:text-indigo-400 file:font-medium"
        }
      />
      {busy && <p className={`text-sm ${sub}`}>Membaca file…</p>}
      {err && <p className="text-sm text-rose-600">{err}</p>}
      {res && (
        <div className="space-y-2 text-sm">
          <p>
            <b>{res.rows.length}</b> target siap diimpor ({d} harian,{" "}
            {res.rows.length - d} mingguan)
            {res.over && " · hanya 500 baris pertama"}
          </p>
          {res.rows.slice(0, 4).map((r, i) => (
            <p key={i} className={`text-xs truncate ${sub}`}>
              {r.due_date} · {r.lang} · {r.title}
            </p>
          ))}
          {res.rows.length > 4 && (
            <p className={`text-xs ${sub}`}>
              …dan {res.rows.length - 4} lainnya
            </p>
          )}
          {res.errs.length > 0 && (
            <div className="text-xs text-rose-600 dark:text-rose-400">
              <p className="font-semibold">{res.errs.length} baris dilewati:</p>
              {res.errs.slice(0, 5).map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className={ghost}>
          Batal
        </button>
        <button
          type="button"
          disabled={!res || !res.rows.length}
          onClick={() => onImport(res.rows)}
          className={btn}
        >
          Impor{res && res.rows.length ? ` ${res.rows.length} target` : ""}
        </button>
      </div>
    </Dialog>
  );
}

function Milestones({ t, scope, onToggle }) {
  const [f, setF] = useState({
    title: "",
    lang: "",
    due_date: today(),
    minutes: 45,
    outcome: "",
    notes: "",
  });
  const [ed, setEd] = useState(null),
    [off, setOff] = useState(0),
    [openN, setOpenN] = useState({});
  const saveEdit = (id, v) => {
    t.patch(id, v);
    setEd(null);
  };
  const EditBtn = ({ m }) => (
    <button
      onClick={() => setEd(m)}
      className="shrink-0 text-xs text-indigo-600 dark:text-indigo-400"
    >
      Edit
    </button>
  );
  const NoteChip = ({ m }) =>
    m.notes ? (
      <button
        type="button"
        onClick={() => setOpenN({ ...openN, [m.id]: !openN[m.id] })}
        className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25"
      >
        Catatan
      </button>
    ) : null;
  const NoteBox = ({ m }) =>
    m.notes && openN[m.id] ? (
      <p className="mt-2 text-xs whitespace-pre-line rounded-lg px-2.5 py-1.5 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
        {m.notes}
      </p>
    ) : null;
  const Mnt = ({ m }) =>
    m.actual_minutes != null ? (
      <>
        <s className="opacity-60">{m.minutes}</s>{" "}
        <span className="text-emerald-600 dark:text-emerald-400">
          {m.actual_minutes} mnt
        </span>
      </>
    ) : (
      <>{m.minutes} mnt</>
    );
  const list = t.rows
    .filter((m) => m.scope === scope)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const wk = weekDates(off),
    keys = wk.map((w) => w.k);
  const submit = (e) => {
    e.preventDefault();
    const row = {
      title: f.title.trim(),
      lang: normLang(f.lang),
      due_date: f.due_date,
      minutes: +f.minutes || 45,
      scope,
      notes: f.notes.trim() || null,
    };
    if (scope === "weekly") row.outcome = f.outcome.trim() || null;
    t.add(row);
    setF({ ...f, title: "", notes: "", outcome: "" });
  };
  const Row = (m) => (
    <div
      key={m.id}
      className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      <div className="flex items-center gap-3">
        <Check on={m.status === "done"} onClick={() => onToggle(m)} />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${m.status === "done" ? "line-through text-slate-400" : ""}`}
          >
            {m.title}
          </p>
          {m.outcome && (
            <p className="text-xs mt-0.5 text-indigo-600 dark:text-indigo-400">
              Hasil: {m.outcome}
            </p>
          )}
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            {m.due_date} · <Mnt m={m} />
          </p>
        </div>
        <NoteChip m={m} />
        <Badge l={m.lang} />
        <EditBtn m={m} />
        <button
          onClick={() => t.del(m.id)}
          className="shrink-0 text-xs text-rose-600 dark:text-rose-400"
        >
          Hapus
        </button>
      </div>
      <div className="pl-[30px]">
        <NoteBox m={m} />
      </div>
    </div>
  );
  const outside = list.filter((m) => !keys.includes(m.due_date));
  const range = `${wk[0].label} – ${wk[6].label} ${wk[6].y}`;
  return (
    <div className="space-y-6">
      {ed && <EditModal m={ed} onSave={saveEdit} onClose={() => setEd(null)} />}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {scope === "daily" ? "Target Harian" : "Target Mingguan"}
          </h1>
          <p className={`text-sm mt-1 ${sub}`}>
            {scope === "daily"
              ? "Catat apa yang ingin kamu pelajari hari ini."
              : "Susun rencana belajar per hari dan hasil besar yang ingin dicapai."}
          </p>
        </div>
        {scope === "weekly" && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 sm:justify-end">
            <span className="order-first w-full text-center text-sm font-semibold sm:order-none sm:w-auto sm:px-1 whitespace-nowrap">
              {range}
            </span>
            <button
              onClick={() => setOff(off - 1)}
              className={
                ghost + " !px-2.5 sm:!px-3 !py-1.5 !text-[13px] sm:!text-sm"
              }
            >
              ‹ Sebelumnya
            </button>
            <button
              onClick={() => setOff(0)}
              disabled={off === 0}
              className={
                btn +
                " !px-2.5 sm:!px-3 !py-1.5 !text-[13px] sm:!text-sm disabled:opacity-40"
              }
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setOff(off + 1)}
              className={
                ghost + " !px-2.5 sm:!px-3 !py-1.5 !text-[13px] sm:!text-sm"
              }
            >
              Berikutnya ›
            </button>
          </div>
        )}
      </div>
      <form onSubmit={submit} className={card + " grid gap-3 sm:grid-cols-5"}>
        <input
          className={inp + " sm:col-span-2"}
          maxLength={120}
          placeholder="Judul target, mis. Latihan list comprehension"
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          required
        />
        <input
          className={inp}
          maxLength={30}
          placeholder="Bahasa, mis. Python"
          value={f.lang}
          onChange={(e) => setF({ ...f, lang: e.target.value })}
          required
        />
        <input
          className={inp}
          type="date"
          value={f.due_date}
          onChange={(e) => setF({ ...f, due_date: e.target.value })}
          required
        />
        <input
          className={inp}
          type="number"
          min="5"
          step="5"
          title="Estimasi menit"
          value={f.minutes}
          onChange={(e) => setF({ ...f, minutes: e.target.value })}
        />
        {scope === "weekly" && (
          <input
            className={inp + " sm:col-span-5"}
            maxLength={160}
            placeholder="Hasil besar yang ingin dicapai, mis. Login dan dashboard berjalan"
            value={f.outcome}
            onChange={(e) => setF({ ...f, outcome: e.target.value })}
          />
        )}
        <textarea
          className={inp + " sm:col-span-5 min-h-[64px] resize-y"}
          maxLength={2000}
          placeholder="Catatan (opsional): hal yang belum dipahami atau perlu dicari tahu"
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
        />
        <button className={btn + " sm:col-span-5"}>
          Tambah target {scope === "daily" ? "harian" : "mingguan"}
        </button>
      </form>
      {scope === "weekly" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wk.map((w) => (
            <div
              key={w.k}
              className={`${card} min-w-0 !p-5 min-h-[240px] ${w.k === today() ? "!border-indigo-400 ring-1 ring-indigo-500/20" : ""}`}
            >
              <div className="pb-2.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                <span
                  className={`text-sm font-bold ${w.k === today() ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                >
                  {w.l}
                  {w.k === today() && " (Hari Ini)"}
                </span>
                <span className="block text-[11px] font-mono text-slate-400">
                  {w.label}
                </span>
              </div>
              {list
                .filter((m) => m.due_date === w.k)
                .map((m) => (
                  <div
                    key={m.id}
                    className="py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <div className="flex items-start gap-2.5">
                      <Check
                        on={m.status === "done"}
                        onClick={() => onToggle(m)}
                      />
                      <span
                        className={`text-sm leading-snug ${m.status === "done" ? "line-through text-slate-400" : ""}`}
                      >
                        {m.title}
                      </span>
                    </div>
                    {m.outcome && (
                      <p className="pl-[30px] mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                        Hasil: {m.outcome}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 pl-[30px] flex-wrap">
                      <Badge l={m.lang} />
                      <span className="text-[11px] font-mono text-slate-400">
                        <Mnt m={m} />
                      </span>
                      <NoteChip m={m} />
                      <span className="ml-auto flex items-center gap-3">
                        <EditBtn m={m} />
                        <button
                          onClick={() => t.del(m.id)}
                          className="shrink-0 text-xs text-rose-600 dark:text-rose-400"
                        >
                          Hapus
                        </button>
                      </span>
                    </div>
                    <div className="pl-[30px]">
                      <NoteBox m={m} />
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
      <div className={card}>
        <h2 className="text-base font-bold mb-1">
          {scope === "weekly"
            ? off === 0
              ? "Di luar minggu ini"
              : "Di luar minggu yang ditampilkan"
            : "Daftar Target Harian"}
        </h2>
        {(scope === "weekly" ? outside : list).length === 0 && (
          <p className={`text-sm ${sub}`}>
            {scope === "weekly"
              ? "Tidak ada target di luar minggu ini."
              : "Belum ada target. Isi formulir di atas untuk menambah yang pertama."}
          </p>
        )}
        {(scope === "weekly" ? outside : list).map(Row)}
      </div>
    </div>
  );
}

/* ---------- proyek ---------- */
const fmt = (d) => {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${+dd} ${BLN[+m - 1]} ${y}`;
};
const fixUrl = (v) => {
  v = (v || "").trim();
  if (!v) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^https?:\/\//i.test(v)) return false;
  return /^https?:\/\//i.test(v) ? v : "https://" + v;
};
const shortUrl = (u) => u.replace(/^https?:\/\//i, "").replace(/\/$/, "");
const ghost =
  "inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap";
const URL_ERR = "Tautan harus berupa alamat web (http:// atau https://).";

function Dialog({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          card +
          " w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3.5 !p-6 shadow-xl"
        }
      >
        <h2 className="text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ProjectEditModal({ p, onSave, onClose }) {
  const [f, setF] = useState({
      name: p.name,
      stack: p.stack || "",
      deadline: p.deadline || "",
      repo_url: p.repo_url || "",
    }),
    [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const url = fixUrl(f.repo_url);
    if (url === false) return setErr(URL_ERR);
    onSave(p.id, {
      name: f.name.trim(),
      stack: f.stack.trim(),
      deadline: f.deadline || null,
      repo_url: url,
    });
  };
  return (
    <Dialog title="Edit Proyek" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <label className="block">
          <span className={cap}>Nama proyek</span>
          <input
            className={inp + " mt-1.5"}
            maxLength={80}
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            required
            autoFocus
          />
        </label>
        <label className="block">
          <span className={cap}>Tech stack</span>
          <input
            className={inp + " mt-1.5"}
            placeholder="mis. React, Supabase"
            value={f.stack}
            onChange={(e) => setF({ ...f, stack: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={cap}>Tenggat proyek</span>
          <input
            className={inp + " mt-1.5"}
            type="date"
            value={f.deadline}
            onChange={(e) => setF({ ...f, deadline: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={cap}>Tautan GitHub / repo</span>
          <input
            className={inp + " mt-1.5"}
            placeholder="github.com/nama/repo"
            value={f.repo_url}
            onChange={(e) => {
              setF({ ...f, repo_url: e.target.value });
              setErr("");
            }}
          />
        </label>
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={ghost}>
            Batal
          </button>
          <button className={btn}>Simpan</button>
        </div>
      </form>
    </Dialog>
  );
}

function MilestoneEditModal({ m, onSave, onClose }) {
  const [f, setF] = useState({
    title: m.title,
    due_date: m.due_date || "",
    notes: m.notes || "",
  });
  return (
    <Dialog title="Edit Milestone" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(m.id, {
            title: f.title.trim(),
            due_date: f.due_date || null,
            notes: f.notes.trim() || null,
          });
        }}
        className="space-y-3.5"
      >
        <label className="block">
          <span className={cap}>Judul</span>
          <input
            className={inp + " mt-1.5"}
            maxLength={120}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            required
            autoFocus
          />
        </label>
        <label className="block">
          <span className={cap}>Tanggal</span>
          <input
            className={inp + " mt-1.5"}
            type="date"
            value={f.due_date}
            onChange={(e) => setF({ ...f, due_date: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={cap}>Deskripsi / catatan</span>
          <textarea
            className={inp + " mt-1.5 min-h-[110px] resize-y"}
            maxLength={2000}
            placeholder="mis. Yang belum dipahami, link referensi, hal yang perlu dicoba"
            value={f.notes}
            onChange={(e) => setF({ ...f, notes: e.target.value })}
          />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={ghost}>
            Batal
          </button>
          <button className={btn}>Simpan</button>
        </div>
      </form>
    </Dialog>
  );
}

const parseBulk = (text) => {
  let badDates = 0;
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 100)
    .map((l) => {
      const [a, b] = l.split("|").map((s) => s.trim());
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(b || "");
      if (b && !ok) badDates++;
      return { title: (a || "").slice(0, 120), due_date: ok ? b : null };
    })
    .filter((r) => r.title);
  return { rows, badDates };
};
function BulkModal({ onAdd, onClose }) {
  const [text, setText] = useState("");
  const { rows, badDates } = parseBulk(text);
  return (
    <Dialog title="Tambah Banyak Milestone" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          rows.length && onAdd(rows);
        }}
        className="space-y-3.5"
      >
        <p className={`text-sm ${sub}`}>
          Satu baris satu milestone. Tanggal opsional, tulis setelah tanda{" "}
          <span className="font-mono">|</span> dengan format{" "}
          <span className="font-mono">2026-12-01</span>.
        </p>
        <textarea
          className={inp + " min-h-[180px] resize-y font-mono"}
          placeholder={
            "Desain database\nBangun halaman login | 2026-12-01\nIntegrasi pembayaran | 2026-12-15"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <p className={`text-xs ${sub}`}>
          {rows.length} milestone
          {rows.length >= 100 ? " (maksimal 100 baris sekali tambah)" : ""}
          {badDates > 0 && ` · ${badDates} tanggal tidak valid diabaikan`}
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={ghost}>
            Batal
          </button>
          <button className={btn} disabled={!rows.length}>
            Tambah {rows.length || ""} milestone
          </button>
        </div>
      </form>
    </Dialog>
  );
}

const COLS = {
  todo: "Akan Dikerjakan",
  doing: "Sedang Berjalan",
  review: "Tinjauan",
  done: "Selesai",
};
function Projects({ pt, pm }) {
  const [f, setF] = useState({
      name: "",
      stack: "",
      deadline: "",
      repo_url: "",
    }),
    [msg, setMsg] = useState("");
  const [sel, setSel] = useState(null),
    [title, setTitle] = useState(""),
    [mdate, setMdate] = useState(""),
    [del, setDel] = useState(null);
  const [pe, setPe] = useState(null),
    [me, setMe] = useState(null),
    [bulk, setBulk] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const url = fixUrl(f.repo_url);
    if (url === false) return setMsg(URL_ERR);
    pt.add({
      name: f.name,
      stack: f.stack,
      deadline: f.deadline || null,
      repo_url: url,
    });
    setF({ name: "", stack: "", deadline: "", repo_url: "" });
    setMsg("");
  };
  const prog = (p) => {
    const a = pm.rows.filter((x) => x.project_id === p.id);
    return {
      a,
      pct: a.length
        ? Math.round(
            (a.filter((x) => x.status === "done").length / a.length) * 100,
          )
        : 0,
    };
  };
  const p = pt.rows.find((x) => x.id === sel);
  const modals = (
    <>
      {del && (
        <ConfirmModal
          title="Hapus Proyek"
          message={`Hapus proyek "${del.name}" beserta milestone-nya? Tindakan ini tidak bisa dibatalkan.`}
          onOk={() => {
            pt.del(del.id);
            setDel(null);
          }}
          onClose={() => setDel(null)}
        />
      )}
      {pe && (
        <ProjectEditModal
          p={pe}
          onSave={(id, v) => {
            pt.patch(id, v);
            setPe(null);
          }}
          onClose={() => setPe(null)}
        />
      )}
      {me && (
        <MilestoneEditModal
          m={me}
          onSave={(id, v) => {
            pm.patch(id, v);
            setMe(null);
          }}
          onClose={() => setMe(null)}
        />
      )}
      {bulk && p && (
        <BulkModal
          onAdd={(rows) => {
            pm.add(rows.map((r) => ({ project_id: p.id, ...r })));
            setBulk(false);
          }}
          onClose={() => setBulk(false)}
        />
      )}
    </>
  );
  if (p) {
    const { a, pct } = prog(p);
    const nxt = a
      .filter((x) => x.status !== "done" && x.due_date && x.due_date >= today())
      .sort((u, v) => u.due_date.localeCompare(v.due_date))[0];
    const dates = [
      p.deadline && `Tenggat proyek ${fmt(p.deadline)}`,
      nxt && `Milestone terdekat ${fmt(nxt.due_date)}`,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <div className="space-y-6">
        {modals}
        <button
          onClick={() => setSel(null)}
          className="text-sm text-indigo-600 dark:text-indigo-400"
        >
          ← Semua proyek
        </button>
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
              <p className={`text-sm mt-1 ${sub}`}>
                {p.stack || "Tanpa stack"}
              </p>
              {dates && <p className={`text-sm mt-1 ${sub}`}>{dates}</p>}
              {p.repo_url && (
                <a
                  href={p.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {shortUrl(p.repo_url)}
                </a>
              )}
            </div>
            <button onClick={() => setPe(p)} className={ghost}>
              Edit Proyek
            </button>
          </div>
          <div className="mt-4 w-full">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span>Progres</span>
              <span>{pct}%</span>
            </div>
            <Bar pct={pct} c="bg-emerald-500" />
          </div>
        </div>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            pm.add({ project_id: p.id, title, due_date: mdate || null });
            setTitle("");
            setMdate("");
          }}
        >
          <input
            className={inp + " flex-1 min-w-[12rem]"}
            maxLength={120}
            placeholder="Milestone baru, mis. Bangun halaman login"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className={inp + " !w-40 shrink-0"}
            type="date"
            title="Tanggal milestone"
            value={mdate}
            onChange={(e) => setMdate(e.target.value)}
          />
          <button className={btn + " shrink-0 whitespace-nowrap"}>
            Tambah
          </button>
          <button
            type="button"
            onClick={() => setBulk(true)}
            className={ghost + " shrink-0"}
          >
            Tambah banyak
          </button>
        </form>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(COLS).map(([k, l]) => (
            <div
              key={k}
              className="rounded-xl bg-slate-100/70 dark:bg-slate-800/40 p-3 min-h-[160px]"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                {l}{" "}
                <span className="font-mono text-slate-400">
                  {a.filter((x) => x.status === k).length}
                </span>
              </h3>
              {a
                .filter((x) => x.status === k)
                .map((x) => {
                  const late =
                    x.due_date && x.status !== "done" && x.due_date < today();
                  return (
                    <div key={x.id} className={card + " !p-3 mb-2.5"}>
                      <p className="text-sm font-medium">{x.title}</p>
                      {x.due_date && (
                        <span
                          className={`inline-block mt-2 text-[11px] font-mono px-2 py-0.5 rounded-md ${late ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"}`}
                        >
                          {fmt(x.due_date)}
                          {late && " · lewat"}
                        </span>
                      )}
                      {x.notes && (
                        <p
                          className={`text-xs mt-2 line-clamp-2 whitespace-pre-line ${sub}`}
                        >
                          {x.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2.5">
                        <select
                          className="flex-1 min-w-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs"
                          value={x.status}
                          onChange={(e) =>
                            pm.patch(x.id, { status: e.target.value })
                          }
                        >
                          {Object.entries(COLS).map(([v, n]) => (
                            <option key={v} value={v}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <button
                          className="shrink-0 text-xs text-indigo-600 dark:text-indigo-400"
                          onClick={() => setMe(x)}
                        >
                          Edit
                        </button>
                        <button
                          className="shrink-0 text-xs text-rose-600 dark:text-rose-400"
                          onClick={() => pm.del(x.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {modals}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Proyek & Pengembangan
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Pecah proyekmu menjadi milestone kecil dan pantau progresnya.
        </p>
      </div>
      <form
        onSubmit={submit}
        className={card + " grid gap-3 sm:grid-cols-2 xl:grid-cols-5"}
      >
        <input
          className={inp}
          maxLength={80}
          placeholder="Nama proyek"
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          required
        />
        <input
          className={inp}
          placeholder="Tech stack, mis. React, Supabase"
          value={f.stack}
          onChange={(e) => setF({ ...f, stack: e.target.value })}
        />
        <input
          className={inp}
          type="date"
          title="Tenggat"
          value={f.deadline}
          onChange={(e) => setF({ ...f, deadline: e.target.value })}
        />
        <input
          className={inp}
          placeholder="Tautan GitHub (opsional)"
          value={f.repo_url}
          onChange={(e) => {
            setF({ ...f, repo_url: e.target.value });
            setMsg("");
          }}
        />
        <button className={btn}>+ Proyek Baru</button>
        {msg && (
          <p className="text-sm text-rose-600 sm:col-span-2 xl:col-span-5">
            {msg}
          </p>
        )}
      </form>
      {pt.rows.length === 0 && (
        <p className={`text-sm ${sub}`}>
          Belum ada proyek. Buat satu untuk mulai mencatat milestone-nya.
        </p>
      )}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pt.rows.map((x) => {
          const { a, pct } = prog(x);
          const tags = (x.stack || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          return (
            <div
              key={x.id}
              className={card + " card-hover cursor-pointer min-w-0"}
              onClick={() => setSel(x.id)}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold">{x.name}</h3>
                <span className="shrink-0 flex items-center gap-3">
                  <button
                    className="text-xs text-indigo-600 dark:text-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPe(x);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-rose-600 dark:text-rose-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDel(x);
                    }}
                  >
                    Hapus
                  </button>
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((s) => (
                    <Badge key={s} l={s} />
                  ))}
                </div>
              )}
              <div
                className={`flex justify-between text-xs font-mono mb-1.5 text-slate-500 ${tags.length ? "mt-3" : "mt-2"}`}
              >
                <span>{a.length} milestone</span>
                <span>{pct}%</span>
              </div>
              <Bar pct={pct} c="bg-emerald-500" />
              {x.deadline && (
                <p className="text-[11px] text-slate-400 mt-2">
                  Tenggat {x.deadline}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- CSV (ekspor / impor) ---------- */
const csvCell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows) =>
  "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
const unq = (s) => s.replace(/^'(?=[=+\-@\t\r])/, "");
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/)[0] || "";
  const d =
    (first.match(/;/g) || []).length > (first.match(/,/g) || []).length
      ? ";"
      : ",";
  const rows = [];
  let row = [],
    cur = "",
    q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === d) {
      row.push(cur);
      cur = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else cur += c;
  }
  if (cur !== "" || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x !== "")).map((r) => r.map(unq));
}
const saveFile = (name, text) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8" }),
  );
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
const okIso = (v) => {
  const m = String(v || "")
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? okDate(m[1], m[2], m[3]) : null;
};
const chunk = (a, n = 500) =>
  Array.from({ length: Math.ceil(a.length / n) }, (_, i) =>
    a.slice(i * n, i * n + n),
  );
const tkey = (r) => `${r.scope}|${r.due_date}|${r.title.toLowerCase()}`;
const statusOf = (v) => {
  v = String(v || "")
    .trim()
    .toLowerCase();
  return Object.keys(COLS).includes(v)
    ? v
    : (Object.entries(COLS).find(([, l]) => l.toLowerCase() === v) || [
        "todo",
      ])[0];
};

/* ---------- pengaturan ---------- */
function Settings({ dark, setDark, goal, setGoal, ms, pt, pm, onImported }) {
  const [msg, setMsg] = useState(null),
    [busy, setBusy] = useState(false);
  const exportTargets = () =>
    saveFile(
      `target-codetrack-${today()}.csv`,
      toCsv([
        [
          "Judul",
          "Bahasa",
          "Tanggal",
          "Menit",
          "Cakupan",
          "Hasil Besar",
          "Catatan",
          "Status",
          "Menit Aktual",
          "Selesai Pada",
        ],
        ...[...ms.rows]
          .sort((a, b) => a.due_date.localeCompare(b.due_date))
          .map((m) => [
            m.title,
            m.lang,
            m.due_date,
            m.minutes,
            m.scope === "weekly" ? "mingguan" : "harian",
            m.outcome || "",
            m.notes || "",
            m.status === "done" ? "selesai" : "belum",
            m.actual_minutes ?? "",
            m.completed_at || "",
          ]),
      ]),
    );
  const exportProjects = () => {
    const rows = [
      [
        "Proyek",
        "Tech Stack",
        "Tenggat Proyek",
        "Tautan Repo",
        "Milestone",
        "Status",
        "Tanggal Milestone",
        "Catatan",
      ],
    ];
    pt.rows.forEach((p) => {
      const a = pm.rows.filter((x) => x.project_id === p.id);
      const head = [p.name, p.stack || "", p.deadline || "", p.repo_url || ""];
      if (!a.length) rows.push([...head, "", "", "", ""]);
      a.forEach((x) =>
        rows.push([
          ...head,
          x.title,
          x.status,
          x.due_date || "",
          x.notes || "",
        ]),
      );
    });
    saveFile(`proyek-codetrack-${today()}.csv`, toCsv(rows));
  };
  const importTargets = async (rows) => {
    const { rows: items, errs } = parseSheet(rows, 5000);
    const have = new Set(ms.rows.map(tkey)),
      fresh = items.filter((r) => !have.has(tkey(r)));
    for (const c of chunk(fresh)) {
      const { error } = await supabase.from("milestones").insert(c);
      if (error) throw error;
    }
    return `${fresh.length} target ditambahkan, ${items.length - fresh.length} dilewati (sudah ada)${errs.length ? `, ${errs.length} baris tidak valid` : ""}.`;
  };
  const importProjects = async (rows) => {
    const groups = new Map();
    rows.slice(1).forEach((r) => {
      const name = (r[0] || "").trim().slice(0, 80);
      if (!name) return;
      const key = name.toLowerCase();
      if (!groups.has(key))
        groups.set(key, {
          name,
          stack: (r[1] || "").trim(),
          deadline: okIso(r[2]),
          repo_url: fixUrl(r[3]) || null,
          items: [],
        });
      const title = (r[4] || "").trim().slice(0, 120);
      if (title)
        groups.get(key).items.push({
          title,
          status: statusOf(r[5]),
          due_date: okIso(r[6]),
          notes: (r[7] || "").trim() || null,
        });
    });
    const ids = Object.fromEntries(
      pt.rows.map((p) => [p.name.toLowerCase(), p.id]),
    );
    const fresh = [...groups.entries()].filter(([k]) => !ids[k]);
    if (fresh.length) {
      const { data, error } = await supabase
        .from("projects")
        .insert(
          fresh.map(([, g]) => ({
            name: g.name,
            stack: g.stack,
            deadline: g.deadline,
            repo_url: g.repo_url,
          })),
        )
        .select("id,name");
      if (error) throw error;
      data.forEach((p) => {
        ids[p.name.toLowerCase()] = p.id;
      });
    }
    const out = [];
    groups.forEach((g, k) => {
      const have = new Set(
        pm.rows
          .filter((x) => x.project_id === ids[k])
          .map((x) => x.title.toLowerCase()),
      );
      g.items
        .filter((x) => !have.has(x.title.toLowerCase()))
        .forEach((x) => out.push({ ...x, project_id: ids[k] }));
    });
    for (const c of chunk(out)) {
      const { error } = await supabase.from("project_milestones").insert(c);
      if (error) throw error;
    }
    return `${fresh.length} proyek baru dan ${out.length} milestone ditambahkan.`;
  };
  const pickCsv = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const rows = parseCsv(await file.text()),
        h = (rows[0]?.[0] || "").trim().toLowerCase();
      if (h !== "judul" && h !== "proyek")
        throw new Error(
          "Format tidak dikenali. Gunakan file hasil ekspor dari halaman ini.",
        );
      setMsg({
        ok: true,
        text: await (h === "judul"
          ? importTargets(rows)
          : importProjects(rows)),
      });
      onImported();
    } catch (err) {
      setMsg({ ok: false, text: err.message || "Gagal mengimpor file." });
    }
    setBusy(false);
  };
  const tpl = async () => {
    try {
      await downloadTemplate();
    } catch {
      setMsg({ ok: false, text: "Gagal membuat template Excel." });
    }
  };
  const Opt = ({ v, name, desc, bg }) => (
    <button
      type="button"
      onClick={() => setDark(v)}
      className={`text-left rounded-xl p-3.5 border-2 transition-colors ${dark === v ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
    >
      <div
        className={`h-14 rounded-lg mb-3 flex items-center gap-2 px-3 border border-slate-200 dark:border-slate-700 ${bg}`}
      >
        <span className="w-3 h-3 rounded-full bg-indigo-500" />
        <span className="h-1.5 w-16 rounded-full bg-slate-400/60" />
      </div>
      <p className="text-sm font-semibold">{name}</p>
      <p className={`text-xs mt-0.5 ${sub}`}>{desc}</p>
    </button>
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Sesuaikan target belajar harian, tampilan tema, dan pengelolaan data.
        </p>
      </div>
      <div className={card}>
        <h2 className="text-base font-bold mb-3">Tampilan Tema</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Opt
            v={false}
            name="Tema Terang (Light)"
            desc="Tampilan bersih dan cerah untuk siang hari"
            bg="bg-slate-50"
          />
          <Opt
            v={true}
            name="Mode Gelap (Dark)"
            desc="Tema slate gelap yang nyaman di mata saat malam"
            bg="bg-[#0f172a]"
          />
        </div>
      </div>
      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">
              Target Durasi Belajar Harian
            </h2>
            <p className={`text-sm ${sub}`}>
              Atur target jam fokus belajar coding setiap hari
            </p>
          </div>
          <span className="shrink-0 font-mono text-sm font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            {goal.toFixed(1)} jam/hari
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="12"
          step="0.5"
          value={goal}
          onChange={(e) => setGoal(+e.target.value)}
          className="w-full mt-5 accent-indigo-600"
          aria-label="Target jam belajar per hari"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
          <span>0.5j</span>
          <span>12j</span>
        </div>
      </div>
      <div className={card}>
        <h2 className="text-base font-bold">Data</h2>
        <p className={`text-sm ${sub}`}>
          Cadangkan atau pulihkan data lewat CSV. Untuk mengisi banyak target
          sekaligus, pakai template Excel lalu tombol Import Excel di bagian
          atas.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={tpl} className={btn}>
            Unduh Template Excel
          </button>
          <button onClick={exportTargets} className={ghost}>
            Ekspor Target (CSV)
          </button>
          <button onClick={exportProjects} className={ghost}>
            Ekspor Proyek (CSV)
          </button>
          <label className={ghost + " cursor-pointer"}>
            {busy ? "Mengimpor…" : "Impor CSV"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={pickCsv}
              disabled={busy}
            />
          </label>
        </div>
        <p className={`text-xs mt-3 ${sub}`}>
          Impor CSV mengenali file target atau proyek dari hasil ekspor. Data
          yang sudah ada (judul dan tanggal sama) dilewati, jadi aman diimpor
          berulang.
        </p>
        {msg && (
          <p
            className={`text-sm mt-3 ${msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
          >
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- kalender bulanan ---------- */
function Calendar({ t, projects, pms, onToggle }) {
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() }),
    [sel, setSel] = useState(today());
  const off = (new Date(cur.y, cur.m, 1, 12).getDay() + 6) % 7;
  const cells = [...Array(42)].map((_, i) => {
    const d = new Date(cur.y, cur.m, 1 - off + i, 12);
    return { k: ymd(d), day: d.getDate(), inMonth: d.getMonth() === cur.m };
  });
  const pname = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const forDay = (k) => [
    ...t.rows
      .filter((m) => m.due_date === k)
      .map((m) => ({ t: "t", text: m.title, done: m.status === "done" })),
    ...pms
      .filter((x) => x.due_date === k)
      .map((x) => ({ t: "m", text: x.title, done: x.status === "done" })),
  ];
  const go = (n) =>
    setCur(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const label = new Date(cur.y, cur.m, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const CH = {
    t: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    m: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  };
  const selT = t.rows.filter((m) => m.due_date === sel),
    selP = pms.filter((x) => x.due_date === sel);
  const selLabel = new Date(sel + "T12:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kalender</h1>
          <p className={`text-sm mt-1 ${sub}`}>
            Target dan tenggat milestone proyek per bulan.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 w-full sm:w-auto sm:flex-row">
          <div className="flex items-center gap-2">
            <button
              onClick={() => go(-1)}
              aria-label="Bulan sebelumnya"
              className={ghost + " !px-3 !py-1.5"}
            >
              ‹
            </button>
            <span className="text-sm font-semibold min-w-[8.5rem] text-center capitalize">
              {label}
            </span>
            <button
              onClick={() => go(1)}
              aria-label="Bulan berikutnya"
              className={ghost + " !px-3 !py-1.5"}
            >
              ›
            </button>
          </div>
          <button
            onClick={() => {
              setCur({ y: now.getFullYear(), m: now.getMonth() });
              setSel(today());
            }}
            className={btn + " !px-3 !py-1.5"}
          >
            Bulan Ini
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-mono text-slate-400 pb-1"
          >
            {d}
          </div>
        ))}
        {cells.map((c) => {
          const it = forDay(c.k);
          return (
            <button
              key={c.k}
              onClick={() => setSel(c.k)}
              className={`h-14 sm:h-[92px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl text-left border transition-colors overflow-hidden ${c.inMonth ? "bg-white dark:bg-[#1e293b]" : "bg-slate-50 dark:bg-slate-900/40 opacity-60"} ${c.k === sel ? "border-indigo-500 ring-1 ring-indigo-500/30" : "border-slate-200 dark:border-slate-700"}`}
            >
              <span
                className={`text-xs font-mono ${c.k === today() ? "inline-flex w-6 h-6 items-center justify-center rounded-full bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400"}`}
              >
                {c.day}
              </span>
              <span className="hidden sm:block mt-1 space-y-0.5">
                {it.slice(0, 2).map((x, i) => (
                  <span
                    key={i}
                    className={`block truncate text-[10px] leading-4 px-1.5 rounded ${CH[x.t]} ${x.done ? "line-through opacity-60" : ""}`}
                  >
                    {x.text}
                  </span>
                ))}
                {it.length > 2 && (
                  <span className="block text-[10px] text-slate-400 px-1">
                    +{it.length - 2} lagi
                  </span>
                )}
              </span>
              <span className="sm:hidden flex gap-0.5 mt-1 flex-wrap">
                {it.slice(0, 3).map((x, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${x.t === "t" ? "bg-indigo-500" : "bg-emerald-500"}`}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-start gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          Target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Milestone proyek
        </span>
      </div>
      <div className={card}>
        <h2 className="text-base font-bold mb-1 capitalize">{selLabel}</h2>
        {!selT.length && !selP.length && (
          <p className={`text-sm ${sub}`}>
            Tidak ada target atau tenggat milestone di hari ini.
          </p>
        )}
        {selT.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
          >
            <Check on={m.status === "done"} onClick={() => onToggle(m)} />
            <span
              className={`flex-1 min-w-0 text-sm ${m.status === "done" ? "line-through text-slate-400" : ""}`}
            >
              {m.title}
            </span>
            <Badge l={m.lang} />
            <span className="text-xs font-mono text-slate-400 shrink-0">
              {mins(m)} mnt
            </span>
          </div>
        ))}
        {selP.map((x) => (
          <div
            key={x.id}
            className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
          >
            <span className="w-[18px] h-[18px] shrink-0 rounded-md bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${x.status === "done" ? "line-through text-slate-400" : ""}`}
              >
                {x.title}
              </p>
              <p className={`text-xs ${sub}`}>
                {pname[x.project_id] || "Proyek"} · {COLS[x.status]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- kerangka aplikasi ---------- */
function Shell({ user }) {
  const [tab, setTab] = useState("dashboard"),
    [open, setOpen] = useState(false),
    [ask, setAsk] = useState(null),
    [imp, setImp] = useState(false);
  const [dark, setDark] = useState(
    () => (localStorage.getItem("codetrack_theme") || "dark") === "dark",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("codetrack_theme", dark ? "dark" : "light");
  }, [dark]);
  const [goal, setGoal] = useState(() =>
      Math.min(12, Math.max(0.5, +localStorage.getItem("codetrack_goal") || 3)),
    ),
    goalReady = useRef(false);
  useEffect(() => {
    supabase
      .from("user_settings")
      .select("daily_goal_hours")
      .maybeSingle()
      .then(({ data }) => {
        goalReady.current = true;
        if (data) setGoal(+data.daily_goal_hours);
      });
  }, []);
  useEffect(() => {
    localStorage.setItem("codetrack_goal", goal);
    if (!goalReady.current) return;
    const id = setTimeout(async () => {
      await supabase.from("user_settings").upsert({
        user_id: user.id,
        daily_goal_hours: goal,
        updated_at: new Date().toISOString(),
      });
    }, 600);
    return () => clearTimeout(id);
  }, [goal, user.id]);
  const ms = useTable("milestones"),
    pt = useTable("projects"),
    pm = useTable("project_milestones");
  const st = calc(ms.rows),
    err = ms.err || pt.err || pm.err;
  const GOAL = goal,
    hrs = st.days[today()] || 0,
    pending = ms.rows.filter(
      (m) => m.scope === "daily" && m.status !== "done",
    ).length;
  const nav = [
    ["dashboard", "Dashboard"],
    ["daily", "Target Harian"],
    ["weekly", "Target Mingguan"],
    ["projects", "Proyek"],
    ["calendar", "Kalender"],
    ["settings", "Pengaturan"],
  ];
  const go = (k) => {
    setTab(k);
    setOpen(false);
  };
  const onToggle = (m) =>
    m.status === "done"
      ? ms.patch(m.id, { status: "todo", completed_at: null })
      : setAsk(m);
  const finish = (actual) => {
    ms.patch(ask.id, {
      status: "done",
      completed_at: new Date().toISOString(),
      actual_minutes: actual,
    });
    setAsk(null);
  };
  return (
    <div className="flex min-h-screen">
      {ask && (
        <DoneModal m={ask} onSave={finish} onClose={() => setAsk(null)} />
      )}
      {imp && (
        <ImportModal
          onImport={(rows) => {
            ms.add(rows);
            setImp(false);
            setTab("daily");
          }}
          onClose={() => setImp(false)}
        />
      )}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-white dark:bg-[#1e293b] border-r border-[#e2e8f0] dark:border-[#334155] flex flex-col justify-between transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div>
          <div
            className="h-16 px-5 flex items-center border-b border-[#e2e8f0] dark:border-[#334155] cursor-pointer"
            onClick={() => go("dashboard")}
          >
            <Logo />
          </div>
          <nav className="p-3.5 space-y-1">
            {nav.map(([k, l]) => (
              <button
                key={k}
                onClick={() => go(k)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === k ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/70"}`}
              >
                <Icon
                  d={ICONS[k]}
                  cls={`w-4 h-4 shrink-0 ${tab === k ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
                />
                <span className="truncate">{l}</span>
                {k === "daily" && pending > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full ${tab === k ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    {pending}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#e2e8f0] dark:border-[#334155]">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Target Belajar Harian
              </span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {hrs.toFixed(1)} / {GOAL.toFixed(1)}j
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (hrs / GOAL) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {hrs >= GOAL
                ? "Target hari ini tercapai 🎉"
                : `${Math.round((GOAL - hrs) * 60)} menit lagi untuk mencapai target`}
            </p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/30 transition-all"
          >
            <Icon d='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' />
            Keluar
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/85 dark:bg-[#1e293b]/85 backdrop-blur-md border-b border-[#e2e8f0] dark:border-[#334155] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <Icon cls="w-5 h-5" d='<path d="M4 6h16M4 12h16M4 18h16"/>' />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button onClick={() => setImp(true)} className={ghost + " !px-3"}>
              <span className="hidden sm:inline">Import Excel</span>
              <span className="sm:hidden">Import</span>
            </button>
            <button onClick={() => go("daily")} className={btn}>
              + <span className="hidden sm:inline">Tambah Target</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <span className="text-sm">🔥</span>
              <span className="font-mono">{st.streak}</span>
              <span>Hari Streak</span>
            </div>
            <button
              onClick={() => setDark(!dark)}
              title="Mode terang / gelap"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-semibold text-xs flex items-center justify-center">
                {user.email.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {err && (
            <p className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
              Gagal memuat data: {err}. Pastikan schema.sql sudah dijalankan di
              Supabase.
            </p>
          )}
          {tab === "dashboard" && (
            <Dashboard
              t={ms}
              projects={pt.rows}
              pms={pm.rows}
              st={st}
              user={user}
              onToggle={onToggle}
            />
          )}
          {(tab === "daily" || tab === "weekly") && (
            <Milestones key={tab} t={ms} scope={tab} onToggle={onToggle} />
          )}
          {tab === "projects" && <Projects pt={pt} pm={pm} />}
          {tab === "calendar" && (
            <Calendar
              t={ms}
              projects={pt.rows}
              pms={pm.rows}
              onToggle={onToggle}
            />
          )}
          {tab === "settings" && (
            <Settings
              dark={dark}
              setDark={setDark}
              goal={goal}
              setGoal={setGoal}
              ms={ms}
              pt={pt}
              pm={pm}
              onImported={() => {
                ms.reload();
                pt.reload();
                pm.reload();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      (localStorage.getItem("codetrack_theme") || "dark") === "dark",
    );
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (session === undefined) return null;
  return session ? <Shell user={session.user} /> : <Auth />;
}
