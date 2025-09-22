/**
 * GameHeader component - main header with title and resource display
 */

import React from 'react';
import { motion } from 'framer-motion';
import { StreamlinedResourceDisplay } from './StreamlinedResourceDisplay';
import { useGameStore } from '../../stores/gameStore';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface GameHeaderProps {
  className?: string;
  onEvolutionTest?: () => void;
}

export function GameHeader({ className, onEvolutionTest }: GameHeaderProps) {
  const { creatures } = useGameStore();
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between',
        'p-4 bg-surface border-b border-card-border',
        'gap-4',
        className
      )}
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl sm:text-3xl font-bold text-text flex items-center gap-2"
      >
        <span role="img" aria-label="Monster">👹</span>
        Monsterworks: Dark Industry
      </motion.h1>
      
      <div className="flex items-center gap-4">
        {onEvolutionTest && creatures.length > 0 && (
          <Button
            onClick={onEvolutionTest}
            variant="secondary"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            🧬 Test Evolution
          </Button>
        )}
        <StreamlinedResourceDisplay className="flex-shrink-0" />
      </div>
    </motion.header>
  );
}