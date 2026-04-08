import { useEffect, useRef } from 'react';
import type { PetState, PetMood } from '../types/pet';
import { decideAutonomousAction } from '../services/personality';

interface UseAutonomousBehaviorProps {
  state: PetState;
  onMoodChange: (mood: PetMood) => void;
}

export function useAutonomousBehavior({ state, onMoodChange }: UseAutonomousBehaviorProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.mood !== 'idle') return;

    const check = () => {
      const action = decideAutonomousAction(state);
      if (action.type === 'mood') {
        onMoodChange(action.mood);
        // Auto-resolve back to idle
        timeoutRef.current = setTimeout(() => onMoodChange('idle'), 3000);
      }
    };

    // Check every 8-15 seconds
    intervalRef.current = setInterval(check, 8000 + Math.random() * 7000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.mood, state.stats, onMoodChange]);
}
