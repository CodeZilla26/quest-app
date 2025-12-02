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
];

const STATUSES = [
  { id: 'backlog', label: 'Pendiente' },
  { id: 'in_progress', label: 'En curso' },
  { id: 'done', label: 'Completado' },
];

const TYPE_ICONS = { comic: '📚', movie: '🎬', series: '📺', game: '🎮' };
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
  const { state, addLibraryItem, removeLibraryItem } = useQuests();
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';

  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [activeTags, setActiveTags] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');

  const items = state.library || [];
  const allTags = useMemo(() => {
    const set = new Set();
    (items||[]).forEach(it => (it.tags||[]).forEach(t => set.add(String(t))));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [items]);

  // Hydrate from URL
  useEffect(() => {
    const q = searchParams.get('query') || '';
    const st = searchParams.get('status') || 'all';
    const t = searchParams.get('type') || 'all';
    const tg = searchParams.getAll('tag');
    setQuery(q);
    setStatus(st);
    setTab(t);
    setActiveTags(tg);
  }, [searchParams]);

  // Push to URL when filters change
  useEffect(() => {
    const sp = new URLSearchParams();
    if (query) sp.set('query', query);
    if (status !== 'all') sp.set('status', status);
    if (tab !== 'all') sp.set('type', tab);
    activeTags.forEach(t => sp.append('tag', t));
    const qs = sp.toString();
    router.replace(`/library${qs ? `?${qs}` : ''}`);
  }, [query, status, tab, activeTags]);

  const filtered = useMemo(() => {
    const base = (items || [])
      .filter((it) => (tab === 'all' ? true : it.type === tab))
      .filter((it) => (status === 'all' ? true : it.status === status))
      .filter((it) => (query.trim() ? (it.title || '').toLowerCase().includes(query.trim().toLowerCase()) : true))
      .filter((it) => (activeTags.length ? (it.tags||[]).some(t => activeTags.includes(String(t))) : true));
    return base.sort((a,b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
  }, [items, tab, status, query, activeTags]);

  // Detail via URL param
  const selectedItemId = searchParams.get('item') || '';
  const selectedItem = (items || []).find(it => String(it.id) === String(selectedItemId));
  const editParam = searchParams.get('edit') === '1';

  const openItem = (id) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set('item', String(id));
    router.replace(`/library?${sp.toString()}`);
  };
  const closeItem = () => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.delete('item');
    sp.delete('edit');
    const qs = sp.toString();
    router.replace(`/library${qs ? `?${qs}` : ''}`);
  };

  const openEditorFor = (id) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set('item', String(id));
    sp.set('edit', '1');
    router.replace(`/library?${sp.toString()}`);
  };

  // Sync URL edit param with modal state
  useEffect(() => {
    if (editParam && selectedItem) setEditItem(selectedItem);
  }, [editParam, selectedItem]);

  // (upload handled inside modals)

  return (
    <main className="container-app">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="heading-epic select-none">Biblioteca</h1>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-2">
        {[{ id: 'all', label: 'Todos' }, ...TYPES].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-md px-3 py-1.5 text-xs font-semibold border ${tab===t.id ? (isDominio ? 'border-purple-500/50 bg-purple-900/30 text-purple-200' : 'border-indigo-500/50 bg-indigo-900/20 text-indigo-200') : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/60'}`}>{t.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-7 items-start">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} className="sm:col-span-2 rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" placeholder="Buscar por título..." />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400">Estado:</span>
          {[{ id: 'all', label: 'Todos' }, ...STATUSES].map(s => {
            const active = status === s.id;
            return (
              <button key={s.id} onClick={()=>setStatus(s.id)} className={`rounded-md border px-3 py-2 text-xs font-semibold ${active ? 'border-emerald-500/50 bg-emerald-900/20 text-emerald-200' : 'border-slate-700/60 bg-slate-800/60 text-slate-300'}`}>{s.label}</button>
            );
          })}
        </div>
        <div className="sm:col-span-4 flex flex-wrap items-center gap-2">
          {allTags.length === 0 ? (
            <span className="text-[11px] text-slate-500">Sin tags</span>
          ) : (
            allTags.map((tg) => {
              const active = activeTags.includes(tg);
              return (
                <button key={tg} onClick={()=> setActiveTags(active ? activeTags.filter(t=>t!==tg) : [...activeTags, tg])} className={`rounded-full px-2 py-0.5 text-[11px] border ${active ? 'border-cyan-500/50 bg-cyan-900/30 text-cyan-200' : 'border-slate-700/60 bg-slate-800/60 text-slate-300'}`}>#{tg}</button>
              );
            })
          )}
        </div>
        <div className="text-right text-xs text-slate-400">Resultados: {filtered.length}</div>
      </div>

      {/* Add button + modal */}
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={() => setAddOpen(true)} className={`${isDominio ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'} text-xs`}>➕ Añadir ítem</Button>
      </div>

      {/* Grid only */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-8 text-center">
          <div className="text-5xl mb-2">📚</div>
          <div className="text-slate-200 font-semibold">Tu biblioteca está vacía</div>
          <div className="text-slate-400 text-sm mb-4">Agrega tu primer ítem con el formulario de arriba</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((it) => (
            <div key={it.id} className="group relative rounded-lg border border-slate-700/60 bg-slate-800/40 p-2 hover:shadow-lg hover:shadow-black/20 transition-transform">
              <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex z-10">
                <button title="Editar" className="rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-1 text-[12px] text-slate-200 hover:bg-slate-700/60" onClick={() => openEditorFor(it.id)}>🖊️</button>
                <button title="Eliminar" className="rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-1 text-[12px] text-slate-200 hover:bg-slate-700/60" onClick={() => { if (confirm('¿Eliminar este ítem de biblioteca?')) removeLibraryItem(it.id); }}>🗑️</button>
              </div>
              {/* Rank badge overlay */}
              {typeof it.rating === 'string' && rankClasses(it.rating) && (
                <div className="absolute left-2 top-2 z-10">
                  <span className={`rounded px-2 py-1 text-xs font-bold shadow-lg ${rankClasses(it.rating)}`}>{String(it.rating).toUpperCase()}</span>
                </div>
              )}
              <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-slate-900/60 cursor-zoom-in" onClick={(e) => { e.stopPropagation(); const src = it.coverPath || it.coverUrl; if (src) setLightboxSrc(src); }}>
                {it.coverPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.coverPath} alt={it.title} className="h-full w-full object-cover" />
                ) : it.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.coverUrl} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs">Sin portada</div>
                )}
              </div>
              <div className="mt-2">
                <div className="truncate text-[13px] font-semibold text-slate-100 cursor-pointer" title={it.title} onClick={() => openItem(it.id)}>{it.title}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px]">
                  <span className="rounded-full border px-2 py-0.5 text-[10px] text-slate-200 bg-slate-800/60 border-slate-700/60">
                    {TYPE_ICONS[it.type] || '📦'} {TYPES.find(t=>t.id===it.type)?.label || it.type}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusClasses(it.status)}`}>
                    {STATUSES.find(s=>s.id===it.status)?.label || it.status}
                  </span>
                </div>
                {Array.isArray(it.tags) && it.tags.length>0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {it.tags.map((tg, i)=> (<span key={i} className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-200">#{tg}</span>))}
                  </div>
                )}
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                  {it.year ? <span>{it.year}</span> : null}
                  {typeof it.rating === 'string' && rankClasses(it.rating) ? (
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${rankClasses(it.rating)}`}>{String(it.rating).toUpperCase()}</span>
                  ) : it.rating ? (
                    <span>⭐ {it.rating}</span>
                  ) : null}
                  {it.platform && <span>🎮 {it.platform}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Large centered modal detail */}
      {selectedItem && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeItem} />
          <div className={`relative w-full max-w-4xl rounded-2xl border p-4 shadow-2xl ${isDominio ? 'border-purple-700/60 bg-slate-900/95' : 'border-slate-700/60 bg-slate-900/95'}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="truncate pr-2 text-base font-semibold text-slate-100">{selectedItem.title}</div>
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={closeItem}>Cerrar</Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900/60 cursor-zoom-in" onClick={(e)=>{ e.stopPropagation(); const src = selectedItem.coverPath || selectedItem.coverUrl; if(src) setLightboxSrc(src); }}>
                {selectedItem.coverPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedItem.coverPath} alt={selectedItem.title} className="h-full w-full object-cover" />
                ) : selectedItem.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedItem.coverUrl} alt={selectedItem.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500 text-sm">Sin portada</div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="rounded-full border px-2 py-0.5 text-[10px] text-slate-200 bg-slate-800/60 border-slate-700/60">
                    {TYPE_ICONS[selectedItem.type] || '📦'} {TYPES.find(t=>t.id===selectedItem.type)?.label || selectedItem.type}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusClasses(selectedItem.status)}`}>
                    {STATUSES.find(s=>s.id===selectedItem.status)?.label || selectedItem.status}
                  </span>
                  {selectedItem.platform && <span className="text-slate-300 text-xs">🎮 {selectedItem.platform}</span>}
                  {typeof selectedItem.rating === 'string' && rankClasses(selectedItem.rating) ? (
                    <span className={`rounded px-2 py-1 text-xs font-bold ${rankClasses(selectedItem.rating)}`}>{String(selectedItem.rating).toUpperCase()}</span>
                  ) : selectedItem.rating ? (
                    <span className="text-slate-300 text-xs">⭐ {selectedItem.rating}</span>
                  ) : null}
                </div>
                {Array.isArray(selectedItem.tags) && selectedItem.tags.length>0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map((tg,i)=> (<span key={i} className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-200">#{tg}</span>))}
                  </div>
                )}
                {/* Format and Chapters info */}
                {selectedItem.type === 'comic' && (
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold">Formato:</span> {selectedItem.format ? (selectedItem.format === 'manga' ? 'Manga' : selectedItem.format === 'manhwa' ? 'Manhwa' : selectedItem.format === 'manhua' ? 'Manhua' : selectedItem.format) : '—'}
                  </div>
                )}
                {(selectedItem.type === 'comic' || selectedItem.type === 'series') && (
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold">Capítulos:</span> {selectedItem.chapters != null && selectedItem.chapters !== '' ? selectedItem.chapters : '—'}
                  </div>
                )}
                <div className="text-xs text-slate-400">
                  <div>Creado: {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : '—'}</div>
                  <div>Actualizado: {selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : '—'}</div>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Button onClick={() => openEditorFor(selectedItem.id)} className={`${isDominio ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'} text-xs`}>Editar</Button>
                  <Button variant="danger" onClick={() => { if (confirm('¿Eliminar este ítem de biblioteca?')) { removeLibraryItem(selectedItem.id); closeItem(); } }} className="text-xs">Eliminar</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LibraryEditModal open={!!editItem} item={editItem} onClose={() => {
        setEditItem(null);
        const sp = new URLSearchParams(Array.from(searchParams.entries()));
        sp.delete('edit');
        const qs = sp.toString();
        router.replace(`/library${qs ? `?${qs}` : ''}`);
      }} />
      <LibraryAddModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ImageLightbox src={lightboxSrc} alt={selectedItem?.title || 'Portada'} onClose={()=> setLightboxSrc('')} />
    </main>
  );
}
