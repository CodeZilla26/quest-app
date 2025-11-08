"use client";
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useQuests from '../hooks/useQuests';
import ConfirmDialog from './ConfirmDialog';
import Button from './Button';
import ObjectiveList from './ObjectiveList';
import { getRank, getRarity, QUEST_TYPES, WEEKDAYS } from '../shared/constants';
import { calculateQuestExpPotential, isQuestActiveToday } from '../shared/storage';

export default function QuestItem({ quest, onRemoveQuest, onEditQuest, onAddObjective, onSetObjectiveNote, onRemoveObjective, onEditObjective }) {
  const { state, archiveQuest, unarchiveQuest, FILTERS } = useQuests();
  const router = useRouter();
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(quest.title);
  const [newObj, setNewObj] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rank = getRank(quest.rank);
  const rarity = getRarity(quest.rarity);
  const qtype = QUEST_TYPES.find((t) => t.id === quest.type) || QUEST_TYPES[0];

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const tkey = todayKey();
  const progress = useMemo(() => {
    if (!quest.objectives?.length) return 0;
    const done = quest.objectives.filter((o) => {
      const noteToday = (o.dailyNotes && o.dailyNotes[tkey]) || o.note || '';
      return !!(noteToday && noteToday.trim());
    }).length;
    return Math.round((done / quest.objectives.length) * 100);
  }, [quest, tkey]);

  // Colapsar automáticamente cuando esté completada
  useEffect(() => {
    if (progress === 100) setCollapsed(true);
  }, [progress]);

  const totalObjectives = quest.objectives?.length ?? 0;
  const doneObjectives = useMemo(
    () => (quest.objectives ? quest.objectives.filter((o) => {
      const noteToday = (o.dailyNotes && o.dailyNotes[tkey]) || o.note || '';
      return !!(noteToday && noteToday.trim());
    }).length : 0),
    [quest, tkey]
  );
  const totalLetters = useMemo(
    () => (quest.objectives ? quest.objectives.reduce((a, o) => a + ((o.note || '').length), 0) : 0),
    [quest]
  );

  const expInfo = useMemo(() => {
    return calculateQuestExpPotential(quest);
  }, [quest]);

  const isActiveToday = useMemo(() => {
    return isQuestActiveToday(quest);
  }, [quest]);

  const activeDaysText = useMemo(() => {
    if (!quest.isRepeatable || !quest.activeDays || quest.activeDays.length === 0) {
      return '';
    }
    return quest.activeDays
      .map(dayId => WEEKDAYS.find(d => d.id === dayId)?.short)
      .filter(Boolean)
      .join(', ');
  }, [quest]);

  function handleSave() {
    const t = text.trim();
    if (t && t !== quest.title) onEditQuest(quest.id, t);
    setEditing(false);
  }

  function addObjective(e) {
    e.preventDefault();
    const t = newObj.trim();
    if (!t) return;
    onAddObjective(quest.id, t);
    setNewObj('');
  }

  return (
    <>
    <li className={`group relative overflow-hidden rounded-2xl border-2 ${
      quest.isBoss 
        ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/80 to-slate-900/90 shadow-[0_0_30px_rgba(244,63,94,0.3)]' 
        : progress === 100
        ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/80 to-slate-900/90 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
        : isActiveToday
        ? (isDominio
            ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/80 to-slate-900/90 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
            : 'border-indigo-500/50 bg-gradient-to-br from-indigo-950/80 to-slate-900/90 shadow-[0_0_30px_rgba(99,102,241,0.3)]')
        : 'border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-800/80 opacity-60'
    } ${!isActiveToday ? 'grayscale' : ''}`}>
      
      {/* Efecto de brillo gaming en el borde */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0"></div>
      
      {/* Patrón de textura gaming */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            {/* Header con badges gaming */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {/* Rank Badge - Estilo gaming */}
              <div className={`relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-white shadow-lg bg-gradient-to-r ${rank.color}`}>
                <span className="text-lg">{rank.icon}</span>
                <span className="tracking-wider">{rank.id}</span>
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0"></div>
              </div>
              
              {/* Rarity Badge - Con glow */}
              <div className={`relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r ${rarity.color} ${rarity.glow}`}>
                <span>✦ {rarity.label}</span>
              </div>
              
              {/* Type Badge - Gaming style */}
              <div className="inline-flex items-center gap-1 rounded-lg border border-slate-600/50 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-300">
                <span className="text-base">{qtype.icon}</span>
                <span>{qtype.label}</span>
              </div>
              
              {/* Boss Badge - Épico */}
              {quest.isBoss && (
                <div className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-fuchsia-600 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                  <span className="text-base">💀</span>
                  <span>BOSS</span>
                </div>
              )}
              
              {/* Repeatable Badge - Gaming */}
              {quest.isRepeatable && (
                <div
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    isActiveToday
                      ? 'text-white bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 bg-slate-700/80'
                  }`}
                  title={`Repetible • Días activos (${quest.activeDays?.length || 0}/7): ${activeDaysText || '—'}`}
                >
                  <span className="text-base">🔄</span>
                  <span>{isActiveToday ? 'ACTIVA' : 'INACTIVA'}</span>
                  <span className="ml-1 text-[11px] opacity-90">({quest.activeDays?.length || 0}/7)</span>
                </div>
              )}

              {quest.archived && state.filter === FILTERS.archived && (
                <div className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold ${isDominio ? 'text-purple-200 bg-purple-900/40 border border-purple-600/40' : 'text-indigo-200 bg-indigo-900/40 border border-indigo-600/40'}`}>
                  <span>📦 Archivada</span>
                </div>
              )}
            </div>
            
            {/* Título + acciones en la misma línea */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                {editing ? (
                  <input
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="w-full rounded-lg border-2 border-indigo-500/50 bg-slate-800/80 px-4 py-2 text-lg font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  />
                ) : (
                  <h3
                    onDoubleClick={() => setEditing(true)}
                    className="cursor-pointer text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300"
                  >
                    {quest.title}
                  </h3>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setEditing((v) => !v)}
                  className="px-4 py-2 text-sm font-semibold border border-slate-600/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500 hover:text-slate-200 transition-all"
                >
                  {editing ? '💾 Guardar' : '✏️ Editar'}
                </Button>
                {!quest.isRepeatable ? (
                  quest.archived ? (
                    <Button
                      variant="ghost"
                      onClick={() => unarchiveQuest(quest.id)}
                      className="px-4 py-2 text-sm font-semibold border border-slate-600/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500 hover:text-slate-200"
                    >
                      📂 Desarchivar
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => archiveQuest(quest.id)}
                      className="px-4 py-2 text-sm font-semibold border border-slate-600/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500 hover:text-slate-200"
                    >
                      🗃️ Archivar
                    </Button>
                  )
                ) : (
                  <Button
                    variant="ghost"
                    disabled
                    title="Las quests repetibles no se archivan; reaparecen según sus días activos"
                    className="px-4 py-2 text-sm font-semibold border border-slate-700/50 bg-slate-800/40 text-slate-500 cursor-not-allowed"
                  >
                    🗃️ Archivar
                  </Button>
                )}
                <Button 
                  variant="danger" 
                  onClick={() => setConfirmOpen(true)}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  🗑️ Eliminar
                </Button>
              </div>
            </div>

            {/* Barra de progreso gaming */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">Progreso de Quest</span>
                <span className={`font-bold ${progress === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  {progress}%
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800/70 border border-slate-700/50">
                <div
                  className={`progress-fill h-full transition-all duration-500 ease-out bg-gradient-to-r ${
                    progress === 100 
                      ? 'from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                      : isDominio
                        ? 'from-purple-500 to-violet-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                        : 'from-indigo-500 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
                {progress > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 animate-pulse"></div>
                )}
              </div>
            </div>
            {/* Panel de información gaming */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* EXP Info */}
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cyan-400">⚡</span>
                  <span className="text-sm font-semibold text-slate-300">Experiencia</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pendiente:</span>
                    <span className={`font-semibold ${(quest.expPending || 0) > 0 ? 'text-cyan-300' : 'text-slate-500'}`}>
                      {quest.expPending || 0} EXP
                    </span>
                  </div>
                  {progress !== 100 && isActiveToday && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Potencial:</span>
                      <span className="font-semibold text-amber-300">~{expInfo.potential} EXP</span>
                    </div>
                  )}
                  {expInfo.completion > 0 && isActiveToday && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bonus:</span>
                      <span className="font-semibold text-emerald-300">+{expInfo.completion} EXP</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado de la Quest */}
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={progress === 100 ? 'text-emerald-400' : !isActiveToday ? 'text-slate-500' : 'text-indigo-400'}>
                    {progress === 100 ? '✅' : !isActiveToday ? '⏸️' : '🎯'}
                  </span>
                  <span className="text-sm font-semibold text-slate-300">Estado</span>
                </div>
                <div className="text-xs">
                  {progress === 100 ? (
                    <span className="font-semibold text-emerald-400">
                      COMPLETADA {quest.isRepeatable ? 'HOY' : ''}
                    </span>
                  ) : !isActiveToday ? (
                    <span className="font-semibold text-slate-500">INACTIVA HOY</span>
                  ) : (
                    <span className={`font-semibold ${isDominio ? 'text-purple-400' : 'text-indigo-400'}`}>EN PROGRESO</span>
                  )}
                  {quest.isRepeatable && (
                    <div className="mt-2 space-y-1">
                      <div className="text-slate-400">Días: {activeDaysText}</div>
                      {quest.lastCompleted && (
                        <div className="text-slate-500">
                          Última: {new Date(quest.lastCompleted).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

  {/* Relacionados de Biblioteca */}
  {Array.isArray(quest.linkedLibraryIds) && quest.linkedLibraryIds.length > 0 && (
    <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-pink-400">📚</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(state.library||[])
          .filter(it => (quest.linkedLibraryIds||[]).includes(it.id))
          .map(it => (
            <div
              key={it.id}
              className="group inline-flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900/50 px-2 py-1 cursor-pointer hover:bg-slate-800/70"
              title="Abrir Biblioteca filtrada por este elemento"
              onClick={() => router.push(`/library?query=${encodeURIComponent(it.title || '')}`)}
            >
              <div className="h-8 w-6 overflow-hidden rounded bg-slate-800/60">
                {it.coverPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.coverPath} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">—</div>
                )}
              </div>
              <span className="text-[12px] text-slate-200 max-w-[160px] truncate" title={it.title}>{it.title}</span>
              {Array.isArray(it.tags) && it.tags.length>0 && (
                <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-200">#{it.tags[0]}</span>
              )}
            </div>
          ))}
      </div>
    </div>
  )}

  {/* Botones movidos junto al título */}
  
  {/* Sección de objetivos: header con toggle y añadir */}
            <div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => setCollapsed((v) => !v)} className="flex items-center gap-2 text-left">
                  <span className="text-indigo-400">🎯</span>
                  <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <span>Objetivos ({totalObjectives})</span>
                  </span>
                </button>
                <form onSubmit={addObjective} className="flex gap-3">
                  <input
                    value={newObj}
                    onChange={(e) => setNewObj(e.target.value)}
                    placeholder={isActiveToday ? "Añadir objetivo..." : "Quest inactiva hoy"}
                    disabled={!isActiveToday}
                    className={`w-52 rounded-lg border px-4 py-2 text-slate-100 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                      isActiveToday 
                        ? 'border-slate-600 bg-slate-900/80 focus:border-indigo-400 focus:ring-indigo-400/20' 
                        : 'border-slate-700 bg-slate-800/50 opacity-50'
                    }`}
                  />
                  <Button 
                    type="submit" 
                    disabled={!isActiveToday}
                    className={`px-6 py-2 font-semibold transition-all ${
                      isActiveToday
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    ➕ Añadir
                  </Button>
                </form>
              </div>

              {!collapsed && (
                <div className="mt-2">
                  <ObjectiveList
                    questId={quest.id}
                    items={quest.objectives}
                    onSetNote={onSetObjectiveNote}
                    onRemove={onRemoveObjective}
                    onEdit={onEditObjective}
                    questMeta={{ rank: quest.rank, rarity: quest.rarity, isBoss: quest.isBoss }}
                    isQuestActive={isActiveToday}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
    {/* Modal de confirmación para eliminar */}
    <ConfirmDialog
      open={confirmOpen}
      title="Eliminar Quest"
      message={`¿Seguro que deseas eliminar la quest:\n"${quest.title}"?\nEsta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      confirmDisabledForMs={2000}
      inline
      themeDominio={isDominio}
      onConfirm={() => { setConfirmOpen(false); onRemoveQuest(quest.id); }}
      onCancel={() => setConfirmOpen(false)}
    />
    </>
  );
}
