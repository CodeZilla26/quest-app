"use client";
import { useEffect } from 'react';
import useQuests from '../hooks/useQuests';

export default function ThemeApplier() {
  const { state } = useQuests();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const has = (id) => (state.inventory || []).some((it) => it.id === id);
    // Tema base (legacy full theme)
    const baseCls = 'theme-dominio';
    if (state.theme === 'dominio' || state.theme === 'shadow') body.classList.add(baseCls); else body.classList.remove(baseCls);
    // Módulos Dominio
    const modules = [
      { id: 'dominion_buttons', cls: 'dominion-buttons' },
      { id: 'dominion_badges', cls: 'dominion-badges' },
      { id: 'dominion_frames', cls: 'dominion-frames' },
      { id: 'dominion_titles', cls: 'dominion-titles' },
      { id: 'dominion_progress', cls: 'dominion-progress' },
    ];
    modules.forEach((m) => {
      if (has(m.id)) body.classList.add(m.cls); else body.classList.remove(m.cls);
    });
  }, [state.theme, state.inventory]);
  return null;
}
