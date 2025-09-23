import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { GameCanvas } from './GameCanvas';
import type { Position } from '../../types/game';

export const GameCanvasContainer: React.FC = () => {
  // Get state from store
  const buildings = useGameStore(state => state.buildings);
  const creatures = useGameStore(state => state.creatures);
  const selectedObject = useGameStore(state => state.selectedObject);
  
  // Start the game loop here instead of in the canvas
  useGameLoop();

  const handleCanvasClick = (position: Position) => {
    console.log('🖱️ Canvas clicked at:', position);
    const { buildings, creatures, selectedBuildingType, selectedCreatureType, actions } = useGameStore.getState();
    
    // If we have a building selected, place it
    if (selectedBuildingType) {
      console.log('🏗️ Placing building:', selectedBuildingType);
      actions.placeBuilding(selectedBuildingType, position);
      return;
    }

    // If we have a creature selected, spawn it
    if (selectedCreatureType) {
      console.log('🦄 Spawning creature:', selectedCreatureType);
      actions.spawnCreature(selectedCreatureType, position);
      return;
    }
    
    // Check if clicking on a building
    const clickedBuilding = buildings.find(building => {
      const distance = Math.sqrt(
        Math.pow(position.x - building.x, 2) + Math.pow(position.y - building.y, 2)
      );
      console.log(`Building ${building.id} at (${building.x}, ${building.y}), distance: ${distance}`);
      return distance <= 20;
    });

    if (clickedBuilding) {
      console.log('🏗️ Selected building:', clickedBuilding);
      actions.selectObject('building', clickedBuilding.id);
      actions.showInfo('building', clickedBuilding.id);
      return;
    }

    // Check if clicking on a creature
    const clickedCreature = creatures.find(creature => {
      const distance = Math.sqrt(
        Math.pow(position.x - creature.x, 2) + Math.pow(position.y - creature.y, 2)
      );
      return distance <= 12;
    });

    if (clickedCreature) {
      console.log('🦄 Selected creature:', clickedCreature);
      actions.selectObject('creature', clickedCreature.id);
      actions.showInfo('creature', clickedCreature.id);
      return;
    }

    // Clear selection if clicking empty space
    console.log('🚫 Clearing selection');
    actions.clearSelection();
    actions.hideInfo();
  };

  const handleCanvasRightClick = (position: Position) => {
    console.log('🖱️ Canvas right-clicked at:', position);
    const { selectedBuildingType, selectedCreatureType, actions } = useGameStore.getState();
    console.log('Selected building type:', selectedBuildingType);
    console.log('Selected creature type:', selectedCreatureType);

    if (selectedBuildingType) {
      console.log('🏗️ Placing building:', selectedBuildingType);
      actions.placeBuilding(selectedBuildingType, position);
    } else if (selectedCreatureType) {
      console.log('🦄 Spawning creature:', selectedCreatureType);
      actions.spawnCreature(selectedCreatureType, position);
    } else {
      console.log('⚠️ No building or creature selected');
    }
  };

  return (
    <GameCanvas
      buildings={buildings}
      creatures={creatures}
      selectedObject={selectedObject}
      onCanvasClick={handleCanvasClick}
      onCanvasRightClick={handleCanvasRightClick}
    />
  );
};