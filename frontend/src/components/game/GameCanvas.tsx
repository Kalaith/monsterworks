import React, { useRef, useEffect, useCallback } from 'react';
import type { Position, BuildingState, CreatureState, BuildingType, CreatureType } from '../../types/game';
import { getBuildingData, getCreatureData, GAME_DATA } from '../../data/gameData';

interface GameCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  buildings: BuildingState[];
  creatures: CreatureState[];
  selectedObject?: { type: 'building' | 'creature'; id: string } | null;
  onCanvasClick?: (position: Position) => void;
  onCanvasRightClick?: (position: Position) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = React.memo(({ 
  width = 1000, 
  height = 700, 
  className = '',
  buildings,
  creatures,
  selectedObject,
  onCanvasClick,
  onCanvasRightClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle canvas clicks
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('🎯 GameCanvas handleCanvasClick triggered');
    if (!onCanvasClick) {
      console.log('⚠️ No onCanvasClick handler provided');
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('⚠️ No canvas ref');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const position: Position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    console.log('🎯 Calling onCanvasClick with position:', position);
    onCanvasClick(position);
  }, [onCanvasClick]);

  // Handle right-click for placing buildings/creatures
  const handleCanvasRightClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('🎯 GameCanvas handleCanvasRightClick triggered');
    if (!onCanvasRightClick) {
      console.log('⚠️ No onCanvasRightClick handler provided');
      return;
    }
    
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('⚠️ No canvas ref');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const position: Position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    console.log('🎯 Calling onCanvasRightClick with position:', position);
    onCanvasRightClick(position);
  }, [onCanvasRightClick]);

  // Pure render function - no state dependencies
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw buildings
    buildings.forEach(building => {
      drawBuilding(ctx, building);
    });

    // Draw creatures
    creatures.forEach(creature => {
      drawCreature(ctx, creature);
    });

    // Draw selection indicator
    if (selectedObject) {
      const target = selectedObject.type === 'building' 
        ? buildings.find(b => b.id === selectedObject.id)
        : creatures.find(c => c.id === selectedObject.id);
      
      if (target) {
        drawSelectionIndicator(ctx, target.x, target.y);
      }
    }
  }, [buildings, creatures, selectedObject]);

  // Grid drawing function
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Building drawing function
  const drawBuilding = (ctx: CanvasRenderingContext2D, building: BuildingState) => {
    const buildingData = getBuildingData(building.type);
    
    // Draw building emoji
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(buildingData.emoji, building.x, building.y + 10);

    // Show production indicator and current production level
    if (buildingData.produces) {
      const resourceData = GAME_DATA.resources[buildingData.produces];
      ctx.font = '12px Arial';
      ctx.fillText(resourceData.emoji, building.x, building.y - 15);
      
      // Show production amount (display actual production progress toward next unit)
      ctx.font = '10px Arial';
      ctx.fillStyle = '#0066cc';
      const productionProgress = (building.production % 1); // Show fractional progress toward next unit
      const displayValue = Math.floor(productionProgress * 100); // Show as percentage
      ctx.fillText(`${displayValue}%`, building.x, building.y - 25);
    }

    // Show storage levels with current/max
    if (building.maxStorage && building.maxStorage > 0) {
      const totalStored = Object.values(building.storage || {}).reduce((sum, amount) => 
        sum + (typeof amount === 'number' ? amount : 0), 0
      );
      
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText(`${Math.floor(totalStored)}/${building.maxStorage}`, building.x, building.y + 30);
    }

    // Show individual stored resources
    if (buildingData.storage && building.storage) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#333';
      let yOffset = 40;
      Object.entries(building.storage).forEach(([resource, amount]) => {
        if (typeof amount === 'number' && amount > 0) {
          const resourceData = GAME_DATA.resources[resource as keyof typeof GAME_DATA.resources];
          if (resourceData) {
            ctx.fillText(`${resourceData.emoji}${Math.floor(amount)}`, building.x, building.y + yOffset);
            yOffset += 12;
          }
        }
      });
    }

    // Show number of workers
    const workerCount = building.workers?.length || 0;
    if (workerCount > 0) {
      ctx.font = '8px Arial';
      ctx.fillStyle = '#28a745';
      ctx.fillText(`👷${workerCount}`, building.x + 20, building.y - 10);
    }

    ctx.fillStyle = '#000';
  };

  // Creature drawing function
  const drawCreature = (ctx: CanvasRenderingContext2D, creature: CreatureState) => {
    const creatureData = getCreatureData(creature.type);
    
    // Draw creature emoji
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(creatureData.emoji, creature.x, creature.y + 6);

    // Show carrying indicator with amount
    if (creature.carriedAmount > 0) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#ff8c00';
      const carriedValue = Math.floor(creature.carriedAmount * 10);
      const maxCarried = creatureData.capacity * 10;
      ctx.fillText(`📦${Math.min(carriedValue, maxCarried)}/${maxCarried}`, creature.x, creature.y - 12);
    }

    // Show status indicator
    ctx.font = '8px Arial';
    ctx.fillStyle = getStatusColor(creature.status);
    ctx.fillText(creature.status, creature.x, creature.y + 20);

    // Show energy bar
    const barWidth = 16;
    const barHeight = 2;
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(creature.x - barWidth/2, creature.y - 18, barWidth, barHeight);
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(creature.x - barWidth/2, creature.y - 18, (creature.energy / 100) * barWidth, barHeight);
    
    ctx.fillStyle = '#000';
  };

  // Selection indicator
  const drawSelectionIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#32a852';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.stroke();
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'idle': return '#666';
      case 'working': return '#32a852';
      case 'traveling': return '#f39c12';
      case 'resting': return '#9b59b6';
      default: return '#000';
    }
  };

  // Re-render when props change
  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="game-canvas-container relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 ${className}`}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
        style={{ 
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
});

export default GameCanvas;