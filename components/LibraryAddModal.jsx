"use client";
import { useState } from 'react';
import useQuests from '../hooks/useQuests';
import Button from './Button';

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

export default function LibraryAddModal({ open, onClose }) {
  const { state, addLibraryItem } = useQuests();
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';

  const [form, setForm] = useState({ title: '', type: 'comic', status: 'backlog', platform: '', coverPath: '', chapters: '', seasons: '', year: '', price: '', format: '', link: '', actors: [''], comments: [''] });
  const [errors, setErrors] = useState({});
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
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Normalizar números
    const normalized = { ...form };
    if (normalized.chapters !== '' && (normalized.type === 'comic' || normalized.type === 'series')) {
      const n = Number(normalized.chapters);
      normalized.chapters = Number.isFinite(n) && n >= 0 ? n : '';
    }
    if (normalized.seasons !== '' && normalized.type === 'series') {
      const n = Number(normalized.seasons);
      normalized.seasons = Number.isFinite(n) && n >= 0 ? n : '';
    } else if (normalized.type !== 'series') {
      normalized.seasons = '';
    }
    if (normalized.year !== '' && (normalized.type === 'movie' || normalized.type === 'game')) {
      const y = Number(normalized.year);
      normalized.year = Number.isFinite(y) && y >= 0 ? y : '';
    } else if (!(normalized.type === 'movie' || normalized.type === 'game')) {
      normalized.year = '';
    }
    if (normalized.price !== '' && normalized.type === 'purchase') {
      const p = Number(String(normalized.price).replace(',', '.'));
      normalized.price = Number.isFinite(p) && p >= 0 ? p : '';
    } else if (normalized.type !== 'purchase') {
      normalized.price = '';
    }
    if (normalized.type === 'purchase') {
      normalized.platform = '';
      normalized.chapters = '';
      normalized.seasons = '';
      normalized.year = '';
      normalized.format = '';
    }
    if (normalized.type === 'movie' || normalized.type === 'series') {
      const rawActors = Array.isArray(normalized.actors) ? normalized.actors : [];
      normalized.actors = rawActors.map(a => String(a || '').trim()).filter(Boolean);
    } else {
      normalized.actors = [];
    }
    if (normalized.type === 'comic') {
      const rawComments = Array.isArray(normalized.comments) ? normalized.comments : [];
      normalized.comments = rawComments.map(c => String(c || '').trim()).filter(Boolean);
    } else {
      normalized.comments = [];
    }
    // Si no es comic, limpiar formato
    if (normalized.type !== 'comic') normalized.format = '';
    addLibraryItem({ ...normalized, link: (normalized.link || '').trim() });
    // reset and close
    setForm({ title: '', type: form.type, status: form.status, platform: '', coverPath: '', chapters: '', seasons: '', year: '', price: '', format: '', link: '', actors: [''], comments: [''] });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={onClose} />
      <div className={`relative w-full max-w-3xl rounded-2xl border p-4 shadow-2xl ${isDominio ? 'border-purple-700/60 bg-slate-900/90' : 'border-slate-700/60 bg-slate-900/90'}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-200">Agregar ítem</div>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose}>Cerrar</Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[240px_1fr]">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
                <div className="text-[11px] text-slate-400 mb-2">Portada</div>
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900/60 flex items-center justify-center">
                  {coverPreview || form.coverPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview || form.coverPath} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-slate-500">Sin portada</span>
                  )}
                </div>
                <div className="mt-3">
                  <input type="file" accept="image/*" onChange={async (e)=>{
                    const f = e.target.files?.[0];
                    if(!f) return;
                    try { setCoverPreview(URL.createObjectURL(f)); } catch(_) {}
                    try { const coverPath = await uploadCover(f); setForm({ ...form, coverPath }); }
                    catch(err){ console.error(err); alert('Error subiendo portada'); }
                  }} className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-md file:border file:border-slate-700/60 file:bg-slate-800/60 file:px-2 file:py-1 file:text-xs" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] text-slate-400">Título</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] text-slate-400">Link (opcional)</label>
                  <input type="url" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {form.type === 'game' ? (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] text-slate-400">Plataforma (requerida)</label>
                    <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                  </div>
                ) : null}

                {(form.type === 'movie' || form.type === 'series') ? (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] text-slate-400">Actores</label>
                    <div className="space-y-2">
                      {(Array.isArray(form.actors) ? form.actors : ['']).map((val, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input value={val} onChange={(e) => {
                            const next = Array.isArray(form.actors) ? [...form.actors] : [''];
                            next[idx] = e.target.value;
                            setForm({ ...form, actors: next });
                          }} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => {
                            const next = (Array.isArray(form.actors) ? [...form.actors] : ['']).filter((_, i) => i !== idx);
                            setForm({ ...form, actors: next.length ? next : [''] });
                          }}>Eliminar</Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => {
                        const next = Array.isArray(form.actors) ? [...form.actors] : [''];
                        next.push('');
                        setForm({ ...form, actors: next });
                      }}>+ Agregar actor</Button>
                    </div>
                  </div>
                ) : null}

                {form.type === 'purchase' ? (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] text-slate-400">Precio</label>
                    <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Ej. 49.99" className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                  </div>
                ) : null}

                {form.type === 'comic' ? (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] text-slate-400">Comentarios</label>
                    <div className="space-y-2">
                      {(Array.isArray(form.comments) ? form.comments : ['']).map((val, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input value={val} onChange={(e) => {
                            const next = Array.isArray(form.comments) ? [...form.comments] : [''];
                            next[idx] = e.target.value;
                            setForm({ ...form, comments: next });
                          }} className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => {
                            const next = (Array.isArray(form.comments) ? [...form.comments] : ['']).filter((_, i) => i !== idx);
                            setForm({ ...form, comments: next.length ? next : [''] });
                          }}>Eliminar</Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => {
                        const next = Array.isArray(form.comments) ? [...form.comments] : [''];
                        next.push('');
                        setForm({ ...form, comments: next });
                      }}>+ Agregar comentario</Button>
                    </div>
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
                          <option value="dc">DC</option>
                          <option value="marvel">Marvel</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-[11px] text-slate-400">Capítulos</label>
                      <input type="number" min="0" step="1" value={form.chapters} onChange={(e) => setForm({ ...form, chapters: e.target.value.replace(/[^0-9]/g,'') })} placeholder="Ej. 120" className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                    </div>
                    {form.type === 'series' && (
                      <div>
                        <label className="mb-1 block text-[11px] text-slate-400">Temporadas</label>
                        <input type="number" min="0" step="1" value={form.seasons} onChange={(e) => setForm({ ...form, seasons: e.target.value.replace(/[^0-9]/g,'') })} placeholder="Ej. 3" className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                      </div>
                    )}
                  </>
                )}

                {(form.type === 'movie' || form.type === 'game') && (
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">Año</label>
                    <input type="number" min="0" step="1" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value.replace(/[^0-9]/g,'') })} placeholder="Ej. 2024" className="w-full rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200" />
                  </div>
                )}
              </div>

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

