import { useState, useEffect, useCallback, useRef } from 'react';
import type { PetState, PetMood, PetAction, PetStats } from '../types/pet';

const INITIAL_STATS: PetStats = {
  happiness: 70,
  energy: 80,
  hunger: 30,
  love: 50,
};

const INITIAL_STATE: PetState = {
  mood: 'idle',
  stats: INITIAL_STATS,
  isBlinking: false,
  lastInteraction: Date.now(),
};

export function usePetState() {
  const [state, setState] = useState<PetState>(INITIAL_STATE);
  const moodTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Random blinking
  useEffect(() => {
    blinkIntervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.mood === 'sleepy' || prev.mood === 'loved') return prev;
        return { ...prev, isBlinking: true };
      });
      setTimeout(() => {
        setState(prev => ({ ...prev, isBlinking: false }));
      }, 150);
    }, 2500 + Math.random() * 3000);

    return () => {
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    };
  }, []);

  // Gradual stat decay
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        stats: {
          happiness: Math.max(0, prev.stats.happiness - 0.3),
          energy: Math.max(0, prev.stats.energy - 0.2),
          hunger: Math.min(100, prev.stats.hunger + 0.4),
          love: Math.max(0, prev.stats.love - 0.15),
        },
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const performAction = useCallback((action: PetAction) => {
    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);

    setState(prev => {
      let newMood: PetMood;
      let statChanges: Partial<PetStats>;

      switch (action) {
        case 'pet':
          newMood = 'loved';
          statChanges = {
            happiness: Math.min(100, prev.stats.happiness + 15),
            love: Math.min(100, prev.stats.love + 10),
          };
          break;
        case 'feed':
          newMood = 'eating';
          statChanges = {
            hunger: Math.max(0, prev.stats.hunger - 30),
            happiness: Math.min(100, prev.stats.happiness + 5),
          };
          break;
        case 'play':
          newMood = 'excited';
          statChanges = {
            happiness: Math.min(100, prev.stats.happiness + 20),
            energy: Math.max(0, prev.stats.energy - 15),
          };
          break;
        case 'sleep':
          newMood = 'sleepy';
          statChanges = {
            energy: Math.min(100, prev.stats.energy + 30),
          };
          break;
      }

      return {
        ...prev,
        mood: newMood,
        stats: { ...prev.stats, ...statChanges },
        lastInteraction: Date.now(),
      };
    });

    const duration = action === 'sleep' ? 3000 : 2000;
    moodTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, mood: 'idle' }));
    }, duration);
  }, []);

  return { state, performAction };
}
