export const FILTERS = {
  all: 'all',
  active: 'active',
  completed: 'completed',
  archived: 'archived',
};

export const RANKS = [
  { id: 'E', label: 'Rango E', color: 'from-emerald-500 to-green-600', ring: 'ring-emerald-400/40', icon: '🐾' },
  { id: 'D', label: 'Rango D', color: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-400/40', icon: '🛡️' },
  { id: 'C', label: 'Rango C', color: 'from-solo-indigo-600 to-solo-purple-600', ring: 'ring-indigo-400/40', icon: '⚔️' },
  { id: 'B', label: 'Rango B', color: 'from-purple-600 to-fuchsia-600', ring: 'ring-fuchsia-400/40', icon: '🏰' },
  { id: 'A', label: 'Rango A', color: 'from-amber-500 to-orange-600', ring: 'ring-amber-400/40', icon: '🔥' },
  { id: 'S', label: 'Rango S', color: 'from-pink-600 to-red-600', ring: 'ring-rose-400/40', icon: '👑' },
];

export const getRank = (id = 'C') => RANKS.find((r) => r.id === id) || RANKS[2];

export const QUEST_TYPES = [
  { id: 'hunt', label: 'Cacería', icon: '🗡️' },
  { id: 'escort', label: 'Escolta', icon: '🛡️' },
  { id: 'raid', label: 'Raid', icon: '🏰' },
  { id: 'explore', label: 'Exploración', icon: '🗺️' },
];

export const RARITIES = [
  { id: 'common', label: 'Común', color: 'from-slate-500 to-slate-400', glow: 'shadow-[0_0_16px_rgba(100,116,139,0.25)]' },
  { id: 'rare', label: 'Rara', color: 'from-cyan-500 to-blue-500', glow: 'shadow-glow-cyan' },
  { id: 'epic', label: 'Épica', color: 'from-solo-indigo-600 to-solo-purple-600', glow: 'shadow-glow-purple' },
  { id: 'legendary', label: 'Legendaria', color: 'from-amber-500 to-orange-600', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]' },
];

export const getRarity = (id = 'rare') => RARITIES.find((r) => r.id === id) || RARITIES[1];

export const WEEKDAYS = [
  { id: 0, label: 'Domingo', short: 'Dom' },
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
];

// Catálogo de Tienda (demo)
export const SHOP_ITEMS = [
  { id: 'cosmetic_badge_shadow', name: 'Insignia Shadow', cost: 8, rarity: 'rare', type: 'cosmetic', icon: '🜁' },
  { id: 'booster_exp_15', name: 'Booster EXP 15m (1.25x)', cost: 9, rarity: 'rare', type: 'booster', icon: '⏳' },
  { id: 'booster_exp_30', name: 'Booster EXP 30m (1.5x)', cost: 13, rarity: 'epic', type: 'booster', icon: '⏳' },
  { id: 'booster_exp_60', name: 'Booster EXP 60m (2x)', cost: 21, rarity: 'legendary', type: 'booster', icon: '⏳' },
  { id: 'booster_mana_30', name: 'Booster Maná 30m (+50)', cost: 8, rarity: 'rare', type: 'booster', icon: '✨' },
  { id: 'booster_essence_30', name: 'Booster Esencia 30m (+50%)', cost: 12, rarity: 'epic', type: 'booster', icon: '⟡' },
  { id: 'consumable_ghost_note', name: 'Nota Fantasma', cost: 7, rarity: 'epic', type: 'consumable', icon: '👻' },
  { id: 'consumable_clean_shard', name: 'Limpia-Shards', cost: 4, rarity: 'common', type: 'consumable', icon: '🧹' },
  { id: 'inventory_slot', name: 'Slot extra de inventario', cost: 5, rarity: 'common', type: 'qol', icon: '🎒' },
  { id: 'fragment_shadow', name: 'Fragmento de Sombra', cost: 6, rarity: 'rare', type: 'fragment', icon: '🌑' },
  { id: 'fragment_void', name: 'Fragmento del Vacío', cost: 8, rarity: 'epic', type: 'fragment', icon: '⚫' },
  { id: 'fragment_portal', name: 'Fragmento de Portal', cost: 7, rarity: 'rare', type: 'fragment', icon: '🌀' },
];
