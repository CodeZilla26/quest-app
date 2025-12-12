"use client";
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const QuestStateContext = createContext(null);
const QuestDispatchContext = createContext(null);

const initialState = {
  library: [],
  libraryFilter: { type: 'all', status: 'all', query: '' },
  theme: 'default',
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      const payload = action.payload || {};
      return {
        ...state,
        library: payload.library || state.library || [],
        libraryFilter: payload.libraryFilter || state.libraryFilter || { type: 'all', status: 'all', query: '' },
        theme: payload.theme || state.theme || 'default',
      };
    }
    case 'ADD_LIBRARY_ITEM': {
      const it = action.item;
      if (!it || !it.title) return state;
      const nowIso = new Date().toISOString();
      const item = {
        id: `lib_${Math.random().toString(36).slice(2)}`,
        type: 'comic',
        status: 'backlog',
        createdAt: nowIso,
        tags: [],
        coverBase64: '',
        ...it,
      };
      return { ...state, library: [...(state.library || []), item] };
    }
    case 'UPDATE_LIBRARY_ITEM': {
      const id = action.id;
      const patch = action.patch || {};
      const library = (state.library || []).map((it) =>
        it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it
      );
      return { ...state, library };
    }
    case 'REMOVE_LIBRARY_ITEM': {
      const id = action.id;
      const library = (state.library || []).filter((it) => it.id !== id);
      return { ...state, library };
    }
    case 'SET_LIBRARY_FILTER': {
      const f = action.filter || {};
      return {
        ...state,
        libraryFilter: {
          ...(state.libraryFilter || { type: 'all', status: 'all', query: '' }),
          ...f,
        },
      };
    }
    case 'SET_THEME': {
      const theme = action.theme === 'dominio' || action.theme === 'shadow' ? 'dominio' : 'default';
      return { ...state, theme };
    }
    default:
      return state;
  }
}

export function QuestProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hidratar biblioteca desde la API existente (/api/quests), usando solo la parte de library
  useEffect(() => {
    let cancelled = false;

    async function loadLibrary() {
      try {
        const res = await fetch('/api/quests');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data) return;
        dispatch({ type: 'INIT', payload: data });
      } catch (err) {
        console.error('Error loading library data:', err);
      }
    }

    loadLibrary();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  const actions = useMemo(() => ({ dispatch }), [dispatch]);

  return (
    <QuestStateContext.Provider value={value}>
      <QuestDispatchContext.Provider value={actions}>
        {children}
      </QuestDispatchContext.Provider>
    </QuestStateContext.Provider>
  );
}

export function useQuestState() {
  const ctx = useContext(QuestStateContext);
  if (!ctx) throw new Error('useQuestState debe usarse dentro de <QuestProvider>');
  return ctx;
}

export function useQuestDispatch() {
  const ctx = useContext(QuestDispatchContext);
  if (!ctx) throw new Error('useQuestDispatch debe usarse dentro de <QuestProvider>');
  return ctx.dispatch;
}
