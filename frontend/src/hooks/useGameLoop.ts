import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

export const useGameLoop = () => {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const { gameSpeed, isPaused, actions } = useGameStore();

  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (!isPaused) {
        actions.updateGame(deltaTime * gameSpeed);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameSpeed, isPaused, actions]);

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