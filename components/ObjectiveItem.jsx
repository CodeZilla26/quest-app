"use client";
import { useMemo, useState } from 'react';
import Button from './Button';
import NotesHistoryModal from './NotesHistoryModal';
import useQuests from '../hooks/useQuests';

function rankMultiplier(rank) {
  switch (rank) {
    case 'S': return 1.6;
    case 'A': return 1.4;
    case 'B': return 1.2;
    case 'C': return 1.1;
    default: return 1.0;
  }
}

function rarityMultiplier(rarity) {
  switch (rarity) {
    case 'legendary': return 1.2;
    case 'epic': return 1.1;
    case 'rare': return 1.05;
    default: return 1.0;
  }
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ObjectiveItem({ questId, objective, onRemove, onEdit, onSetNote, questMeta, isQuestActive = true }) {
  const [editing, setEditing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { state, useItem } = useQuests();
  const [text, setText] = useState(objective.title);
  const key = todayKey();
  const noteToday = (objective.dailyNotes && objective.dailyNotes[key]) || '';
  const [noteDraft, setNoteDraft] = useState(noteToday);
  const hasNote = !!(noteToday && noteToday.trim());

  const liveExp = useMemo(() => {
    const prevLen = ((objective.dailyNotes && objective.dailyNotes[key]) || '').length;
    const nextLen = (noteDraft || '').length;
    const delta = Math.max(0, nextLen - prevLen);
    const base = Math.floor(delta / 4);
    const mult = rankMultiplier(questMeta?.rank) * rarityMultiplier(questMeta?.rarity) * (questMeta?.isBoss ? 1.3 : 1.0);
    return Math.max(0, Math.min(50, Math.round(base * mult)));
  }, [noteDraft, objective.dailyNotes, questMeta]);

  function handleSave() {
    const t = text.trim();
    if (t && t !== objective.title) onEdit(questId, objective.id, t);
    setEditing(false);
  }

  function submitNote(e) {
    e.preventDefault();
    onSetNote(questId, objective.id, noteDraft);
  }

  return (
    <li className={`group relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-[1.01] ${
      hasNote 
        ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
        : isQuestActive
        ? 'border-slate-700/50 bg-gradient-to-r from-slate-900/60 to-slate-800/80 hover:border-indigo-500/30'
        : 'border-slate-800/50 bg-slate-900/40 opacity-60 grayscale'
    }`}>
      {/* Efecto de brillo para objetivos completados */}
      {hasNote && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent opacity-50 animate-pulse"></div>
      )}
      
      <div className="relative p-4">
        <div className="flex items-start gap-4">
          {/* Indicador de estado */}
          <div className={`mt-1 h-3 w-3 rounded-full border-2 transition-all ${
            hasNote 
              ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
              : 'border-slate-500 bg-transparent group-hover:border-indigo-400'
          }`}></div>
          
          <div className="flex-1">
            {editing ? (
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full rounded-lg border-2 border-indigo-500/50 bg-slate-800/80 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            ) : (
              <h4
                onDoubleClick={() => setEditing(true)}
                className={`cursor-pointer font-medium transition-all ${
                  hasNote 
                    ? 'text-emerald-200 line-through decoration-emerald-400/50' 
                    : 'text-slate-200 hover:text-indigo-300'
                }`}
              >
                {objective.title}
              </h4>
            )}
          </div>
          
          {/* Badges y botones */}
          <div className="flex items-center gap-2">
            {liveExp > 0 && (
              <div className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-2 py-1 text-xs font-bold text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <span>⚡</span>
                <span>+{liveExp} EXP</span>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              onClick={() => setEditing((v) => !v)} 
              disabled={!isQuestActive}
              className="px-3 py-1 text-xs font-semibold border border-slate-600/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500 hover:text-slate-200 disabled:opacity-50"
            >
              {editing ? '💾' : '✏️'}
            </Button>

            {state.inventory?.some(it => it.id === 'consumable_ghost_note') && (
              <Button
                variant="ghost"
                onClick={() => useItem('consumable_ghost_note', questId, objective.id)}
                className="px-3 py-1 text-xs font-semibold border border-emerald-600/40 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/40 hover:border-emerald-500"
              >
                👻 Usar fantasma
              </Button>
            )}
            {state.inventory?.some(it => it.id === 'consumable_clean_shard') && (
              <Button
                variant="ghost"
                onClick={() => useItem('consumable_clean_shard', questId, objective.id)}
                className="px-3 py-1 text-xs font-semibold border border-amber-600/40 bg-amber-900/30 text-amber-300 hover:bg-amber-800/40 hover:border-amber-500"
              >
                🧹 Limpiar
              </Button>
            )}
            
            <Button 
              variant="danger" 
              onClick={() => onRemove(questId, objective.id)} 
              disabled={!isQuestActive}
              className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white disabled:opacity-50"
            >
              🗑️
            </Button>
          </div>
        </div>
        
        {/* Área de notas gaming */}
        <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-indigo-400">📝</span>
            <span className="text-sm font-semibold text-slate-300">Notas del Objetivo</span>
            <span title="Las notas son por día. Mañana se reinicia el estado visible."
              className="ml-2 inline-flex items-center gap-1 rounded-full border border-slate-600/50 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300">
              HOY: {key}
            </span>
            {hasNote && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-400">
                <span>✅</span>
                <span>COMPLETADO</span>
              </span>
            )}
          </div>
          
          <form onSubmit={submitNote} className="space-y-3">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={isQuestActive ? "Describe cómo completaste este objetivo..." : "Quest inactiva hoy"}
              disabled={!isQuestActive}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-100 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                isQuestActive 
                  ? 'border-slate-600 bg-slate-900/80 focus:border-indigo-400 focus:ring-indigo-400/20' 
                  : 'border-slate-700 bg-slate-800/50 opacity-50'
              }`}
              rows={3}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xs">
                {hasNote ? (
                  <span className="font-semibold text-emerald-400">✓ Objetivo completado</span>
                ) : !isQuestActive ? (
                  <span className="text-slate-500">Quest inactiva</span>
                ) : (
                  <span className="text-slate-400">Pendiente de completar</span>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={!isQuestActive}
                className={`px-4 py-2 text-xs font-semibold transition-all ${
                  isQuestActive
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg hover:from-emerald-600 hover:to-green-600 hover:shadow-xl'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {hasNote ? '📝 Actualizar' : '✅ Completar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <NotesHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} objective={objective} />
    </li>
  );
}
