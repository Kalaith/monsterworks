/**
 * Building placement and validation logic
 */

import type { BuildingState, BuildingType, Position, ResourceCost } from '../types/game';
import { getBuildingData, snapToGrid, isValidPosition } from '../data/gameData';

export class BuildingService {
  /**
   * Validate if a building can be placed at the given position
   */
  static canPlaceBuilding(
    type: BuildingType,
    position: Position,
    existingBuildings: BuildingState[],
    canAfford: (cost: ResourceCost) => boolean,
    isBuildingUnlocked: (type: BuildingType) => boolean
  ): { canPlace: boolean; reason?: string } {
    const buildingData = getBuildingData(type);

    // Check if building type is unlocked
    if (!isBuildingUnlocked(type)) {
      return { canPlace: false, reason: `${buildingData.name} is not yet unlocked!` };
    }

    // Check if we can afford it
    if (!canAfford(buildingData.cost)) {
      return { canPlace: false, reason: 'Not enough resources!' };
    }

    // Snap to grid
    const snappedPos = snapToGrid(position.x, position.y);

    // Check if position is valid
    if (!isValidPosition(snappedPos.x, snappedPos.y)) {
      return { canPlace: false, reason: 'Cannot place building outside the map boundaries!' };
    }

    // Check for overlapping buildings
    const hasOverlap = existingBuildings.some(building => {
      const buildingGridX = Math.round((building.x - 25) / 50);
      const buildingGridY = Math.round((building.y - 25) / 50);
      const newGridX = Math.round((snappedPos.x - 25) / 50);
      const newGridY = Math.round((snappedPos.y - 25) / 50);

      return buildingGridX === newGridX && buildingGridY === newGridY;
    });

    if (hasOverlap) {
      return { canPlace: false, reason: 'Cannot place building here - space is occupied!' };
    }

    return { canPlace: true };
  }

  /**
   * Create a new building instance
   */
  static createBuilding(type: BuildingType, position: Position): BuildingState {
    const buildingData = getBuildingData(type);
    const snappedPos = snapToGrid(position.x, position.y);

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: snappedPos.x,
      y: snappedPos.y,
      production: 0,
      storage: {},
      maxStorage: buildingData.storage || 20,
      isWorking: false,
      workers: [],
    };
  }
}
