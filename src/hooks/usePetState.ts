import { useState, useEffect, useCallback, useRef } from 'react';
import type { PetState, PetMood, PetAction, PetStats } from '../types/pet';
import config from '../data/ember.json';
import { evaluateCondition } from '../services/conditions';

interface ActionConfig {
  mood: string;
  stats: Record<string, number>;
  durationMs: number;
  override?: {
    condition: { stat: string; op: string; value: number };
    mood: string;
    stats: Record<string, number>;
  };
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

const INITIAL_STATE: PetState = {
  mood: 'idle',
  stats: { ...config.stats.initial } as PetStats,
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
    const decay = config.stats.decayPerTick;
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        stats: {
          happiness: clamp(prev.stats.happiness + decay.happiness),
          energy: clamp(prev.stats.energy + decay.energy),
          hunger: clamp(prev.stats.hunger + decay.hunger),
          love: clamp(prev.stats.love + decay.love),
        },
      }));
    }, config.stats.decayIntervalMs);
    return () => clearInterval(interval);
  }, []);

  const performAction = useCallback((action: PetAction) => {
    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);

    const actionCfg = config.actions[action as keyof typeof config.actions] as ActionConfig;
    if (!actionCfg) return;

    setState(prev => {
      let mood = actionCfg.mood as PetMood;
      let statChanges: Record<string, number> = { ...actionCfg.stats };

      if (actionCfg.override && evaluateCondition(actionCfg.override.condition, prev.stats)) {
        mood = actionCfg.override.mood as PetMood;
        statChanges = { ...actionCfg.override.stats };
      }

      const newStats = { ...prev.stats };
      for (const [stat, delta] of Object.entries(statChanges)) {
        const key = stat as keyof PetStats;
        newStats[key] = clamp(newStats[key] + delta);
      }

      return {
        ...prev,
        mood,
        stats: newStats,
        lastInteraction: Date.now(),
      };
    });

    moodTimeoutRef.current = setTimeout(() => {
      setState(prev => {
        const { happiness, energy } = prev.stats;
        if (happiness < 20 && energy > 15) return { ...prev, mood: 'grumpy' };
        if (energy < 10) return { ...prev, mood: 'dizzy' };
        return { ...prev, mood: 'idle' };
      });
    }, actionCfg.durationMs);

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
