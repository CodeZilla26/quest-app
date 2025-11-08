"use client";
import { useMemo } from 'react';
import { SHOP_ITEMS, getRarity } from '../shared/constants';
import useQuests from '../hooks/useQuests';
import Button from './Button';

export default function ShopModal({ open, onClose }) {
  const { state, purchaseItem } = useQuests();
  const items = SHOP_ITEMS;
  const essence = state.wallet?.essence ?? 0;
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';
  const now = Date.now();
  const expBooster = state.boosters?.exp;
  const manaBooster = state.boosters?.mana;
  const essenceBooster = state.boosters?.essence;
  const hasDominio = (state.theme === 'dominio' || state.theme === 'shadow');
  const hasCompleteDominio = state.theme === 'dominio';
  const expActive = !!(expBooster && new Date(expBooster.activeUntil).getTime() > now);
  const manaActive = !!(manaBooster && new Date(manaBooster.activeUntil).getTime() > now);
  const essenceActive = !!(essenceBooster && new Date(essenceBooster.activeUntil).getTime() > now);
  const expMinLeft = expActive ? Math.ceil((new Date(expBooster.activeUntil).getTime() - now) / 60000) : 0;
  const manaMinLeft = manaActive ? Math.ceil((new Date(manaBooster.activeUntil).getTime() - now) / 60000) : 0;
  const essenceMinLeft = essenceActive ? Math.ceil((new Date(essenceBooster.activeUntil).getTime() - now) / 60000) : 0;

  const sorted = useMemo(() => {
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
    // Filtrar fragmentos si ya tienes el Dominio del Monarca completo
    const filteredItems = hasCompleteDominio 
      ? items.filter(item => item.type !== 'fragment')
      : items;
    return [...filteredItems].sort((a, b) => (rarityOrder[a.rarity] - rarityOrder[b.rarity]) || a.cost - b.cost);
  }, [items, hasCompleteDominio]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-xl border p-4 shadow-2xl ${isDominio ? 'border-purple-700/60 bg-slate-900/90' : 'border-slate-700/60 bg-slate-900/90'}`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">Tienda</div>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="mb-2 text-xs text-slate-300">Esencia disponible: <span className="font-semibold text-amber-300">{essence}</span></div>
        
        {!hasCompleteDominio && (
          <div className="mb-3 rounded-lg border border-purple-700/30 bg-purple-900/20 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-purple-300">🕳️</span>
              <span className="text-sm font-semibold text-purple-200">Fragmentos del Dominio del Monarca</span>
            </div>
            <div className="text-xs text-purple-300">
              {(() => {
                const fragments = ['fragment_shadow', 'fragment_void', 'fragment_portal', 'fragment_crown', 'fragment_essence'];
                const owned = fragments.filter(id => (state.inventory || []).some(item => item.id === id));
                return `${owned.length}/5 fragmentos recolectados`;
              })()}
            </div>
            <div className="mt-2 text-xs text-purple-400">
              Reúne todos los fragmentos para desbloquear el tema completo
            </div>
          </div>
        )}
        {(expActive || manaActive || essenceActive) && (
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {expActive && <span className="text-emerald-300">EXP activo ~{expMinLeft}m</span>}
            {manaActive && <span className="text-cyan-300">Maná activo ~{manaMinLeft}m</span>}
            {essenceActive && <span className="text-amber-300">Esencia activa ~{essenceMinLeft}m</span>}
          </div>
        )}
        <div className="max-h-[60vh] overflow-auto pr-1">
        <ul className="flex flex-col gap-2">
          {sorted.map((it) => {
            const r = getRarity(it.rarity);
            const isExpBooster = it.id.startsWith('booster_exp_');
            const isManaBooster = it.id === 'booster_mana_30';
            const isEssenceBooster = it.id === 'booster_essence_30';
            const isFragment = it.type === 'fragment';
            const alreadyHasFragment = isFragment && (state.inventory || []).some(item => item.id === it.id);
            const blocked = (isExpBooster && expActive) || (isManaBooster && manaActive) || (isEssenceBooster && essenceActive) || alreadyHasFragment;
            const canBuy = essence >= it.cost && !blocked;
            return (
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{it.icon}</span>
                  <div>
                    <div className="text-slate-100 text-sm font-semibold">{it.name}</div>
                    <div className="text-slate-400 text-xs">{it.type} · <span className={`badge bg-gradient-to-r ${r.color}`}>{r.label}</span></div>
                    {blocked && isExpBooster && (
                      <div className="text-[11px] text-emerald-300 mt-1">EXP activo · ~{expMinLeft} min</div>
                    )}
                    {blocked && isManaBooster && (
                      <div className="text-[11px] text-cyan-300 mt-1">Maná activo · ~{manaMinLeft} min</div>
                    )}
                    {blocked && isEssenceBooster && (
                      <div className="text-[11px] text-amber-300 mt-1">Esencia activa · ~{essenceMinLeft} min</div>
                    )}
                    {blocked && alreadyHasFragment && (
                      <div className="text-[11px] text-purple-300 mt-1">Fragmento ya obtenido</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-amber-300 text-sm font-semibold">{it.cost} ⟡</div>
                  <Button
                    disabled={!canBuy}
                    onClick={() => purchaseItem(it)}
                    className={`px-3 py-1 text-xs font-medium ${!canBuy ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : ''}`}
                  >
                    Comprar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    </div>
  );
}
