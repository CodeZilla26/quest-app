"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';

const PIN = '2601';

function normalizeComments(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((c) => String(c || '').trim()).filter(Boolean);
}

export default function SecretLibraryPage() {
  const router = useRouter();

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');

  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const selected = useMemo(
    () => (items || []).find((it) => String(it.id) === String(selectedId)),
    [items, selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return (items || []).filter((it) => (it.title || '').toLowerCase().includes(q));
  }, [items, query]);

  const hasSelection = Boolean(selectedId);

  useEffect(() => {
    try {
      const ok = sessionStorage.getItem('secretUnlocked') === '1';
      setUnlocked(ok);
    } catch {
      setUnlocked(false);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/secrets');
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data.items) ? data.items : [];
        setItems(list);
        setHydrated(true);
      } catch (e) {
        console.error(e);
        setItems([]);
        setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    if (!hydrated) return;

    const t = setTimeout(async () => {
      try {
        setSaving(true);
        await fetch('/api/secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [items, unlocked, hydrated]);

  async function uploadCover(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
    return data.coverPath;
  }

  const onUnlock = () => {
    if (pin !== PIN) return;
    try {
      sessionStorage.setItem('secretUnlocked', '1');
    } catch {}
    setUnlocked(true);
  };

  const onLock = () => {
    try {
      sessionStorage.removeItem('secretUnlocked');
    } catch {}
    setUnlocked(false);
    setPin('');
    router.push('/library');
  };

  const addItem = () => {
    const nowIso = new Date().toISOString();
    const item = {
      id: `sec_${Math.random().toString(36).slice(2)}`,
      type: 'secret',
      title: 'Nuevo secreto',
      coverPath: '',
      comments: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setItems((prev) => [...(prev || []), item]);
    setSelectedId(String(item.id));
  };

  const removeItem = (id) => {
    if (!window.confirm('¿Eliminar este secreto?')) return;
    setItems((prev) => (prev || []).filter((it) => String(it.id) !== String(id)));
    if (String(selectedId) === String(id)) setSelectedId('');
  };

  const patchItem = (id, patch) => {
    setItems((prev) =>
      (prev || []).map((it) =>
        String(it.id) === String(id)
          ? { ...it, ...patch, updatedAt: new Date().toISOString() }
          : it
      )
    );
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-black to-red-950/40">
        <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4 py-10">
          <div className="w-full rounded-2xl border border-red-800/50 bg-black/70 p-4 shadow-2xl">
            <div className="text-lg font-semibold text-red-100">Acceso restringido</div>
            <div className="mt-1 text-xs text-red-200/70">Ingresa el PIN para abrir la biblioteca secreta.</div>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              type="password"
              className="mt-3 w-full rounded-lg border border-red-900/60 bg-black/70 px-3 py-2 text-sm text-red-50 placeholder:text-red-200/30 focus:outline-none focus:ring-2 focus:ring-red-500/60"
              placeholder="PIN"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => router.push('/library')}>Volver</Button>
              <Button className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-700 to-rose-700" onClick={onUnlock}>Entrar</Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-black to-red-950/40">
      <div className="sticky top-0 z-10 border-b border-red-900/40 bg-black/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-red-100">Biblioteca Secreta</div>
            <div className="mt-0.5 text-[11px] text-red-200/70">Rojo/negro · {saving ? 'Guardando...' : 'Listo'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={onLock}>Cerrar</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          <div className={`${hasSelection ? 'hidden lg:block' : ''} rounded-2xl border border-red-900/40 bg-black/60 p-3`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-red-100">Secretos</div>
              <Button className="px-2 py-1 text-xs bg-gradient-to-r from-red-700 to-rose-700" onClick={addItem}>+ Nuevo</Button>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título..."
              className="mb-3 w-full rounded-lg border border-red-900/60 bg-black/70 px-3 py-2 text-sm text-red-50 placeholder:text-red-200/30 focus:outline-none focus:ring-2 focus:ring-red-500/60"
            />
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-1 space-y-2">
              {filtered.map((it) => {
                const active = String(it.id) === String(selectedId);
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setSelectedId(String(it.id))}
                    className={`w-full rounded-xl border p-2 text-left transition-colors ${active ? 'border-red-500/60 bg-red-950/40' : 'border-red-900/40 bg-black/40 hover:bg-black/60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-10 overflow-hidden rounded-md bg-black/60 border border-red-900/40 flex items-center justify-center">
                        {it.coverPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.coverPath} alt={it.title || 'cover'} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-red-200/40">Sin</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-red-50">{it.title || 'Sin título'}</div>
                        <div className="mt-0.5 text-[11px] text-red-200/50">Comentarios: {(it.comments || []).length}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {!filtered.length && (
                <div className="text-xs text-red-200/60">No hay secretos.</div>
              )}
            </div>
          </div>

          <div className={`${hasSelection ? '' : 'hidden lg:block'} rounded-2xl border border-red-900/40 bg-black/60 p-3`}
          >
            {!selected ? (
              <div className="text-sm text-red-200/70">Selecciona un secreto.</div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
                  <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setSelectedId('')}>Volver</Button>
                  <div className="text-[11px] text-red-200/60">Detalle</div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-red-200/60">Título</div>
                    <input
                      value={selected.title || ''}
                      onChange={(e) => patchItem(selected.id, { title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-red-900/60 bg-black/70 px-3 py-2 text-sm text-red-50"
                    />
                  </div>
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => removeItem(selected.id)}>Eliminar</Button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr]">
                  <div>
                    <div className="text-xs text-red-200/60">Imagen</div>
                    <div className="mt-2 rounded-xl border border-red-900/40 bg-black/50 p-2">
                      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-black/60 flex items-center justify-center">
                        {selected.coverPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selected.coverPath} alt="cover" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[11px] text-red-200/40">Sin imagen</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-2 block w-full text-xs text-red-100 file:mr-3 file:rounded-md file:border file:border-red-900/50 file:bg-black/50 file:px-2 file:py-1 file:text-xs"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const coverPath = await uploadCover(f);
                            patchItem(selected.id, { coverPath });
                          } catch (err) {
                            console.error(err);
                            alert('Error subiendo imagen');
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-red-200/60">Comentarios</div>
                    <div className="mt-2 space-y-2">
                      {(Array.isArray(selected.comments) ? selected.comments : []).map((val, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={val}
                            onChange={(e) => {
                              const next = Array.isArray(selected.comments) ? [...selected.comments] : [];
                              next[idx] = e.target.value;
                              patchItem(selected.id, { comments: next });
                            }}
                            className="w-full rounded-md border border-red-900/60 bg-black/70 px-3 py-2 text-sm text-red-50"
                          />
                          <Button
                            variant="ghost"
                            className="px-2 py-1 text-xs"
                            onClick={() => {
                              const next = (Array.isArray(selected.comments) ? [...selected.comments] : []).filter((_, i) => i !== idx);
                              patchItem(selected.id, { comments: next });
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-700 to-rose-700"
                          onClick={() => {
                            const base = Array.isArray(selected.comments) ? [...selected.comments] : [];
                            base.push('');
                            patchItem(selected.id, { comments: base });
                          }}
                        >
                          + Agregar comentario
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => {
                            const cleaned = normalizeComments(selected.comments);
                            patchItem(selected.id, { comments: cleaned });
                          }}
                        >
                          Limpiar vacíos
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
