/**
 * Debug component to test inventory and building placement
 */

import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { BUILDINGS } from '../../data/gameData';
import { Button } from '../ui/Button';

export function DebugPanel() {
  const { inventory, actions } = useGameStore();

  const testBuildingPlacement = () => {
    // Test placing a bone kiln at a fixed position
    const result = actions.placeBuilding('bone_kiln', { x: 500, y: 300 });
    console.log('Building placement result:', result);
  };

  const logInventoryState = () => {
    console.log('Current inventory state:', inventory);
    console.log('Total flesh:', actions.getTotalResource('flesh'));
    console.log('Total bone:', actions.getTotalResource('bone'));
    
    // Test affordability
    const boneKilnCost = BUILDINGS.bone_kiln.cost;
    console.log('Bone kiln cost:', boneKilnCost);
    console.log('Can afford bone kiln:', actions.canAfford(boneKilnCost));
  };

  return (
    <div className="fixed bottom-4 left-4 bg-surface border border-card-border rounded p-4 space-y-2">
      <h4 className="font-semibold text-sm">Debug Panel</h4>
      <div className="space-y-1">
        <Button
          size="sm"
          onClick={logInventoryState}
          className="w-full text-xs"
        >
          Log Inventory
        </Button>
        <Button
          size="sm"
          onClick={testBuildingPlacement}
          className="w-full text-xs"
        >
          Test Building
        </Button>
      </div>
      <div className="text-xs text-text-muted">
        <div>Flesh: {actions.getTotalResource('flesh')}</div>
        <div>Bone: {actions.getTotalResource('bone')}</div>
      </div>
    </div>
  );
}