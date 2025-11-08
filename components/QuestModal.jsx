"use client";
import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { RANKS, QUEST_TYPES, RARITIES, WEEKDAYS } from '../shared/constants';

export default function QuestModal({ isOpen, onClose, onAdd }) {
  const [value, setValue] = useState('');
  const [rank, setRank] = useState('C');
  const [qtype, setQtype] = useState('hunt');
  const [rarity, setRarity] = useState('rare');
  const [isBoss, setIsBoss] = useState(false);
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [activeDays, setActiveDays] = useState([]);

  function submit(e) {
    e.preventDefault();
    const title = value.trim();
    if (!title) return;
    
    onAdd(title, rank, qtype, rarity, isBoss, isRepeatable, activeDays);
    
    // Reset form
    setValue('');
    setRank('C');
    setQtype('hunt');
    setRarity('rare');
    setIsBoss(false);
    setIsRepeatable(false);
    setActiveDays([]);
    
    // Close modal
    onClose();
  }

  function toggleDay(dayId) {
    setActiveDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  }

  function handleClose() {
    // Reset form when closing
    setValue('');
    setRank('C');
    setQtype('hunt');
    setRarity('rare');
    setIsBoss(false);
    setIsRepeatable(false);
    setActiveDays([]);
    onClose();
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="✨ Crear Nueva Quest"
      size="md"
    >
      <form onSubmit={submit} className="flex flex-col gap-6">
        {/* Título de la quest */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Nombre de la Quest
          </label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="¿Cómo se llama tu nueva quest?"
            className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            autoFocus
          />
        </div>

        {/* Configuración principal */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Selector de Rango */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-300">Rango</label>
            <div className="relative">
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-3 pr-10 text-sm text-slate-100 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              >
                {RANKS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-800 text-slate-100">
                    {r.icon} {r.id} - {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Selector de Tipo */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-300">Tipo</label>
            <div className="relative">
              <select
                value={qtype}
                onChange={(e) => setQtype(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-3 pr-10 text-sm text-slate-100 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              >
                {QUEST_TYPES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-800 text-slate-100">
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Selector de Rareza */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-300">Rareza</label>
            <div className="relative">
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-3 pr-10 text-sm text-slate-100 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              >
                {RARITIES.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-800 text-slate-100">
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Checkboxes mejorados */}
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-300">Configuración Especial</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-600/50 bg-slate-800/40 px-4 py-3 transition-all hover:border-rose-400/50 hover:bg-slate-700/60">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isBoss}
                  onChange={(e) => setIsBoss(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-slate-500 bg-slate-700 transition-all peer-checked:border-rose-400 peer-checked:bg-rose-500">
                  <svg className="h-full w-full text-white opacity-0 transition-opacity peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-300">🩸 Boss Quest</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-600/50 bg-slate-800/40 px-4 py-3 transition-all hover:border-cyan-400/50 hover:bg-slate-700/60">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isRepeatable}
                  onChange={(e) => setIsRepeatable(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-slate-500 bg-slate-700 transition-all peer-checked:border-cyan-400 peer-checked:bg-cyan-500">
                  <svg className="h-full w-full text-white opacity-0 transition-opacity peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-300">🔄 Quest Repetible</span>
            </label>
          </div>
        </div>
      
        {/* Selector de días para quests repetibles */}
        {isRepeatable && (
          <div className="rounded-lg border border-slate-600/50 bg-slate-800/40 p-4">
            <h4 className="mb-3 text-sm font-medium text-slate-300">📅 Días activos:</h4>
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    activeDays.includes(day.id)
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
            {activeDays.length === 0 && (
              <p className="mt-2 text-xs text-amber-400">⚠️ Selecciona al menos un día</p>
            )}
          </div>
        )}
        
        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button"
            variant="ghost"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={!value.trim() || (isRepeatable && activeDays.length === 0)}
            className="px-6 py-3 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✨ Crear Quest
          </Button>
        </div>
      </form>
    </Modal>
  );
}
