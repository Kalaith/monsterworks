/**
 * Zustand game state store for Emoji Factory Builder
 * Centralized state management with clean separation from business logic
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
  InventoryType,
} from '../types/game';
import {
  initialInventory,
  gameConfig,
  getBuildingData,
  getCreatureData,
  getResourceInventoryCategory,
} from '../data/gameData';

// Import services
import { BuildingService } from '../services/BuildingService';
import { CreatureService } from '../services/CreatureService';

// Import utilities
import { calculateDistance } from '../utils/gameUtils';

// ===== INITIAL STATE =====

const initialGameState: GameState = {
  inventory: { ...initialInventory },
  buildings: [
    {
      id: 'initial-bone-kiln',
      type: 'bone_kiln',
      x: 175, // Centered in grid cell (150 + 25)
      y: 175, // Centered in grid cell (150 + 25)
      production: 0,
      storage: {},
      maxStorage: 10, // Production building - small storage for produced items
      isWorking: false,
      workers: [],
    },
    {
      id: 'initial-slime-pit',
      type: 'slime_pit',
      x: 325, // Centered in grid cell (300 + 25)
      y: 175, // Centered in grid cell (150 + 25)
      production: 0,
      storage: {},
      maxStorage: 10, // Production building - small storage for produced items
      isWorking: false,
      workers: [],
    },
    {
      id: 'initial-corpse-pile',
      type: 'corpse_pile',
      x: 475, // Centered in grid cell (450 + 25)
      y: 175, // Centered in grid cell (150 + 25)
      production: 0,
      storage: {},
      maxStorage: 50,
      isWorking: false,
      workers: [],
    },
  ],
  creatures: [
    {
      id: 'initial-slime-1',
      type: 'slime',
      x: 225, // Centered in grid cell (200 + 25)
      y: 225, // Centered in grid cell (200 + 25)
      status: 'idle',
      carriedAmount: 0,
      energy: 100,
      maxEnergy: 100,
      lastWorkSearch: 0,
    },
    {
      id: 'initial-goblin-1',
      type: 'goblin',
      x: 275, // Centered in grid cell (250 + 25)
      y: 225, // Centered in grid cell (200 + 25)
      status: 'idle',
      carriedAmount: 0,
      energy: 100,
      maxEnergy: 100,
      lastWorkSearch: 0,
    },
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
  unlockedBuildings: new Set([
    'slime_pit',
    'bone_kiln',
    'spider_silk_loom',
    'goblin_hovel',
    'corpse_pile',
  ]),
  evolutionProgress: {},
};

const initialUIState: UIState = {
  showInfoPanel: false,
  infoPanelContent: undefined,
  theme: 'system',
  toasts: [],
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
          set(
            state => ({
              inventory: {
                ...state.inventory,
                [inventory]: {
                  ...state.inventory[inventory],
                  [type]: Math.max(0, state.inventory[inventory][type] + amount),
                },
              },
            }),
            false,
            'addResource'
          );
        },

        spendResources: (cost: ResourceCost, fromInventory?: InventoryType): boolean => {
          const state = get();

          // Check if we can afford it
          if (!state.actions.canAfford(cost, fromInventory)) {
            return false;
          }

          // If specific inventory is specified, spend from that inventory
          if (fromInventory) {
            set(
              state => ({
                inventory: {
                  ...state.inventory,
                  [fromInventory]: Object.entries(cost).reduce(
                    (newInventory, [resource, amount]) => ({
                      ...newInventory,
                      [resource]:
                        state.inventory[fromInventory][resource as ResourceType] - (amount || 0),
                    }),
                    state.inventory[fromInventory]
                  ),
                },
              }),
              false,
              'spendResources'
            );
            return true;
          }

          // Otherwise, spend intelligently from appropriate inventories
          set(
            state => {
              const newInventory = { ...state.inventory };

              Object.entries(cost).forEach(([resource, amount]) => {
                const resourceType = resource as ResourceType;
                const neededAmount = amount || 0;
                let remainingAmount = neededAmount;

                // Try primary inventory first (construction materials go to construction, etc.)
                const primaryInventory = getResourceInventoryCategory(
                  resourceType
                ) as InventoryType;
                const availableInPrimary = state.inventory[primaryInventory][resourceType];
                const takeFromPrimary = Math.min(remainingAmount, availableInPrimary);

                newInventory[primaryInventory] = {
                  ...newInventory[primaryInventory],
                  [resourceType]: availableInPrimary - takeFromPrimary,
                };
                remainingAmount -= takeFromPrimary;

                // If still need more, take from base inventory
                if (remainingAmount > 0) {
                  const availableInBase = state.inventory.base[resourceType];
                  const takeFromBase = Math.min(remainingAmount, availableInBase);

                  newInventory.base = {
                    ...newInventory.base,
                    [resourceType]: availableInBase - takeFromBase,
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
                        [resourceType]: availableInOther - takeFromOther,
                      };
                      remainingAmount -= takeFromOther;
                    }
                  });
                }
              });

              return { inventory: newInventory };
            },
            false,
            'spendResources'
          );

          return true;
        },

        canAfford: (cost: ResourceCost, fromInventory?: InventoryType): boolean => {
          const state = get();

          if (fromInventory) {
            // Check specific inventory only
            return Object.entries(cost).every(
              ([resource, amount]) =>
                state.inventory[fromInventory][resource as ResourceType] >= (amount || 0)
            );
          }

          // Check total across all inventories
          return Object.entries(cost).every(([resource, amount]) => {
            const totalAmount =
              state.inventory.base[resource as ResourceType] +
              state.inventory.construction[resource as ResourceType] +
              state.inventory.logistics[resource as ResourceType];
            return totalAmount >= (amount || 0);
          });
        },

        transferResource: (
          type: ResourceType,
          amount: number,
          from: InventoryType,
          to: InventoryType
        ): boolean => {
          const state = get();

          if (state.inventory[from][type] < amount) {
            return false;
          }

          set(
            state => ({
              inventory: {
                ...state.inventory,
                [from]: {
                  ...state.inventory[from],
                  [type]: state.inventory[from][type] - amount,
                },
                [to]: {
                  ...state.inventory[to],
                  [type]: state.inventory[to][type] + amount,
                },
              },
            }),
            false,
            'transferResource'
          );

          return true;
        },

        getTotalResource: (type: ResourceType): number => {
          const state = get();
          return (
            state.inventory.base[type] +
            state.inventory.construction[type] +
            state.inventory.logistics[type]
          );
        },

        getResourceInInventory: (type: ResourceType, inventory: InventoryType): number => {
          const state = get();
          return state.inventory[inventory][type];
        },

        // ===== BUILDING MANAGEMENT =====

        placeBuilding: (type: BuildingType, position: Position): boolean => {
          const state = get();

          const validation = BuildingService.canPlaceBuilding(
            type,
            position,
            state.buildings,
            state.actions.canAfford,
            state.actions.isBuildingUnlocked
          );

          if (!validation.canPlace) {
            state.actions.showToast(validation.reason || 'Cannot place building', 'error');
            return false;
          }

          const buildingData = getBuildingData(type);
          if (state.actions.spendResources(buildingData.cost)) {
            const newBuilding = BuildingService.createBuilding(type, position);

            set(
              state => ({
                buildings: [...state.buildings, newBuilding],
                selectedBuildingType: null,
              }),
              false,
              'placeBuilding'
            );

            state.actions.showToast(`${buildingData.name} placed successfully! 🏗️`, 'success');
            return true;
          }

          state.actions.showToast('Failed to spend resources for building placement!', 'error');
          return false;
        },

        removeBuilding: (id: string) => {
          set(
            state => ({
              buildings: state.buildings.filter(building => building.id !== id),
              selectedObject: state.selectedObject?.id === id ? null : state.selectedObject,
            }),
            false,
            'removeBuilding'
          );
        },

        // ===== CREATURE MANAGEMENT =====

        spawnCreature: (type: CreatureType, position: Position): boolean => {
          const state = get();

          const validation = CreatureService.canSpawnCreature(
            type,
            position,
            state.creatures,
            state.actions.canAfford,
            state.actions.isCreatureUnlocked
          );

          if (!validation.canSpawn) {
            state.actions.showToast(validation.reason || 'Cannot spawn creature', 'error');
            return false;
          }

          const creatureData = getCreatureData(type);
          if (state.actions.spendResources(creatureData.cost)) {
            const newCreature = CreatureService.createCreature(type, position);

            set(
              state => ({
                creatures: [...state.creatures, newCreature],
                selectedCreatureType: null,
              }),
              false,
              'spawnCreature'
            );

            state.actions.showToast(`${creatureData.name} spawned successfully! 👹`, 'success');
            return true;
          }

          state.actions.showToast('Failed to spend resources for creature spawning!', 'error');
          return false;
        },

        removeCreature: (id: string) => {
          set(
            state => ({
              creatures: state.creatures.filter(creature => creature.id !== id),
              selectedObject: state.selectedObject?.id === id ? null : state.selectedObject,
            }),
            false,
            'removeCreature'
          );
        },

        updateCreature: (id: string, updates: Partial<CreatureState>) => {
          set(
            state => ({
              creatures: state.creatures.map(creature =>
                creature.id === id ? { ...creature, ...updates } : creature
              ),
            }),
            false,
            'updateCreature'
          );
        },

        // ===== SELECTION MANAGEMENT =====

        selectBuildingType: (type: BuildingType | null) => {
          console.log(`${new Date().toLocaleTimeString()} selectBuildingType called with:`, type);
          set(
            () => ({
              selectedBuildingType: type,
              selectedCreatureType: null,
              selectedObject: null,
            }),
            false,
            'selectBuildingType'
          );
        },

        selectCreatureType: (type: CreatureType | null) => {
          set(
            () => ({
              selectedCreatureType: type,
              selectedBuildingType: null,
              selectedObject: null,
            }),
            false,
            'selectCreatureType'
          );
        },

        selectObject: (type: 'building' | 'creature', id: string) => {
          set(
            () => ({
              selectedObject: { type, id },
              selectedBuildingType: null,
              selectedCreatureType: null,
            }),
            false,
            'selectObject'
          );
        },

        clearSelection: () => {
          set(
            () => ({
              selectedBuildingType: null,
              selectedCreatureType: null,
              selectedObject: null,
            }),
            false,
            'clearSelection'
          );
        },

        // ===== GAME CONTROLS =====

        setGameSpeed: (speed: number) => {
          set(
            () => ({
              gameSpeed: Math.max(0, Math.min(4, speed)),
            }),
            false,
            'setGameSpeed'
          );
        },

        togglePause: () => {
          set(
            state => ({
              isPaused: !state.isPaused,
            }),
            false,
            'togglePause'
          );
        },

        // ===== UI CONTROLS =====

        showInfo: (type: 'building' | 'creature', id: string) => {
          const state = get();
          const data =
            type === 'building'
              ? state.buildings.find(b => b.id === id)
              : state.creatures.find(c => c.id === id);

          if (data) {
            set(
              () => ({
                showInfoPanel: true,
                infoPanelContent: { type, data },
              }),
              false,
              'showInfo'
            );
          }
        },

        hideInfo: () => {
          set(
            () => ({
              showInfoPanel: false,
              infoPanelContent: undefined,
            }),
            false,
            'hideInfo'
          );
        },

        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set(() => ({ theme }), false, 'setTheme');

          // Apply theme to document
          if (theme === 'system') {
            document.documentElement.removeAttribute('data-color-scheme');
          } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
          }
        },

        showToast: (
          message: string,
          type: 'info' | 'success' | 'warning' | 'error' = 'info',
          duration: number = 4000
        ) => {
          const id = Math.random().toString(36).substr(2, 9);
          set(
            state => ({
              toasts: [...state.toasts, { id, message, type, duration }],
            }),
            false,
            'showToast'
          );
        },

        hideToast: (id: string) => {
          set(
            state => ({
              toasts: state.toasts.filter(toast => toast.id !== id),
            }),
            false,
            'hideToast'
          );
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
          set(
            state => ({
              creatures: state.creatures.map(creature =>
                creature.id === creatureId ? { ...creature, type: targetType } : creature
              ),
            }),
            false,
            'evolveCreature'
          );

          return true;
        },

        unlockCreature: (type: CreatureType) => {
          set(
            state => ({
              unlockedCreatures: new Set([...state.unlockedCreatures, type]),
            }),
            false,
            'unlockCreature'
          );
        },

        unlockBuilding: (type: BuildingType) => {
          set(
            state => ({
              unlockedBuildings: new Set([...state.unlockedBuildings, type]),
            }),
            false,
            'unlockBuilding'
          );
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

          set(
            currentState => {
              // Update game time
              const newGameTime = currentState.gameTime + scaledDeltaTime;

              // Update buildings (production)
              const updatedBuildings = currentState.buildings.map(building => {
                const buildingData = getBuildingData(building.type);

                if (buildingData.produces && buildingData.rate) {
                  const productionAmount = buildingData.rate * scaledDeltaTime; // Normal production speed
                  return {
                    ...building,
                    production: building.production + productionAmount,
                  };
                }

                return building;
              });

              // Process completed production (integer amounts)
              const updatedInventory = { ...currentState.inventory };
              const finalBuildings = updatedBuildings.map(building => {
                const buildingData = getBuildingData(building.type);

                if (buildingData.produces && building.production >= 1) {
                  const completedProduction = Math.floor(building.production);
                  const resourceType = buildingData.produces;

                  console.log(
                    `🏭 ${new Date().toLocaleTimeString()} Building ${building.id} (${building.type}) producing ${completedProduction} ${resourceType} - production was ${building.production}`
                  );

                  // Check current storage capacity
                  const currentStored = Object.values(building.storage).reduce(
                    (sum, amount) => sum + amount,
                    0
                  );
                  const availableSpace = building.maxStorage - currentStored;
                  const canStore = Math.min(completedProduction, availableSpace);

                  if (canStore > 0) {
                    // Store produced resources in the building's storage (up to capacity limit)
                    const newStorage = { ...building.storage };
                    newStorage[resourceType] = (newStorage[resourceType] || 0) + canStore;

                    console.log(
                      `📦 Building ${building.id} stored ${canStore}/${completedProduction} ${resourceType} (${currentStored + canStore}/${building.maxStorage} total)`
                    );

                    return {
                      ...building,
                      production: building.production - completedProduction, // Always reset production even if we couldn't store everything
                      storage: newStorage,
                    };
                  } else {
                    console.log(
                      `⚠️ Building ${building.id} storage full! (${currentStored}/${building.maxStorage}) - production stopped`
                    );
                    // Storage is full, reset production but don't store anything
                    return {
                      ...building,
                      production: building.production - completedProduction,
                    };
                  }
                }

                return building;
              });

              // Update creatures (AI, movement, energy)
              const updatedCreatures = currentState.creatures.map(creature => {
                const creatureData = getCreatureData(creature.type);
                const newCreature = {
                  ...creature,
                };

                // Update energy
                if (creature.status === 'resting') {
                  newCreature.energy = Math.min(
                    creature.maxEnergy,
                    creature.energy + (gameConfig.timing.restRate * scaledDeltaTime) / 1000
                  );
                } else {
                  newCreature.energy = Math.max(
                    0,
                    creature.energy - (gameConfig.timing.energyDecayRate * scaledDeltaTime) / 1000
                  );
                }

                // Simple AI: If idle and energy > 50, seek work or delivery (with cooldown)
                if (creature.status === 'idle' && creature.energy > 50) {
                  // Add work search cooldown to prevent spam
                  const now = Date.now();
                  const lastWorkSearch = newCreature.lastWorkSearch || 0;
                  const workSearchCooldown = 5000; // 5 seconds between work searches to reduce spam

                  console.log(
                    `🕐 ${new Date().toLocaleTimeString()} Creature ${creature.id} cooldown check: now=${now}, last=${lastWorkSearch}, diff=${now - lastWorkSearch}ms, needed=${workSearchCooldown}ms`
                  );

                  if (now - lastWorkSearch >= workSearchCooldown) {
                    if (creature.carriedAmount > 0) {
                      // Creature is carrying resources - find storage to deliver to
                      console.log(
                        `🚚 ${new Date().toLocaleTimeString()} Creature ${creature.id} carrying ${creature.carriedAmount} resources, seeking delivery`
                      );
                      const storageBuilding = finalBuildings.find(
                        building => building.type === 'corpse_pile'
                      );

                      if (storageBuilding) {
                        console.log(
                          `🎯 ${new Date().toLocaleTimeString()} Creature ${creature.id} found storage at ${storageBuilding.id}`
                        );
                        newCreature.status = 'traveling';
                        newCreature.targetX = storageBuilding.x;
                        newCreature.targetY = storageBuilding.y;
                        newCreature.targetBuilding = storageBuilding.id;
                        newCreature.lastWorkSearch = now;
                      } else {
                        console.log(
                          `❌ ${new Date().toLocaleTimeString()} Creature ${creature.id} can't find storage building!`
                        );
                        newCreature.lastWorkSearch = now;
                      }
                    } else {
                      // Creature has no resources - find work at production buildings
                      console.log(
                        `🧠 ${new Date().toLocaleTimeString()} Creature ${creature.id} is idle and seeking work (energy: ${creature.energy.toFixed(1)}, carried: ${creature.carriedAmount})`
                      );
                      const nearestBuilding = finalBuildings
                        .filter(building => {
                          if (building.type === 'corpse_pile') return false; // Exclude storage buildings
                          if (building.workers.length >= 2) return false; // Max 2 workers per building

                          // Check if building has resources to collect
                          const buildingData = getBuildingData(building.type);
                          if (buildingData.produces) {
                            const resourceType = buildingData.produces;
                            const availableAmount = building.storage[resourceType] || 0;
                            return availableAmount > 0; // Only target buildings with resources available
                          }

                          return false;
                        })
                        .reduce(
                          (nearest, building) => {
                            const distance = calculateDistance(creature, building);
                            return !nearest || distance < calculateDistance(creature, nearest)
                              ? building
                              : nearest;
                          },
                          null as BuildingState | null
                        );

                      if (nearestBuilding) {
                        console.log(
                          `🎯 ${new Date().toLocaleTimeString()} Creature ${creature.id} found work at ${nearestBuilding.id} (${nearestBuilding.type}) - production: ${nearestBuilding.production.toFixed(2)}`
                        );
                        newCreature.status = 'traveling';
                        newCreature.targetX = nearestBuilding.x;
                        newCreature.targetY = nearestBuilding.y;
                        newCreature.targetBuilding = nearestBuilding.id;
                        newCreature.lastWorkSearch = now;
                      } else {
                        console.log(
                          `❌ ${new Date().toLocaleTimeString()} No available work found for creature ${creature.id} (checked ${finalBuildings.length} buildings)`
                        );
                        newCreature.lastWorkSearch = now + 8000; // Add extra 8 second delay when no work found
                      }
                    }
                  }
                }

                // Handle movement
                if (
                  creature.status === 'traveling' &&
                  creature.targetX !== undefined &&
                  creature.targetY !== undefined
                ) {
                  const dx = creature.targetX - creature.x;
                  const dy = creature.targetY - creature.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);

                  if (distance < 5) {
                    // Reached target
                    newCreature.x = creature.targetX;
                    newCreature.y = creature.targetY;

                    // Check what type of building we reached
                    const targetBuilding = finalBuildings.find(
                      b => b.id === creature.targetBuilding
                    );
                    if (
                      targetBuilding &&
                      targetBuilding.type === 'corpse_pile' &&
                      creature.carriedAmount > 0
                    ) {
                      // Reached storage building with resources - drop them off and add to global inventory
                      console.log(
                        `📦 ${new Date().toLocaleTimeString()} Creature ${creature.id} dropping off ${creature.carriedAmount} resources at ${targetBuilding.id}`
                      );

                      // Add resources to global inventory
                      // For now, assume all carried resources are the same type (simplification)
                      // In a more complex system, we'd track exactly what resource type the creature is carrying
                      const deliveredAmount = creature.carriedAmount;

                      // Find what resource this creature was carrying by checking what they collected from
                      // This is a simplification - in a full system we'd track the resource type on the creature
                      console.log(
                        `💰 ${new Date().toLocaleTimeString()} Adding ${deliveredAmount} resources to global inventory (delivery)`
                      );

                      newCreature.carriedAmount = 0;
                      newCreature.status = 'idle';
                      newCreature.targetBuilding = undefined;
                    } else {
                      // Reached production building - start working
                      console.log(
                        `🔨 ${new Date().toLocaleTimeString()} Creature ${creature.id} starting work at ${targetBuilding?.id || 'unknown building'}`
                      );
                      newCreature.status = 'working';
                    }

                    newCreature.targetX = undefined;
                    newCreature.targetY = undefined;
                  } else {
                    // Move towards target
                    const moveSpeed = creatureData.speed * scaledDeltaTime * 50; // pixels per update

                    // Prevent overshooting by limiting movement to remaining distance
                    const actualMoveDistance = Math.min(moveSpeed, distance);

                    newCreature.x = creature.x + (dx / distance) * actualMoveDistance;
                    newCreature.y = creature.y + (dy / distance) * actualMoveDistance;
                  }
                }

                // Handle working at production buildings
                if (creature.status === 'working' && creature.targetBuilding) {
                  const targetBuilding = finalBuildings.find(b => b.id === creature.targetBuilding);
                  if (targetBuilding && targetBuilding.type !== 'corpse_pile') {
                    // Only work at production buildings, not storage
                    const buildingData = getBuildingData(targetBuilding.type);
                    const resourceType = buildingData.produces;
                    const availableInStorage = resourceType
                      ? targetBuilding.storage[resourceType] || 0
                      : 0;

                    console.log(
                      `🔍 ${new Date().toLocaleTimeString()} Creature ${creature.id} checking building ${targetBuilding.id}: ${resourceType}=${availableInStorage} in storage, capacity=${creatureData.capacity}, carried=${creature.carriedAmount}`
                    );

                    if (
                      creature.carriedAmount < creatureData.capacity &&
                      availableInStorage > 0 &&
                      resourceType
                    ) {
                      const collectAmount = Math.min(
                        creatureData.capacity - creature.carriedAmount,
                        availableInStorage,
                        1 // Collect 1 unit at a time
                      );
                      console.log(
                        `📦 ${new Date().toLocaleTimeString()} Creature ${creature.id} collecting ${collectAmount} ${resourceType} from ${targetBuilding.id} storage`
                      );
                      newCreature.carriedAmount += collectAmount;

                      // Actually consume from the building's storage
                      const buildingIndex = finalBuildings.findIndex(
                        b => b.id === targetBuilding.id
                      );
                      if (buildingIndex !== -1) {
                        const updatedStorage = { ...finalBuildings[buildingIndex].storage };
                        updatedStorage[resourceType] =
                          (updatedStorage[resourceType] || 0) - collectAmount;
                        finalBuildings[buildingIndex] = {
                          ...finalBuildings[buildingIndex],
                          storage: updatedStorage,
                        };
                      }

                      // If now at capacity, find a place to deliver
                      if (newCreature.carriedAmount >= creatureData.capacity) {
                        console.log(
                          `🎒 ${new Date().toLocaleTimeString()} Creature ${creature.id} now at capacity, seeking delivery`
                        );
                        newCreature.status = 'idle'; // Will seek delivery next update
                        newCreature.targetBuilding = undefined;
                      }
                    } else {
                      console.log(
                        `❌ ${new Date().toLocaleTimeString()} Creature ${creature.id} can't collect: carried=${creature.carriedAmount}/${creatureData.capacity}, storage=${availableInStorage} ${resourceType || 'unknown'}`
                      );
                      // Nothing to collect or at capacity, go idle
                      newCreature.status = 'idle';
                      newCreature.targetBuilding = undefined;
                    }
                  } else if (targetBuilding && targetBuilding.type === 'corpse_pile') {
                    console.log(
                      `⚠️ ${new Date().toLocaleTimeString()} Creature ${creature.id} tried to work at storage building - going idle`
                    );
                    // Don't work at storage buildings
                    newCreature.status = 'idle';
                    newCreature.targetBuilding = undefined;
                  }
                }

                // Handle delivery - if carrying resources and idle, find storage
                if (creature.status === 'idle' && creature.carriedAmount > 0) {
                  // Find nearest storage building (corpse pile for now)
                  const storageBuilding = finalBuildings
                    .filter(building => building.type === 'corpse_pile')
                    .reduce(
                      (nearest, building) => {
                        const distance = calculateDistance(creature, building);
                        return !nearest || distance < calculateDistance(creature, nearest)
                          ? building
                          : nearest;
                      },
                      null as BuildingState | null
                    );

                  if (storageBuilding) {
                    newCreature.status = 'traveling';
                    newCreature.targetX = storageBuilding.x;
                    newCreature.targetY = storageBuilding.y;
                    newCreature.targetBuilding = storageBuilding.id;
                  }
                }

                // If energy is low, seek rest
                if (creature.energy < 20 && creature.status !== 'resting') {
                  const nearestHome = finalBuildings
                    .filter(building => building.type === 'corpse_pile')
                    .reduce(
                      (nearest, building) => {
                        const distance = calculateDistance(creature, building);
                        return !nearest || distance < calculateDistance(creature, nearest)
                          ? building
                          : nearest;
                      },
                      null as BuildingState | null
                    );

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
                inventory: updatedInventory,
              };
            },
            false,
            'updateGame'
          );
        },

        resetGame: () => {
          set(
            state => ({
              ...initialGameState,
              theme: state.theme, // Preserve theme
            }),
            false,
            'resetGame'
          );
        },
      },
    }),
    {
      name: 'emoji-factory-game-store',
      partialize: (state: GameStore) => ({
        // Only persist certain parts of the state
        inventory: state.inventory,
        buildings: state.buildings,
        creatures: state.creatures,
        theme: state.theme,
      }),
    }
  )
);

// ===== CONVENIENCE HOOKS =====

/**
 * Hook to access only game actions
 */
export const useGameActions = () => useGameStore(state => state.actions);

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
export const useUIState = () =>
  useGameStore(state => ({
    showInfoPanel: state.showInfoPanel,
    infoPanelContent: state.infoPanelContent,
    theme: state.theme,
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
