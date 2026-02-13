/**
 * Creature spawning and management logic
 */

import type { CreatureState, CreatureType, Position, ResourceCost } from '../types/game';
import { getCreatureData, snapToGrid, isValidPosition, gameConfig } from '../data/gameData';

export class CreatureService {
  /**
   * Validate if a creature can be spawned at the given position
   */
  static canSpawnCreature(
    type: CreatureType,
    position: Position,
    existingCreatures: CreatureState[],
    canAfford: (cost: ResourceCost) => boolean,
    isCreatureUnlocked: (type: CreatureType) => boolean
  ): { canSpawn: boolean; reason?: string } {
    const creatureData = getCreatureData(type);

    // Check creature limit
    if (existingCreatures.length >= gameConfig.limits.maxCreatures) {
      return {
        canSpawn: false,
        reason: `Maximum creature limit reached (${gameConfig.limits.maxCreatures})!`,
      };
    }

    // Check if creature type is unlocked
    if (!isCreatureUnlocked(type)) {
      return { canSpawn: false, reason: `${creatureData.name} is not yet unlocked!` };
    }

    // Check if we can afford it
    if (!canAfford(creatureData.cost)) {
      return { canSpawn: false, reason: 'Not enough resources!' };
    }

    // Check if position is valid
    const snappedPos = snapToGrid(position.x, position.y);
    if (!isValidPosition(snappedPos.x, snappedPos.y)) {
      return { canSpawn: false, reason: 'Cannot spawn creature outside the map boundaries!' };
    }

    return { canSpawn: true };
  }

  /**
   * Create a new creature instance
   */
  static createCreature(type: CreatureType, position: Position): CreatureState {
    const snappedPos = snapToGrid(position.x, position.y);

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: snappedPos.x,
      y: snappedPos.y,
      status: 'idle',
      carriedAmount: 0,
      energy: 100,
      maxEnergy: 100,
    };
  }
}
