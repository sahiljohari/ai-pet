import { useEffect, useRef } from 'react';
import type { PetState, PetMood } from '../types/pet';
import { decideAutonomousAction } from '../services/personality';
import config from '../data/ember.json';

interface UseAutonomousBehaviorProps {
  state: PetState;
  onMoodChange: (mood: PetMood) => void;
}

export function useAutonomousBehavior({ state, onMoodChange }: UseAutonomousBehaviorProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.mood !== 'idle') return;

    const [minMs, maxMs] = config.autonomousBehavior.checkIntervalMs;

    const check = () => {
      const action = decideAutonomousAction(state);
      if (action.type === 'mood') {
        onMoodChange(action.mood);
        timeoutRef.current = setTimeout(
          () => onMoodChange('idle'),
          config.autonomousBehavior.autoResolveMs,
        );
      }
    };

    intervalRef.current = setInterval(check, minMs + Math.random() * (maxMs - minMs));

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.mood, state.stats, onMoodChange]);
}
