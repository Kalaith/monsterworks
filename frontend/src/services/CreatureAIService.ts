/**
 * Creature AI and behavior logic
 */

import type { CreatureState, BuildingState, CreatureStatus } from '../types/game';
import { getCreatureData } from '../data/gameData';

// Utility function
function calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

export class CreatureAIService {
  /**
   * Find the nearest available work for a creature
   */
  static findNearestWork(
    creature: CreatureState,
    buildings: BuildingState[]
  ): BuildingState | null {
    return buildings
      .filter(
        building =>
          building.type !== 'corpse_pile' && // Exclude storage buildings
          building.workers.length < 2 && // Max 2 workers per building
          building.production >= 1 // Only target buildings with at least 1 unit ready
      )
      .reduce(
        (nearest, building) => {
          const distance = calculateDistance(creature, building);
          return !nearest || distance < calculateDistance(creature, nearest) ? building : nearest;
        },
        null as BuildingState | null
      );
  }

  /**
   * Find the nearest storage building for delivery
   */
  static findNearestStorage(
    creature: CreatureState,
    buildings: BuildingState[]
  ): BuildingState | null {
    return buildings
      .filter(building => building.type === 'corpse_pile')
      .reduce(
        (nearest, building) => {
          const distance = calculateDistance(creature, building);
          return !nearest || distance < calculateDistance(creature, nearest) ? building : nearest;
        },
        null as BuildingState | null
      );
  }

  /**
   * Update creature AI decisions with cooldown
   */
  static updateCreatureAI(creatures: CreatureState[], buildings: BuildingState[]): CreatureState[] {
    const now = Date.now();

    return creatures.map(creature => {
      const newCreature = { ...creature };

      // Work search with cooldown
      if (creature.status === 'idle' && creature.energy > 50) {
        const lastWorkSearch = creature.lastWorkSearch || 0;
        const workSearchCooldown = 2000; // 2 seconds between work searches

        if (now - lastWorkSearch >= workSearchCooldown) {
          console.log(`🧠 ${new Date().toLocaleTimeString()} Creature ${creature.id} seeking work`);

          const nearestBuilding = this.findNearestWork(creature, buildings);

          if (nearestBuilding) {
            console.log(
              `🎯 ${new Date().toLocaleTimeString()} Creature ${creature.id} found work at ${nearestBuilding.id}`
            );
            newCreature.status = 'traveling';
            newCreature.targetX = nearestBuilding.x;
            newCreature.targetY = nearestBuilding.y;
            newCreature.targetBuilding = nearestBuilding.id;
            newCreature.lastWorkSearch = now;
          } else {
            console.log(
              `❌ ${new Date().toLocaleTimeString()} No work found for creature ${creature.id}`
            );
            newCreature.lastWorkSearch = now;
          }
        }
      }

      // Delivery logic for creatures carrying resources
      if (creature.status === 'idle' && creature.carriedAmount > 0) {
        const storageBuilding = this.findNearestStorage(creature, buildings);
        if (storageBuilding) {
          newCreature.status = 'traveling';
          newCreature.targetX = storageBuilding.x;
          newCreature.targetY = storageBuilding.y;
          newCreature.targetBuilding = storageBuilding.id;
        }
      }

      // Rest when energy is low
      if (creature.energy < 20 && creature.status !== 'resting') {
        const nearestHome = this.findNearestStorage(creature, buildings);
        if (nearestHome) {
          newCreature.status = 'traveling';
          newCreature.targetX = nearestHome.x;
          newCreature.targetY = nearestHome.y;
          newCreature.targetBuilding = nearestHome.id;
        }
      }

      return newCreature;
    });
  }

  /**
   * Update creature movement
   */
  static updateCreatureMovement(
    creatures: CreatureState[],
    buildings: BuildingState[],
    deltaTime: number
  ): CreatureState[] {
    return creatures.map(creature => {
      if (creature.status !== 'traveling' || !creature.targetX || !creature.targetY) {
        return creature;
      }

      const creatureData = getCreatureData(creature.type);
      const dx = creature.targetX - creature.x;
      const dy = creature.targetY - creature.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // Reached target
        const newCreature = { ...creature };
        newCreature.x = creature.targetX;
        newCreature.y = creature.targetY;
        newCreature.targetX = undefined;
        newCreature.targetY = undefined;

        // Determine what to do based on building type
        const targetBuilding = buildings.find(b => b.id === creature.targetBuilding);
        if (targetBuilding?.type === 'corpse_pile' && creature.carriedAmount > 0) {
          console.log(
            `📦 ${new Date().toLocaleTimeString()} Creature ${creature.id} dropping off resources`
          );
          newCreature.carriedAmount = 0;
          newCreature.status = 'idle';
          newCreature.targetBuilding = undefined;
        } else {
          console.log(
            `🔨 ${new Date().toLocaleTimeString()} Creature ${creature.id} starting work`
          );
          newCreature.status = 'working';
        }

        return newCreature;
      } else {
        // Move towards target
        const moveSpeed = creatureData.speed * deltaTime * 50;
        const actualMoveDistance = Math.min(moveSpeed, distance);

        return {
          ...creature,
          x: creature.x + (dx / distance) * actualMoveDistance,
          y: creature.y + (dy / distance) * actualMoveDistance,
        };
      }
    });
  }

  /**
   * Handle creatures working at buildings
   */
  static updateCreatureWork(
    creatures: CreatureState[],
    buildings: BuildingState[]
  ): { creatures: CreatureState[]; buildings: BuildingState[] } {
    const updatedBuildings = [...buildings];

    const updatedCreatures = creatures.map(creature => {
      if (creature.status !== 'working' || !creature.targetBuilding) {
        return creature;
      }

      const targetBuilding = buildings.find(b => b.id === creature.targetBuilding);
      if (!targetBuilding || targetBuilding.type === 'corpse_pile') {
        return { ...creature, status: 'idle' as CreatureStatus, targetBuilding: undefined };
      }

      const creatureData = getCreatureData(creature.type);

      if (creature.carriedAmount < creatureData.capacity && targetBuilding.production >= 1) {
        const collectAmount = Math.min(
          creatureData.capacity - creature.carriedAmount,
          Math.floor(targetBuilding.production),
          1
        );

        console.log(
          `📦 ${new Date().toLocaleTimeString()} Creature ${creature.id} collecting ${collectAmount}`
        );

        // Update building production
        const buildingIndex = updatedBuildings.findIndex(b => b.id === targetBuilding.id);
        if (buildingIndex !== -1) {
          updatedBuildings[buildingIndex] = {
            ...updatedBuildings[buildingIndex],
            production: updatedBuildings[buildingIndex].production - collectAmount,
          };
        }

        const newCreature = { ...creature, carriedAmount: creature.carriedAmount + collectAmount };

        if (newCreature.carriedAmount >= creatureData.capacity) {
          console.log(`🎒 ${new Date().toLocaleTimeString()} Creature ${creature.id} at capacity`);
          newCreature.status = 'idle';
          newCreature.targetBuilding = undefined;
        }

        return newCreature;
      } else {
        return { ...creature, status: 'idle' as CreatureStatus, targetBuilding: undefined };
      }
    });

    return { creatures: updatedCreatures, buildings: updatedBuildings };
  }
}
