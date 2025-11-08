"use client";
import { useState } from 'react';
import useQuests from '../hooks/useQuests';
import QuestModal from '../components/QuestModal';
import QuestList from '../components/QuestList';
import QuestFilterBar from '../components/QuestFilterBar';
import Button from '../components/Button';

function QuestApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    filtered,
    addQuest,
    removeQuest,
    editQuest,
    addObjective,
    setObjectiveNote,
    removeObjective,
    editObjective,
  } = useQuests();

  return (
    <main className="container-app">
      {/* Header con botón para crear quest */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="heading-epic select-none">Panel de Quests</h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 font-medium shadow-lg hover:shadow-xl"
        >
          ✨ Nueva Quest
        </Button>
      </div>

      {/* Filtros */}
      <section className="mb-4 card p-3 shadow-glow-purple">
        <QuestFilterBar />
      </section>

      {/* Lista de quests */}
      <section className="card p-3 shadow-inner-card">
        <QuestList
          items={filtered}
          onRemoveQuest={removeQuest}
          onEditQuest={editQuest}
          onAddObjective={addObjective}
          onSetObjectiveNote={setObjectiveNote}
          onRemoveObjective={removeObjective}
          onEditObjective={editObjective}
          onOpenModal={() => setIsModalOpen(true)}
        />
      </section>

      {/* Modal para crear quest */}
      <QuestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addQuest}
      />
    </main>
  );
}

export default function Page() {
  return <QuestApp />;
}
