// Utilidades para manejar el almacenamiento de quests via API

export async function loadQuestsData() {
  try {
    const response = await fetch('/api/quests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading quests data:', error);
    // Retornar estado inicial si hay error
    return {
      quests: [],
      filter: 'all',
      exp: 0,
    };
  }
}

export async function saveQuestsData(data) {
  try {
    const response = await fetch('/api/quests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving quests data:', error);
    return false;
  }
}

// Funciones para calcular EXP
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

// Funciones para manejar quests repetibles
export function isQuestActiveToday(quest) {
  if (!quest.isRepeatable || !quest.activeDays || quest.activeDays.length === 0) {
    return true; // Quest normal, siempre activa
  }
  
  const today = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
  return quest.activeDays.includes(today);
}

export function canQuestBeCompleted(quest) {
  if (!quest.isRepeatable) {
    return true; // Quest normal, se puede completar una vez
  }
  
  if (!isQuestActiveToday(quest)) {
    return false; // No está activa hoy
  }
  
  // Verificar si ya se completó hoy
  if (quest.lastCompleted) {
    const lastCompleted = new Date(quest.lastCompleted);
    const today = new Date();
    
    // Si se completó hoy, no se puede completar de nuevo
    return !(
      lastCompleted.getDate() === today.getDate() &&
      lastCompleted.getMonth() === today.getMonth() &&
      lastCompleted.getFullYear() === today.getFullYear()
    );
  }
  
  return true; // Nunca se ha completado o no se completó hoy
}

export function shouldResetQuest(quest) {
  if (!quest.isRepeatable) return false;
  
  // Si la quest está completada y hoy está activa, resetear
  if (quest.expAwarded && isQuestActiveToday(quest) && canQuestBeCompleted(quest)) {
    return true;
  }
  
  return false;
}

export function calculateQuestExpPotential(quest) {
  if (!quest.objectives || quest.objectives.length === 0) {
    return { potential: 0, completion: 0, pending: quest.expPending || 0 };
  }

  const baseMult = rankMultiplier(quest.rank) * rarityMultiplier(quest.rarity) * (quest.isBoss ? 1.3 : 1.0);
  
  // Calcular EXP potencial considerando las notas ya escritas
  let potentialFromObjectives = 0;
  const avgCharsForIncomplete = 100; // Estimación para objetivos sin completar
  
  quest.objectives.forEach(objective => {
    const currentLength = (objective.note || '').length;
    if (objective.note && objective.note.trim()) {
      // Objetivo ya completado - no suma EXP adicional
      potentialFromObjectives += 0;
    } else {
      // Objetivo incompleto - estimar EXP potencial
      const estimatedExp = Math.floor(avgCharsForIncomplete / 4) * baseMult;
      potentialFromObjectives += Math.round(estimatedExp);
    }
  });
  
  // EXP por completar la quest (bonus de 50) - solo si no está completada
  const isCompleted = quest.objectives.every(o => o.note && o.note.trim().length > 0);
  const completionBonus = isCompleted ? 0 : Math.round(50 * baseMult);
  
  return {
    potential: Math.round(potentialFromObjectives + completionBonus + (quest.expPending || 0)),
    completion: completionBonus,
    pending: quest.expPending || 0,
    fromObjectives: Math.round(potentialFromObjectives)
  };
}

// Debounce para evitar guardar demasiado frecuentemente
let saveTimeout = null;

export function debouncedSave(data, delay = 1000) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveQuestsData(data);
  }, delay);
}

