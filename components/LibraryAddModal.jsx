"use client";
import { useState } from 'react';
import useQuests from '../hooks/useQuests';
import Button from './Button';

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

// Solo Leveling style ranks
const RANKS = [
  { id: 'E', label: 'E', color: 'from-slate-500 to-slate-400' },
  { id: 'D', label: 'D', color: 'from-green-500 to-emerald-500' },
  { id: 'C', label: 'C', color: 'from-cyan-500 to-blue-500' },
  { id: 'B', label: 'B', color: 'from-indigo-600 to-purple-600' },
  { id: 'A', label: 'A', color: 'from-amber-500 to-orange-600' },
  { id: 'S', label: 'S', color: 'from-pink-600 to-red-600' },
  { id: 'SS', label: 'SS', color: 'from-fuchsia-600 to-rose-600' },
  { id: 'SSS', label: 'SSS', color: 'from-yellow-500 to-amber-600' },
];

export default function LibraryAddModal({ open, onClose }) {
  const { state, addLibraryItem } = useQuests();
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';

  const [form, setForm] = useState({ title: '', type: 'comic', status: 'backlog', platform: '', rating: '', coverPath: '', chapters: '', format: '', link: '' });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [coverPreview, setCoverPreview] = useState('');

  async function uploadCover(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
    return data.coverPath;
  }

  if (!open) return null;

  const onAdd = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Título requerido';
    if (form.type === 'game' && !form.platform.trim()) errs.platform = 'Plataforma requerida en juegos';
    if (form.rating && !RANKS.some(r => r.id === form.rating)) errs.rating = 'Selecciona un rango válido';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Normalizar capítulos a número si aplica
    const normalized = { ...form };
    if (normalized.chapters !== '' && (normalized.type === 'comic' || normalized.type === 'series')) {
      const n = Number(normalized.chapters);
      normalized.chapters = Number.isFinite(n) && n >= 0 ? n : '';
    }
    // Si no es comic, limpiar formato
    if (normalized.type !== 'comic') normalized.format = '';
    addLibraryItem({ ...normalized, tags, link: (normalized.link || '').trim() });
    // reset and close
    setForm({ title: '', type: form.type, status: form.status, platform: '', rating: '', coverPath: '', chapters: '', format: '', link: '' });
    setTags([]);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-xl border p-4 shadow-2xl ${isDominio ? 'border-purple-700/60 bg-slate-900/90' : 'border-slate-700/60 bg-slate-900/90'}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-200">Agregar ítem</div>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose}>Cerrar</Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] text-slate-400">Título</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] text-slate-400">Link (opcional)</label>
              <input type="url" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
            </div>
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Tipo</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => {
                  const active = form.type === t.id;
                  return (
                    <button key={t.id} type="button" onClick={()=> setForm({ ...form, type: t.id })} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${active ? (isDominio ? 'border-purple-500/50 bg-purple-900/30 text-purple-200' : 'border-indigo-500/50 bg-indigo-900/20 text-indigo-200') : 'border-slate-700/60 bg-slate-800/60 text-slate-300'}`}>{t.label}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Estado</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => {
                  const active = form.status === s.id;
                  return (
                    <button key={s.id} type="button" onClick={()=> setForm({ ...form, status: s.id })} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${active ? 'border-emerald-500/50 bg-emerald-900/20 text-emerald-200' : 'border-slate-700/60 bg-slate-800/60 text-slate-300'}`}>{s.label}</button>
                  );
                })}
              </div>
            </div>
          </div>
          {form.type === 'game' ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] text-slate-400">Plataforma (requerida)</label>
              <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
            </div>
          ) : null}
          {(form.type === 'comic' || form.type === 'series') && (
            <>
              {form.type === 'comic' && (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] text-slate-400">Formato (solo comics)</label>
                  <select value={form.format} onChange={(e)=> setForm({ ...form, format: e.target.value })} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                    <option value="">Sin especificar</option>
                    <option value="manga">Manga</option>
                    <option value="manhwa">Manhwa</option>
                    <option value="manhua">Manhua</option>
                  </select>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] text-slate-400">Capítulos</label>
                <input type="number" min="0" step="1" value={form.chapters} onChange={(e) => setForm({ ...form, chapters: e.target.value.replace(/[^0-9]/g,'') })} placeholder="Ej. 120" className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] text-slate-400">Rango</label>
            <div className="flex flex-wrap gap-2">
              {RANKS.map(r => {
                const active = form.rating === r.id;
                return (
                  <button key={r.id} type="button" onClick={()=> setForm({ ...form, rating: r.id })} className={`rounded-md border px-3 py-1.5 text-xs font-bold bg-gradient-to-r ${active ? `${r.color} text-white` : 'from-slate-800 to-slate-800 text-slate-300 border-slate-700/60'}`}>{r.label}</button>
                );
              })}
              <button type="button" onClick={()=> setForm({ ...form, rating: '' })} className={`rounded-md border px-3 py-1.5 text-xs ${!form.rating ? 'border-slate-500/60 text-slate-300' : 'border-slate-700/60 text-slate-400'}`}>Sin rango</button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] text-slate-400">Portada</label>
            <div className="flex items-start gap-3">
              <input type="file" accept="image/*" onChange={async (e)=>{
                const f = e.target.files?.[0];
                if(!f) return;
                // Preview immediate
                try { setCoverPreview(URL.createObjectURL(f)); } catch(_) {}
                try { const coverPath = await uploadCover(f); setForm({ ...form, coverPath }); }
                catch(err){ console.error(err); alert('Error subiendo portada'); }
              }} className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-md file:border file:border-slate-700/60 file:bg-slate-800/60 file:px-2 file:py-1 file:text-xs" />
              <div className="w-20 h-28 overflow-hidden rounded bg-slate-800/60 flex items-center justify-center">
                {coverPreview || form.coverPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview || form.coverPath} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] text-slate-500">Sin portada</span>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Tags */}
          <div className="mt-3">
            <div className="mb-1 text-[11px] text-slate-400">Tags</div>
            <div className="flex items-center gap-2">
              <input value={tagInput} onChange={(e)=>setTagInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && tagInput.trim()){ setTags([...(tags||[]), tagInput.trim()]); setTagInput(''); } }} placeholder="Añadir tag y Enter" className="rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500" />
              <Button variant="ghost" className="px-2 py-1 text-[11px]" onClick={()=>{ if(tagInput.trim()){ setTags([...(tags||[]), tagInput.trim()]); setTagInput(''); } }}>Añadir</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(tags||[]).map((t, idx)=> (
                <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-200">
                  <span>#{t}</span>
                  <button className="opacity-70 hover:opacity-100" onClick={()=> setTags(tags.filter((_,i)=>i!==idx))}>×</button>
                </span>
              ))}
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="mt-3 text-[11px] text-red-300">{Object.values(errors).join(' · ')}</div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={onClose}>Cancelar</Button>
          <Button className={`${isDominio ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'} px-3 py-1.5 text-xs`} onClick={onAdd}>Añadir</Button>
        </div>
      </div>
    </div>
  );
}

