"use client";
import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useQuests from '../hooks/useQuests';
import ShopModal from './ShopModal';
import InventoryModal from './InventoryModal';
import AchievementsModal from './AchievementsModal';

function useLevel(exp) {
  const levels = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
  let level = 1;
  for (let i = 1; i < levels.length; i++) {
    if (exp >= levels[i]) level = i + 1; else break;
  }
  const curBase = levels[level - 2] ?? 0;
  const nextBase = levels[level - 1] ?? levels[levels.length - 1];
  const cur = Math.max(0, exp - curBase);
  const next = Math.max(1, nextBase - curBase);
  const pct = Math.min(100, Math.round((cur / next) * 100));
  return { level, cur, next, pct };
}

function Header() {
  const { state, setSetting } = useQuests();
  const router = useRouter();
  const pathname = usePathname();
  const onLibrary = pathname === '/library';
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';
  const { level, cur, next, pct } = useLevel(state.exp || 0);
  const totalLetters = (state.quests || []).reduce(
    (acc, q) => acc + (q.objectives || []).reduce((a, o) => a + ((o.note || '').length), 0),
    0
  );
  const power = 50 + level * 10 + Math.floor((state.exp || 0) / 20);
  const baseMana = 30 + Math.min(100, Math.floor(totalLetters / 50));
  const manaBooster = state.boosters?.mana;
  const manaBonusActive = !!(manaBooster && new Date(manaBooster.activeUntil).getTime() > Date.now());
  const mana = baseMana + (manaBonusActive ? (manaBooster.bonus || 50) : 0);
  const expBooster = state.boosters?.exp;

  const prevLevelRef = useRef(level);
  const [sparkKey, setSparkKey] = useState(0);
  useEffect(() => {
    if (level > prevLevelRef.current) {
      setSparkKey((k) => k + 1);
    }
    prevLevelRef.current = level;
  }, [state.exp]);

  // Redirigir eventos legacy a la página de biblioteca
  useEffect(() => {
    function handleOpenLibrary(e) {
      const detail = e.detail || {};
      const sp = new URLSearchParams();
      if (detail.query != null) sp.set('query', String(detail.query));
      if (detail.type != null) sp.set('type', String(detail.type));
      if (detail.status != null) sp.set('status', String(detail.status));
      router.push(`/library${sp.toString() ? `?${sp.toString()}` : ''}`);
    }
    window.addEventListener('open_library', handleOpenLibrary);
    return () => window.removeEventListener('open_library', handleOpenLibrary);
  }, [router]);

  const [shopOpen, setShopOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const now = Date.now();
  const boosterActive = !!(expBooster && new Date(expBooster.activeUntil).getTime() > now);
  const boosterMsLeft = boosterActive ? new Date(expBooster.activeUntil).getTime() - now : 0;
  const boosterMinLeft = boosterActive ? Math.ceil(boosterMsLeft / 60000) : 0;

  const pendingRewards = (state.rewardsQueue || []).length;
  const perfectStreak = state.metrics?.perfectDayStreak || 0;
  const dailyStreak = state.metrics?.dailyCompletionStreak || 0;

  return (
    <header className={`sticky top-0 z-40 mb-6 border-b backdrop-blur ${isDominio ? 'border-purple-800/60 bg-slate-950/80' : 'border-slate-800/60 bg-slate-950/70'}`}>
      <div className="container-app py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-slate-300">Cazador</div>
            <div className="bg-clip-text text-transparent text-lg font-extrabold tracking-tight" style={{ backgroundImage: isDominio ? 'linear-gradient(90deg, #a855f7, #8b5cf6)' : 'linear-gradient(90deg, #4f46e5, #3b82f6)' }}>
              Nivel {level}
            </div>
            <div key={sparkKey} className="level-spark text-blue-400">✦</div>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                <span>EXP</span>
                <span>
                  {cur}/{next}
                </span>
              </div>
              <div className={`h-2 w-full overflow-hidden rounded ring-1 bg-slate-900/70 ${boosterActive ? 'ring-emerald-400/40 shadow-[0_0_14px_rgba(16,185,129,0.35)]' : isDominio ? 'ring-purple-400/40 shadow-glow-purple' : 'ring-indigo-400/30 shadow-glow-indigo'}`}>
                <div className={`h-full bg-gradient-to-r ${boosterActive ? 'from-emerald-500 to-green-400' : isDominio ? 'from-purple-500 to-violet-500' : 'from-solo-indigo-600 to-blue-500'} animate-shimmer shimmer-bar`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            {boosterActive && (
              <div className="mt-1 text-[11px] text-emerald-300">Booster EXP 1.5x activo · ~{boosterMinLeft} min restantes</div>
            )}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className={`rounded-lg ring-1 bg-slate-900/60 p-2 ${isDominio ? 'ring-purple-400/30 shadow-glow-purple' : 'ring-indigo-400/30 shadow-glow-indigo'}`}>
                <div className="text-slate-300">Poder ⚡</div>
                <div className="text-base font-semibold text-slate-100">{power}</div>
              </div>
              <div className="rounded-lg ring-1 ring-cyan-400/30 bg-slate-900/60 p-2 shadow-glow-cyan">
                <div className="text-slate-300">Maná ✦</div>
                <div className="text-base font-semibold text-slate-100">{mana}</div>
              </div>
              <div className="rounded-lg ring-1 ring-amber-400/30 bg-slate-900/60 p-2">
                <div>
                  <div className="text-slate-300">Esencia ⟡</div>
                  <div className="text-base font-semibold text-slate-100">{state.wallet?.essence ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Barra de acciones HUD */}
            <div className="flex items-center justify-end gap-2">
              {dailyStreak > 0 && (
                <div title="Racha diaria (al menos 1 quest completada por día)" className="rounded-md border border-amber-500/40 bg-amber-900/30 px-3 py-1.5 text-xs font-medium text-amber-300 flex items-center gap-1 animate-flame-soft">
                  <span>🔥</span>
                  <span>Racha diaria: {dailyStreak}</span>
                </div>
              )}
              {perfectStreak > 0 && (
                <div title="Racha de días perfectos: completaste todas las quests activas de cada día" className="rounded-md border border-emerald-600/40 bg-emerald-900/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  🔥 Días perfectos: {perfectStreak}
                </div>
              )}
              <button
                onClick={() => setAchOpen(true)}
                title="Abrir Logros"
                className="rounded-md border border-slate-700/60 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/60"
              >
                🏆 Logros{pendingRewards > 0 ? ` (${pendingRewards})` : ''}
              </button>
              {/* Preferencias */}
              <button
                onClick={() => setSetting('animations', !(state.settings?.animations !== false))}
                title={`Animaciones: ${state.settings?.animations === false ? 'Off' : 'On'}`}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium ${state.settings?.animations === false ? 'border-slate-700/60 bg-slate-800/60 text-slate-300' : 'border-cyan-600/40 bg-cyan-900/30 text-cyan-300'}`}
              >
                {state.settings?.animations === false ? '⏹️ Animaciones' : '▶️ Animaciones'}
              </button>
              <button
                onClick={() => setInvOpen(true)}
                title="Abrir inventario de ítems permanentes"
                className="rounded-md border border-slate-700/60 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/60"
              >
                {`Inventario (${(state.inventory || []).length})`}
              </button>
              {onLibrary ? (
                <button
                  onClick={() => router.push('/')}
                  title="Volver a Quests"
                  className="rounded-md border border-slate-700/60 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/60"
                >
                  Quests
                </button>
              ) : (
                <button
                  onClick={() => router.push('/library')}
                  title="Abrir Biblioteca (cómics, películas, series y juegos)"
                  className="rounded-md border border-slate-700/60 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/60"
                >
                  Biblioteca
                </button>
              )}
              <button
                onClick={() => setShopOpen(true)}
                title="Abrir Tienda (boosters, cosméticos y QoL)"
                className="rounded-md border border-slate-700/60 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/60"
              >
                Tienda
              </button>
            </div>
        </div>
      </div>
      </div>
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
      <InventoryModal open={invOpen} onClose={() => setInvOpen(false)} />
      <AchievementsModal open={achOpen} onClose={() => setAchOpen(false)} />
    </header>
  );
}

export default Header;
