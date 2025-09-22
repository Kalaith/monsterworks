import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { getBuildingData, getCreatureData, GAME_DATA } from '../../data/gameData';
import type { Position } from '../../types/game';

interface GameCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width = 1000, 
  height = 700, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  
  const { 
    buildings, 
    creatures, 
    selectedObject, 
    selectedBuildingType, 
    selectedCreatureType,
    actions 
  } = useGameStore();

  // Start the game loop
  useGameLoop();

  // Handle canvas clicks
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on a building
    const clickedBuilding = buildings.find(building => {
      const distance = Math.sqrt(
        Math.pow(x - building.x, 2) + Math.pow(y - building.y, 2)
      );
      return distance <= 20;
    });

    if (clickedBuilding) {
      actions.selectObject('building', clickedBuilding.id);
      actions.showInfo('building', clickedBuilding.id);
      return;
    }

    // Check if clicking on a creature
    const clickedCreature = creatures.find(creature => {
      const distance = Math.sqrt(
        Math.pow(x - creature.x, 2) + Math.pow(y - creature.y, 2)
      );
      return distance <= 12;
    });

    if (clickedCreature) {
      actions.selectObject('creature', clickedCreature.id);
      actions.showInfo('creature', clickedCreature.id);
      return;
    }

    // Clear selection if clicking empty space
    actions.clearSelection();
    actions.hideInfo();
  }, [buildings, creatures, actions]);

  // Handle right-click for placing buildings/creatures
  const handleCanvasRightClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const position: Position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    if (selectedBuildingType) {
      actions.placeBuilding(selectedBuildingType, position);
    } else if (selectedCreatureType) {
      actions.spawnCreature(selectedCreatureType, position);
    }
  }, [selectedBuildingType, selectedCreatureType, actions]);

  // Render function
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
  const drawBuilding = (ctx: CanvasRenderingContext2D, building: any) => {
    const buildingData = getBuildingData(building.type);
    
    // Draw building emoji
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(buildingData.emoji, building.x, building.y + 10);

    // Show production indicator
    if (buildingData.produces) {
      const resourceData = GAME_DATA.resources[buildingData.produces];
      ctx.font = '12px Arial';
      ctx.fillText(resourceData.emoji, building.x, building.y - 15);
    }

    // Show storage for warehouses
    if (buildingData.storage && building.storage) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666';
      let yOffset = 25;
      Object.entries(building.storage).forEach(([resource, amount]) => {
        if (typeof amount === 'number' && amount > 0) {
          const resourceData = GAME_DATA.resources[resource as keyof typeof GAME_DATA.resources];
          if (resourceData) {
            ctx.fillText(`${resourceData.emoji}${Math.floor(amount)}`, building.x, building.y + yOffset);
            yOffset += 12;
          }
        }
      });
      ctx.fillStyle = '#000';
    }
  };

  // Creature drawing function
  const drawCreature = (ctx: CanvasRenderingContext2D, creature: any) => {
    const creatureData = getCreatureData(creature.type);
    
    // Draw creature emoji
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(creatureData.emoji, creature.x, creature.y + 6);

    // Show carrying indicator
    if (creature.carriedAmount > 0) {
      ctx.font = '10px Arial';
      ctx.fillText('📦', creature.x, creature.y - 12);
    }

    // Show status indicator
    ctx.font = '8px Arial';
    ctx.fillStyle = getStatusColor(creature.status);
    ctx.fillText(creature.status, creature.x, creature.y + 20);
    ctx.fillStyle = '#000';

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

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const { clientWidth } = container;
        const newWidth = Math.min(clientWidth - 32, width);
        const newHeight = Math.floor((newWidth / width) * height);
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  // Render on every frame
  useEffect(() => {
    const renderLoop = () => {
      render();
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }, [render]);

  return (
    <div className="game-canvas-container relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 ${className}`}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
        style={{ 
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {/* Info Panel */}
      <div className="absolute top-4 right-4 max-w-xs">
        {useGameStore.getState().showInfoPanel && (
          <InfoPanel />
        )}
      </div>
    </div>
  );
};

// Info Panel Component
const InfoPanel: React.FC = () => {
  const { infoPanelContent, actions } = useGameStore();
  
  if (!infoPanelContent) return null;

  const { type, data } = infoPanelContent;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg">
          {type === 'building' 
            ? getBuildingData(data.type as any).emoji 
            : getCreatureData(data.type as any).emoji}
          {' '}
          {type === 'building' 
            ? getBuildingData(data.type as any).name 
            : getCreatureData(data.type as any).name}
        </h4>
        <button
          onClick={() => actions.hideInfo()}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1 text-sm">
        {type === 'building' ? (
          <BuildingInfo building={data} />
        ) : (
          <CreatureInfo creature={data} />
        )}
        <div className="text-xs text-gray-500">
          Position: ({Math.round(data.x)}, {Math.round(data.y)})
        </div>
      </div>
    </div>
  );
};

// Building Info Component
const BuildingInfo: React.FC<{ building: any }> = ({ building }) => {
  const buildingData = getBuildingData(building.type);
  
  return (
    <>
      {buildingData.produces && (
        <div>
          <span className="font-medium">Produces:</span>{' '}
          {GAME_DATA.resources[buildingData.produces].emoji} {buildingData.produces}
        </div>
      )}
      {buildingData.rate && (
        <div>
          <span className="font-medium">Rate:</span> {buildingData.rate}/sec
        </div>
      )}
      {buildingData.storage && (
        <div>
          <span className="font-medium">Storage:</span> {buildingData.storage}
        </div>
      )}
    </>
  );
};

// Creature Info Component
const CreatureInfo: React.FC<{ creature: any }> = ({ creature }) => {
  const creatureData = getCreatureData(creature.type);
  
  return (
    <>
      <div>
        <span className="font-medium">Capacity:</span> {creatureData.capacity}
      </div>
      <div>
        <span className="font-medium">Speed:</span> {creatureData.speed}
      </div>
      <div>
        <span className="font-medium">Status:</span> {creature.status}
      </div>
      <div>
        <span className="font-medium">Energy:</span> {Math.round(creature.energy)}%
      </div>
      <div>
        <span className="font-medium">Specialties:</span> {creatureData.specialties.join(', ')}
      </div>
    </>
  );
};

export default GameCanvas;