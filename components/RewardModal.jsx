"use client";
import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import useQuests from '../hooks/useQuests';
import { useQuestDispatch } from '../context/QuestContext';

export default function RewardModal() {
  const { state } = useQuests();
  const dispatch = useQuestDispatch();
  const [open, setOpen] = useState(false);

  const current = useMemo(() => (state.rewardsQueue || [])[0] || null, [state.rewardsQueue]);

  useEffect(() => {
    setOpen(!!current);
  }, [current]);

  if (!current) return null;

  const reward = current.reward || {};
  const items = reward.items || [];

  const onClaim = () => {
    dispatch({ type: 'CLAIM_REWARD', queueId: current.id, achievementId: current.achievementId, reward: current.reward });
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} size="sm" hideCloseButton>
      <div className="relative select-none">
        {/* Title */}
        <div className="mb-2 text-center">
          <div className="text-xl font-extrabold text-slate-100 tracking-wide">Recompensa</div>
          {current.title && (
            <div className="text-xs text-slate-400">{current.title}</div>
          )}
        </div>

        {/* Animated card */}
        <div className="mx-auto w-full overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-lg shadow-emerald-900/20">
          <div className="relative p-4">
            {/* Glow sweep */}
            <div className="pointer-events-none absolute -inset-1 rounded-xl opacity-20 blur-md bg-gradient-to-r from-emerald-400/50 to-cyan-400/50 animate-pulse" />

            {/* Rewards grid */}
            <div className="relative grid grid-cols-1 gap-3">
              {reward.exp ? (
                <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                  <div className="flex items-center gap-2 text-cyan-300"><span>⚡</span><span>EXP</span></div>
                  <div className="text-cyan-200 font-bold">+{reward.exp}</div>
                </div>
              ) : null}
              {reward.essence ? (
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex items-center gap-2 text-amber-300"><span>⟡</span><span>Esencia</span></div>
                  <div className="text-amber-200 font-bold">+{reward.essence}</div>
                </div>
              ) : null}
              {items.length > 0 && (
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
                  <div className="mb-2 flex items-center gap-2 text-violet-300 font-semibold"><span>🎁</span><span>Ítems</span></div>
                  <ul className="space-y-2">
                    {items.map((it, idx) => (
                      <li key={`${it.id}_${idx}`} className="flex items-center justify-between rounded-md border border-violet-500/30 bg-slate-900/30 p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getItemIcon(it)}</span>
                          <span className="text-slate-200 text-sm">{it.name || it.id}</span>
                        </div>
                        <span className="text-slate-300 text-xs">x{it.qty || 1}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Chest hint */}
            {items.some(it => (it.id || '').startsWith('chest_')) && (
              <div className="mt-3 text-center text-xs text-slate-400">Abriremos tu cofre enseguida ✨</div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex justify-center">
          <button onClick={onClaim} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60">
            Reclamar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function getItemIcon(it) {
  const id = it.id || '';
  const type = it.type || '';
  if (id.startsWith('chest_')) return '🗃️';
  if (type === 'fragment') return '🧩';
  if (type === 'consumable') return '🧪';
  if (type === 'qol') return '🛠️';
  if (type === 'permanent') return '🏅';
  if (type === 'theme') return '🎨';
  return '🎁';
}
