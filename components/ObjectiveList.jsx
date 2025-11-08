"use client";
import ObjectiveItem from './ObjectiveItem';

export default function ObjectiveList({ questId, items, onSetNote, onRemove, onEdit, questMeta, isQuestActive = true }) {
  if (!items?.length) {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
        Esta quest aún no tiene objetivos.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((o) => (
        <ObjectiveItem
          key={o.id}
          questId={questId}
          objective={o}
          onSetNote={onSetNote}
          onRemove={onRemove}
          onEdit={onEdit}
          questMeta={questMeta}
          isQuestActive={isQuestActive}
        />
      ))}
    </ul>
  );
}
