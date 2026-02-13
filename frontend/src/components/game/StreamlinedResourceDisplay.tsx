/**
 * StreamlinedResourceDisplay component - Factorio-style compact resource display
 * Shows only the most essential resources at the top of the screen
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { RESOURCES, getStreamlinedResources, inventoryCategories } from '../../data/gameData';
import type { ResourceType, InventoryType } from '../../types/game';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

interface StreamlinedResourceItemProps {
  type: ResourceType;
  totalAmount: number;
  index: number;
}

function StreamlinedResourceItem({ type, totalAmount, index }: StreamlinedResourceItemProps) {
  const resourceData = RESOURCES[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5',
        'bg-surface/90 backdrop-blur-sm rounded-md border border-card-border/50',
        'transition-all duration-fast hover:bg-surface hover:shadow-sm',
        'min-w-[80px]'
      )}
    >
      <span 
        className="text-base" 
        role="img" 
        aria-label={resourceData.name}
      >
        {resourceData.emoji}
      </span>
      <span 
        className="font-semibold text-text min-w-[2rem] text-right text-sm"
        style={{ color: totalAmount > 0 ? resourceData.color : '#666' }}
      >
        {totalAmount}
      </span>
    </motion.div>
  );
}

interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function InventoryDetailModal({ isOpen, onClose }: InventoryDetailModalProps) {
  const inventory = useGameStore((state) => state.inventory);
  const actions = useGameStore((state) => state.actions);
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-surface border border-card-border rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text">Detailed Inventory</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-text"
          >
            ✕
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(inventoryCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="space-y-3">
              <div className="border-b border-card-border pb-2">
                <h3 className="font-semibold text-text text-lg">{category.name}</h3>
                <p className="text-sm text-text-secondary">{category.description}</p>
              </div>
              
              <div className="space-y-2">
                {category.resources.map((resourceType) => {
                  const resourceData = RESOURCES[resourceType];
                  const amount = inventory[category.type as InventoryType][resourceType];
                  const totalAmount = actions.getTotalResource(resourceType);
                  
                  return (
                    <div 
                      key={resourceType}
                      className="flex items-center justify-between p-2 bg-surface-variant rounded border border-card-border/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{resourceData.emoji}</span>
                        <span className="text-sm font-medium text-text">{resourceData.name}</span>
                      </div>
                      <div className="text-right">
                        <div 
                          className="font-semibold text-sm"
                          style={{ color: amount > 0 ? resourceData.color : '#666' }}
                        >
                          {amount}
                        </div>
                        {totalAmount !== amount && (
                          <div className="text-xs text-text-secondary">
                            ({totalAmount} total)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-card-border">
          <p className="text-sm text-text-secondary">
            💡 Tip: Resources are automatically used from the most appropriate inventory. 
            Construction materials are used for buildings, base resources for creatures and production.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface StreamlinedResourceDisplayProps {
  className?: string;
}

export function StreamlinedResourceDisplay({ className }: StreamlinedResourceDisplayProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const actions = useGameStore((state) => state.actions);
  
  const streamlinedResources = getStreamlinedResources();

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Essential Resources */}
        <div className="flex gap-2">
          {streamlinedResources.map((type, index) => {
            const totalAmount = actions.getTotalResource(type);
            return (
              <StreamlinedResourceItem 
                key={type}
                type={type}
                totalAmount={totalAmount}
                index={index}
              />
            );
          })}
        </div>
        
        {/* More Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetailModal(true)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium',
            'bg-surface/60 hover:bg-surface border border-card-border/50',
            'text-text-secondary hover:text-text',
            'transition-all duration-fast'
          )}
        >
          ⋯ More
        </Button>
      </div>
      
      {/* Detailed Inventory Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <InventoryDetailModal 
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}