"use client";
import { useMemo, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { ACHIEVEMENTS } from '../shared/achievements';
import useQuests from '../hooks/useQuests';

export default function AchievementsModal({ open, onClose }) {
  const { state, claimReward } = useQuests();
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';
  const queue = state.rewardsQueue || [];
  const unlockedGlobal = new Set(state.achievementsUnlocked || []);

  const pendingMap = useMemo(() => new Map(queue.map((q) => [`${q.from}:${q.achievementId}:${q.questId || ''}`, q])), [queue]);
  const hasPend = queue.length > 0;
  const [tab, setTab] = useState(hasPend ? 'pending' : 'global');
  const tabs = [
    { id: 'pending', label: `Pendientes${hasPend ? ` (${queue.length})` : ''}` },
    { id: 'global', label: 'Globales' },
  ];

  function statusChip({ unlocked, pending }) {
    if (pending) return <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">Pendiente</span>;
    if (unlocked) return <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">Reclamado</span>;
    return <span className="rounded-md bg-slate-700/50 px-2 py-0.5 text-[11px] font-medium text-slate-300">Bloqueado</span>;
  }

function itemIcon(it) {
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

  function progressHintGlobal(a) {
    const m = state.metrics || {};
    switch (a.id) {
      case 'day_clean': {
        const today = new Date().toLocaleDateString();
        return `Objetivos hoy: ${m.objectivesCompletedToday || 0}`;
      }
      case 'day_double':
      case 'trifecta':
        return `Racha de días perfectos: ${m.perfectDayStreak || 0}`;
      case 'obj_10_day':
        return `Objetivos hoy: ${m.objectivesCompletedToday || 0} / 10`;
      case 'boss_hunter_5':
        return `Boss completados hoy: ${m.bossCompletedCount || 0} / 5`;
      default:
        return '';
    }
  }

  function progressHintQuest(a, q) {
    if (a.id.startsWith('streak_')) {
      const target = parseInt(a.id.replace('streak_', ''), 10) || 0;
      const cur = q.streak || 0;
      return `Racha actual: ${cur} / ${target}`;
    }
    return '';
  }

  // Iconografía por logro
  function iconFor(a) {
    if (a.id.startsWith('streak_')) return '🔥';
    if (a.id.startsWith('day_')) return '📅';
    if (a.id === 'trifecta') return '🌟';
    if (a.id === 'obj_10_day') return '🧮';
    if (a.id === 'boss_hunter_5') return '👑';
    return a.scope === 'quest' ? '🗡️' : '🏅';
  }

  // Barra de progreso compacta
  function progressBar({ current = 0, target = 1 }) {
    const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
    return (
      <div className="ml-2 flex items-center gap-2 text-[11px] text-slate-400">
        <div className="h-1.5 w-28 overflow-hidden rounded-full border border-slate-700/60 bg-slate-800/60">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${pct}%` }} />
        </div>
        <span>{current}/{target}</span>
      </div>
    );
  }

  return (
    <Modal isOpen={open} onClose={onClose} size="lg" align="start" title="🏆 Logros" closeVariant="button" closeText="Cerrar">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {[{id:'pending',label:`Pendientes${hasPend ? ` (${queue.length})` : ''}`},{id:'global',label:'Globales'},{id:'quest',label:'Por quest'}].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold border ${tab===t.id ? (isDominio ? 'border-purple-500/50 bg-purple-900/30 text-purple-200' : 'border-indigo-500/50 bg-indigo-900/20 text-indigo-200') : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/60'}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Recompensas pendientes */}
        {tab === 'pending' && (
        <section>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span>🎁 Recompensas pendientes</span>
            {queue.length > 0 && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">{queue.length}</span>}
            {queue.length > 1 && (
              <button
                onClick={async () => {
                  // Procesar en secuencia para evitar colisiones con deduplicador de toasts
                  let totalExp = 0; let totalEss = 0; const itemsAgg = new Map();
                  for (let i = 0; i < queue.length; i++) {
                    const entry = queue[i];
                    const def = ACHIEVEMENTS.find(a => a.id === entry.achievementId);
                    const rewardUsed = entry.reward || def?.reward || {};
                    // pequeña separación entre cada reclamo
                    await new Promise(res => setTimeout(res, 250));
                    claimReward(entry, rewardUsed);
                    // acumular resumen
                    if (rewardUsed.exp) totalExp += rewardUsed.exp;
                    if (rewardUsed.essence) totalEss += rewardUsed.essence;
                    (rewardUsed.items || []).forEach(it => {
                      const key = it.name || it.id;
                      itemsAgg.set(key, (itemsAgg.get(key) || 0) + (it.qty || 1));
                    });
                  }
                  // Toast resumen al final
                  const parts = [];
                  if (totalExp) parts.push(`+${totalExp} EXP`);
                  if (totalEss) parts.push(`+${totalEss} Esencia`);
                  const itemsText = Array.from(itemsAgg.entries()).slice(0, 4).map(([name, qty]) => `${name} x${qty}`).join(', ');
                  if (itemsText) parts.push(itemsText);
                  if (typeof window !== 'undefined' && parts.length) {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', text: `✅ ${queue.length} recompensas reclamadas: ${parts.join(', ')}`, duration: 6000 } }));
                    }, 300);
                  }
                }}
                className={`ml-auto rounded-md border px-2 py-0.5 text-[11px] font-semibold ${isDominio ? 'border-purple-500/50 bg-purple-900/30 text-purple-200' : 'border-indigo-500/50 bg-indigo-900/20 text-indigo-200'}`}
                title="Reclamar todas las recompensas en cola"
              >
                Reclamar todo
              </button>
            )}
          </div>
          {queue.length === 0 ? (
            <div className="text-sm text-slate-400">No tienes recompensas pendientes.</div>
          ) : (
            <div className="space-y-3">
              {queue.map((entry) => {
                const def = ACHIEVEMENTS.find(a => a.id === entry.achievementId);
                const rewardUsed = entry.reward || def?.reward || {};
                const title = entry.title || def?.title || entry.achievementId;
                const desc = entry.desc || def?.desc || '';
                const items = rewardUsed.items || [];
                return (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/60 p-3">
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold ${isDominio ? 'text-purple-200' : 'text-indigo-200'}`}>{title}</div>
                      {desc ? <div className="text-xs text-slate-400 truncate">{desc}</div> : null}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                        {rewardUsed.exp ? (
                          <span className="inline-flex items-center rounded border border-cyan-600/40 bg-cyan-500/10 px-2 py-0.5 text-cyan-200">⚡ +{rewardUsed.exp} EXP</span>
                        ) : null}
                        {rewardUsed.essence ? (
                          <span className="inline-flex items-center rounded border border-amber-600/40 bg-amber-500/10 px-2 py-0.5 text-amber-200">⟡ +{rewardUsed.essence} Esencia</span>
                        ) : null}
                        {items.map((it, idx) => (
                          <span key={idx} title={`${it.name || it.id} · ${it.type || 'item'}`} className="inline-flex items-center gap-1 rounded border border-violet-600/40 bg-violet-500/10 px-2 py-0.5 text-violet-200">
                            <span>{itemIcon(it)}</span>
                            <span className="truncate">{it.name || it.id}</span>
                            <span className="opacity-80">×{it.qty || 1}</span>
                          </span>
                        ))}
                        {items.some(i => (i.id||'').startsWith('chest_')) && (
                          <span className="inline-flex items-center rounded border border-yellow-600/30 bg-yellow-500/10 px-2 py-0.5 text-yellow-200">🗃️ Se abrirá un cofre al reclamar</span>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => claimReward(entry, rewardUsed)} className={`px-3 py-1 text-xs font-semibold ${isDominio ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white' : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'}`}>Reclamar</Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        )}

        {/* Globales */}
        {tab === 'global' && (
        <section>
          <div className="mb-2 text-sm font-semibold text-slate-200">🌍 Logros globales</div>
          <div className="grid grid-cols-1 gap-2">
            {ACHIEVEMENTS.filter(a => a.scope === 'global').map((a) => {
              const key = `global:${a.id}:`;
              const pending = pendingMap.get(key);
              const isUnlocked = unlockedGlobal.has(a.id) || !!pending;
              const reward = a.reward;
              // Global progress metrics
              const m = state.metrics || {};
              let cur = 0, target = 0;
              if (a.id === 'obj_10_day') { cur = m.objectivesCompletedToday || 0; target = 10; }
              else if (a.id === 'boss_hunter_5') { cur = m.bossCompletedCount || 0; target = 5; }
              else if (a.id === 'day_double') { cur = m.perfectDayStreak || 0; target = 2; }
              else if (a.id === 'trifecta') { cur = m.perfectDayStreak || 0; target = 3; }
              return (
                <div key={a.id} className={`flex items-center justify-between rounded-lg border p-3 ${isUnlocked ? 'border-emerald-700/40 bg-emerald-950/30' : 'border-slate-700/50 bg-slate-900/40'}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{iconFor(a)}</span>
                      <div className="text-sm font-semibold text-slate-100">{a.title}</div>
                    </div>
                    <div className="text-xs text-slate-400">{a.desc}</div>
                    <div className="mt-1 flex items-center">
                      <div className="text-[11px] text-slate-400">{progressHintGlobal(a)}</div>
                      {target > 0 && progressBar({ current: Math.min(cur, target), target })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reward?.items?.length ? reward.items.map((it, idx) => (
                      <span key={idx} className="mr-2 inline-flex items-center rounded border border-slate-700/60 px-2 py-0.5 text-[11px] text-slate-300">
                        {it.name}
                      </span>
                    )) : null}
                    {statusChip({ unlocked: isUnlocked && !pending, pending })}
                    {pending && (
                      <Button onClick={() => claimReward(pending, reward)} className="px-3 py-1 text-xs">Reclamar</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        )}

        {/* Sección por quest eliminada: logros ahora son sólo globales */}
      </div>
    </Modal>
  );
}
