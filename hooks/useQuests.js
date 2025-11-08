import { useMemo } from 'react';
import { useQuestDispatch, useQuestState } from '../context/QuestContext';
import { FILTERS } from '../shared/constants';
import { isQuestActiveToday } from '../shared/storage';

export default function useQuests() {
  const state = useQuestState();
  const dispatch = useQuestDispatch();

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const key = todayKey();

  const filtered = useMemo(() => {
    const withComputed = state.quests.map((q) => ({
      ...q,
      done: (q.objectives?.length ?? 0) > 0
        ? q.objectives.every((o) => {
            const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
            return !!(noteToday && noteToday.trim());
          })
        : false,
      progress: (q.objectives?.length ?? 0) > 0
        ? Math.round((q.objectives.filter((o) => {
            const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
            return !!(noteToday && noteToday.trim());
          }).length / q.objectives.length) * 100)
        : 0,
    }));
    // 1) Separar archivadas
    const isArchivedView = state.filter === FILTERS.archived;
    const base = withComputed.filter((q) => (isArchivedView ? q.archived : !q.archived));
    // 2) Aplicar filtros de estado
    return base.filter((q) => {
      if (state.filter === FILTERS.active) return !q.done && isQuestActiveToday(q); // solo activas hoy
      if (state.filter === FILTERS.completed) return q.done; // completadas hoy
      if (state.filter === FILTERS.archived) return true; // ya filtradas arriba
      return true; // all
    });
  }, [state.quests, state.filter]);

  const remaining = useMemo(() => {
    return state.quests.filter((q) => {
      const hasObjectives = (q.objectives?.length ?? 0) > 0;
      if (!hasObjectives) return true;
      const allDoneToday = q.objectives.every((o) => {
        const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
        return !!(noteToday && noteToday.trim());
      });
      return !allDoneToday;
    }).length;
  }, [state.quests, key]);

  return {
    ...state,
    state, // backward-compat alias so components can use { state, ... }
    filtered,
    remaining,
    FILTERS,
    unarchiveAll: () => dispatch({ type: 'UNARCHIVE_ALL' }),
    archiveQuest: (id) => dispatch({ type: 'ARCHIVE_QUEST', id }),
    unarchiveQuest: (id) => dispatch({ type: 'UNARCHIVE_QUEST', id }),
    addQuest: (title, rank, qtype, rarity, isBoss, isRepeatable, activeDays) => dispatch({ type: 'ADD_QUEST', title, rank, qtype, rarity, isBoss, isRepeatable, activeDays }),
    removeQuest: (id) => dispatch({ type: 'REMOVE_QUEST', id }),
    editQuest: (id, title) => dispatch({ type: 'EDIT_QUEST', id, title }),
    setQuestRank: (id, rank) => dispatch({ type: 'SET_QUEST_RANK', id, rank }),

    addObjective: (questId, title) => dispatch({ type: 'ADD_OBJECTIVE', questId, title }),
    setObjectiveNote: (questId, objectiveId, note) => dispatch({ type: 'SET_OBJECTIVE_NOTE', questId, objectiveId, note }),
    removeObjective: (questId, objectiveId) => dispatch({ type: 'REMOVE_OBJECTIVE', questId, objectiveId }),
    editObjective: (questId, objectiveId, title) => dispatch({ type: 'EDIT_OBJECTIVE', questId, objectiveId, title }),

    setFilter: (filter) => dispatch({ type: 'SET_FILTER', filter }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', theme }),
    setSetting: (key, value) => dispatch({ type: 'SET_SETTING', key, value }),

    purchaseItem: (item) => dispatch({ type: 'PURCHASE_ITEM', item }),
    useItem: (itemId, questId, objectiveId) => dispatch({ type: 'USE_ITEM', itemId, questId, objectiveId }),
    claimReward: (entry, reward) => dispatch({ type: 'CLAIM_REWARD', queueId: entry.id, achievementId: entry.achievementId, reward, title: entry.title }),

    // Library actions
    addLibraryItem: (item) => dispatch({ type: 'ADD_LIBRARY_ITEM', item }),
    updateLibraryItem: (id, patch) => dispatch({ type: 'UPDATE_LIBRARY_ITEM', id, patch }),
    removeLibraryItem: (id) => dispatch({ type: 'REMOVE_LIBRARY_ITEM', id }),
    setLibraryFilter: (filter) => dispatch({ type: 'SET_LIBRARY_FILTER', filter }),
    syncLibraryLinks: (libraryId, questIds) => dispatch({ type: 'SYNC_QUEST_LINKS_FOR_LIBRARY', libraryId, questIds }),
  };
}
