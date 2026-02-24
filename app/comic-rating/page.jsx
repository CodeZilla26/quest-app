"use client";
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useQuests from '../../hooks/useQuests';
import Button from '../../components/Button';

const MODEL = [
  {
    id: 'script',
    title: 'Guion y narrativa',
    weight: 30,
    items: [
      { id: 'structure', label: 'Estructura narrativa (inicio–desarrollo–cierre)' },
      { id: 'coherence', label: 'Coherencia interna' },
      { id: 'rhythm', label: 'Ritmo' },
      { id: 'dialogue', label: 'Calidad de diálogos' },
      { id: 'conflict', label: 'Manejo del conflicto' },
    ],
  },
  {
    id: 'characters',
    title: 'Desarrollo de personajes',
    weight: 20,
    items: [
      { id: 'psychology', label: 'Profundidad psicológica' },
      { id: 'motivation', label: 'Motivaciones claras' },
      { id: 'evolution', label: 'Evolución a lo largo de la historia' },
      { id: 'relationships', label: 'Relaciones entre personajes' },
      { id: 'consistency', label: 'Consistencia en su comportamiento' },
    ],
  },
  {
    id: 'art',
    title: 'Arte y ejecución visual',
    weight: 25,
    items: [
      { id: 'drawing', label: 'Calidad del dibujo' },
      { id: 'composition', label: 'Composición de viñetas' },
      { id: 'flow', label: 'Fluidez de lectura' },
      { id: 'expressivity', label: 'Expresividad facial y corporal' },
      { id: 'color', label: 'Uso del color o contraste' },
      { id: 'clarity', label: 'Claridad de la acción' },
    ],
  },
  {
    id: 'comicLanguage',
    title: 'Uso del lenguaje del cómic',
    weight: 15,
    items: [
      { id: 'silence', label: 'Uso narrativo del silencio' },
      { id: 'panelRhythm', label: 'Ritmo entre viñetas' },
      { id: 'transitions', label: 'Transiciones' },
      { id: 'pageDesign', label: 'Diseño de página' },
      { id: 'resources', label: 'Uso de splash pages o recursos gráficos' },
      { id: 'noText', label: 'Capacidad de contar sin texto' },
    ],
  },
  {
    id: 'originality',
    title: 'Originalidad e impacto',
    weight: 10,
    items: [
      { id: 'genre', label: 'Aporte al género' },
      { id: 'identity', label: 'Identidad propia' },
      { id: 'emotional', label: 'Impacto emocional' },
      { id: 'resonance', label: 'Reflexión o resonancia posterior' },
    ],
  },
];

function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '';
  if (n < 1) return 1;
  if (n > 10) return 10;
  return n;
}

function categoryAverage(scores, cat) {
  const items = cat.items || [];
  if (!items.length) return 0;
  const vals = items
    .map((it) => scores?.[cat.id]?.[it.id])
    .map((v) => (v === '' || v == null ? null : Number(v)))
    .filter((v) => Number.isFinite(v));
  if (!vals.length) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return sum / vals.length;
}

function weightedTotal(scores) {
  const totalWeight = MODEL.reduce((a, c) => a + c.weight, 0) || 100;
  const sum = MODEL.reduce((acc, cat) => {
    const avg = categoryAverage(scores, cat);
    return acc + avg * (cat.weight / totalWeight);
  }, 0);
  // escala 1-10 -> 0-100
  return sum * 10;
}

function labelForTotal(t) {
  if (t >= 90) return 'Obra sobresaliente';
  if (t >= 80) return 'Muy sólida';
  if (t >= 70) return 'Buena pero con fallas claras';
  if (t >= 60) return 'Irregular';
  if (t >= 50) return 'Débil';
  return 'Fallida estructuralmente';
}

export default function ComicRatingPage() {
  const router = useRouter();
  const { state, updateLibraryItem } = useQuests();

  const comics = useMemo(() => {
    return (state.library || []).filter((it) => it && it.type === 'comic');
  }, [state.library]);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const selected = useMemo(() => comics.find((c) => String(c.id) === String(selectedId)), [comics, selectedId]);

  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return comics;
    return comics.filter((c) => (c.title || '').toLowerCase().includes(q));
  }, [comics, query]);

  const total = useMemo(() => weightedTotal(scores), [scores]);
  const totalLabel = useMemo(() => labelForTotal(total), [total]);

  const loadFromComic = (comic) => {
    const ev = comic?.evaluation;
    if (ev && typeof ev === 'object') {
      setScores(ev.scores && typeof ev.scores === 'object' ? ev.scores : {});
      setNotes(typeof ev.notes === 'string' ? ev.notes : '');
    } else {
      setScores({});
      setNotes('');
    }
  };

  const onSelect = (comic) => {
    setSelectedId(String(comic.id));
    loadFromComic(comic);
  };

  const onChangeScore = (catId, itemId, value) => {
    const v = value === '' ? '' : clampScore(value);
    setScores((prev) => {
      const next = { ...(prev || {}) };
      next[catId] = { ...(next[catId] || {}) };
      next[catId][itemId] = v;
      return next;
    });
  };

  const onSave = () => {
    if (!selected) return;
    const evaluation = {
      modelVersion: 1,
      scores,
      notes,
      total: Math.round(total * 100) / 100,
      label: totalLabel,
      updatedAt: new Date().toISOString(),
    };
    updateLibraryItem(selected.id, { evaluation });
    alert('Calificación guardada');
  };

  return (
    <main className="container-app">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="heading-epic select-none">Calificación de Cómics</h1>
          <div className="mt-1 text-xs text-slate-400">Selecciona un cómic y completa el formulario (escala 1–10 por subcriterio).</div>
        </div>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => router.push('/library')}>Volver a Biblioteca</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3">
          <div className="mb-2 text-xs font-semibold text-slate-200">Cómics</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="mb-3 w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          />
          <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-2">
            {filtered.map((c) => {
              const active = String(c.id) === String(selectedId);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c)}
                  className={`w-full rounded-xl border p-2 text-left transition-colors ${active ? 'border-emerald-500/60 bg-emerald-900/20' : 'border-slate-700/60 bg-slate-950/20 hover:bg-slate-900/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-10 overflow-hidden rounded-md bg-slate-800/60 flex items-center justify-center">
                      {c.coverPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.coverPath} alt={c.title || 'cover'} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-500">Sin</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-100">{c.title}</div>
                      {c.evaluation?.total != null ? (
                        <div className="mt-0.5 text-[11px] text-slate-400">Total: <span className="text-slate-200 font-semibold">{c.evaluation.total}</span></div>
                      ) : (
                        <div className="mt-0.5 text-[11px] text-slate-500">Sin calificación</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {!filtered.length && (
              <div className="text-xs text-slate-400">No hay cómics para calificar.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3">
          {!selected ? (
            <div className="text-sm text-slate-300">Selecciona un cómic para empezar.</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{selected.title}</div>
                  <div className="mt-1 text-xs text-slate-400">Total actual: <span className="text-slate-100 font-semibold">{Math.round(total * 100) / 100}</span> / 100 · {totalLabel}</div>
                </div>
                <Button className="px-3 py-1.5 text-xs bg-gradient-to-r from-indigo-600 to-blue-600" onClick={onSave}>Guardar</Button>
              </div>

              <div className="mt-3 space-y-3">
                {MODEL.map((cat) => {
                  const avg = categoryAverage(scores, cat);
                  const catTotal = Math.round(avg * 10 * (cat.weight / 100) * 100) / 100;
                  return (
                    <div key={cat.id} className="rounded-xl border border-slate-700/60 bg-slate-950/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-200">{cat.title} — {cat.weight}%</div>
                        <div className="text-[11px] text-slate-400">Prom: <span className="text-slate-200 font-semibold">{Math.round(avg * 100) / 100}</span> · Aporte: <span className="text-slate-200 font-semibold">{catTotal}</span></div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                        {cat.items.map((it) => {
                          const v = scores?.[cat.id]?.[it.id] ?? '';
                          return (
                            <div key={it.id} className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-2">
                              <div className="text-[11px] text-slate-300">{it.label}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  step="1"
                                  value={v}
                                  onChange={(e) => onChangeScore(cat.id, it.id, e.target.value)}
                                  className="w-24 rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-200"
                                />
                                <div className="text-[11px] text-slate-500">1–10</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-xl border border-slate-700/60 bg-slate-950/20 p-3">
                  <div className="text-xs font-semibold text-slate-200">Notas (opcional)</div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-y rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200"
                  />
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-slate-950/20 p-3">
                  <div className="text-xs font-semibold text-slate-200">Escala objetiva (1–10)</div>
                  <div className="mt-2 text-[11px] text-slate-400">1–2 Deficiente · 3–4 Insuficiente · 5 Aceptable · 6 Competente · 7 Bueno · 8 Muy bueno · 9 Excelente · 10 Sobresaliente</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
