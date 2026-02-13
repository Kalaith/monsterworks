/**
 * BuildingPanel component - shows available buildings for placement
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, useGameActions } from '../../stores/gameStore';
import { BUILDINGS } from '../../data/gameData';
import { Card } from '../ui/Card';
import type { BuildingType } from '../../types/game';
import { cn } from '../../utils/cn';

interface BuildingItemProps {
  type: BuildingType;
  isSelected: boolean;
  canAfford: boolean;
  onSelect: (type: BuildingType) => void;
}

const BuildingItem = React.memo<BuildingItemProps>(({ type, isSelected, canAfford, onSelect }) => {
  const buildingData = BUILDINGS[type];

  const costText = Object.entries(buildingData.cost)
    .map(([resource, amount]) => `${amount} ${resource}`)
    .join(', ');

  return (
    <motion.div
      whileHover={{ scale: canAfford ? 1.02 : 1 }}
      whileTap={{ scale: canAfford ? 0.98 : 1 }}
      className={cn(
        'p-3 rounded-lg border-2 cursor-pointer transition-all duration-fast',
        'flex flex-col items-center text-center gap-2',
        'min-h-[100px] justify-center',
        isSelected && 'border-primary bg-primary text-white shadow-md',
        !isSelected && 'border-card-border bg-surface hover:border-primary text-text',
        !canAfford && 'opacity-50 cursor-not-allowed hover:border-card-border'
      )}
      onClick={() => {
        console.log('BuildingItem clicked:', { type, canAfford, onSelect });
        onSelect(type);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-disabled={!canAfford}
    >
      <span className="text-2xl" role="img" aria-label={buildingData.name}>
        {buildingData.emoji}
      </span>

      <div className="flex flex-col gap-1">
        <span className={cn('font-medium text-sm', isSelected ? 'text-white' : 'text-text')}>
          {buildingData.name}
        </span>

        <span className={cn('text-xs', isSelected ? 'text-white/80' : 'text-text-muted')}>
          {costText}
        </span>
      </div>
    </motion.div>
  );
});

interface BuildingPanelProps {
  className?: string;
}

export const BuildingPanel = React.memo<BuildingPanelProps>(({ className }) => {
  const selectedBuildingType = useGameStore(state => state.selectedBuildingType);
  const { selectBuildingType, canAfford } = useGameActions();

  const buildingTypes = Object.keys(BUILDINGS) as BuildingType[];

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <span role="img" aria-label="Buildings">
            🏗️
          </span>
          Buildings
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {buildingTypes.map(type => (
            <BuildingItem
              key={type}
              type={type}
              isSelected={selectedBuildingType === type}
              canAfford={canAfford(BUILDINGS[type].cost)}
              onSelect={selectBuildingType}
            />
          ))}
        </div>

        {selectedBuildingType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-bg-1 rounded-lg border border-primary/20"
          >
            <p className="text-sm text-text-muted">
              Click on the canvas to place your selected building.
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
});
