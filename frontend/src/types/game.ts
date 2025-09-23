/**
 * Comprehensive TypeScript interfaces for the Emoji Factory Builder game
 * Based on the original JavaScript game with full type safety
 */

// ===== RESOURCE TYPES =====

export type ResourceType = 
  // Biological Resources
  | 'flesh'
  | 'bone' 
  | 'fungus'
  | 'ichor'
  // Elemental Resources
  | 'fire_cores'
  | 'dark_crystals'
  | 'corrupted_water'
  | 'shadow_essence'
  // Looted Resources
  | 'rusted_weapons'
  | 'torn_cloth'
  | 'stolen_knowledge'
  // Synthetic Resources
  | 'mutagen'
  | 'evolution_essence'
  | 'loyalty';export interface ResourceData {
  emoji: string;
  name: string;
  color: string;
}

export type ResourceAmounts = Record<ResourceType, number>;
export type ResourceCost = Partial<ResourceAmounts>;

// ===== INVENTORY SYSTEM TYPES =====

export type InventoryType = 'base' | 'construction' | 'logistics';

export interface InventoryCategory {
  type: InventoryType;
  name: string;
  description: string;
  resources: ResourceType[];
  displayPriority: number; // Lower numbers show first, higher priority resources
}

export interface InventoryState {
  base: ResourceAmounts; // Core resources for production and consumption
  construction: ResourceAmounts; // Building materials and construction resources
  logistics: ResourceAmounts; // Transport and logistics resources
}

// ===== CREATURE TYPES =====

export type CreatureType = 
  // Tier 0: Primitive Workers
  | 'slime'
  | 'goblin'
  | 'spider'
  | 'wild_creature'
  // Tier 1: First Specializations
  | 'acid_slime'
  | 'hobgoblin'
  | 'weaver_spider'
  | 'worker_ant'
  | 'forager_ant'
  // Tier 2: Industrial Beasts
  | 'troll'
  | 'zombie'
  | 'bat'
  | 'wraith'
  | 'ember_drake'
  | 'crystal_slime';export type CreatureSpecialty = 
  // Material handling
  | 'liquid' | 'corruption' | 'scavenging' | 'general' | 'silk' | 'web'
  | 'metal' | 'dissolving' | 'highway' | 'tunneling' | 'logistics'
  | 'seeking' | 'automatic' | 'crushing' | 'heavy' | 'forge'
  | 'tireless' | 'undead' | 'flying' | 'courier' | 'teleport'
  | 'fragile' | 'fire' | 'smelting' | 'magical' | 'delicate'
  | 'construction' | 'any';

export type CreatureStatus = 
  | 'idle' 
  | 'seeking_work' 
  | 'traveling' 
  | 'working' 
  | 'carrying' 
  | 'resting' 
  | 'delivering';

export interface CreatureData {
  emoji: string;
  name: string;
  capacity: number;
  speed: number;
  cost: ResourceCost;
  specialties: CreatureSpecialty[];
  tier?: number; // Evolution tier (0-4)
  evolvesFrom?: CreatureType; // What creature this evolves from
  evolvesTo?: CreatureType[]; // What creatures this can evolve to
  evolutionCost?: ResourceCost; // Cost to evolve
}

export interface CreatureState {
  id: string;
  type: CreatureType;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  status: CreatureStatus;
  carriedResource?: ResourceType;
  carriedAmount: number;
  targetBuilding?: string; // Building ID
  energy: number;
  maxEnergy: number;
  lastWorkSearch?: number; // Timestamp for work search cooldown
}

// ===== BUILDING TYPES =====

export type BuildingType = 
  // Basic Facilities
  | 'slime_pit'
  | 'bone_kiln'
  | 'spider_silk_loom'
  | 'goblin_hovel'
  | 'scavenging_post'
  // Advanced Facilities
  | 'troll_forge'
  | 'necromantic_circle'
  | 'crystal_garden'
  | 'demon_circle'
  // Infrastructure
  | 'bio_tunnel'
  | 'silk_highway'
  | 'bone_walkway'
  | 'corpse_pile';export interface BuildingData {
  emoji: string;
  name: string;
  cost: ResourceCost;
  // Resource production buildings
  produces?: ResourceType;
  rate?: number;
  // Processing buildings
  input?: ResourceType[];
  output?: ResourceType;
  ratio?: number;
  // Special buildings
  storage?: number;
  rest?: number;
}

export interface BuildingState {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  production: number; // Accumulated production
  storage: Partial<ResourceAmounts>; // Stored resources
  maxStorage: number;
  isWorking: boolean;
  workers: string[]; // Creature IDs working here
}

// ===== GAME STATE TYPES =====

export interface GameState {
  // Resources - now organized by inventory type
  inventory: InventoryState;
  
  // Game objects
  buildings: BuildingState[];
  creatures: CreatureState[];
  
  // Game controls
  gameSpeed: number;
  isPaused: boolean;
  
  // Selection state
  selectedBuildingType: BuildingType | null;
  selectedCreatureType: CreatureType | null;
  selectedObject: {
    type: 'building' | 'creature';
    id: string;
  } | null;
  
  // Game time
  gameTime: number;
  lastUpdate: number;
  
  // Evolution system
  unlockedCreatures: Set<CreatureType>;
  unlockedBuildings: Set<BuildingType>;
  evolutionProgress: Record<string, number>; // Progress towards unlocking evolutions
}

// ===== POSITION AND INTERACTION TYPES =====

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  gridX: number;
  gridY: number;
}

export interface GridConfig {
  size: number;
  showLines: boolean;
  snapToGrid: boolean;
  lineColor: string;
  lineWidth: number;
  subGrid?: {
    divisions: number;
    color: string;
    width: number;
  };
}

export interface CanvasMouseEvent {
  x: number;
  y: number;
  button: 'left' | 'right';
  type: 'click' | 'contextmenu';
}

// ===== UI STATE TYPES =====

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface UIState {
  showInfoPanel: boolean;
  infoPanelContent?: {
    type: 'building' | 'creature';
    data: BuildingState | CreatureState;
  };
  theme: 'light' | 'dark' | 'system';
  toasts: ToastNotification[];
}

// ===== GAME CONFIGURATION TYPES =====

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
    gridSize: number;
  };
  grid: {
    size: number;
    showLines: boolean;
    snapToGrid: boolean;
    lineColor: string;
    lineWidth: number;
    subGrid?: {
      divisions: number;
      color: string;
      width: number;
    };
  };
  limits: {
    maxCreatures: number;
    maxBuildings: number;
  };
  timing: {
    productionInterval: number;
    creatureUpdateInterval: number;
    energyDecayRate: number;
    restRate: number;
  };
}

// ===== ACTION TYPES FOR STATE MANAGEMENT =====

export interface GameActions {
  // Resource management
  addResource: (type: ResourceType, amount: number, inventory?: InventoryType) => void;
  spendResources: (cost: ResourceCost, fromInventory?: InventoryType) => boolean;
  canAfford: (cost: ResourceCost, fromInventory?: InventoryType) => boolean;
  transferResource: (type: ResourceType, amount: number, from: InventoryType, to: InventoryType) => boolean;
  getTotalResource: (type: ResourceType) => number; // Get total across all inventories
  getResourceInInventory: (type: ResourceType, inventory: InventoryType) => number;
  
  // Building management
  placeBuilding: (type: BuildingType, position: Position) => boolean;
  removeBuilding: (id: string) => void;
  
  // Creature management
  spawnCreature: (type: CreatureType, position: Position) => boolean;
  removeCreature: (id: string) => void;
  updateCreature: (id: string, updates: Partial<CreatureState>) => void;
  
  // Evolution system
  canEvolveCreature: (creatureId: string, targetType: CreatureType) => boolean;
  evolveCreature: (creatureId: string, targetType: CreatureType) => boolean;
  unlockCreature: (type: CreatureType) => void;
  unlockBuilding: (type: BuildingType) => void;
  isCreatureUnlocked: (type: CreatureType) => boolean;
  isBuildingUnlocked: (type: BuildingType) => boolean;
  
  // Selection management
  selectBuildingType: (type: BuildingType | null) => void;
  selectCreatureType: (type: CreatureType | null) => void;
  selectObject: (type: 'building' | 'creature', id: string) => void;
  clearSelection: () => void;
  
  // Game controls
  setGameSpeed: (speed: number) => void;
  togglePause: () => void;
  
  // UI controls
  showInfo: (type: 'building' | 'creature', id: string) => void;
  hideInfo: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  hideToast: (id: string) => void;
  
  // Game loop
  updateGame: (deltaTime: number) => void;
  resetGame: () => void;
}

// ===== UTILITY TYPES =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ID = string;

// ===== EXPORT ALL DATA INTERFACES =====

export interface GameData {
  creatures: Record<CreatureType, CreatureData>;
  buildings: Record<BuildingType, BuildingData>;
  resources: Record<ResourceType, ResourceData>;
}

// ===== CONSTANTS =====

export const CREATURE_TYPES: CreatureType[] = [
  // Tier 0: Primitive Workers
  'slime', 'goblin', 'spider', 'wild_creature',
  // Tier 1: First Specializations
  'acid_slime', 'hobgoblin', 'weaver_spider', 'worker_ant', 'forager_ant',
  // Tier 2: Industrial Beasts
  'troll', 'zombie', 'bat', 'wraith', 'ember_drake', 'crystal_slime'
];

export const BUILDING_TYPES: BuildingType[] = [
  // Basic Facilities
  'slime_pit', 'bone_kiln', 'spider_silk_loom', 'goblin_hovel', 'scavenging_post',
  // Advanced Facilities
  'troll_forge', 'necromantic_circle', 'crystal_garden', 'demon_circle',
  // Infrastructure
  'bio_tunnel', 'silk_highway', 'bone_walkway', 'corpse_pile'
];

export const RESOURCE_TYPES: ResourceType[] = [
  // Biological Resources
  'flesh', 'bone', 'fungus', 'ichor',
  // Elemental Resources  
  'fire_cores', 'dark_crystals', 'corrupted_water', 'shadow_essence',
  // Looted Resources
  'rusted_weapons', 'torn_cloth', 'stolen_knowledge',
  // Synthetic Resources
  'mutagen', 'evolution_essence', 'loyalty'
];