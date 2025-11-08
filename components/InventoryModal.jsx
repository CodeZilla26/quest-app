"use client";
import { useMemo, useState } from 'react';
import useQuests from '../hooks/useQuests';
import { getRarity } from '../shared/constants';
import Button from './Button';

export default function InventoryModal({ open, onClose }) {
  const { state } = useQuests();
  const items = state.inventory || [];
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';
  const [filter, setFilter] = useState('all');

  const grouped = useMemo(() => {
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
    const filtered = (items || []).filter((it) => {
      if (filter === 'all') return true;
      if (filter === 'chest') return (it.id || '').startsWith('chest_');
      if (filter === 'consumable') return it.type === 'consumable' && !(it.id || '').startsWith('chest_');
      if (filter === 'fragment') return it.type === 'fragment';
      if (filter === 'permanent') return it.type === 'permanent' || it.type === 'qol' || it.type === 'theme';
      return true;
    });
    return [...filtered]
      .sort((a, b) => (rarityOrder[(a.rarity||'common')] - rarityOrder[(b.rarity||'common')]) || (a.name || '').localeCompare(b.name || ''));
  }, [items, filter]);

  function iconFor(it) {
    const id = it?.id || '';
    const type = it?.type || '';
    if (id.startsWith('chest_')) return '🗃️';
    if (type === 'fragment') return '🧩';
    if (type === 'consumable') return '🧪';
    if (type === 'qol') return '🛠️';
    if (type === 'permanent') return '🏅';
    if (type === 'theme') return '🎨';
    return '🎁';
  }

  function openChest(it) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open_chest', { detail: { chest: { id: it.id, name: it.name || 'Cofre' } } }));
    }
    onClose?.();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-xl border p-4 shadow-2xl ${isDominio ? 'border-purple-700/60 bg-slate-900/90' : 'border-slate-700/60 bg-slate-900/90'}`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">Inventario</div>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose}>Cerrar</Button>
        </div>
        {/* Filtros */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'chest', label: 'Cofres' },
            { id: 'consumable', label: 'Consumibles' },
            { id: 'fragment', label: 'Fragmentos' },
            { id: 'permanent', label: 'Permanentes' },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} className={`rounded-md border px-2 py-1 ${filter===t.id ? (isDominio ? 'border-purple-500/50 bg-purple-900/30 text-purple-200' : 'border-indigo-500/50 bg-indigo-900/20 text-indigo-200') : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/60'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {grouped.length === 0 ? (
          <div className="text-sm text-slate-400">No tienes ítems permanentes. Compra cosméticos o QoL en la Tienda.</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {grouped.map((it) => {
              const r = getRarity(it.rarity);
              return (
                <li key={`${it.id}-${it.acquiredAt}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{iconFor(it)}</span>
                    <div>
                      <div className="text-slate-100 text-sm font-semibold">{it.name}</div>
                      <div className="text-slate-400 text-xs">{it.type} · <span className={`badge bg-gradient-to-r ${r.color}`}>{r.label}</span></div>
                      {it.acquiredAt && (
                        <div className="text-[11px] text-slate-500 mt-1">Adquirido: {new Date(it.acquiredAt).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  {(it.id || '').startsWith('chest_') && (
                    <div className="flex items-center gap-2">
                      <Button className="px-2 py-1 text-xs" onClick={() => openChest(it)}>Abrir</Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
