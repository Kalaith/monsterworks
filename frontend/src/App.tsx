import React, { useState } from 'react';
import { GameHeader } from './components/game/GameHeader';
import { BuildingPanel } from './components/game/BuildingPanel';
import { CreaturePanel } from './components/game/CreaturePanel';
import { EvolutionPanel } from './components/game/EvolutionPanel';
import { SpeedControls } from './components/game/SpeedControls';
import { DebugPanel } from './components/game/DebugPanel';
import { GameCanvasContainer } from './components/game/GameCanvasContainer';
import { ToastContainer } from './components/ui';
import { useGameStore } from './stores/gameStore';
import type { CreatureState } from './types/game';
import './styles/globals.css';

function App() {
  const [evolutionTarget, setEvolutionTarget] = useState<CreatureState | undefined>();
  const { creatures, toasts, actions } = useGameStore();

  const handleEvolutionRequest = (creatureId: string) => {
    const creature = creatures.find(c => c.id === creatureId);
    if (creature) {
      setEvolutionTarget(creature);
    }
  };

  const handleCloseEvolution = () => {
    setEvolutionTarget(undefined);
  };

  const handleEvolutionTest = () => {
    // Test evolution with the first creature if available
    if (creatures.length > 0) {
      setEvolutionTarget(creatures[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <GameHeader onEvolutionTest={handleEvolutionTest} />
      
      <main className="flex flex-col lg:flex-row p-4 gap-4">
        {/* Controls Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-4">
          <BuildingPanel />
          <CreaturePanel />
          <SpeedControls />
        </aside>
        
        {/* Game Canvas Area */}
        <div className="flex-1 min-h-[700px]">
          <GameCanvasContainer />
        </div>
      </main>
      
      {/* Evolution Panel Modal */}
      {evolutionTarget && (
        <EvolutionPanel 
          selectedCreature={evolutionTarget}
          onClose={handleCloseEvolution}
        />
      )}
      
      {/* Instructions */}
      <footer className="p-4 bg-surface border-t border-card-border">
        <p className="text-center text-sm text-text-muted">
          <strong>Instructions:</strong> Right-click to place monster buildings • Left-click to select • Double-click creatures to evolve them!
        </p>
      </footer>
      
      {/* Toast Notifications */}
      <ToastContainer 
        toasts={toasts}
        onClose={actions.hideToast}
      />
      
      {/* Debug Panel (temporary) - DISABLED to fix re-render issue */}
      {/* <DebugPanel /> */}
    </div>
  );
}

export default App;
