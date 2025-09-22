/**
 * CreaturePanel component - shows available creatures for spawning
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, useGameActions } from '../../stores/gameStore';
import { CREATURES } from '../../data/gameData';
import { Card } from '../ui/Card';
import type { CreatureType } from '../../types/game';
import { cn } from '../../utils/cn';

interface CreatureItemProps {
  type: CreatureType;
  isSelected: boolean;
  canAfford: boolean;
  onSelect: (type: CreatureType) => void;
}

function CreatureItem({ type, isSelected, canAfford, onSelect }: CreatureItemProps) {
  const creatureData = CREATURES[type];
  
  const costText = Object.entries(creatureData.cost)
    .map(([resource, amount]) => `${amount} ${resource}`)
    .join(', ');

  const statsText = `${creatureData.capacity} cap • ${creatureData.speed} spd`;

  return (
    <motion.div
      whileHover={{ scale: canAfford ? 1.02 : 1 }}
      whileTap={{ scale: canAfford ? 0.98 : 1 }}
      className={cn(
        'p-3 rounded-lg border-2 cursor-pointer transition-all duration-fast',
        'flex flex-col items-center text-center gap-2',
        'min-h-[120px] justify-center',
        isSelected && 'border-primary bg-primary text-white shadow-md',
        !isSelected && 'border-card-border bg-surface hover:border-primary text-text',
        !canAfford && 'opacity-50 cursor-not-allowed hover:border-card-border'
      )}
      onClick={() => canAfford && onSelect(type)}
      role="button"
      tabIndex={canAfford ? 0 : -1}
      aria-pressed={isSelected}
      aria-disabled={!canAfford}
    >
      <span 
        className="text-2xl" 
        role="img" 
        aria-label={creatureData.name}
      >
        {creatureData.emoji}
      </span>
      
      <div className="flex flex-col gap-1">
        <span className={cn(
          'font-medium text-sm',
          isSelected ? 'text-white' : 'text-text'
        )}>
          {creatureData.name}
        </span>
        
        <span className={cn(
          'text-xs',
          isSelected ? 'text-white/80' : 'text-text-muted'
        )}>
          {statsText}
        </span>
        
        <span className={cn(
          'text-xs',
          isSelected ? 'text-white/70' : 'text-text-muted'
        )}>
          {costText}
        </span>
      </div>
    </motion.div>
  );
}

interface CreaturePanelProps {
  className?: string;
}

export function CreaturePanel({ className }: CreaturePanelProps) {
  const selectedCreatureType = useGameStore((state) => state.selectedCreatureType);
  const creatures = useGameStore((state) => state.creatures);
  const { selectCreatureType, canAfford } = useGameActions();

  const creatureTypes = Object.keys(CREATURES) as CreatureType[];

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <span role="img" aria-label="Creatures">🐾</span>
          Creatures ({creatures.length}/50)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {creatureTypes.map((type) => (
            <CreatureItem
              key={type}
              type={type}
              isSelected={selectedCreatureType === type}
              canAfford={canAfford(CREATURES[type].cost)}
              onSelect={selectCreatureType}
            />
          ))}
        </div>
        
        {selectedCreatureType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-bg-2 rounded-lg border border-warning/20"
          >
            <p className="text-sm text-text-muted">
              Right-click on the canvas to spawn your selected creature
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}