"use client";
import React, { useMemo } from 'react';

export default function NotesHistoryModal({ open, onClose, objective }) {
  const entries = useMemo(() => {
    const map = objective?.dailyNotes || {};
    return Object.entries(map)
      .map(([date, note]) => ({ date, note }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [objective]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={onClose} />
      <div className="relative mt-16 sm:mt-24 w-full max-w-2xl rounded-xl border border-slate-700/60 bg-slate-900/90 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">Historial de notas</div>
          <button onClick={onClose} className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700/60">Cerrar</button>
        </div>
        {entries.length === 0 ? (
          <div className="text-sm text-slate-400">No hay notas previas para este objetivo.</div>
        ) : (
          <ul className="space-y-3 max-h-[60vh] overflow-auto pr-2">
            {entries.map(({ date, note }) => (
              <li key={date} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
                <div className="mb-1 text-xs font-semibold text-slate-300">{date}</div>
                <div className="whitespace-pre-wrap text-sm text-slate-100">{note}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
