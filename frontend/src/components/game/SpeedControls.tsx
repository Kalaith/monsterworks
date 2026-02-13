/**
 * SpeedControls component - game speed and pause controls
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, useGameActions } from '../../stores/gameStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

interface SpeedControlsProps {
  className?: string;
}

export function SpeedControls({ className }: SpeedControlsProps) {
  const gameSpeed = useGameStore(state => state.gameSpeed);
  const isPaused = useGameStore(state => state.isPaused);
  const { setGameSpeed, togglePause } = useGameActions();

  const speedOptions = [
    { speed: 0.5, label: '0.5x', emoji: '🐌' },
    { speed: 1, label: '1x', emoji: '▶️' },
    { speed: 2, label: '2x', emoji: '⏩' },
    { speed: 4, label: '4x', emoji: '⚡' },
  ];

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <span role="img" aria-label="Speed">
            ⚡
          </span>
          Game Speed
        </h3>

        <div className="flex flex-col gap-3">
          {/* Pause/Resume Button */}
          <Button
            variant={isPaused ? 'primary' : 'secondary'}
            onClick={togglePause}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <span role="img" aria-label={isPaused ? 'Resume' : 'Pause'}>
              {isPaused ? '▶️' : '⏸️'}
            </span>
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          {/* Speed Controls */}
          <div className="grid grid-cols-2 gap-2">
            {speedOptions.map(({ speed, label, emoji }) => (
              <motion.button
                key={speed}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGameSpeed(speed)}
                className={cn(
                  'p-2 rounded border-2 transition-all duration-fast',
                  'flex items-center justify-center gap-1',
                  'text-sm font-medium',
                  gameSpeed === speed && 'border-primary bg-primary text-white shadow-sm',
                  gameSpeed !== speed &&
                    'border-card-border bg-surface text-text hover:border-primary hover:bg-bg-1'
                )}
                disabled={isPaused}
                aria-pressed={gameSpeed === speed}
              >
                <span role="img" aria-label={`Speed ${label}`}>
                  {emoji}
                </span>
                {label}
              </motion.button>
            ))}
          </div>

          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 p-2 bg-bg-3 rounded border border-success/20 text-center"
          >
            <span className="text-sm text-text-muted">
              {isPaused ? 'Game Paused' : `Running at ${gameSpeed}x speed`}
            </span>
          </motion.div>
        </div>
      </div>
    </Card>
  );
}
