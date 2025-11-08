"use client";
import { useState } from 'react';
import Button from './Button';
import useQuests from '../hooks/useQuests';
import ConfirmDialog from './ConfirmDialog';

export default function QuestFilterBar() {
  const { state, setFilter, FILTERS, remaining, unarchiveAll } = useQuests();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2">
      <span className="text-sm text-slate-300">Quests pendientes: {remaining}</span>
      <div className="flex items-center gap-2">
        <Button
          variant={state.filter === FILTERS.all ? 'primary' : 'ghost'}
          onClick={() => setFilter(FILTERS.all)}
        >Todas</Button>
        <Button
          variant={state.filter === FILTERS.active ? 'primary' : 'ghost'}
          onClick={() => setFilter(FILTERS.active)}
        >Activas</Button>
        <Button
          variant={state.filter === FILTERS.completed ? 'primary' : 'ghost'}
          onClick={() => setFilter(FILTERS.completed)}
        >Completadas</Button>
        <Button
          variant={state.filter === FILTERS.archived ? 'primary' : 'ghost'}
          onClick={() => setFilter(FILTERS.archived)}
        >Archivadas</Button>

      </div>
      {state.filter === FILTERS.archived && (
        <>
          <Button
            variant="ghost"
            onClick={() => setConfirmOpen(true)}
            className="border border-slate-700/60 bg-slate-800/60"
          >Desarchivar todo</Button>
          <ConfirmDialog
            open={confirmOpen}
            title="Desarchivar todo"
            message="¿Seguro que deseas restaurar todas las quests archivadas?"
            confirmText="Desarchivar"
            cancelText="Cancelar"
            confirmDisabledForMs={1000}
            themeDominio={isDominio}
            onConfirm={() => { setConfirmOpen(false); unarchiveAll(); }}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      )}
    </div>
  );
}
