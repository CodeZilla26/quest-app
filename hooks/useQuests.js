import { useQuestDispatch, useQuestState } from '../context/QuestContext';

export default function useQuests() {
  const state = useQuestState();
  const dispatch = useQuestDispatch();

  return {
    state,
    // Acciones de biblioteca
    addLibraryItem: (item) => dispatch({ type: 'ADD_LIBRARY_ITEM', item }),
    updateLibraryItem: (id, patch) => dispatch({ type: 'UPDATE_LIBRARY_ITEM', id, patch }),
    removeLibraryItem: (id) => dispatch({ type: 'REMOVE_LIBRARY_ITEM', id }),
    setLibraryFilter: (filter) => dispatch({ type: 'SET_LIBRARY_FILTER', filter }),
  };
}
