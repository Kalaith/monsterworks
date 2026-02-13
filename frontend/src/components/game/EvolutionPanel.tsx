/**
 * Evolution Panel component for monster evolution system
 * Displays evolution trees and allows creature evolution
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { getCreatureData } from '../../data/gameData';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { CreatureType, CreatureState } from '../../types/game';

interface EvolutionPanelProps {
  selectedCreature?: CreatureState;
  onClose: () => void;
}

export function EvolutionPanel({ selectedCreature, onClose }: EvolutionPanelProps) {
  const { canEvolveCreature, evolveCreature, isCreatureUnlocked, canAfford } = useGameStore(
    state => state.actions
  );

  if (!selectedCreature) return null;

  const creatureData = getCreatureData(selectedCreature.type);
  const evolutionPaths = creatureData.evolvesTo || [];

  const handleEvolve = (targetType: CreatureType) => {
    if (canEvolveCreature(selectedCreature.id, targetType)) {
      evolveCreature(selectedCreature.id, targetType);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          exit={{ y: 20 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-red-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-red-400">
              Evolve {creatureData.emoji} {creatureData.name}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          <div className="mb-6">
            <Card className="p-4 bg-slate-800/50 border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{creatureData.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{creatureData.name}</h3>
                  <p className="text-slate-400 text-sm">Tier {creatureData.tier || 1} creature</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="text-slate-300">
                  <span className="text-slate-500">Speed:</span> {creatureData.speed}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Capacity:</span> {creatureData.capacity}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Tier:</span> {creatureData.tier || 1}
                </div>
              </div>
            </Card>
          </div>

          {evolutionPaths.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Evolution Paths</h3>
              <div className="space-y-3">
                {evolutionPaths.map(targetType => {
                  const targetData = getCreatureData(targetType);
                  const canEvolve = canEvolveCreature(selectedCreature.id, targetType);
                  const canAffordCost = targetData.evolutionCost
                    ? canAfford(targetData.evolutionCost)
                    : true;
                  const isUnlocked = isCreatureUnlocked(targetType);

                  return (
                    <motion.div
                      key={targetType}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border ${
                        canEvolve
                          ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30'
                          : 'bg-slate-800/30 border-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{targetData.emoji}</span>
                          <div>
                            <h4 className="font-semibold text-white">{targetData.name}</h4>
                            <p className="text-slate-400 text-sm">
                              Tier {targetData.tier || 1} creature
                            </p>

                            {/* Evolution requirements */}
                            {targetData.evolutionCost && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(targetData.evolutionCost).map(
                                  ([resource, amount]) => (
                                    <span
                                      key={resource}
                                      className={`px-2 py-1 rounded text-xs ${
                                        canAffordCost
                                          ? 'bg-green-900/30 text-green-300'
                                          : 'bg-red-900/30 text-red-300'
                                      }`}
                                    >
                                      {amount} {resource}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          {!isUnlocked ? (
                            <span className="text-red-400 text-sm">🔒 Locked</span>
                          ) : (
                            <Button
                              onClick={() => handleEvolve(targetType)}
                              disabled={!canEvolve}
                              variant={canEvolve ? 'primary' : 'secondary'}
                              size="sm"
                              className={canEvolve ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                              {canEvolve ? 'Evolve' : 'Cannot Evolve'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Stats comparison */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-slate-500">Speed</div>
                          <div
                            className={`font-semibold ${
                              targetData.speed > creatureData.speed
                                ? 'text-green-400'
                                : targetData.speed < creatureData.speed
                                  ? 'text-red-400'
                                  : 'text-slate-300'
                            }`}
                          >
                            {targetData.speed > creatureData.speed && '+'}
                            {targetData.speed - creatureData.speed || targetData.speed}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-500">Capacity</div>
                          <div
                            className={`font-semibold ${
                              targetData.capacity > creatureData.capacity
                                ? 'text-green-400'
                                : targetData.capacity < creatureData.capacity
                                  ? 'text-red-400'
                                  : 'text-slate-300'
                            }`}
                          >
                            {targetData.capacity > creatureData.capacity && '+'}
                            {targetData.capacity - creatureData.capacity || targetData.capacity}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-500">Tier</div>
                          <div
                            className={`font-semibold ${
                              (targetData.tier || 1) > (creatureData.tier || 1)
                                ? 'text-green-400'
                                : (targetData.tier || 1) < (creatureData.tier || 1)
                                  ? 'text-red-400'
                                  : 'text-slate-300'
                            }`}
                          >
                            {targetData.tier || 1}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">🧬</div>
              <p className="text-slate-400">This creature has reached its final evolution.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
