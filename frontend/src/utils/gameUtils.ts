/**
 * Game utility functions and classes
 * Converted from original JavaScript with TypeScript typing
 */

import type { 
  BuildingState, 
  CreatureState, 
  BuildingType, 
  CreatureType, 
  Position, 
  ResourceType,
  GameActions,
  GameState
} from '../types/game';
import { getBuildingData, getCreatureData, GAME_DATA, GAME_CONFIG } from '../data/gameData';

// ===== UTILITY FUNCTIONS =====

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

export function snapToGrid(x: number, y: number, gridSize: number = 50): Position {
  return {
    x: Math.round(x / gridSize) * gridSize + gridSize / 2,
    y: Math.round(y / gridSize) * gridSize + gridSize / 2
  };
}

export function pixelToGrid(x: number, y: number, gridSize: number = 50): { gridX: number; gridY: number } {
  return {
    gridX: Math.round(x / gridSize),
    gridY: Math.round(y / gridSize)
  };
}

export function gridToPixel(gridX: number, gridY: number, gridSize: number = 50): Position {
  return {
    x: gridX * gridSize,
    y: gridY * gridSize
  };
}

export function isValidPosition(x: number, y: number, canvasWidth = 1000, canvasHeight = 700): boolean {
  const gridSize = GAME_CONFIG.grid?.size || 50;
  return x >= gridSize/2 && x <= canvasWidth - gridSize/2 && 
         y >= gridSize/2 && y <= canvasHeight - gridSize/2;
}

export function isValidGridPosition(
  gridX: number, 
  gridY: number, 
  canvasWidth = 1000, 
  canvasHeight = 700,
  gridSize = 50
): boolean {
  const maxGridX = Math.floor(canvasWidth / gridSize);
  const maxGridY = Math.floor(canvasHeight / gridSize);
  
  return gridX >= 0 && gridX < maxGridX && gridY >= 0 && gridY < maxGridY;
}

export function isPositionOccupied(
  position: Position, 
  buildings: BuildingState[], 
  radius: number = 40
): boolean {
  return buildings.some(building => 
    calculateDistance(position, { x: building.x, y: building.y }) < radius
  );
}

// ===== BUILDING CLASS =====

export class Building {
  public id: string;
  public type: BuildingType;
  public x: number;
  public y: number;
  public production: number;
  public storage: Record<string, number>;
  public maxStorage: number;
  public isWorking: boolean;
  public workers: string[]; // Creature IDs
  public lastProduction: number;

  constructor(buildingState: BuildingState) {
    this.id = buildingState.id;
    this.type = buildingState.type;
    this.x = buildingState.x;
    this.y = buildingState.y;
    this.production = buildingState.production || 0;
    this.storage = buildingState.storage || {};
    this.maxStorage = buildingState.maxStorage || 20;
    this.isWorking = buildingState.isWorking || false;
    this.workers = buildingState.workers || [];
    this.lastProduction = 0;

    // Initialize storage for storage buildings
    const buildingData = getBuildingData(this.type);
    if (buildingData.storage) {
      Object.keys(GAME_DATA.resources).forEach(resource => {
        if (this.storage[resource] === undefined) {
          this.storage[resource] = 0;
        }
      });
    }
  }

  update(deltaTime: number, gameActions: GameActions): void {
    const buildingData = getBuildingData(this.type);
    this.lastProduction += deltaTime;

    // Handle resource production
    if (buildingData.produces && buildingData.rate && this.lastProduction >= 1) {
      const amount = buildingData.rate * Math.floor(this.lastProduction);
      
      if (buildingData.storage) {
        // Store in building
        this.storage[buildingData.produces] = Math.min(
          (this.storage[buildingData.produces] || 0) + amount,
          this.maxStorage
        );
      } else {
        // Add directly to game resources
        gameActions.addResource(buildingData.produces, amount);
      }
      
      this.lastProduction = this.lastProduction % 1;
      this.isWorking = true;
    }

    // Handle processing buildings (input -> output)
    if (buildingData.input && buildingData.output && this.lastProduction >= 2) {
      // This would need access to global resources to check availability
      // For now, we'll handle this in the game store
      this.lastProduction = 0;
    }
  }

  hasResource(resourceType: ResourceType): boolean {
    return (this.storage[resourceType] || 0) > 0;
  }

  takeResource(resourceType: ResourceType, amount: number = 1): number {
    const available = Math.min(this.storage[resourceType] || 0, amount);
    this.storage[resourceType] = (this.storage[resourceType] || 0) - available;
    return available;
  }

  storeResource(resourceType: ResourceType, amount: number): number {
    const buildingData = getBuildingData(this.type);
    if (!buildingData.storage) return 0;
    
    const totalStored = Object.values(this.storage).reduce((sum, val) => sum + val, 0);
    const canStore = Math.min(amount, this.maxStorage - totalStored);
    
    this.storage[resourceType] = (this.storage[resourceType] || 0) + canStore;
    return canStore;
  }

  getTotalStoredAmount(): number {
    return Object.values(this.storage).reduce((sum, val) => sum + val, 0);
  }

  getStorageInfo(): Array<{ resource: ResourceType; amount: number; emoji: string }> {
    return Object.entries(this.storage)
      .filter(([_, amount]) => amount > 0)
      .map(([resource, amount]) => ({
        resource: resource as ResourceType,
        amount,
        emoji: GAME_DATA.resources[resource as ResourceType]?.emoji || '?'
      }));
  }

  canAcceptWorker(): boolean {
    return this.workers.length < 2; // Max 2 workers per building
  }

  addWorker(creatureId: string): boolean {
    if (this.canAcceptWorker() && !this.workers.includes(creatureId)) {
      this.workers.push(creatureId);
      return true;
    }
    return false;
  }

  removeWorker(creatureId: string): void {
    this.workers = this.workers.filter(id => id !== creatureId);
  }

  toState(): BuildingState {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      production: this.production,
      storage: this.storage,
      maxStorage: this.maxStorage,
      isWorking: this.isWorking,
      workers: this.workers
    };
  }
}

// ===== CREATURE CLASS =====

export class Creature {
  public id: string;
  public type: CreatureType;
  public x: number;
  public y: number;
  public status: CreatureState['status'];
  public carriedAmount: number;
  public carriedResource?: ResourceType;
  public energy: number;
  public maxEnergy: number;
  public targetX?: number;
  public targetY?: number;
  public targetBuilding?: string;
  public task?: 'pickup' | 'deliver' | 'rest' | 'idle';
  public restTime: number;
  public workCooldown: number;

  constructor(creatureState: CreatureState) {
    this.id = creatureState.id;
    this.type = creatureState.type;
    this.x = creatureState.x;
    this.y = creatureState.y;
    this.status = creatureState.status || 'idle';
    this.carriedAmount = creatureState.carriedAmount || 0;
    this.energy = creatureState.energy || 100;
    this.maxEnergy = creatureState.maxEnergy || 100;
    this.restTime = 0;
    this.workCooldown = 0;
  }

  update(deltaTime: number, buildings: Building[], gameActions: GameActions): void {
    const creatureData = getCreatureData(this.type);
    
    this.workCooldown = Math.max(0, this.workCooldown - deltaTime);
    
    // Update energy
    if (this.status === 'resting') {
      this.energy = Math.min(
        this.maxEnergy,
        this.energy + (GAME_CONFIG.timing.restRate * deltaTime) / 1000
      );
      this.restTime += deltaTime;
      
      // Stop resting when fully rested or after minimum rest time
      if (this.energy >= this.maxEnergy * 0.9 || this.restTime >= 3) {
        this.status = 'idle';
        this.restTime = 0;
        this.targetBuilding = undefined;
      }
    } else {
      this.energy = Math.max(
        0,
        this.energy - (GAME_CONFIG.timing.energyDecayRate * deltaTime) / 1000
      );
    }

    // Check if creature needs rest
    if (this.energy < 20 && this.status !== 'resting') {
      this.findRestLocation(buildings);
      return;
    }

    // Handle movement
    this.updateMovement(deltaTime, creatureData.speed);

    // Find work if idle and not tired
    if (this.status === 'idle' && this.workCooldown <= 0 && this.energy > 50) {
      this.findWork(buildings, gameActions);
    }

    // Handle work at target location
    if (this.isAtTarget() && this.targetBuilding && this.workCooldown <= 0) {
      const targetBuilding = buildings.find(b => b.id === this.targetBuilding);
      if (targetBuilding) {
        this.handleWork(targetBuilding, gameActions);
      }
    }
  }

  private updateMovement(deltaTime: number, speed: number): void {
    if (this.targetX === undefined || this.targetY === undefined) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) {
      const moveSpeed = speed * 30 * deltaTime; // pixels per second
      this.x += (dx / distance) * moveSpeed;
      this.y += (dy / distance) * moveSpeed;
    }
  }

  private isAtTarget(): boolean {
    if (this.targetX === undefined || this.targetY === undefined) return false;
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    return Math.sqrt(dx * dx + dy * dy) < 8;
  }

  private findWork(buildings: Building[], gameActions: GameActions): void {
    if (this.carriedAmount === 0) {
      // Find resources to pick up
      const source = this.findResourceSource(buildings, gameActions);
      if (source) {
        this.setTarget(source);
        this.task = 'pickup';
        this.status = 'traveling';
      }
    } else {
      // Find place to deliver
      const destination = this.findDeliveryLocation(buildings);
      if (destination) {
        this.setTarget(destination);
        this.task = 'deliver';
        this.status = 'traveling';
      }
    }
  }

  private findResourceSource(buildings: Building[], gameActions: GameActions): Building | null {
    const creatureData = getCreatureData(this.type);
    
    // Look for production buildings with resources to pickup
    const producers = buildings.filter(building => {
      const buildingData = getBuildingData(building.type);
      if (!buildingData.produces) return false;
      
      const resourceType = buildingData.produces;
      return this.canCarry(resourceType) && 
             (building.hasResource(resourceType) || !buildingData.storage);
    });

    if (producers.length > 0) {
      // Find closest producer
      return producers.reduce((closest, building) => {
        const distance = calculateDistance(this, building);
        return !closest || distance < calculateDistance(this, closest) 
          ? building 
          : closest;
      });
    }

    // Look for storage buildings with resources
    const storageBuildings = buildings.filter(building => {
      const buildingData = getBuildingData(building.type);
      if (!buildingData.storage) return false;
      
      return Object.keys(building.storage).some(resource => 
        building.storage[resource] > 0 && this.canCarry(resource as ResourceType)
      );
    });

    if (storageBuildings.length > 0) {
      return storageBuildings.reduce((closest, building) => {
        const distance = calculateDistance(this, building);
        return !closest || distance < calculateDistance(this, closest) 
          ? building 
          : closest;
      });
    }

    return null;
  }

  private findDeliveryLocation(buildings: Building[]): Building | null {
    // Find warehouses with available storage space
    const warehouses = buildings.filter(building => {
      const buildingData = getBuildingData(building.type);
      return buildingData.storage && building.getTotalStoredAmount() < building.maxStorage;
    });

    if (warehouses.length > 0) {
      return warehouses.reduce((closest, building) => {
        const distance = calculateDistance(this, building);
        return !closest || distance < calculateDistance(this, closest) 
          ? building 
          : closest;
      });
    }

    return null;
  }

  private findRestLocation(buildings: Building[]): void {
    const homes = buildings.filter(building => building.type === 'corpse_pile');
    
    if (homes.length > 0) {
      const nearestHome = homes.reduce((closest, building) => {
        const distance = calculateDistance(this, building);
        return !closest || distance < calculateDistance(this, closest) 
          ? building 
          : closest;
      });
      
      this.setTarget(nearestHome);
      this.status = 'traveling';
      this.task = 'rest';
    } else {
      // Rest in place if no home available
      this.status = 'resting';
      this.task = 'rest';
    }
  }

  private canCarry(resourceType: ResourceType): boolean {
    const creatureData = getCreatureData(this.type);
    
    if (this.carriedAmount >= creatureData.capacity) return false;
    
    const specialties = creatureData.specialties;
    if (specialties.includes('any') || specialties.includes('general')) return true;
    
    // Resource category mapping
    const resourceCategories: Record<ResourceType, string[]> = {
      flesh: ['liquid', 'general'],
      bone: ['heavy', 'construction'],
      fungus: ['general', 'light'],
      ichor: ['magical', 'liquid'],
      fire_cores: ['fire', 'heavy'],
      dark_crystals: ['magical', 'delicate'],
      corrupted_water: ['liquid', 'corruption'],
      shadow_essence: ['magical', 'fragile'],
      rusted_weapons: ['heavy', 'metal'],
      torn_cloth: ['light', 'silk'],
      stolen_knowledge: ['light', 'magical'],
      mutagen: ['magical', 'delicate'],
      evolution_essence: ['magical', 'fragile'],
      loyalty: ['general', 'any']
    };
    
    const categories = resourceCategories[resourceType] || [];
    return specialties.some(spec => categories.includes(spec));
  }

  private setTarget(building: Building): void {
    this.targetBuilding = building.id;
    // Add some randomness to target position to avoid clustering
    this.targetX = building.x + (Math.random() - 0.5) * 30;
    this.targetY = building.y + (Math.random() - 0.5) * 30;
  }

  private handleWork(building: Building, gameActions: GameActions): void {
    if (this.task === 'pickup') {
      this.handlePickup(building, gameActions);
    } else if (this.task === 'deliver') {
      this.handleDelivery(building, gameActions);
    } else if (this.task === 'rest') {
      this.status = 'resting';
      this.task = 'idle';
      this.targetBuilding = undefined;
    }
  }

  private handlePickup(building: Building, gameActions: GameActions): void {
    const buildingData = getBuildingData(building.type);
    let pickedUp = false;

    if (buildingData.produces && !buildingData.storage) {
      // Pick up from production building (take from global resources)
      const resourceType = buildingData.produces;
      if (this.canCarry(resourceType)) {
        // This would need to check global resources and reduce them
        // For now, we'll handle this logic in the game store
        pickedUp = true;
        this.carriedResource = resourceType;
        this.carriedAmount = 1;
      }
    } else if (buildingData.storage) {
      // Pick up from storage building
      for (const [resource, amount] of Object.entries(building.storage)) {
        if (amount > 0 && this.canCarry(resource as ResourceType) && this.carriedAmount < getCreatureData(this.type).capacity) {
          const taken = building.takeResource(resource as ResourceType, 1);
          if (taken > 0) {
            this.carriedResource = resource as ResourceType;
            this.carriedAmount += taken;
            pickedUp = true;
            break;
          }
        }
      }
    }

    if (pickedUp) {
      this.status = 'idle'; // Will find delivery work next
      this.task = 'idle';
      this.targetBuilding = undefined;
      this.workCooldown = 0.5;
    } else {
      this.status = 'idle';
      this.task = 'idle';
      this.targetBuilding = undefined;
      this.workCooldown = 1;
    }
  }

  private handleDelivery(building: Building, gameActions: GameActions): void {
    const buildingData = getBuildingData(building.type);
    
    if (buildingData.storage && this.carriedAmount > 0 && this.carriedResource) {
      const stored = building.storeResource(this.carriedResource, this.carriedAmount);
      
      if (stored > 0) {
        this.carriedAmount -= stored;
        if (this.carriedAmount <= 0) {
          this.carriedResource = undefined;
        }
      } else {
        // Couldn't store, add back to global resources
        gameActions.addResource(this.carriedResource, this.carriedAmount);
        this.carriedAmount = 0;
        this.carriedResource = undefined;
      }
    }

    if (this.carriedAmount <= 0) {
      this.status = 'idle';
      this.task = 'idle';
      this.targetBuilding = undefined;
      this.workCooldown = 0.5;
    }
  }

  getStatusColor(): string {
    switch (this.status) {
      case 'idle': return '#666';
      case 'working': return '#32a852';
      case 'traveling': return '#f39c12';
      case 'resting': return '#9b59b6';
      default: return '#000';
    }
  }

  toState(): CreatureState {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      status: this.status,
      carriedAmount: this.carriedAmount,
      energy: this.energy,
      maxEnergy: this.maxEnergy
    };
  }
}