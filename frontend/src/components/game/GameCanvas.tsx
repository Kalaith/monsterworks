import React, { useRef, useEffect, useCallback } from 'react';
import type { Position, BuildingState, CreatureState } from '../../types/game';
import { getBuildingData, getCreatureData, gameData } from '../../data/gameData';

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

const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawBuilding = (ctx: CanvasRenderingContext2D, building: BuildingState) => {
  const buildingData = getBuildingData(building.type);

  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000';
  ctx.fillText(buildingData.emoji, building.x, building.y + 10);

  if (buildingData.produces) {
    const resourceData = gameData.resources[buildingData.produces];
    ctx.font = '12px Arial';
    ctx.fillText(resourceData.emoji, building.x, building.y - 15);

    ctx.font = '10px Arial';
    ctx.fillStyle = '#0066cc';
    const productionValue = building.production.toFixed(1);
    ctx.fillText(`${productionValue}`, building.x, building.y - 25);
  }

  if (building.maxStorage && building.maxStorage > 0) {
    const totalStored = Object.values(building.storage || {}).reduce(
      (sum, amount) => sum + (typeof amount === 'number' ? amount : 0),
      0
    );

    ctx.font = '10px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`${Math.floor(totalStored)}/${building.maxStorage}`, building.x, building.y + 30);
  }

  if (buildingData.storage && building.storage) {
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    let yOffset = 40;
    Object.entries(building.storage).forEach(([resource, amount]) => {
      if (typeof amount === 'number' && amount > 0) {
        const resourceData = gameData.resources[resource as keyof typeof gameData.resources];
        if (resourceData) {
          ctx.fillText(`${resourceData.emoji}${Math.floor(amount)}`, building.x, building.y + yOffset);
          yOffset += 12;
        }
      }
    });
  }

  const workerCount = building.workers?.length || 0;
  if (workerCount > 0) {
    ctx.font = '8px Arial';
    ctx.fillStyle = '#28a745';
    ctx.fillText(`??${workerCount}`, building.x + 20, building.y - 10);
  }

  ctx.fillStyle = '#000';
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'idle':
      return '#666';
    case 'working':
      return '#32a852';
    case 'traveling':
      return '#f39c12';
    case 'resting':
      return '#9b59b6';
    default:
      return '#000';
  }
};

const drawCreature = (ctx: CanvasRenderingContext2D, creature: CreatureState) => {
  const creatureData = getCreatureData(creature.type);

  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000';
  ctx.fillText(creatureData.emoji, creature.x, creature.y + 6);

  if (creature.carriedAmount > 0) {
    ctx.font = '10px Arial';
    ctx.fillStyle = '#ff8c00';
    const carriedValue = Math.floor(creature.carriedAmount * 10);
    const maxCarried = creatureData.capacity * 10;
    ctx.fillText(`??${Math.min(carriedValue, maxCarried)}/${maxCarried}`, creature.x, creature.y - 12);
  }

  ctx.font = '8px Arial';
  ctx.fillStyle = getStatusColor(creature.status);
  ctx.fillText(creature.status, creature.x, creature.y + 20);

  const barWidth = 16;
  const barHeight = 2;
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(creature.x - barWidth / 2, creature.y - 18, barWidth, barHeight);
  ctx.fillStyle = '#44ff44';
  ctx.fillRect(
    creature.x - barWidth / 2,
    creature.y - 18,
    (creature.energy / 100) * barWidth,
    barHeight
  );

  ctx.fillStyle = '#000';
};

const drawSelectionIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.strokeStyle = '#32a852';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.stroke();
};

export const GameCanvas: React.FC<GameCanvasProps> = React.memo(
  ({
    width = 1000,
    height = 700,
    className = '',
    buildings,
    creatures,
    selectedObject,
    onCanvasClick,
    onCanvasRightClick,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCanvasClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        console.log('GameCanvas handleCanvasClick triggered');
        if (!onCanvasClick) {
          console.log('No onCanvasClick handler provided');
          return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
          console.log('No canvas ref');
          return;
        }

        const rect = canvas.getBoundingClientRect();
        const position: Position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        console.log('Calling onCanvasClick with position:', position);
        onCanvasClick(position);
      },
      [onCanvasClick]
    );

    const handleCanvasRightClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        console.log('GameCanvas handleCanvasRightClick triggered');
        if (!onCanvasRightClick) {
          console.log('No onCanvasRightClick handler provided');
          return;
        }

        event.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) {
          console.log('No canvas ref');
          return;
        }

        const rect = canvas.getBoundingClientRect();
        const position: Position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        console.log('Calling onCanvasRightClick with position:', position);
        onCanvasRightClick(position);
      },
      [onCanvasRightClick]
    );

    const render = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvas.width, canvas.height);

      buildings.forEach(building => {
        drawBuilding(ctx, building);
      });

      creatures.forEach(creature => {
        drawCreature(ctx, creature);
      });

      if (selectedObject) {
        const target =
          selectedObject.type === 'building'
            ? buildings.find(b => b.id === selectedObject.id)
            : creatures.find(c => c.id === selectedObject.id);

        if (target) {
          drawSelectionIndicator(ctx, target.x, target.y);
        }
      }
    }, [buildings, creatures, selectedObject]);

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
            height: 'auto',
          }}
        />
      </div>
    );
  }
);

export default GameCanvas;
