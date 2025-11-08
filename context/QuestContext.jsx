"use client";
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { FILTERS } from '../shared/constants';
import { loadQuestsData, debouncedSave, isQuestActiveToday, shouldResetQuest } from '../shared/storage';
import { evaluateQuestAchievements, evaluateGlobalAchievements } from '../shared/achievements';

const QuestStateContext = createContext(null);
const QuestDispatchContext = createContext(null);

const initialState = {
  quests: [],
  filter: FILTERS.all,
  exp: 0,
  wallet: { essence: 0 },
  inventory: [],
  boosters: {},
  theme: 'default',
  achievementsUnlocked: [],
  rewardsQueue: [],
  toastQueue: [],
  settings: { animations: true },
  library: [],
  libraryFilter: { type: 'all', status: 'all', query: '' },
  metrics: { 
    objectivesCompletedToday: 0, 
    questsCompletedToday: 0, 
    bossCompletedCount: 0, 
    perfectDayStreak: 0, 
    dailyCompletionStreak: 0, 
    lastStreakCheckKey: '', 
    lastStreakUpdate: '',
    pity: { rareNoFragment: 0, epicNoFragment: 0 }
  },
  streaks: {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
    completionHistory: []
  },
};

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isQuestCompleted(quest) {
  if (!quest.objectives || quest.objectives.length === 0) return false;
  const key = todayKey();
  return quest.objectives.every((o) => {
    const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
    return !!(noteToday && noteToday.trim().length > 0);
  });
}

function rankMultiplier(rank) {
  switch (rank) {
    case 'S': return 1.6;
    case 'A': return 1.4;
    case 'B': return 1.2;
    case 'C': return 1.1;
    default: return 1.0; // D, E
  }
}

function rarityMultiplier(rarity) {
  switch (rarity) {
    case 'legendary': return 1.2;
    case 'epic': return 1.1;
    case 'rare': return 1.05;
    default: return 1.0; // common
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'CLEAR_TOAST_QUEUE': {
      return { ...state, toastQueue: [] };
    }
    case 'SET_SETTING': {
      const key = action.key;
      const value = action.value;
      const base = { animations: true };
      return { ...state, settings: { ...(state.settings || base), [key]: value } };
    }
    case 'INIT': {
      const payload = action.payload || {};
      const quests = (payload.quests || []).map((q) => ({
        streak: 0,
        bestStreak: 0,
        achievements: [],
        ...q,
      }));
      return {
        ...state,
        ...payload,
        quests,
        achievementsUnlocked: payload.achievementsUnlocked || [],
        rewardsQueue: payload.rewardsQueue || [],
        toastQueue: [],
        settings: payload.settings ? { animations: payload.settings.animations !== false } : { animations: true },
        library: payload.library || [],
        libraryFilter: payload.libraryFilter || { type: 'all', status: 'all', query: '' },
        metrics: payload.metrics || { objectivesCompletedToday: 0, questsCompletedToday: 0, bossCompletedCount: 0, perfectDayStreak: 0, dailyCompletionStreak: 0, lastStreakCheckKey: '', lastStreakUpdate: '', pity: { rareNoFragment: 0, epicNoFragment: 0 } },
        streaks: payload.streaks || {
          currentStreak: 0,
          longestStreak: 0,
          lastCompletionDate: null,
          completionHistory: []
        },
      };
    }
    case 'ADD_LIBRARY_ITEM': {
      const it = action.item;
      if (!it || !it.title) return state;
      const nowIso = new Date().toISOString();
      const item = { id: `lib_${Math.random().toString(36).slice(2)}`, type: 'comic', status: 'backlog', createdAt: nowIso, tags: [], coverBase64: '', linkedQuestIds: [], ...it };
      return { ...state, library: [ ...(state.library || []), item ] };
    }
    case 'UPDATE_LIBRARY_ITEM': {
      const id = action.id;
      const patch = action.patch || {};
      const library = (state.library || []).map(it => it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it);
      return { ...state, library };
    }
    case 'REMOVE_LIBRARY_ITEM': {
      const id = action.id;
      const library = (state.library || []).filter(it => it.id !== id);
      return { ...state, library };
    }
    case 'SET_LIBRARY_FILTER': {
      const f = action.filter || {};
      return { ...state, libraryFilter: { ...(state.libraryFilter || { type: 'all', status: 'all', query: '' }), ...f } };
    }
    case 'SYNC_QUEST_LINKS_FOR_LIBRARY': {
      const libraryId = action.libraryId;
      const selectedQuestIds = new Set(action.questIds || []);
      // Actualizar cada quest: agregar/quitar libraryId en linkedLibraryIds
      const quests = (state.quests || []).map(q => {
        const cur = new Set(q.linkedLibraryIds || []);
        if (selectedQuestIds.has(q.id)) {
          cur.add(libraryId);
        } else {
          cur.delete(libraryId);
        }
        const next = Array.from(cur);
        if ((q.linkedLibraryIds || []).length === next.length && (q.linkedLibraryIds || []).every((v,i)=>v===next[i])) return q;
        return { ...q, linkedLibraryIds: next };
      });
      return { ...state, quests };
    }
    case 'ADD_QUEST': {
      const quest = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        title: action.title.trim(),
        rank: action.rank || 'C',
        type: action.qtype || 'hunt',
        rarity: action.rarity || 'rare',
        isBoss: !!action.isBoss,
        isRepeatable: !!action.isRepeatable,
        activeDays: action.activeDays || [],
        lastCompleted: null,
        objectives: [],
        expPending: 0,
        expAwarded: false,
        archived: false,
        streak: 0,
        bestStreak: 0,
        achievements: [],
        startTime: Date.now(),
        editCount: 0,
      };
      return { ...state, quests: [quest, ...state.quests] };
    }
    case 'REMOVE_QUEST': {
      return { ...state, quests: state.quests.filter((q) => q.id !== action.id) };
    }
    case 'EDIT_QUEST': {
      return {
        ...state,
        quests: state.quests.map((q) => (q.id === action.id ? { ...q, title: action.title } : q)),
      };
    }
    case 'SET_QUEST_RANK': {
      return {
        ...state,
        quests: state.quests.map((q) => (q.id === action.id ? { ...q, rank: action.rank } : q)),
      };
    }
    case 'ADD_OBJECTIVE': {
      return {
        ...state,
        quests: state.quests.map((q) =>
          q.id === action.questId
            ? {
                ...q,
                objectives: [
                  {
                    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    title: action.title.trim(),
                    note: '',
                  },
                  ...q.objectives,
                ],
              }
            : q
        ),
      };
    }
    case 'SET_OBJECTIVE_NOTE': {
      const toasts = [];
      let expToAward = 0;
      let essenceToAward = 0;
      let rewardsQueue = [...(state.rewardsQueue || [])];
      const nowTs = Date.now();
      const expBooster = state.boosters?.exp;
      const essenceBooster = state.boosters?.essence;
      const essenceBoostActive = !!(essenceBooster && new Date(essenceBooster.activeUntil).getTime() > nowTs);
      const expBoostActive = !!(expBooster && new Date(expBooster.activeUntil).getTime() > nowTs);
      const expMultiplier = expBoostActive ? (expBooster.multiplier || 1.5) : 1.0;
      const key = todayKey();
      // Valor previo de quests completadas hoy (para toasts)
      const prevKey = todayKey();
      const prevQuestsCompletedToday = (state.quests || []).filter((q) => (q.objectives?.length ?? 0) > 0 && q.objectives.every((o) => {
        const noteToday = (o.dailyNotes && o.dailyNotes[prevKey]) || o.note || '';
        return !!(noteToday && noteToday.trim());
      })).length;

      const quests = state.quests.map((q) => {
        if (q.id !== action.questId) return q;
        const wasDone = isQuestCompleted(q);
        const baseMult = rankMultiplier(q.rank) * rarityMultiplier(q.rarity) * (q.isBoss ? 1.3 : 1.0);
        let pendingAdd = 0;
        const objectives = q.objectives.map((o) => {
          if (o.id !== action.objectiveId) return o;
          const prevNoteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
          const prevLen = prevNoteToday.length;
          const nextLen = (action.note || '').length;
          const delta = Math.max(0, nextLen - prevLen);
          const base = Math.floor(delta / 4); // 1 EXP cada 4 caracteres añadidos
          const gainedBase = Math.max(0, Math.min(50, Math.round(base * baseMult)));
          
          // Incrementar contador de ediciones si hay cambios
          if (prevNoteToday !== (action.note || '')) {
            q = { ...q, editCount: (q.editCount || 0) + 1 };
          }
          const gained = Math.round(gainedBase * expMultiplier);
          pendingAdd += gained;
          const nextDaily = { ...(o.dailyNotes || {}), [key]: action.note };
          const next = { ...o, dailyNotes: nextDaily };
          return next;
        });
        let nextQuest = { ...q, objectives, expPending: (q.expPending || 0) + pendingAdd };
        if (pendingAdd > 0) {
          toasts.push({ type: 'exp', text: `Nota guardada (+${pendingAdd} EXP pendiente)`, duration: 3000 });
        }
        const nowDone = isQuestCompleted(nextQuest);
        if (!wasDone && nowDone && !nextQuest.expAwarded) {
          const awardBase = (nextQuest.expPending || 0) + 50; // sumar bonus al completar
          const award = Math.round(awardBase * expMultiplier);

          // Opción B: recompensa fija por rango (Esencia)
          const essenceByRank = { E: 2, D: 3, C: 5, B: 8, A: 13, S: 21 };
          const rankKey = (nextQuest.rank || 'C').toUpperCase();
          const essenceAward = essenceByRank[rankKey] ?? 5;
          const essenceMul = essenceBoostActive ? (essenceBooster.multiplier || 1.5) : 1.0;
          const finalEssence = Math.round(essenceAward * essenceMul);

          // Marcar fecha de última completion (sin racha por quest)
          nextQuest = { ...nextQuest, lastCompleted: new Date().toISOString() };

          nextQuest = { ...nextQuest, expPending: 0, expAwarded: true };
          
          // Agregar recompensa de quest completada a la cola del RewardModal
          rewardsQueue.push({
            id: `quest_completion_${nextQuest.id}_${Date.now()}`,
            title: `Quest Completada: ${nextQuest.title}`,
            desc: 'Recompensa por completar la quest',
            reward: {
              exp: award,
              essence: finalEssence,
              items: []
            },
            unlockedAt: new Date().toISOString(),
            type: 'quest_completion'
          });
          
          toasts.push({ type: 'quest', text: `⚔️ Quest completada! Reclama tu recompensa`, duration: 5000 });
          // sonido eliminado

          // Evaluar logros por quest y preparar recompensas
          const questMetadata = {
            completionTime: Date.now() - (nextQuest.startTime || Date.now()),
            editCount: nextQuest.editCount || 0
          };
          const newlyUnlocked = evaluateQuestAchievements(nextQuest, questMetadata);
          if (newlyUnlocked.length > 0) {
            const newIds = newlyUnlocked.map(a => a.id);
            nextQuest = { ...nextQuest, achievements: [ ...(nextQuest.achievements || []), ...newIds ] };
            
            // Agregar recompensas de logros por quest a la cola
            newlyUnlocked.forEach(achievement => {
              rewardsQueue.push({
                id: `quest_${nextQuest.id}_${achievement.id}_${Date.now()}`,
                achievementId: achievement.id,
                title: achievement.title,
                desc: `${achievement.desc} (Quest: ${nextQuest.title})`,
                reward: achievement.reward,
                unlockedAt: new Date().toISOString(),
                type: 'quest'
              });
            });
          }
          if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach((a, index) => {
              toasts.push({ type: 'achievement', text: `🏆 ${a.title} - ${a.desc}`, duration: 6000, delayMs: index * 500 });
            });
          }
        }
        return nextQuest;
      });
      // Logros globales y por quest se evalúan por separado
      // rewardsQueue ya fue declarado al inicio del case

      // Recalcular métricas globales del día actual (usar el mismo 'key' de hoy)
      const activeToday = quests.filter((q) => !q.archived && (!q.isRepeatable || isQuestActiveToday(q)));
      const allActiveDone = activeToday.length > 0 && activeToday.every((q) => (q.objectives?.length ?? 0) > 0 && q.objectives.every((o) => {
        const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
        return !!(noteToday && noteToday.trim());
      }));
      const objectivesCompletedToday = quests.reduce((acc, q) => acc + (q.objectives || []).filter((o) => {
        const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
        return !!(noteToday && noteToday.trim());
      }).length, 0);
      const bossCompletedCount = quests.filter((q) => q.isBoss).filter((q) => (q.objectives?.length ?? 0) > 0 && q.objectives.every((o) => {
        const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
        return !!(noteToday && noteToday.trim());
      })).length;
      const questsCompletedToday = quests.filter((q) => (q.objectives?.length ?? 0) > 0 && q.objectives.every((o) => {
        const noteToday = (o.dailyNotes && o.dailyNotes[key]) || o.note || '';
        return !!(noteToday && noteToday.trim());
      })).length;

      // Evaluar logros globales (solo si cambia algo significativo)
      let achievementsUnlocked = [...(state.achievementsUnlocked || [])];
      const newlyGlobal = evaluateGlobalAchievements({ ...state, quests, metrics: { ...state.metrics, objectivesCompletedToday, questsCompletedToday, bossCompletedCount } })
        .filter(a => !achievementsUnlocked.includes(a.id));
      if (newlyGlobal.length > 0) {
        achievementsUnlocked = [...achievementsUnlocked, ...newlyGlobal.map(a => a.id)];
        newlyGlobal.forEach((a, index) => {
          rewardsQueue.push({ id: `${a.id}:global:${Date.now()}`, achievementId: a.id, from: 'global' });
          toasts.push({ type: 'achievement', text: `🌟 Logro Global: ${a.title} - ${a.desc}`, duration: 7000, delayMs: (index + 3) * 500 });
        });
      }
      // Actualizar racha diaria inmediatamente si es la primera quest completada hoy
      let updatedMetrics = { ...(state.metrics || {}), objectivesCompletedToday, questsCompletedToday, bossCompletedCount };
      const prevQuestsToday = prevQuestsCompletedToday;
      const currentQuestsToday = questsCompletedToday;
      
      // Si es la primera quest completada hoy, incrementar racha diaria
      if (prevQuestsToday === 0 && currentQuestsToday === 1) {
        const currentStreak = state.metrics?.dailyCompletionStreak || 0;
        updatedMetrics.dailyCompletionStreak = currentStreak + 1;
        updatedMetrics.lastStreakUpdate = key; // Marcar que ya actualizamos hoy
        
        toasts.push({ type: 'success', text: `🔥 Racha diaria: ${updatedMetrics.dailyCompletionStreak}`, duration: 3000 });
      }
      
      // Toast cuando sube el contador de quests completadas hoy
      const deltaQuests = questsCompletedToday - prevQuestsCompletedToday;
      if (deltaQuests > 0) {
        toasts.push({ type: 'success', text: `Victorias de hoy: ${questsCompletedToday}`, duration: 3000 });
      }
      return {
        ...state,
        quests,
        // EXP y esencia ahora se otorgan al reclamar rewards en RewardModal
        inventory: state.inventory || [],
        boosters: state.boosters,
        rewardsQueue,
        achievementsUnlocked,
        metrics: updatedMetrics,
        toastQueue: [ ...(state.toastQueue || []), ...toasts ],
      };
    }
    case 'CLAIM_REWARD': {
      const toasts = [];
      const { queueId, reward, achievementId } = action; // reward opcionalmente traído desde catálogo en UI
      const q = [...(state.rewardsQueue || [])];
      const idx = q.findIndex(r => r.id === queueId);
      if (idx === -1) return state;
      q.splice(idx, 1);
      let inventory = [...(state.inventory || [])];
      let exp = state.exp;
      let wallet = { ...state.wallet };
      let theme = state.theme;
      
      // Si es el logro de fragmentos del Dominio del Monarca, eliminar fragmentos y activar tema
      if (achievementId === 'monarch_fragments') {
        const fragmentIds = ['fragment_shadow', 'fragment_void', 'fragment_portal', 'fragment_crown', 'fragment_essence'];
        inventory = inventory.filter(item => !fragmentIds.includes(item.id));
        theme = 'dominio';
        toasts.push({ type: 'success', text: '🕳️ Los fragmentos se han fusionado! Dominio del Monarca activado!', duration: 5000 });
      }
      
      if (reward?.items) {
        reward.items.forEach(it => {
          if (it.unique && inventory.some(x => x.id === it.id)) return;
          for (let i = 0; i < (it.qty || 1); i++) {
            inventory.push({ id: it.id, name: it.name, type: it.type || 'permanent', acquiredAt: new Date().toISOString(), source: action.achievementId });
          }
        });
      }
      if (reward?.exp) exp += reward.exp;
      if (reward?.essence) wallet.essence = (wallet.essence || 0) + reward.essence;

      // Si la recompensa incluye cofres, disparar modal de apertura
      const chestItem = reward?.items?.find?.((it) => (it.id || '').startsWith('chest_'));
      const hasChest = !!chestItem;
      
      if (chestItem && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open_chest', { detail: { chest: { id: chestItem.id, name: chestItem.name || 'Cofre' } } }));
      }
      
      // Solo mostrar notificación si NO hay cofre (el cofre ya mostrará todo)
      if (!hasChest) {
        const parts = [];
        if (reward?.exp) parts.push(`+${reward.exp} EXP`);
        if (reward?.essence) parts.push(`+${reward.essence} Esencia`);
        if (reward?.items?.length) {
          const itemParts = reward.items.map(it => {
            const name = it.name || it.id;
            const qty = it.qty ? ` x${it.qty}` : '';
            return `${name}${qty}`;
          }).join(', ');
          parts.push(itemParts);
        }
        const title = action.title || 'Recompensa';
        toasts.push({ type: 'success', text: `🎁 ${title}: ${parts.join(', ')}`, duration: 5000 });
      }
      
      return { ...state, rewardsQueue: q, inventory, exp, wallet, theme, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
    }
    case 'APPLY_CHEST_LOOT': {
      const toasts = [];
      const chestId = action.chestId;
      let loot = { ...(action.loot || {}), items: [...(action.loot?.items || [])] };
      let inventory = [...(state.inventory || [])];
      // Remover 1 cofre del inventario
      const idx = inventory.findIndex((it) => it.id === chestId);
      if (idx !== -1) inventory.splice(idx, 1);

      let exp = state.exp || 0;
      let wallet = { ...(state.wallet || { essence: 0 }) };
      let metrics = { ...(state.metrics || {}), pity: { ...(state.metrics?.pity || { rareNoFragment: 0, epicNoFragment: 0 }) } };

      // Pity: garantizar fragmento después de varios cofres sin fragmentos
      const hasFragment = (loot.items || []).some(it => (it.type === 'fragment') || (it.id || '').startsWith('fragment_'));
      if (chestId === 'chest_rare') {
        if (!hasFragment) metrics.pity.rareNoFragment = (metrics.pity.rareNoFragment || 0) + 1; else metrics.pity.rareNoFragment = 0;
        if (metrics.pity.rareNoFragment >= 4) {
          loot.items.push({ id: 'fragment_essence', name: 'Fragmento de Esencia', qty: 1, type: 'fragment' });
          metrics.pity.rareNoFragment = 0;
        }
      }
      if (chestId === 'chest_epic') {
        if (!hasFragment) metrics.pity.epicNoFragment = (metrics.pity.epicNoFragment || 0) + 1; else metrics.pity.epicNoFragment = 0;
        if (metrics.pity.epicNoFragment >= 2) {
          loot.items.push({ id: 'fragment_void', name: 'Fragmento del Vacío', qty: 1, type: 'fragment' });
          metrics.pity.epicNoFragment = 0;
        }
      }
      if (loot.exp) exp += loot.exp;
      if (loot.essence) wallet.essence = (wallet.essence || 0) + loot.essence;
      if (Array.isArray(loot.items)) {
        loot.items.forEach((it) => {
          inventory.push({ id: it.id, name: it.name || it.id, type: it.type || 'consumable', acquiredAt: new Date().toISOString(), source: 'chest' });
        });
      }

      // Notificación detallada del botín
      {
        const parts = [];
        if (loot.exp) parts.push(`+${loot.exp} EXP`);
        if (loot.essence) parts.push(`+${loot.essence} Esencia`);
        if (loot.items?.length) {
          const itemNames = loot.items.map(it => it.name || it.id).join(', ');
          parts.push(`${itemNames}`);
        }
        const message = parts.length > 0 ? parts.join(', ') : 'Cofre vacío';
        toasts.push({ type: 'success', text: `🗃️ Cofre abierto: ${message}`, duration: 5000 });
      }

      // Historial de botín deshabilitado intencionalmente

      return { ...state, inventory, exp, wallet, metrics, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
    }
    case 'PURCHASE_ITEM': {
      const toasts = [];
      const cost = action.item?.cost ?? 0;
      const name = action.item?.name ?? 'Ítem';
      const current = state.wallet?.essence ?? 0;
      const now = Date.now();
      const boosters = { ...(state.boosters || {}) };
      // Bloquear compra si booster del mismo tipo ya está activo
      const blockIfActive = (key) => boosters[key] && new Date(boosters[key].activeUntil).getTime() > now;
      const id = action.item?.id;
      // El theme_gate ya no existe, se reemplazó por sistema de fragmentos
      if (id === 'booster_exp_15' || id === 'booster_exp_30' || id === 'booster_exp_60') {
        if (blockIfActive('exp')) {
          toasts.push({ type: 'warning', text: '⚠️ Ya tienes un booster EXP activo', duration: 3000 });
          return { ...state, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
        }
      }
      if (id === 'booster_mana_30') {
        if (blockIfActive('mana')) {
          toasts.push({ type: 'warning', text: '⚠️ Ya tienes un booster de Maná activo', duration: 3000 });
          return { ...state, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
        }
      }
      if (id === 'booster_essence_30') {
        if (blockIfActive('essence')) {
          toasts.push({ type: 'warning', text: '⚠️ Ya tienes un booster de Esencia activo', duration: 3000 });
          return { ...state, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
        }
      }
      if (cost <= 0 || current < cost) {
        toasts.push({ type: 'error', text: '💸 Fondos insuficientes', duration: 3000 });
        return { ...state, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
      }
      const wallet = { ...state.wallet, essence: current - cost };
      let inventory = [...(state.inventory || [])];
      // Aplicar efectos por ítem
      if (id === 'booster_exp_15') {
        boosters.exp = { multiplier: 1.25, activeUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString() };
      } else if (id === 'booster_exp_30') {
        boosters.exp = { multiplier: 1.5, activeUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString() };
      } else if (id === 'booster_exp_60') {
        boosters.exp = { multiplier: 2.0, activeUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString() };
      } else if (id === 'booster_mana_30') {
        boosters.mana = { bonus: 50, activeUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString() };
      } else if (id === 'booster_essence_30') {
        boosters.essence = { multiplier: 1.5, activeUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString() };
      } else if (id === 'theme_gate') {
        // Tema permanente Dominio del Monarca (púrpura)
        inventory = [...inventory, { ...action.item, acquiredAt: new Date().toISOString() }];
        return { ...state, wallet, inventory, boosters, theme: 'dominio' };
      } else {
        // Ítems permanentes al inventario
        inventory = [...inventory, { ...action.item, acquiredAt: new Date().toISOString() }];
      }
      {
        const itemType = action.item?.type || 'item';
        const notificationType = itemType === 'fragment' ? 'essence' : 'success';
        const icon = itemType === 'fragment' ? '🧩' : itemType === 'booster' ? '⚡' : '🛒';
        toasts.push({ type: notificationType, text: `${icon} ${name} adquirido (-${cost} Esencia)`, duration: 4000 });
      }
      return { ...state, wallet, inventory, boosters, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
    }
    case 'USE_ITEM': {
      const toasts = [];
      const { itemId, questId, objectiveId } = action;
      const key = todayKey();
      const inv = [...(state.inventory || [])];
      const idx = inv.findIndex((it) => it.id === itemId);
      if (idx === -1) {
        toasts.push({ type: 'error', text: '❌ No tienes este consumible', duration: 3000 });
        return { ...state, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
      }
      let quests = state.quests.map((q) => {
        if (q.id !== questId) return q;
        const objectives = q.objectives.map((o) => {
          if (o.id !== objectiveId) return o;
          const daily = { ...(o.dailyNotes || {}) };
          if (itemId === 'consumable_ghost_note') {
            if (daily[key] && daily[key].trim()) return o; // ya hay nota hoy
            const text = 'Completado automáticamente (Ghost Note)';
            daily[key] = text;
            return { ...o, dailyNotes: daily };
          }
          if (itemId === 'consumable_clean_shard') {
            if (daily[key]) delete daily[key];
            return { ...o, dailyNotes: daily };
          }
          return o;
        });
        return { ...q, objectives };
      });
      // remover 1 unidad del inventario (primer match)
      inv.splice(idx, 1);
      {
        const itemName = inv[idx]?.name || 'Consumible';
        const icon = itemId === 'consumable_ghost_note' ? '👻' : itemId === 'consumable_clean_shard' ? '🧹' : '🔮';
        toasts.push({ type: 'info', text: `${icon} ${itemName} usado`, duration: 3000 });
      }
      return { ...state, inventory: inv, quests, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
    }
    case 'EDIT_OBJECTIVE': {
      return {
        ...state,
        quests: state.quests.map((q) => {
          if (q.id !== action.questId) return q;
          const objectives = q.objectives.map((o) => (o.id === action.objectiveId ? { ...o, title: action.title } : o));
          return { ...q, objectives };
        }),
      };
    }
    case 'SET_FILTER': {
      return { ...state, filter: action.filter };
    }
    case 'SET_THEME': {
      const theme = action.theme === 'dominio' || action.theme === 'shadow' ? 'dominio' : 'default';
      return { ...state, theme };
    }
    case 'ARCHIVE_QUEST': {
      return {
        ...state,
        quests: state.quests.map((q) => (q.id === action.id ? { ...q, archived: true } : q)),
      };
    }
    case 'UNARCHIVE_QUEST': {
      return {
        ...state,
        quests: state.quests.map((q) => (q.id === action.id ? { ...q, archived: false } : q)),
      };
    }
    case 'UNARCHIVE_ALL': {
      return {
        ...state,
        quests: state.quests.map((q) => (q.archived ? { ...q, archived: false } : q)),
      };
    }
    case 'SET_QUEST_REPEATABLE': {
      return {
        ...state,
        quests: state.quests.map((q) => 
          q.id === action.id 
            ? { ...q, isRepeatable: action.isRepeatable, activeDays: action.activeDays || [] }
            : q
        ),
      };
    }
    case 'RESET_REPEATABLE_QUEST': {
      return {
        ...state,
        quests: state.quests.map((q) => 
          q.id === action.id 
            ? { 
                ...q, 
                // No borrar historial de dailyNotes; sólo reiniciar estado de completion y exp
                objectives: q.objectives.map(o => ({ ...o })),
                expPending: 0,
                expAwarded: false,
                lastCompleted: null
              }
            : q
        ),
      };
    }
    case 'MARK_QUEST_COMPLETED_TODAY': {
      return {
        ...state,
        quests: state.quests.map((q) => 
          q.id === action.id 
            ? { ...q, lastCompleted: new Date().toISOString() }
            : q
        ),
      };
    }
    case 'CHECK_REPEATABLE_QUESTS': {
      const toasts = [];
      // 1) Reset de estado de repetibles si corresponde
      let updatedQuests = state.quests.map(quest => {
        if (shouldResetQuest(quest)) {
          return {
            ...quest,
            objectives: quest.objectives.map(o => ({ ...o, note: '' })),
            expPending: 0,
            expAwarded: false,
            lastCompleted: null
          };
        }
        return quest;
      });

      const tKey = todayKey();
      if ((state.metrics?.lastStreakCheckKey || '') !== tKey) {
        const today = new Date();
        const yest = new Date();
        yest.setDate(today.getDate() - 1);
        const yestWeekday = yest.getDay();
        const yKey = `${yest.getFullYear()}-${String(yest.getMonth()+1).padStart(2,'0')}-${String(yest.getDate()).padStart(2,'0')}`;
        
        // 2) Detección de Día perfecto de AYER y mantenimiento de perfectDayStreak
        const activeYesterday = updatedQuests.filter((q) => !q.archived && (!q.isRepeatable || q.activeDays?.includes(yestWeekday)));
        const hadActive = activeYesterday.length > 0;
        const perfectYesterday = hadActive && activeYesterday.every((q) => (q.objectives?.length ?? 0) > 0 && q.objectives.every((o) => {
          const noteY = (o.dailyNotes && o.dailyNotes[yKey]) || '';
          return !!(noteY && noteY.trim());
        }));
        let perfectDayStreak = state.metrics?.perfectDayStreak || 0;
        if (hadActive) {
          perfectDayStreak = perfectYesterday ? (perfectDayStreak + 1) : 0;
        }
        
        // 3) Verificar continuidad de racha diaria (solo si no se actualizó hoy)
        let dailyCompletionStreak = state.metrics?.dailyCompletionStreak || 0;
        const alreadyUpdatedToday = (state.metrics?.lastStreakUpdate || '') === tKey;
        
        if (!alreadyUpdatedToday) {
          // Solo verificar ayer si no hemos actualizado la racha hoy
          const completedYesterday = updatedQuests.some((q) => (q.objectives?.length ?? 0) > 0 && q.objectives.every((o) => {
            const noteY = (o.dailyNotes && o.dailyNotes[yKey]) || '';
            return !!(noteY && noteY.trim());
          }));
          
          if (!completedYesterday && dailyCompletionStreak > 0) {
            // Perdió la racha porque no completó nada ayer
            toasts.push({ type: 'warning', text: 'Has perdido tu racha diaria de victorias.', duration: 4000 });
            dailyCompletionStreak = 0;
          }
        }
        
        const metrics = { 
          ...(state.metrics || {}), 
          lastStreakCheckKey: tKey, 
          perfectDayStreak, 
          dailyCompletionStreak 
        };
        return { ...state, quests: updatedQuests, metrics, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
      }

      return { ...state, quests: updatedQuests, toastQueue: [ ...(state.toastQueue || []), ...toasts ] };
    }
    default:
      return state;
  }
}

export function QuestProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Cargar datos al inicializar
  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadQuestsData();
        if (data) {
          dispatch({ type: 'INIT', payload: data });
          // Verificar quests repetibles después de cargar
          setTimeout(() => {
            dispatch({ type: 'CHECK_REPEATABLE_QUESTS' });
          }, 100);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    }
    
    loadData();
  }, []);

  // Verificar quests repetibles cada hora
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CHECK_REPEATABLE_QUESTS' });
    }, 60 * 60 * 1000); // 1 hora

    return () => clearInterval(interval);
  }, []);

  // Guardar datos cuando el estado cambie (con debounce)
  useEffect(() => {
    // No guardar el estado inicial vacío
    if (state.quests.length === 0 && state.exp === 0) {
      return;
    }
    
    debouncedSave(state);
  }, [state]);

  // Emitir toasts encolados desde el reducer y limpiar la cola
  useEffect(() => {
    const queue = state.toastQueue || [];
    if (queue.length === 0) return;
    queue.forEach((t) => {
      const delay = t.delayMs || 0;
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: t.type, text: t.text, duration: t.duration ?? 4000 } }));
        }
      }, delay);
    });
    // Limpiar inmediatamente (los timeouts ya quedaron programados)
    dispatch({ type: 'CLEAR_TOAST_QUEUE' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.toastQueue]);

  // Emitir sonidos encolados respetando settings.sound
  // (audio eliminado)

  // (audio eliminado)

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
