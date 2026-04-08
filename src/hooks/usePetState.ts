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
          // If energy is critically low, get dizzy instead
          if (prev.stats.energy < 15) {
            newMood = 'dizzy';
            statChanges = {
              energy: Math.max(0, prev.stats.energy - 5),
            };
          } else {
            newMood = 'excited';
            statChanges = {
              happiness: Math.min(100, prev.stats.happiness + 20),
              energy: Math.max(0, prev.stats.energy - 15),
            };
          }
          break;
        case 'sleep':
          newMood = 'sleepy';
          statChanges = {
            energy: Math.min(100, prev.stats.energy + 30),
          };
          break;
        case 'dance':
          newMood = 'dancing';
          statChanges = {
            happiness: Math.min(100, prev.stats.happiness + 25),
            love: Math.min(100, prev.stats.love + 5),
            energy: Math.max(0, prev.stats.energy - 10),
          };
          break;
        case 'surprise':
          newMood = 'surprised';
          statChanges = {
            happiness: Math.min(100, prev.stats.happiness + 10),
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

    const duration = action === 'sleep' ? 3000 : action === 'dance' ? 3500 : action === 'surprise' ? 1500 : 2000;
    moodTimeoutRef.current = setTimeout(() => {
      setState(prev => {
        // After actions resolve, check if stats warrant a reactive mood
        const { happiness, energy } = prev.stats;
        if (happiness < 20 && energy > 15) return { ...prev, mood: 'grumpy' };
        if (energy < 10) return { ...prev, mood: 'dizzy' };
        return { ...prev, mood: 'idle' };
      });
    }, duration);

    // Grumpy/dizzy auto-resolve to idle after a bit
    if (['surprise'].includes(action)) return;
    const autoIdleTimeout = setTimeout(() => {
      setState(prev => {
        if (prev.mood === 'grumpy' || prev.mood === 'dizzy' || prev.mood === 'curious') {
          return { ...prev, mood: 'idle' };
        }
        return prev;
      });
    }, 5000);
    return () => clearTimeout(autoIdleTimeout);
  }, []);

  const setMood = useCallback((mood: PetMood) => {
    setState(prev => ({ ...prev, mood, lastInteraction: Date.now() }));
  }, []);

  return { state, performAction, setMood };
}
