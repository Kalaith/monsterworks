import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

export const useGameLoop = () => {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      lastTimeRef.current = currentTime;

      const currentState = useGameStore.getState();
      if (!currentState.isPaused) {
        // Only update store every 200ms (5 times per second) instead of every frame
        const timeSinceLastUpdate = currentTime - lastUpdateRef.current;
        if (timeSinceLastUpdate >= 200) { // 200ms = 5 FPS for UI updates
          // Pass the actual time elapsed since last update, not the frame deltaTime
          const updateDeltaTime = timeSinceLastUpdate / 1000; // Convert to seconds
          currentState.actions.updateGame(updateDeltaTime * currentState.gameSpeed);
          lastUpdateRef.current = currentTime;
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Remove dependencies to prevent restarting the loop

  return {
    start: () => {
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame((time) => {
          lastTimeRef.current = time;
          // Restart the loop
        });
      }
    },
    stop: () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };
};
