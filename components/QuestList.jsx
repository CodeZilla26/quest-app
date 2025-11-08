"use client";
import QuestItem from './QuestItem';

export default function QuestList({ items, onRemoveQuest, onEditQuest, onAddObjective, onSetObjectiveNote, onRemoveObjective, onEditObjective, onSetQuestRank, onOpenModal }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-6xl">🗡️</div>
          <h3 className="mb-2 text-xl font-semibold text-slate-200">¡Tu aventura comienza aquí!</h3>
          <p className="mb-6 text-slate-400">
            No tienes quests activas. Crea tu primera quest y comienza a ganar experiencia completando objetivos.
          </p>
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl"
            >
              ✨ Crear Primera Quest
            </button>
          )}
        </div>
      </div>
    );
  }

  function isCompleted(q) {
    const total = q.objectives?.length ?? 0;
    if (total === 0) return false;
    return q.objectives.every((o) => !!(o.note && o.note.trim()));
  }

  const sorted = [...items].sort((a, b) => {
    const aDone = isCompleted(a);
    const bDone = isCompleted(b);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1; // completadas al final
  });

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((q) => (
        <QuestItem
          key={q.id}
          quest={q}
          onRemoveQuest={onRemoveQuest}
          onEditQuest={onEditQuest}
          onAddObjective={onAddObjective}
          onSetObjectiveNote={onSetObjectiveNote}
          onRemoveObjective={onRemoveObjective}
          onEditObjective={onEditObjective}
          onSetQuestRank={onSetQuestRank}
        />
      ))}
    </ul>
  );
}
