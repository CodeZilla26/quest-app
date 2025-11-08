"use client";
import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { useQuestDispatch } from '../context/QuestContext';
import useQuests from '../hooks/useQuests';

export default function ChestOpenModal() {
  const dispatch = useQuestDispatch();
  const { state } = useQuests();
  const [open, setOpen] = useState(false);
  const [chest, setChest] = useState(null);
  const [opening, setOpening] = useState(false);
  const [loot, setLoot] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const onOpenChest = (e) => {
      setChest(e.detail?.chest || { id: 'chest_small', name: 'Cofre pequeño' });
      setLoot(null);
      setOpening(false);
      setOpen(true);
    };
    if (typeof window !== 'undefined') window.addEventListener('open_chest', onOpenChest);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('open_chest', onOpenChest);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startOpening = () => {
    if (opening || loot) return;
    const animationsOn = state.settings?.animations !== false;
    if (animationsOn) {
      setOpening(true);
      // Simular animación ~1.2-1.4s y luego resolver botín
      timerRef.current = setTimeout(() => {
        const rolled = rollLoot(chest?.id || 'chest_small');
        setLoot(rolled);
        dispatch({ type: 'APPLY_CHEST_LOOT', chestId: chest?.id || 'chest_small', loot: rolled });
      }, 1200);
    } else {
      // Sin animaciones: apertura instantánea
      const rolled = rollLoot(chest?.id || 'chest_small');
      setLoot(rolled);
      dispatch({ type: 'APPLY_CHEST_LOOT', chestId: chest?.id || 'chest_small', loot: rolled });
    }
  };

  const reset = () => {
    setOpen(false);
    setChest(null);
    setOpening(false);
    setLoot(null);
  };

  if (!open) return null;

  // Estilos por rareza/tipo de cofre
  const chestId = chest?.id || 'chest_small';
  const style = styleForChest(chestId);

  return (
    <Modal open={open} onClose={reset} size="sm" hideCloseButton>
      <div className="relative select-none">
        <div className="mb-3 text-center">
          <div className="text-xl font-extrabold text-slate-100 tracking-wide">{chest?.name || 'Cofre'}</div>
          <div className="text-xs text-slate-400">Toca para abrir</div>
        </div>

        <div className="relative mx-auto flex w-full flex-col items-center justify-center">
          {/* Caja */}
          <div
            className={`relative grid h-28 w-36 place-items-center rounded-xl border ${style.boxBorder} ${style.boxBg} shadow-lg ${style.boxShadow} ${(state.settings?.animations !== false && opening) ? 'animate-chest-wiggle' : (state.settings?.animations !== false ? 'hover:scale-105 transition-transform duration-200' : '')}`}
            onClick={!opening && !loot ? startOpening : undefined}
          >
            {/* Tapa */}
            <div className={`absolute -top-4 h-6 w-32 rounded-t-xl ${style.lidBg} border ${style.lidBorder} shadow ${state.settings?.animations !== false && opening ? 'animate-chest-lid' : ''}`} />
            {/* Cuerpo */}
            <div className={`h-20 w-28 rounded-lg ${style.bodyBg} border ${style.bodyBorder}`} />
            {/* Brillo */}
            {(state.settings?.animations !== false && opening) && <div className={`pointer-events-none absolute inset-0 rounded-xl ${style.glow}`} />}
          </div>

          {/* Loot */}
          {loot && (
            <div className={`mt-4 w-full rounded-xl border ${style.lootBorder} ${style.lootBg} p-3`}>
              <div className={`mb-2 text-center font-semibold ${style.lootTitle}`}>Botín</div>
              <ul className="space-y-2">
                {loot.exp ? (
                  <li className="flex items-center justify-between rounded-md border border-cyan-400/30 bg-cyan-500/10 p-2">
                    <span className="text-cyan-300 flex items-center gap-2"><span>⚡</span><span>EXP</span></span>
                    <span className="text-cyan-200 font-bold">+{loot.exp}</span>
                  </li>
                ) : null}
                {loot.essence ? (
                  <li className="flex items-center justify-between rounded-md border border-amber-400/30 bg-amber-500/10 p-2">
                    <span className="text-amber-300 flex items-center gap-2"><span>⟡</span><span>Esencia</span></span>
                    <span className="text-amber-200 font-bold">+{loot.essence}</span>
                  </li>
                ) : null}
                {(loot.items || []).map((it, idx) => (
                  <li key={`${it.id}_${idx}`} className="flex items-center justify-between rounded-md border border-violet-400/30 bg-violet-500/10 p-2">
                    <span className="text-violet-300 text-sm">{it.name || it.id}</span>
                    <span className="text-violet-200 text-xs">x{it.qty || 1}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botones */}
          <div className="mt-4 flex justify-center gap-2">
            {!opening && !loot && (
              <button onClick={startOpening} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60">Abrir</button>
            )}
            {(opening || loot) && (
              <button onClick={reset} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/60">Cerrar</button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes chestWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(1deg) scale(1.02); }
          50% { transform: rotate(-1deg) scale(1.03); }
          75% { transform: rotate(0.5deg) scale(1.02); }
        }
        @keyframes chestLid {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(-50deg); }
          100% { transform: rotateX(0deg); }
        }
        .animate-chest-wiggle { animation: chestWiggle 0.8s ease-in-out infinite; }
        .animate-chest-lid { transform-origin: center bottom; animation: chestLid 1.2s ease-in-out 1; }
      `}</style>
    </Modal>
  );
}

function rollLoot(chestId) {
  const rng = Math.random;
  const base = () => ({ exp: 0, essence: 0, items: [] });
  const res = base();
  switch (chestId) {
    case 'chest_small': {
      res.exp = 100 + Math.floor(rng() * 101);
      res.essence = 10 + Math.floor(rng() * 21);
      if (rng() < 0.25) res.items.push({ id: 'consumable_ghost_note', name: 'Nota Fantasma', qty: 1, type: 'consumable' });
      return res;
    }
    case 'chest_rare': {
      res.exp = 220 + Math.floor(rng() * 151); // 220-370
      res.essence = 25 + Math.floor(rng() * 26); // 25-50
      if (rng() < 0.5) res.items.push({ id: 'consumable_ghost_note', name: 'Nota Fantasma', qty: 1 + (rng() < 0.3 ? 1 : 0), type: 'consumable' });
      if (rng() < 0.2) res.items.push({ id: 'fragment_essence', name: 'Fragmento de Esencia', qty: 1, type: 'fragment' });
      return res;
    }
    case 'chest_epic': {
      res.exp = 380 + Math.floor(rng() * 251); // 380-630
      res.essence = 45 + Math.floor(rng() * 41); // 45-85
      res.items.push({ id: 'consumable_ghost_note', name: 'Nota Fantasma', qty: 1 + (rng() < 0.5 ? 1 : 0), type: 'consumable' });
      if (rng() < 0.4) res.items.push({ id: 'fragment_void', name: 'Fragmento del Vacío', qty: 1, type: 'fragment' });
      return res;
    }
    case 'chest_legendary': {
      res.exp = 650 + Math.floor(rng() * 401); // 650-1050
      res.essence = 80 + Math.floor(rng() * 71); // 80-150
      res.items.push({ id: 'consumable_ghost_note', name: 'Nota Fantasma', qty: 2, type: 'consumable' });
      // Garantía de fragmento
      const frags = ['fragment_shadow','fragment_void','fragment_portal','fragment_crown','fragment_essence'];
      const pick = frags[Math.floor(rng()() * frags.length)];
      const fragNames = {
        fragment_shadow: 'Fragmento de Sombra',
        fragment_void: 'Fragmento del Vacío',
        fragment_portal: 'Fragmento del Portal',
        fragment_crown: 'Fragmento de la Corona',
        fragment_essence: 'Fragmento de Esencia',
      };
      res.items.push({ id: pick, name: fragNames[pick] || pick, qty: 1, type: 'fragment' });
      return res;
    }
    default: {
      res.exp = 50 + Math.floor(rng() * 51);
      res.essence = 10 + Math.floor(rng() * 11);
      return res;
    }
  }
}

function styleForChest(chestId) {
  // Visuales por rareza
  if (chestId === 'chest_legendary') {
    return {
      boxBorder: 'border-yellow-400/60',
      boxBg: 'bg-gradient-to-b from-yellow-500/40 to-orange-700/30',
      boxShadow: 'shadow-yellow-900/40',
      lidBg: 'bg-gradient-to-b from-yellow-300 to-yellow-600',
      lidBorder: 'border-yellow-400',
      bodyBg: 'bg-gradient-to-b from-yellow-400 to-orange-600',
      bodyBorder: 'border-yellow-500',
      glow: 'bg-yellow-300/25 blur-md',
      lootBorder: 'border-yellow-400/40',
      lootBg: 'bg-yellow-500/10',
      lootTitle: 'text-yellow-200',
    };
  }
  if (chestId === 'chest_epic') {
    return {
      boxBorder: 'border-fuchsia-400/60',
      boxBg: 'bg-gradient-to-b from-fuchsia-600/40 to-purple-700/30',
      boxShadow: 'shadow-fuchsia-900/40',
      lidBg: 'bg-gradient-to-b from-fuchsia-300 to-fuchsia-600',
      lidBorder: 'border-fuchsia-400',
      bodyBg: 'bg-gradient-to-b from-fuchsia-400 to-purple-700',
      bodyBorder: 'border-fuchsia-500',
      glow: 'bg-fuchsia-300/25 blur-md',
      lootBorder: 'border-fuchsia-400/40',
      lootBg: 'bg-fuchsia-500/10',
      lootTitle: 'text-fuchsia-200',
    };
  }
  if (chestId === 'chest_rare') {
    return {
      boxBorder: 'border-blue-400/60',
      boxBg: 'bg-gradient-to-b from-blue-600/40 to-indigo-700/30',
      boxShadow: 'shadow-blue-900/40',
      lidBg: 'bg-gradient-to-b from-blue-300 to-blue-600',
      lidBorder: 'border-blue-400',
      bodyBg: 'bg-gradient-to-b from-blue-400 to-indigo-700',
      bodyBorder: 'border-blue-500',
      glow: 'bg-blue-300/25 blur-md',
      lootBorder: 'border-blue-400/40',
      lootBg: 'bg-blue-500/10',
      lootTitle: 'text-blue-200',
    };
  }
  // default small
  return {
    boxBorder: 'border-amber-400/40',
    boxBg: 'bg-gradient-to-b from-amber-600/40 to-yellow-700/30',
    boxShadow: 'shadow-yellow-900/30',
    lidBg: 'bg-gradient-to-b from-amber-300 to-amber-600',
    lidBorder: 'border-amber-400',
    bodyBg: 'bg-gradient-to-b from-amber-400 to-amber-700',
    bodyBorder: 'border-amber-500',
    glow: 'bg-yellow-300/20 blur-md',
    lootBorder: 'border-emerald-400/40',
    lootBg: 'bg-emerald-500/10',
    lootTitle: 'text-emerald-200',
  };
}
