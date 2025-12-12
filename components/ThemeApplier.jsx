"use client";
import { useEffect } from 'react';
import useQuests from '../hooks/useQuests';

export default function ThemeApplier() {
  const { state } = useQuests();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    // Tema base Dominio para Biblioteca
    const baseCls = 'theme-dominio';
    if (state.theme === 'dominio' || state.theme === 'shadow') body.classList.add(baseCls);
    else body.classList.remove(baseCls);
  }, [state.theme]);
  return null;
}
