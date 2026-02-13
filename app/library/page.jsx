"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useQuests from '../../hooks/useQuests';
import Button from '../../components/Button';
import LibraryEditModal from '../../components/LibraryEditModal';
import LibraryAddModal from '../../components/LibraryAddModal';
import ImageLightbox from '../../components/ImageLightbox';

const TYPES = [
  { id: 'comic', label: 'Comics' },
  { id: 'movie', label: 'Películas' },
  { id: 'series', label: 'Series' },
  { id: 'game', label: 'Juegos' },
  { id: 'purchase', label: 'Compras' },
];

const STATUSES = [
  { id: 'backlog', label: 'Pendiente' },
  { id: 'in_progress', label: 'En curso' },
  { id: 'done', label: 'Completado' },
];

const TYPE_ICONS = { comic: '📚', movie: '🎬', series: '📺', game: '🎮', purchase: '🛒' };
function statusClasses(id) {
  switch (id) {
    case 'done': return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
    case 'in_progress': return 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200';
    default: return 'border-amber-500/40 bg-amber-500/10 text-amber-200';
  }
}

function rankClasses(r) {
  switch (String(r).toUpperCase()) {
    case 'E': return 'bg-gradient-to-r from-slate-500 to-slate-400 text-white';
    case 'D': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    case 'C': return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white';
    case 'B': return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white';
    case 'A': return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
    case 'S': return 'bg-gradient-to-r from-pink-600 to-red-600 text-white';
    case 'SS': return 'bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white';
    case 'SSS': return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
    default: return '';
  }
}

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, addLibraryItem, updateLibraryItem, removeLibraryItem } = useQuests();
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';

  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent | title | rating
  const [editItem, setEditItem] = useState(null);
  const [suppressUrlEditOpen, setSuppressUrlEditOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');

  const items = state.library || [];

  const currentTypeLabel = TYPES.find(t => t.id === tab)?.label || '';
  const currentTypeIcon = tab === 'all' ? '📚' : (TYPE_ICONS[tab] || '📦');

  // Contadores por tipo para mostrar en las pestañas
  const typeCounts = useMemo(() => {
    const counts = { all: items.length };
    TYPES.forEach(t => { counts[t.id] = 0; });
    (items || []).forEach(it => {
      if (it?.type && counts.hasOwnProperty(it.type)) counts[it.type] += 1;
    });
    return counts;
  }, [items]);
  // Hydrate from URL
  useEffect(() => {
    const q = searchParams.get('query') || '';
    const st = searchParams.get('status') || 'all';
    const t = searchParams.get('type') || 'all';
    setQuery(q);
    setStatus(st);
    setTab(t);
  }, [searchParams]);

  // Push to URL when filters change
  useEffect(() => {
    const sp = new URLSearchParams();
    if (query) sp.set('query', query);
    if (status !== 'all') sp.set('status', status);
    if (tab !== 'all') sp.set('type', tab);
    const qs = sp.toString();
    router.replace(`/library${qs ? `?${qs}` : ''}`);
  }, [query, status, tab]);

  const filtered = useMemo(() => {
    const base = (items || [])
      .filter((it) => (tab === 'all' ? true : it.type === tab))
      .filter((it) => (status === 'all' ? true : it.status === status))
      .filter((it) => (query.trim() ? (it.title || '').toLowerCase().includes(query.trim().toLowerCase()) : true))
      ;

    // Ordenamiento según preferencia
    const copy = [...base];
    if (sortBy === 'title') {
      copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'rating') {
      const rankOrder = ['E','D','C','B','A','S','SS','SSS'];
      copy.sort((a, b) => {
        const ra = String(a.rating || '').toUpperCase();
        const rb = String(b.rating || '').toUpperCase();
        const ia = rankOrder.indexOf(ra);
        const ib = rankOrder.indexOf(rb);
        const sa = ia === -1 ? -1 : ia;
        const sb = ib === -1 ? -1 : ib;
        return sb - sa; // mayor rating primero
      });
    } else {
      // recent (por defecto): updatedAt/createdAt descendente
      copy.sort((a,b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
    }

    return copy;
  }, [items, tab, status, query, sortBy]);

  // Edit via URL param
  const selectedItemId = searchParams.get('item') || '';
  const selectedItem = (items || []).find(it => String(it.id) === String(selectedItemId));
  const editParam = searchParams.get('edit') === '1';

  const openEditorFor = (id) => {
    setSuppressUrlEditOpen(false);
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set('item', String(id));
    sp.set('edit', '1');
    router.replace(`/library?${sp.toString()}`);
  };

  // Sync URL edit param with modal state
  useEffect(() => {
    if (!editParam && suppressUrlEditOpen) {
      setSuppressUrlEditOpen(false);
      return;
    }
    if (editParam && selectedItem && !suppressUrlEditOpen) setEditItem(selectedItem);
  }, [editParam, selectedItem]);

  // (upload handled inside modals)

  return (
    <main className="container-app">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="heading-epic select-none">Biblioteca</h1>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'Todos', icon: '📚' }, ...TYPES.map(t => ({ ...t, icon: TYPE_ICONS[t.id] || '📦' }))].map(t => {
          const active = tab === t.id;
          const count = typeCounts[t.id] ?? 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold border whitespace-nowrap ${active ? (isDominio ? 'border-purple-500/60 bg-purple-900/40 text-purple-100' : 'border-indigo-500/60 bg-indigo-900/30 text-indigo-100') : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/60'}`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-slate-200">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-7 items-start">
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          className="sm:col-span-2 rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 shadow-[0_0_0_1px_rgba(15,23,42,0.6)] focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          placeholder="Buscar por título..."
        />
        <div className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide text-slate-400/80">Estado</span>
          <div className="flex flex-wrap items-center gap-1">
            {[{ id: 'all', label: 'Todos' }, ...STATUSES].map(s => {
              const active = status === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={()=>setStatus(s.id)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-emerald-500/70 bg-emerald-900/40 text-emerald-100'
                      : 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="sm:col-span-3" />
        <div className="flex flex-col items-end gap-1 text-right text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wide text-slate-400/80">Ordenar por</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 rounded-lg border border-slate-700/70 bg-slate-900/60 px-2 py-1 text-[11px] text-slate-200 shadow-[0_0_0_1px_rgba(15,23,42,0.6)] focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          >
            <option value="recent">Recientes</option>
            <option value="title">Título A-Z</option>
            <option value="rating">Rating alto → bajo</option>
          </select>
          <div className="mt-1 text-[11px] text-slate-400/80">Resultados: <span className="text-slate-100 font-semibold">{filtered.length}</span></div>
        </div>
      </div>

      {/* Add button + modal */}
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={() => setAddOpen(true)} className={`${isDominio ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'} text-xs`}>➕ Añadir ítem</Button>
      </div>

      {/* Grid only */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-8 text-center">
          <div className="text-5xl mb-2">
            {items.length === 0 ? '📚' : currentTypeIcon}
          </div>
          <div className="text-slate-200 font-semibold">
            {items.length === 0
              ? 'Tu biblioteca está vacía'
              : tab === 'all'
                ? 'No hay ítems que coincidan con estos filtros'
                : `No hay ${currentTypeLabel.toLowerCase()} que coincidan con estos filtros`}
          </div>
          <div className="text-slate-400 text-sm mb-4">
            {items.length === 0
              ? 'Agrega tu primer ítem con el formulario de arriba'
              : (query || status !== 'all')
                ? 'Prueba ajustando la búsqueda o el estado para ver más resultados.'
                : 'Agrega un nuevo ítem con el botón "Añadir ítem".'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((it) => {
            const coverSrc = it.coverPath || it.coverUrl;
            const typeLabel = TYPES.find(t=>t.id===it.type)?.label || it.type;
            const statusLabel = STATUSES.find(s=>s.id===it.status)?.label || it.status;

            return (
              <div key={it.id} className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5">
                <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex z-20">
                  <button title="Editar" className="rounded-md border border-slate-700/60 bg-slate-950/80 px-2 py-1 text-[12px] text-slate-100 hover:bg-slate-800/80" onClick={() => openEditorFor(it.id)}>🖊️</button>
                  <button title="Eliminar" className="rounded-md border border-slate-700/60 bg-slate-950/80 px-2 py-1 text-[12px] text-slate-100 hover:bg-slate-800/80" onClick={() => { if (confirm('¿Eliminar este ítem de biblioteca?')) removeLibraryItem(it.id); }}>🗑️</button>
                </div>

                {/* Cover */}
                <div className="relative aspect-[3/4] w-full bg-slate-900/60 cursor-zoom-in" onClick={(e) => { e.stopPropagation(); if (coverSrc) setLightboxSrc(coverSrc); }}>
                  {coverSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverSrc} alt={it.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs">Sin portada</div>
                  )}

                  {/* Bottom gradient overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  {/* Title + meta */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <button type="button" onClick={() => openEditorFor(it.id)} className="text-left">
                        <div className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-100 drop-shadow-sm">{it.title}</div>
                      </button>

                      {typeof it.rating === 'string' && rankClasses(it.rating) ? (
                        <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-extrabold shadow-lg ${rankClasses(it.rating)}`}>{String(it.rating).toUpperCase()}</span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-0.5 text-slate-200">
                        <span>{TYPE_ICONS[it.type] || '📦'}</span>
                        <span>{typeLabel}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${statusClasses(it.status)}`}>
                        <span>{it.status === 'done' ? '✓' : it.status === 'in_progress' ? '▶' : '…'}</span>
                        <span className="text-[10px]">{statusLabel}</span>
                      </span>
                      {it.year ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-0.5 text-slate-200">
                          <span>📅</span>
                          <span>{it.year}</span>
                        </span>
                      ) : null}
                      {it.platform ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-0.5 text-slate-200">
                          <span>🎮</span>
                          <span className="max-w-[120px] truncate">{it.platform}</span>
                        </span>
                      ) : null}
                      {it.type === 'purchase' && it.price != null && it.price !== '' ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-0.5 text-slate-200">
                          <span>💲</span>
                          <span>{it.price}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LibraryEditModal open={!!editItem} item={editItem} onClose={() => {
        setSuppressUrlEditOpen(true);
        setEditItem(null);
        const sp = new URLSearchParams(Array.from(searchParams.entries()));
        sp.delete('edit');
        sp.delete('item');
        const qs = sp.toString();
        router.replace(`/library${qs ? `?${qs}` : ''}`);
      }} />
      <LibraryAddModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ImageLightbox src={lightboxSrc} alt={'Portada'} onClose={()=> setLightboxSrc('')} />
    </main>
  );
}
