// Catálogo de logros y evaluadores

export const ACHIEVEMENTS = [
  // Consistencia diaria global y logros únicos
  {
    id: 'quest_1_day', scope: 'global', title: 'Primer paso',
    desc: 'Completa 1 quest hoy (todos sus objetivos)',
    condition: ({ state }) => (state.metrics?.questsCompletedToday || 0) >= 1,
    reward: { items: [{ id: 'chest_small', name: 'Cofre pequeño', qty: 1, type: 'consumable' }] },
  },
  {
    id: 'quest_5_day', scope: 'global', title: 'Cadena de victorias',
    desc: 'Completa 5 quests hoy (todos sus objetivos)',
    condition: ({ state }) => (state.metrics?.questsCompletedToday || 0) >= 5,
    reward: { items: [{ id: 'potion_focus', name: 'Poción de enfoque', qty: 1, type: 'consumable' }] },
  },
  {
    id: 'day_clean', scope: 'global', title: 'Día perfecto',
    desc: 'Completa todas las quests activas de hoy',
    condition: ({ state }) => {
      const today = new Date().getDay();
      const actives = state.quests.filter(q => !q.archived && q.isRepeatable ? q.activeDays?.includes(today) : true);
      if (actives.length === 0) return false;
      const key = todayKey();
      return actives.every(q => (q.objectives||[]).every(o => !!((o.dailyNotes && o.dailyNotes[key]) || o.note || '').trim()));
    },
    reward: { exp: 50, essence: 10 },
  },
  {
    id: 'day_double', scope: 'global', title: 'Doble perfecto',
    desc: 'Dos días perfectos seguidos',
    condition: ({ state }) => (state.metrics?.perfectDayStreak || 0) >= 2,
    reward: { items: [{ id: 'key_rare', name: 'Llave rara', qty: 1, type: 'consumable' }] },
  },
  {
    id: 'trifecta', scope: 'global', title: 'Trifecta',
    desc: 'Tres días perfectos seguidos',
    condition: ({ state }) => (state.metrics?.perfectDayStreak || 0) >= 3,
    reward: { items: [{ id: 'fragment_crown', name: 'Fragmento de Corona', qty: 1, type: 'fragment', unique: true }] },
  },
  // Volumen y dificultad
  {
    id: 'obj_10_day', scope: 'global', title: 'Forja implacable',
    desc: 'Completa 10 objetivos en un mismo día',
    condition: ({ state }) => (state.metrics?.objectivesCompletedToday || 0) >= 10,
    reward: { items: [{ id: 'scroll_productivity', name: 'Pergamino de productividad', qty: 1, type: 'consumable' }] },
  },
  {
    id: 'boss_hunter_5', scope: 'global', title: 'Cazador de jefes',
    desc: 'Completa 5 quests con jefe en un día',
    condition: ({ state }) => (state.metrics?.bossCompletedCount || 0) >= 5,
    reward: { items: [{ id: 'trophy_king', name: 'Trofeo del rey', qty: 1, type: 'permanent', unique: true }] },
  },
  {
    id: 'streak_master', scope: 'global', title: 'Maestro de la Consistencia',
    desc: 'Mantén una racha de 7 días completando quests',
    condition: ({ state }) => (state.streaks?.currentStreak || 0) >= 7,
    reward: { items: [{ id: 'fragment_essence', name: 'Fragmento de Esencia', qty: 1, type: 'fragment', unique: true }] },
  },
  {
    id: 'streak_veteran', scope: 'global', title: 'Veterano Implacable',
    desc: 'Mantén una racha de 10 días completando quests',
    condition: ({ state }) => (state.streaks?.currentStreak || 0) >= 10,
    reward: { essence: 50, exp: 200, items: [{ id: 'badge_veteran', name: 'Insignia de Veterano', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'streak_champion', scope: 'global', title: 'Campeón de la Disciplina',
    desc: 'Mantén una racha de 30 días completando quests',
    condition: ({ state }) => (state.streaks?.currentStreak || 0) >= 30,
    reward: { essence: 100, exp: 500, items: [{ id: 'crown_discipline', name: 'Corona de la Disciplina', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'streak_legend', scope: 'global', title: 'Leyenda Viviente',
    desc: 'Mantén una racha de 100 días completando quests',
    condition: ({ state }) => (state.streaks?.currentStreak || 0) >= 100,
    reward: { essence: 300, exp: 1000, items: [{ id: 'aura_legend', name: 'Aura Legendaria', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'streak_immortal', scope: 'global', title: 'Inmortal del Progreso',
    desc: 'Mantén una racha de 365 días completando quests',
    condition: ({ state }) => (state.streaks?.currentStreak || 0) >= 365,
    reward: { essence: 1000, exp: 5000, items: [{ id: 'title_immortal', name: 'Título: El Inmortal', qty: 1, type: 'title', unique: true }] },
  },
  // Logros de volumen y productividad
  {
    id: 'obj_25_day', scope: 'global', title: 'Máquina de Guerra',
    desc: 'Completa 25 objetivos en un mismo día',
    condition: ({ state }) => (state.metrics?.objectivesCompletedToday || 0) >= 25,
    reward: { essence: 75, exp: 300, items: [{ id: 'gear_war_machine', name: 'Engranaje de Guerra', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'obj_50_day', scope: 'global', title: 'Fuerza Imparable',
    desc: 'Completa 50 objetivos en un mismo día',
    condition: ({ state }) => (state.metrics?.objectivesCompletedToday || 0) >= 50,
    reward: { essence: 150, exp: 600, items: [{ id: 'aura_unstoppable', name: 'Aura Imparable', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'quest_10_day', scope: 'global', title: 'Conquistador',
    desc: 'Completa 10 quests en un mismo día',
    condition: ({ state }) => (state.metrics?.questsCompletedToday || 0) >= 10,
    reward: { essence: 100, exp: 400, items: [{ id: 'banner_conqueror', name: 'Estandarte del Conquistador', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'quest_20_day', scope: 'global', title: 'Emperador de Tareas',
    desc: 'Completa 20 quests en un mismo día',
    condition: ({ state }) => (state.metrics?.questsCompletedToday || 0) >= 20,
    reward: { essence: 200, exp: 800, items: [{ id: 'throne_emperor', name: 'Trono del Emperador', qty: 1, type: 'cosmetic', unique: true }] },
  },
  // Logros de consistencia perfecta
  {
    id: 'perfect_week', scope: 'global', title: 'Semana Perfecta',
    desc: 'Siete días perfectos seguidos',
    condition: ({ state }) => (state.metrics?.perfectDayStreak || 0) >= 7,
    reward: { essence: 75, exp: 350, items: [{ id: 'crystal_perfection', name: 'Cristal de Perfección', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'perfect_month', scope: 'global', title: 'Mes Inmaculado',
    desc: 'Treinta días perfectos seguidos',
    condition: ({ state }) => (state.metrics?.perfectDayStreak || 0) >= 30,
    reward: { essence: 250, exp: 1000, items: [{ id: 'halo_immaculate', name: 'Halo Inmaculado', qty: 1, type: 'cosmetic', unique: true }] },
  },
  // Logros de dificultad y jefes
  {
    id: 'boss_hunter_10', scope: 'global', title: 'Asesino de Titanes',
    desc: 'Completa 10 quests con jefe en un día',
    condition: ({ state }) => (state.metrics?.bossCompletedCount || 0) >= 10,
    reward: { essence: 200, exp: 750, items: [{ id: 'blade_titan_slayer', name: 'Hoja Mata-Titanes', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'boss_hunter_legendary', scope: 'global', title: 'Némesis de Leyendas',
    desc: 'Completa 25 quests con jefe en un día',
    condition: ({ state }) => (state.metrics?.bossCompletedCount || 0) >= 25,
    reward: { essence: 500, exp: 1500, items: [{ id: 'armor_nemesis', name: 'Armadura del Némesis', qty: 1, type: 'cosmetic', unique: true }] },
  },
  // Logros de progreso y experiencia
  {
    id: 'exp_master', scope: 'global', title: 'Maestro del Conocimiento',
    desc: 'Alcanza 5000 puntos de experiencia',
    condition: ({ state }) => (state.exp || 0) >= 5000,
    reward: { essence: 100, items: [{ id: 'tome_knowledge', name: 'Tomo del Conocimiento', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'exp_sage', scope: 'global', title: 'Sabio Ancestral',
    desc: 'Alcanza 25000 puntos de experiencia',
    condition: ({ state }) => (state.exp || 0) >= 25000,
    reward: { essence: 300, items: [{ id: 'staff_sage', name: 'Bastón del Sabio', qty: 1, type: 'cosmetic', unique: true }] },
  },
  // Logros de riqueza
  {
    id: 'essence_collector', scope: 'global', title: 'Coleccionista de Esencia',
    desc: 'Acumula 1000 puntos de esencia',
    condition: ({ state }) => (state.wallet?.essence || 0) >= 1000,
    reward: { exp: 500, items: [{ id: 'vault_collector', name: 'Bóveda del Coleccionista', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'essence_magnate', scope: 'global', title: 'Magnate de la Esencia',
    desc: 'Acumula 5000 puntos de esencia',
    condition: ({ state }) => (state.wallet?.essence || 0) >= 5000,
    reward: { exp: 2000, items: [{ id: 'palace_magnate', name: 'Palacio del Magnate', qty: 1, type: 'cosmetic', unique: true }] },
  },
  {
    id: 'monarch_fragments', scope: 'global', title: 'Señor del Vacío',
    desc: 'Reúne los 5 fragmentos del Dominio del Monarca',
    condition: ({ state }) => {
      const inventory = state.inventory || [];
      const fragments = ['fragment_shadow', 'fragment_void', 'fragment_portal', 'fragment_crown', 'fragment_essence'];
      return fragments.every(fragmentId => inventory.some(item => item.id === fragmentId));
    },
    reward: { 
      items: [{ id: 'theme_dominio_complete', name: 'Dominio del Monarca Completo', qty: 1, type: 'theme', unique: true }],
      essence: 25,
      exp: 100
    },
  },
];

export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Logros específicos por quest individual
const QUEST_ACHIEVEMENTS = [
  {
    id: 'quest_speed_demon', title: 'Demonio de Velocidad',
    desc: 'Completa una quest en menos de 5 minutos',
    condition: ({ quest, completionTime }) => completionTime && completionTime < 5 * 60 * 1000,
    reward: { exp: 50, essence: 10 },
  },
  {
    id: 'quest_marathon', title: 'Maratonista',
    desc: 'Completa una quest con más de 10 objetivos',
    condition: ({ quest }) => (quest.objectives?.length || 0) >= 10,
    reward: { exp: 100, essence: 20 },
  },
  {
    id: 'quest_perfectionist', title: 'Perfeccionista',
    desc: 'Completa todos los objetivos de una quest sin editar ninguna nota',
    condition: ({ quest, editCount }) => editCount === 0 && (quest.objectives?.length || 0) > 0,
    reward: { exp: 75, essence: 15 },
  },
  {
    id: 'quest_epic_boss', title: 'Matador Épico',
    desc: 'Completa una quest Boss de rareza Épica o superior',
    condition: ({ quest }) => quest.isBoss && (quest.rarity === 'epic' || quest.rarity === 'legendary'),
    reward: { exp: 150, essence: 30 },
  },
  {
    id: 'quest_legendary_master', title: 'Maestro Legendario',
    desc: 'Completa una quest de rareza Legendaria',
    condition: ({ quest }) => quest.rarity === 'legendary',
    reward: { exp: 200, essence: 40 },
  },
  {
    id: 'quest_rank_s_champion', title: 'Campeón Rango S',
    desc: 'Completa una quest de Rango S',
    condition: ({ quest }) => quest.rank === 'S',
    reward: { exp: 250, essence: 50 },
  },
  {
    id: 'quest_night_owl', title: 'Búho Nocturno',
    desc: 'Completa una quest entre las 10 PM y 6 AM',
    condition: ({ completionTime }) => {
      if (!completionTime) return false;
      const hour = new Date(completionTime).getHours();
      return hour >= 22 || hour < 6;
    },
    reward: { exp: 75, essence: 15 },
  },
  {
    id: 'quest_early_bird', title: 'Madrugador',
    desc: 'Completa una quest antes de las 7 AM',
    condition: ({ completionTime }) => {
      if (!completionTime) return false;
      const hour = new Date(completionTime).getHours();
      return hour < 7;
    },
    reward: { exp: 100, essence: 20 },
  },
];

export function evaluateQuestAchievements(quest, metadata = {}) {
  const unlocked = [];
  const questAchievements = quest.achievements || [];
  
  for (const achievement of QUEST_ACHIEVEMENTS) {
    // Verificar si ya fue desbloqueado para esta quest
    if (questAchievements.includes(achievement.id)) continue;
    
    // Evaluar condición
    if (achievement.condition({ quest, ...metadata })) {
      unlocked.push({
        ...achievement,
        questId: quest.id,
        questTitle: quest.title
      });
    }
  }
  
  return unlocked;
}

export function evaluateGlobalAchievements(state) {
  const unlocked = [];
  for (const a of ACHIEVEMENTS.filter(a => a.scope === 'global')) {
    if (state.achievementsUnlocked?.includes(a.id)) continue;
    if (a.condition({ state })) unlocked.push(a);
  }
  return unlocked;
}
