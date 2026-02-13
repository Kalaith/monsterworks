/**
 * ResourceDisplay component - shows current resource amounts
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { RESOURCES } from '../../data/gameData';
import type { ResourceType } from '../../types/game';
import { cn } from '../../utils/cn';

interface ResourceItemProps {
  type: ResourceType;
  amount: number;
  index: number;
}

function ResourceItem({ type, amount, index }: ResourceItemProps) {
  const resourceData = RESOURCES[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2',
        'bg-surface rounded-lg border border-card-border',
        'transition-all duration-fast hover:shadow-sm'
      )}
    >
      <span className="text-lg" role="img" aria-label={resourceData.name}>
        {resourceData.emoji}
      </span>
      <span
        className="font-medium text-text min-w-[2rem] text-right"
        style={{ color: amount > 0 ? resourceData.color : undefined }}
      >
        {amount}
      </span>
      <span className="sr-only">{resourceData.name}</span>
    </motion.div>
  );
}

interface ResourceDisplayProps {
  className?: string;
}

export function ResourceDisplay({ className }: ResourceDisplayProps) {
  const actions = useGameStore(state => state.actions);

  // Get all resource types and their total amounts
  const resourceEntries = Object.keys(RESOURCES).map(type => {
    const resourceType = type as ResourceType;
    const totalAmount = actions.getTotalResource(resourceType);
    return [resourceType, totalAmount] as [ResourceType, number];
  });

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {resourceEntries.map(([type, amount], index) => (
        <ResourceItem key={type} type={type} amount={amount} index={index} />
      ))}
    </div>
  );
}
