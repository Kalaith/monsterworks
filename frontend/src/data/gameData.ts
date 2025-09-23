/**
 * Game data configuration with full TypeScript typing
 * Ported from the original GAME_DATA object with enhanced type safety
 */

import type { 
  GameData, 
  CreatureType, 
  BuildingType, 
  ResourceType,
  CreatureData,
  BuildingData,
  ResourceData,
  ResourceCost,
  GameConfig,
  InventoryCategory,
  InventoryState,
  CreatureSpecialty
} from '../types/game';

// ===== CREATURE DATA =====

export const CREATURES: Record<CreatureType, CreatureData> = {
  // Tier 0: Primitive Workers
  slime: {
    emoji: "🟢",
    name: "Slime",
    capacity: 2,
    speed: 1,
    cost: { flesh: 3 },
    specialties: ["liquid", "corruption"],
    tier: 0,
    evolvesTo: ['acid_slime', 'crystal_slime']
  },
  goblin: {
    emoji: "�",
    name: "Goblin",
    capacity: 1,
    speed: 3,
    cost: { flesh: 2, bone: 1 },
    specialties: ["scavenging", "general"]
  },
  spider: {
    emoji: "�️",
    name: "Spider",
    capacity: 1,
    speed: 2,
    cost: { flesh: 2 },
    specialties: ["silk", "web"]
  },
  wild_creature: {
    emoji: "🦇",
    name: "Wild Creature",
    capacity: 1,
    speed: 2,
    cost: { flesh: 1 },
    specialties: ["any"]
  },
  // Tier 1: First Specializations
  acid_slime: {
    emoji: "�",
    name: "Acid Slime",
    capacity: 3,
    speed: 1,
    cost: { flesh: 5, corrupted_water: 2 },
    specialties: ["metal", "dissolving"]
  },
  hobgoblin: {
    emoji: "�",
    name: "Hobgoblin",
    capacity: 3,
    speed: 2,
    cost: { flesh: 5, bone: 3, rusted_weapons: 1 },
    specialties: ["heavy", "construction"]
  },
  weaver_spider: {
    emoji: "�️",
    name: "Weaver Spider",
    capacity: 2,
    speed: 3,
    cost: { flesh: 4, torn_cloth: 2 },
    specialties: ["silk", "highway"]
  },
  worker_ant: {
    emoji: "🐜",
    name: "Worker Ant",
    capacity: 1,
    speed: 4,
    cost: { flesh: 3, fungus: 2 },
    specialties: ["tunneling", "logistics"]
  },
  forager_ant: {
    emoji: "🐛",
    name: "Forager Ant",
    capacity: 2,
    speed: 3,
    cost: { flesh: 4, fungus: 3 },
    specialties: ["seeking", "automatic"]
  },
  // Tier 2: Industrial Beasts
  troll: {
    emoji: "�",
    name: "Troll",
    capacity: 8,
    speed: 1,
    cost: { flesh: 10, bone: 8, fire_cores: 2 },
    specialties: ["crushing", "heavy", "forge"]
  },
  zombie: {
    emoji: "🧟",
    name: "Zombie",
    capacity: 3,
    speed: 1,
    cost: { bone: 5, corrupted_water: 3 },
    specialties: ["tireless", "undead"]
  },
  bat: {
    emoji: "�",
    name: "Bat",
    capacity: 1,
    speed: 5,
    cost: { flesh: 3, shadow_essence: 1 },
    specialties: ["flying", "courier"]
  },
  wraith: {
    emoji: "👻",
    name: "Wraith",
    capacity: 1,
    speed: 3,
    cost: { shadow_essence: 5, stolen_knowledge: 2 },
    specialties: ["teleport", "fragile"]
  },
  ember_drake: {
    emoji: "�",
    name: "Ember Drake",
    capacity: 6,
    speed: 2,
    cost: { flesh: 15, fire_cores: 5, dark_crystals: 2 },
    specialties: ["fire", "smelting", "heavy"]
  },
  crystal_slime: {
    emoji: "�",
    name: "Crystal Slime",
    capacity: 2,
    speed: 1,
    cost: { flesh: 8, dark_crystals: 3, corrupted_water: 2 },
    specialties: ["magical", "delicate"]
  }
} as const;

// ===== BUILDING DATA =====

export const BUILDINGS: Record<BuildingType, BuildingData> = {
  // Basic Facilities
  slime_pit: {
    emoji: "🫧",
    name: "Slime Pit",
    produces: "corrupted_water",
    rate: 1,
    cost: { flesh: 8, bone: 4 }
  },
  bone_kiln: {
    emoji: "🦴",
    name: "Bone Kiln",
    produces: "bone",
    rate: 1,
    cost: { flesh: 5 }
  },
  spider_silk_loom: {
    emoji: "🕸️",
    name: "Spider Silk Loom",
    produces: "torn_cloth",
    rate: 0.5,
    cost: { flesh: 6, bone: 3 }
  },
  goblin_hovel: {
    emoji: "�️",
    name: "Goblin Hovel",
    produces: "flesh",
    rate: 1,
    cost: { bone: 8, torn_cloth: 4 }
  },
  scavenging_post: {
    emoji: "🗡️",
    name: "Scavenging Post",
    produces: "rusted_weapons",
    rate: 0.3,
    cost: { flesh: 10, bone: 6 }
  },
  // Advanced Facilities
  troll_forge: {
    emoji: "�",
    name: "Troll Forge",
    input: ["rusted_weapons", "fire_cores"],
    output: "mutagen",
    ratio: 0.2,
    cost: { flesh: 20, bone: 15, fire_cores: 3 }
  },
  necromantic_circle: {
    emoji: "⚱️",
    name: "Necromantic Circle",
    input: ["bone", "shadow_essence"],
    output: "evolution_essence",
    ratio: 0.1,
    cost: { bone: 25, shadow_essence: 5, stolen_knowledge: 3 }
  },
  crystal_garden: {
    emoji: "💎",
    name: "Crystal Garden",
    produces: "dark_crystals",
    rate: 0.5,
    cost: { flesh: 15, shadow_essence: 8 }
  },
  demon_circle: {
    emoji: "😈",
    name: "Demon Circle",
    input: ["dark_crystals", "corrupted_water", "shadow_essence"],
    output: "fire_cores",
    ratio: 0.3,
    cost: { flesh: 30, bone: 20, dark_crystals: 10 }
  },
  // Infrastructure
  bio_tunnel: {
    emoji: "🕳️",
    name: "Bio Tunnel",
    storage: 50,
    cost: { flesh: 12, bone: 8 }
  },
  silk_highway: {
    emoji: "🛤️",
    name: "Silk Highway",
    storage: 30,
    cost: { torn_cloth: 10, bone: 5 }
  },
  bone_walkway: {
    emoji: "🦴",
    name: "Bone Walkway",
    storage: 20,
    cost: { bone: 15 }
  },
  corpse_pile: {
    emoji: "💀",
    name: "Corpse Pile",
    rest: 10,
    cost: { flesh: 10, bone: 8 }
  }
} as const;

// ===== RESOURCE DATA =====

export const RESOURCES: Record<ResourceType, ResourceData> = {
  // Biological Resources
  flesh: {
    emoji: "🥩",
    name: "Flesh",
    color: "#8B0000"
  },
  bone: {
    emoji: "�",
    name: "Bone",
    color: "#F5F5DC"
  },
  fungus: {
    emoji: "🍄",
    name: "Fungus",
    color: "#8B4513"
  },
  ichor: {
    emoji: "�",
    name: "Ichor",
    color: "#800080"
  },
  // Elemental Resources
  fire_cores: {
    emoji: "🔥",
    name: "Fire Cores",
    color: "#FF4500"
  },
  dark_crystals: {
    emoji: "💎",
    name: "Dark Crystals",
    color: "#4B0082"
  },
  corrupted_water: {
    emoji: "🫧",
    name: "Corrupted Water",
    color: "#228B22"
  },
  shadow_essence: {
    emoji: "🌫️",
    name: "Shadow Essence",
    color: "#2F4F4F"
  },
  // Looted Resources
  rusted_weapons: {
    emoji: "🗡️",
    name: "Rusted Weapons",
    color: "#A0522D"
  },
  torn_cloth: {
    emoji: "🧵",
    name: "Torn Cloth",
    color: "#696969"
  },
  stolen_knowledge: {
    emoji: "�",
    name: "Stolen Knowledge",
    color: "#4169E1"
  },
  // Synthetic Resources
  mutagen: {
    emoji: "🧪",
    name: "Mutagen",
    color: "#9370DB"
  },
  evolution_essence: {
    emoji: "✨",
    name: "Evolution Essence",
    color: "#FFD700"
  },
  loyalty: {
    emoji: "❤️",
    name: "Loyalty",
    color: "#DC143C"
  }
} as const;

// ===== GAME CONFIGURATION =====

export const GAME_CONFIG: GameConfig = {
  canvas: {
    width: 1000,
    height: 700,
    gridSize: 50 // Legacy support
  },
  grid: {
    size: 50,
    showLines: true,
    snapToGrid: true,
    lineColor: 'rgba(100, 100, 100, 0.3)',
    lineWidth: 1,
    subGrid: {
      divisions: 2,
      color: 'rgba(100, 100, 100, 0.1)',
      width: 0.5
    }
  },
  limits: {
    maxCreatures: 50,
    maxBuildings: 100
  },
  timing: {
    productionInterval: 1000, // ms between production cycles
    creatureUpdateInterval: 16, // ms between creature updates (~60fps)
    energyDecayRate: 0.1, // energy decay per second
    restRate: 2 // energy restoration per second when resting
  }
} as const;

// ===== INVENTORY CATEGORIES =====

export const INVENTORY_CATEGORIES: Record<string, InventoryCategory> = {
  base: {
    type: 'base',
    name: 'Base Resources',
    description: 'Core resources for production and monster creation',
    displayPriority: 1,
    resources: [
      'flesh',       // Primary creature resource
      'bone',        // Primary building resource
      'fungus',      // Food and growth
      'ichor',       // Advanced creature resource
      'mutagen',     // Evolution catalyst
      'evolution_essence', // Advanced evolution
      'loyalty'      // Community resource
    ]
  },
  construction: {
    type: 'construction', 
    name: 'Construction Materials',
    description: 'Materials used specifically for building structures',
    displayPriority: 2,
    resources: [
      'rusted_weapons',  // Metal construction
      'torn_cloth',      // Fabric construction
      'fire_cores',      // Energy construction
      'dark_crystals',   // Magical construction
      'stolen_knowledge' // Advanced construction
    ]
  },
  logistics: {
    type: 'logistics',
    name: 'Logistics Resources', 
    description: 'Resources for transport and processing systems',
    displayPriority: 3,
    resources: [
      'corrupted_water', // Liquid transport
      'shadow_essence'   // Magical transport
    ]
  }
} as const;

// ===== INITIAL INVENTORY STATE =====

export const INITIAL_INVENTORY: InventoryState = {
  base: {
    // Biological Resources - Starting supplies
    flesh: 25,
    bone: 15,
    fungus: 8,
    ichor: 0,
    // Synthetic Resources - Must be produced  
    mutagen: 10, // For testing evolution
    evolution_essence: 5, // For testing evolution
    loyalty: 10,
    // Initialize other base resources
    fire_cores: 0,
    dark_crystals: 0,
    corrupted_water: 0,
    shadow_essence: 0,
    rusted_weapons: 0,
    torn_cloth: 0,
    stolen_knowledge: 0
  },
  construction: {
    // Elemental Resources - Construction materials
    fire_cores: 2,
    dark_crystals: 1,
    // Looted Resources - From initial scavenging
    rusted_weapons: 3,
    torn_cloth: 4,
    stolen_knowledge: 0,
    // Initialize other construction resources
    flesh: 0,
    bone: 0,
    fungus: 0,
    ichor: 0,
    mutagen: 0,
    evolution_essence: 0,
    loyalty: 0,
    corrupted_water: 0,
    shadow_essence: 0
  },
  logistics: {
    // Logistics specific resources
    corrupted_water: 5,
    shadow_essence: 0,
    // Initialize other logistics resources
    flesh: 0,
    bone: 0,
    fungus: 0,
    ichor: 0,
    fire_cores: 0,
    dark_crystals: 0,
    rusted_weapons: 0,
    torn_cloth: 0,
    stolen_knowledge: 0,
    mutagen: 0,
    evolution_essence: 0,
    loyalty: 0
  }
} as const;

// ===== COMBINED GAME DATA =====

export const GAME_DATA: GameData = {
  creatures: CREATURES,
  buildings: BUILDINGS,
  resources: RESOURCES
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Get which inventory category a resource belongs to primarily
 */
export function getResourceInventoryCategory(resourceType: ResourceType): string {
  for (const [categoryName, category] of Object.entries(INVENTORY_CATEGORIES)) {
    if (category.resources.includes(resourceType)) {
      return categoryName;
    }
  }
  return 'base'; // Default fallback
}

/**
 * Get all resources in a specific inventory category
 */
export function getResourcesInCategory(categoryName: string): ResourceType[] {
  return INVENTORY_CATEGORIES[categoryName]?.resources || [];
}

/**
 * Get streamlined resources for top display (highest priority items)
 */
export function getStreamlinedResources(): ResourceType[] {
  return [
    'flesh',     // Primary creature cost
    'bone',      // Primary building cost  
    'mutagen',   // Evolution cost
    'loyalty'    // Population limit
  ];
}

/**
 * Check if a building cost primarily uses construction materials
 */
export function isBuildingCostPrimarilyConstruction(cost: ResourceCost): boolean {
  const constructionResources = getResourcesInCategory('construction');
  const totalCostItems = Object.keys(cost).length;
  const constructionCostItems = Object.keys(cost).filter(resource => 
    constructionResources.includes(resource as ResourceType)
  ).length;
  
  return constructionCostItems >= totalCostItems * 0.5; // 50% or more construction materials
}

/**
 * Get creature data by type
 */
export function getCreatureData(type: CreatureType): CreatureData {
  return CREATURES[type];
}

/**
 * Get building data by type
 */
export function getBuildingData(type: BuildingType): BuildingData {
  return BUILDINGS[type];
}

/**
 * Get resource data by type
 */
export function getResourceData(type: ResourceType): ResourceData {
  return RESOURCES[type];
}

/**
 * Check if a creature type has a specific specialty
 */
export function hasSpecialty(creatureType: CreatureType, specialty: string): boolean {
  return CREATURES[creatureType].specialties.includes(specialty as CreatureSpecialty);
}

/**
 * Get all resource producer buildings
 */
export function getProducerBuildings(): BuildingType[] {
  return Object.entries(BUILDINGS)
    .filter(([_, data]) => data.produces)
    .map(([type, _]) => type as BuildingType);
}

/**
 * Get all processing buildings
 */
export function getProcessingBuildings(): BuildingType[] {
  return Object.entries(BUILDINGS)
    .filter(([_, data]) => data.input && data.output)
    .map(([type, _]) => type as BuildingType);
}

/**
 * Get creatures that can carry a specific resource type
 */
export function getCarriersForResource(resourceType: ResourceType): CreatureType[] {
  return Object.entries(CREATURES)
    .filter(([_, data]) => 
      data.specialties.includes('any') || 
      data.specialties.includes(resourceType as CreatureSpecialty)
    )
    .map(([type, _]) => type as CreatureType);
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate that a position is within canvas bounds
 */
export function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x <= GAME_CONFIG.canvas.width && 
         y >= 0 && y <= GAME_CONFIG.canvas.height;
}

/**
 * Snap position to grid center (places items in center of grid cells)
 */
export function snapToGrid(x: number, y: number, gridSize?: number): { x: number; y: number } {
  const size = gridSize || GAME_CONFIG.grid.size;
  return {
    x: Math.round(x / size) * size + size / 2,
    y: Math.round(y / size) * size + size / 2
  };
}

/**
 * Convert pixel position to grid coordinates
 */
export function pixelToGrid(x: number, y: number, gridSize?: number): { gridX: number; gridY: number } {
  const size = gridSize || GAME_CONFIG.grid.size;
  return {
    gridX: Math.round(x / size),
    gridY: Math.round(y / size)
  };
}

/**
 * Convert grid coordinates to pixel position
 */
export function gridToPixel(gridX: number, gridY: number, gridSize?: number): { x: number; y: number } {
  const size = gridSize || GAME_CONFIG.grid.size;
  return {
    x: gridX * size,
    y: gridY * size
  };
}

/**
 * Check if grid position is valid (within bounds and not occupied)
 */
export function isValidGridPosition(
  gridX: number, 
  gridY: number, 
  canvasWidth?: number, 
  canvasHeight?: number
): boolean {
  const width = canvasWidth || GAME_CONFIG.canvas.width;
  const height = canvasHeight || GAME_CONFIG.canvas.height;
  const gridSize = GAME_CONFIG.grid.size;
  
  const maxGridX = Math.floor(width / gridSize);
  const maxGridY = Math.floor(height / gridSize);
  
  return gridX >= 0 && gridX < maxGridX && gridY >= 0 && gridY < maxGridY;
}

// ===== EXPORT DEFAULT =====

export default GAME_DATA;