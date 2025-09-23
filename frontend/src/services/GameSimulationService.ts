/**
 * Core game simulation logic - handles production, AI, and game state updates
 */

import type { BuildingState, CreatureState, InventoryState, ResourceType, InventoryType } from '../types/game';
import { getBuildingData, getCreatureData, getResourceInventoryCategory } from '../data/gameData';

// Utility function - moved from store
function calculateDistance(pos1: { x: number, y: number }, pos2: { x: number, y: number }): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

export class GameSimulationService {
  /**
   * Update building production based on time elapsed
   */
  static updateBuildingProduction(buildings: BuildingState[], deltaTime: number): BuildingState[] {
    return buildings.map(building => {
      const buildingData = getBuildingData(building.type);
      
      if (buildingData.produces && buildingData.rate) {
        const productionAmount = buildingData.rate * deltaTime * 10; // 10x faster production
        return {
          ...building,
          production: building.production + productionAmount
        };
      }
      
      return building;
    });
  }

  /**
   * Process completed production and add to inventory
   */
  static processCompletedProduction(
    buildings: BuildingState[], 
    inventory: InventoryState
  ): { buildings: BuildingState[], inventory: InventoryState } {
    let updatedInventory = { ...inventory };
    
    const updatedBuildings = buildings.map(building => {
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

    return { buildings: updatedBuildings, inventory: updatedInventory };
  }

  /**
   * Update creature energy based on their status
   */
  static updateCreatureEnergy(creatures: CreatureState[], deltaTime: number): CreatureState[] {
    return creatures.map(creature => {
      let newEnergy = creature.energy;

      if (creature.status === 'resting') {
        newEnergy = Math.min(creature.maxEnergy, creature.energy + (0.5 * deltaTime));
      } else {
        newEnergy = Math.max(0, creature.energy - (0.1 * deltaTime));
      }

      return { ...creature, energy: newEnergy };
    });
  }
}