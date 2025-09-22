/**
 * Zustand game state store for Emoji Factory Builder
 * Centralized state management with all game logic and mutations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  GameState,
  GameActions,
  ResourceType,
  ResourceCost,
  BuildingType,
  CreatureType,
  BuildingState,
  CreatureState,
  Position,
  UIState,
  InventoryType
} from '../types/game';
import { 
  INITIAL_INVENTORY, 
  GAME_CONFIG,
  getBuildingData,
  getCreatureData,
  snapToGrid,
  isValidPosition,
  getResourceInventoryCategory
} from '../data/gameData';

// ===== UTILITY FUNCTIONS =====

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

// ===== INITIAL STATE =====

const initialGameState: GameState = {
  inventory: { ...INITIAL_INVENTORY },
  buildings: [
    {
      id: 'initial-bone-kiln',
      type: 'bone_kiln',
      x: 150,
      y: 150,
      production: 0,
      storage: {},
      maxStorage: 20,
      isWorking: false,
      workers: []
    },
    {
      id: 'initial-slime-pit',
      type: 'slime_pit',
      x: 300,
      y: 150,
      production: 0,
      storage: {},
      maxStorage: 20,
      isWorking: false,
      workers: []
    },
    {
      id: 'initial-corpse-pile',
      type: 'corpse_pile',
      x: 450,
      y: 150,
      production: 0,
      storage: {},
      maxStorage: 50,
      isWorking: false,
      workers: []
    }
  ],
  creatures: [
    {
      id: 'initial-slime-1',
      type: 'slime',
      x: 200,
      y: 200,
      status: 'idle',
      carriedAmount: 0,
      energy: 100,
      maxEnergy: 100
    },
    {
      id: 'initial-goblin-1',
      type: 'goblin',
      x: 250,
      y: 200,
      status: 'idle',
      carriedAmount: 0,
      energy: 100,
      maxEnergy: 100
    }
  ],
  gameSpeed: 1,
  isPaused: false,
  selectedBuildingType: null,
  selectedCreatureType: null,
  selectedObject: null,
  gameTime: 0,
  lastUpdate: 0,
  // Evolution system
  unlockedCreatures: new Set(['slime', 'goblin', 'spider', 'wild_creature']),
  unlockedBuildings: new Set(['slime_pit', 'bone_kiln', 'spider_silk_loom', 'goblin_hovel', 'corpse_pile']),
  evolutionProgress: {}
};

const initialUIState: UIState = {
  showInfoPanel: false,
  infoPanelContent: undefined,
  theme: 'system',
  toasts: []
};

// ===== COMBINED STATE INTERFACE =====

interface GameStore extends GameState, UIState {
  actions: GameActions;
}

// ===== ZUSTAND STORE =====

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // ===== GAME STATE =====
      ...initialGameState,
      ...initialUIState,

      // ===== ACTIONS =====
      actions: {
        // ===== RESOURCE MANAGEMENT =====
        
        addResource: (type: ResourceType, amount: number, inventory: InventoryType = 'base') => {
          set((state) => ({
            inventory: {
              ...state.inventory,
              [inventory]: {
                ...state.inventory[inventory],
                [type]: Math.max(0, state.inventory[inventory][type] + amount)
              }
            }
          }), false, 'addResource');
        },

        spendResources: (cost: ResourceCost, fromInventory?: InventoryType): boolean => {
          const state = get();
          
          // Check if we can afford it
          if (!state.actions.canAfford(cost, fromInventory)) {
            return false;
          }

          // If specific inventory is specified, spend from that inventory
          if (fromInventory) {
            set((state) => ({
              inventory: {
                ...state.inventory,
                [fromInventory]: Object.entries(cost).reduce((newInventory, [resource, amount]) => ({
                  ...newInventory,
                  [resource]: state.inventory[fromInventory][resource as ResourceType] - (amount || 0)
                }), state.inventory[fromInventory])
              }
            }), false, 'spendResources');
            return true;
          }

          // Otherwise, spend intelligently from appropriate inventories
          set((state) => {
            const newInventory = { ...state.inventory };
            
            Object.entries(cost).forEach(([resource, amount]) => {
              const resourceType = resource as ResourceType;
              const neededAmount = amount || 0;
              let remainingAmount = neededAmount;
              
              // Try primary inventory first (construction materials go to construction, etc.)
              const primaryInventory = getResourceInventoryCategory(resourceType) as InventoryType;
              const availableInPrimary = state.inventory[primaryInventory][resourceType];
              const takeFromPrimary = Math.min(remainingAmount, availableInPrimary);
              
              newInventory[primaryInventory] = {
                ...newInventory[primaryInventory],
                [resourceType]: availableInPrimary - takeFromPrimary
              };
              remainingAmount -= takeFromPrimary;
              
              // If still need more, take from base inventory
              if (remainingAmount > 0) {
                const availableInBase = state.inventory.base[resourceType];
                const takeFromBase = Math.min(remainingAmount, availableInBase);
                
                newInventory.base = {
                  ...newInventory.base,
                  [resourceType]: availableInBase - takeFromBase
                };
                remainingAmount -= takeFromBase;
              }
              
              // If still need more, take from other inventories
              if (remainingAmount > 0) {
                ['construction', 'logistics'].forEach(invType => {
                  if (remainingAmount > 0 && invType !== primaryInventory) {
                    const inv = invType as InventoryType;
                    const availableInOther = state.inventory[inv][resourceType];
                    const takeFromOther = Math.min(remainingAmount, availableInOther);
                    
                    newInventory[inv] = {
                      ...newInventory[inv],
                      [resourceType]: availableInOther - takeFromOther
                    };
                    remainingAmount -= takeFromOther;
                  }
                });
              }
            });
            
            return { inventory: newInventory };
          }, false, 'spendResources');

          return true;
        },

        canAfford: (cost: ResourceCost, fromInventory?: InventoryType): boolean => {
          const state = get();
          
          if (fromInventory) {
            // Check specific inventory only
            return Object.entries(cost).every(([resource, amount]) => 
              state.inventory[fromInventory][resource as ResourceType] >= (amount || 0)
            );
          }
          
          // Check total across all inventories
          return Object.entries(cost).every(([resource, amount]) => 
            state.actions.getTotalResource(resource as ResourceType) >= (amount || 0)
          );
        },

        transferResource: (type: ResourceType, amount: number, from: InventoryType, to: InventoryType): boolean => {
          const state = get();
          
          if (state.inventory[from][type] < amount) {
            return false;
          }
          
          set((state) => ({
            inventory: {
              ...state.inventory,
              [from]: {
                ...state.inventory[from],
                [type]: state.inventory[from][type] - amount
              },
              [to]: {
                ...state.inventory[to],
                [type]: state.inventory[to][type] + amount
              }
            }
          }), false, 'transferResource');
          
          return true;
        },

        getTotalResource: (type: ResourceType): number => {
          const state = get();
          return state.inventory.base[type] + 
                 state.inventory.construction[type] + 
                 state.inventory.logistics[type];
        },

        getResourceInInventory: (type: ResourceType, inventory: InventoryType): number => {
          const state = get();
          return state.inventory[inventory][type];
        },

        // ===== BUILDING MANAGEMENT =====

        placeBuilding: (type: BuildingType, position: Position): boolean => {
          const state = get();
          const buildingData = getBuildingData(type);
          
          // Check if building type is unlocked
          if (!state.actions.isBuildingUnlocked(type)) {
            state.actions.showToast(`${buildingData.name} is not yet unlocked!`, 'warning');
            return false;
          }
          
          // Check if we can afford it
          if (!state.actions.canAfford(buildingData.cost)) {
            const missingResources = Object.entries(buildingData.cost)
              .filter(([resource, amount]) => state.actions.getTotalResource(resource as ResourceType) < (amount || 0))
              .map(([resource, amount]) => `${amount} ${resource}`)
              .join(', ');
            
            state.actions.showToast(`Not enough resources! Need: ${missingResources}`, 'error');
            return false;
          }

          // Snap to grid
          const snappedPos = snapToGrid(position.x, position.y);
          
          // Check if position is valid
          if (!isValidPosition(snappedPos.x, snappedPos.y)) {
            state.actions.showToast('Cannot place building outside the map boundaries!', 'warning');
            return false;
          }

          // Check for overlapping buildings
          const hasOverlap = state.buildings.some(building => 
            Math.abs(building.x - snappedPos.x) < 40 && 
            Math.abs(building.y - snappedPos.y) < 40
          );

          if (hasOverlap) {
            state.actions.showToast('Cannot place building here - space is occupied!', 'warning');
            return false;
          }

          // Spend resources and place building
          if (state.actions.spendResources(buildingData.cost)) {
            const newBuilding: BuildingState = {
              id: generateId(),
              type,
              x: snappedPos.x,
              y: snappedPos.y,
              production: 0,
              storage: {},
              maxStorage: buildingData.storage || 20,
              isWorking: false,
              workers: []
            };

            set((state) => ({
              buildings: [...state.buildings, newBuilding],
              selectedBuildingType: null // Clear selection after placing
            }), false, 'placeBuilding');

            state.actions.showToast(`${buildingData.name} placed successfully! 🏗️`, 'success');
            return true;
          }

          state.actions.showToast('Failed to spend resources for building placement!', 'error');
          return false;
        },

        removeBuilding: (id: string) => {
          set((state) => ({
            buildings: state.buildings.filter(building => building.id !== id),
            selectedObject: state.selectedObject?.id === id ? null : state.selectedObject
          }), false, 'removeBuilding');
        },

        // ===== CREATURE MANAGEMENT =====

        spawnCreature: (type: CreatureType, position: Position): boolean => {
          const state = get();
          const creatureData = getCreatureData(type);
          
          // Check creature limit
          if (state.creatures.length >= GAME_CONFIG.limits.maxCreatures) {
            state.actions.showToast(`Maximum creature limit reached (${GAME_CONFIG.limits.maxCreatures})!`, 'warning');
            return false;
          }

          // Check if creature type is unlocked
          if (!state.actions.isCreatureUnlocked(type)) {
            state.actions.showToast(`${creatureData.name} is not yet unlocked!`, 'warning');
            return false;
          }

          // Check if we can afford it
          if (!state.actions.canAfford(creatureData.cost)) {
            const missingResources = Object.entries(creatureData.cost)
              .filter(([resource, amount]) => state.actions.getTotalResource(resource as ResourceType) < (amount || 0))
              .map(([resource, amount]) => `${amount} ${resource}`)
              .join(', ');
            
            state.actions.showToast(`Not enough resources! Need: ${missingResources}`, 'error');
            return false;
          }

          // Snap to grid
          const snappedPos = snapToGrid(position.x, position.y);
          
          // Check if position is valid
          if (!isValidPosition(snappedPos.x, snappedPos.y)) {
            state.actions.showToast('Cannot spawn creature outside the map boundaries!', 'warning');
            return false;
          }

          // Spend resources and spawn creature
          if (state.actions.spendResources(creatureData.cost)) {
            const newCreature: CreatureState = {
              id: generateId(),
              type,
              x: snappedPos.x,
              y: snappedPos.y,
              status: 'idle',
              carriedAmount: 0,
              energy: 100,
              maxEnergy: 100
            };

            set((state) => ({
              creatures: [...state.creatures, newCreature],
              selectedCreatureType: null // Clear selection after spawning
            }), false, 'spawnCreature');

            state.actions.showToast(`${creatureData.name} spawned successfully! 👹`, 'success');
            return true;
          }

          state.actions.showToast('Failed to spend resources for creature spawning!', 'error');
          return false;
        },

        removeCreature: (id: string) => {
          set((state) => ({
            creatures: state.creatures.filter(creature => creature.id !== id),
            selectedObject: state.selectedObject?.id === id ? null : state.selectedObject
          }), false, 'removeCreature');
        },

        updateCreature: (id: string, updates: Partial<CreatureState>) => {
          set((state) => ({
            creatures: state.creatures.map(creature =>
              creature.id === id ? { ...creature, ...updates } : creature
            )
          }), false, 'updateCreature');
        },

        // ===== SELECTION MANAGEMENT =====

        selectBuildingType: (type: BuildingType | null) => {
          set((state) => ({
            selectedBuildingType: type,
            selectedCreatureType: null,
            selectedObject: null
          }), false, 'selectBuildingType');
        },

        selectCreatureType: (type: CreatureType | null) => {
          set((state) => ({
            selectedCreatureType: type,
            selectedBuildingType: null,
            selectedObject: null
          }), false, 'selectCreatureType');
        },

        selectObject: (type: 'building' | 'creature', id: string) => {
          set((state) => ({
            selectedObject: { type, id },
            selectedBuildingType: null,
            selectedCreatureType: null
          }), false, 'selectObject');
        },

        clearSelection: () => {
          set((state) => ({
            selectedBuildingType: null,
            selectedCreatureType: null,
            selectedObject: null
          }), false, 'clearSelection');
        },

        // ===== GAME CONTROLS =====

        setGameSpeed: (speed: number) => {
          set((state) => ({
            gameSpeed: Math.max(0, Math.min(4, speed))
          }), false, 'setGameSpeed');
        },

        togglePause: () => {
          set((state) => ({
            isPaused: !state.isPaused
          }), false, 'togglePause');
        },

        // ===== UI CONTROLS =====

        showInfo: (type: 'building' | 'creature', id: string) => {
          const state = get();
          const data = type === 'building' 
            ? state.buildings.find(b => b.id === id)
            : state.creatures.find(c => c.id === id);

          if (data) {
            set((state) => ({
              showInfoPanel: true,
              infoPanelContent: { type, data }
            }), false, 'showInfo');
          }
        },

        hideInfo: () => {
          set((state) => ({
            showInfoPanel: false,
            infoPanelContent: undefined
          }), false, 'hideInfo');
        },

        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => ({ theme }), false, 'setTheme');
          
          // Apply theme to document
          if (theme === 'system') {
            document.documentElement.removeAttribute('data-color-scheme');
          } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
          }
        },

        showToast: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 4000) => {
          const id = Math.random().toString(36).substr(2, 9);
          set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration }]
          }), false, 'showToast');
        },

        hideToast: (id: string) => {
          set((state) => ({
            toasts: state.toasts.filter(toast => toast.id !== id)
          }), false, 'hideToast');
        },

        // ===== EVOLUTION SYSTEM =====

        canEvolveCreature: (creatureId: string, targetType: CreatureType): boolean => {
          const state = get();
          const creature = state.creatures.find(c => c.id === creatureId);
          if (!creature) return false;

          const currentData = getCreatureData(creature.type);
          const targetData = getCreatureData(targetType);

          // Check if evolution path exists
          if (!currentData.evolvesTo?.includes(targetType)) return false;

          // Check if player can afford evolution cost
          if (targetData.evolutionCost && !state.actions.canAfford(targetData.evolutionCost)) {
            return false;
          }

          return true;
        },

        evolveCreature: (creatureId: string, targetType: CreatureType): boolean => {
          const state = get();
          if (!get().actions.canEvolveCreature(creatureId, targetType)) return false;

          const targetData = getCreatureData(targetType);
          
          // Spend evolution cost
          if (targetData.evolutionCost && !state.actions.spendResources(targetData.evolutionCost)) {
            return false;
          }

          // Update creature type
          set((state) => ({
            creatures: state.creatures.map(creature =>
              creature.id === creatureId 
                ? { ...creature, type: targetType }
                : creature
            )
          }), false, 'evolveCreature');

          return true;
        },

        unlockCreature: (type: CreatureType) => {
          set((state) => ({
            unlockedCreatures: new Set([...state.unlockedCreatures, type])
          }), false, 'unlockCreature');
        },

        unlockBuilding: (type: BuildingType) => {
          set((state) => ({
            unlockedBuildings: new Set([...state.unlockedBuildings, type])
          }), false, 'unlockBuilding');
        },

        isCreatureUnlocked: (type: CreatureType): boolean => {
          const state = get();
          return state.unlockedCreatures.has(type);
        },

        isBuildingUnlocked: (type: BuildingType): boolean => {
          const state = get();
          return state.unlockedBuildings.has(type);
        },

        // ===== GAME LOOP =====

        updateGame: (deltaTime: number) => {
          const state = get();
          
          if (state.isPaused) return;

          const scaledDeltaTime = deltaTime * state.gameSpeed;

          set((currentState) => {
            // Update game time
            const newGameTime = currentState.gameTime + scaledDeltaTime;

            // Update buildings (production)
            const updatedBuildings = currentState.buildings.map(building => {
              const buildingData = getBuildingData(building.type);
              
              if (buildingData.produces && buildingData.rate) {
                const productionAmount = (buildingData.rate * scaledDeltaTime) / 1000;
                return {
                  ...building,
                  production: building.production + productionAmount
                };
              }
              
              return building;
            });

            // Process completed production (integer amounts)
            let updatedInventory = { ...currentState.inventory };
            const finalBuildings = updatedBuildings.map(building => {
              const buildingData = getBuildingData(building.type);
              
              if (buildingData.produces && building.production >= 1) {
                const completedProduction = Math.floor(building.production);
                const resourceType = buildingData.produces;
                const primaryInventory = getResourceInventoryCategory(resourceType) as InventoryType;
                
                updatedInventory[primaryInventory] = {
                  ...updatedInventory[primaryInventory],
                  [resourceType]: updatedInventory[primaryInventory][resourceType] + completedProduction
                };
                
                return {
                  ...building,
                  production: building.production - completedProduction
                };
              }
              
              return building;
            });

            // Update creatures (AI, movement, energy)
            const updatedCreatures = currentState.creatures.map(creature => {
              const creatureData = getCreatureData(creature.type);
              let newCreature = { ...creature };

              // Update energy
              if (creature.status === 'resting') {
                newCreature.energy = Math.min(
                  creature.maxEnergy,
                  creature.energy + (GAME_CONFIG.timing.restRate * scaledDeltaTime) / 1000
                );
              } else {
                newCreature.energy = Math.max(
                  0,
                  creature.energy - (GAME_CONFIG.timing.energyDecayRate * scaledDeltaTime) / 1000
                );
              }

              // Simple AI: If idle and energy > 50, seek work
              if (creature.status === 'idle' && creature.energy > 50) {
                // Find nearest building that needs work
                const nearestBuilding = finalBuildings
                  .filter(building => building.workers.length < 2) // Max 2 workers per building
                  .reduce((nearest, building) => {
                    const distance = calculateDistance(creature, building);
                    return !nearest || distance < calculateDistance(creature, nearest) 
                      ? building 
                      : nearest;
                  }, null as BuildingState | null);

                if (nearestBuilding) {
                  newCreature.status = 'traveling';
                  newCreature.targetX = nearestBuilding.x;
                  newCreature.targetY = nearestBuilding.y;
                  newCreature.targetBuilding = nearestBuilding.id;
                }
              }

              // Handle movement
              if (creature.status === 'traveling' && creature.targetX !== undefined && creature.targetY !== undefined) {
                const dx = creature.targetX - creature.x;
                const dy = creature.targetY - creature.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 5) {
                  // Reached target
                  newCreature.x = creature.targetX;
                  newCreature.y = creature.targetY;
                  newCreature.status = 'working';
                  newCreature.targetX = undefined;
                  newCreature.targetY = undefined;
                } else {
                  // Move towards target
                  const moveSpeed = (creatureData.speed * scaledDeltaTime) / 1000 * 50; // pixels per second
                  newCreature.x += (dx / distance) * moveSpeed;
                  newCreature.y += (dy / distance) * moveSpeed;
                }
              }

              // If energy is low, seek rest
              if (creature.energy < 20 && creature.status !== 'resting') {
                const nearestHome = finalBuildings
                  .filter(building => building.type === 'corpse_pile')
                  .reduce((nearest, building) => {
                    const distance = calculateDistance(creature, building);
                    return !nearest || distance < calculateDistance(creature, nearest) 
                      ? building 
                      : nearest;
                  }, null as BuildingState | null);

                if (nearestHome) {
                  newCreature.status = 'traveling';
                  newCreature.targetX = nearestHome.x;
                  newCreature.targetY = nearestHome.y;
                  newCreature.targetBuilding = nearestHome.id;
                }
              }

              return newCreature;
            });

            return {
              gameTime: newGameTime,
              lastUpdate: performance.now(),
              buildings: finalBuildings,
              creatures: updatedCreatures,
              inventory: updatedInventory
            };
          }, false, 'updateGame');
        },

        resetGame: () => {
          set((state) => ({
            ...initialGameState,
            theme: state.theme // Preserve theme
          }), false, 'resetGame');
        }
      }
    }),
    {
      name: 'emoji-factory-game-store',
      partialize: (state: GameStore) => ({
        // Only persist certain parts of the state
        inventory: state.inventory,
        buildings: state.buildings,
        creatures: state.creatures,
        theme: state.theme
      })
    }
  )
);

// ===== CONVENIENCE HOOKS =====

/**
 * Hook to access only game actions
 */
export const useGameActions = () => useGameStore((state) => state.actions);

/**
 * Hook to access only game state (no UI state)
 */
/**
 * Hook to access game state - removed to prevent infinite loops
 * Use specific selectors instead: useGameStore(state => state.resources)
 */
// export const useGameState = () => useGameStore((state) => ({
//   resources: state.resources,
//   buildings: state.buildings,
//   creatures: state.creatures,
//   gameSpeed: state.gameSpeed,
//   isPaused: state.isPaused,
//   selectedBuildingType: state.selectedBuildingType,
//   selectedCreatureType: state.selectedCreatureType,
//   selectedObject: state.selectedObject,
//   gameTime: state.gameTime,
//   lastUpdate: state.lastUpdate
// }));

/**
 * Hook to access only UI state
 */
export const useUIState = () => useGameStore((state) => ({
  showInfoPanel: state.showInfoPanel,
  infoPanelContent: state.infoPanelContent,
  theme: state.theme
}));

// ===== SELECTORS =====

/**
 * Get building by ID
 */
export const selectBuildingById = (id: string) => (state: GameStore) =>
  state.buildings.find(building => building.id === id);

/**
 * Get creature by ID
 */
export const selectCreatureById = (id: string) => (state: GameStore) =>
  state.creatures.find(creature => creature.id === id);

/**
 * Check if player can afford a cost
 */
export const selectCanAfford = (cost: ResourceCost) => (state: GameStore) =>
  state.actions.canAfford(cost);

export default useGameStore;