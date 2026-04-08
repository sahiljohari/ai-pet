import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PetState } from '../types/pet';
import { generateThought } from '../services/personality';
import config from '../data/ember.json';

interface ThoughtBubbleProps {
  state: PetState;
}

export function ThoughtBubble({ state }: ThoughtBubbleProps) {
  const [thought, setThought] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { initialDelayMs, intervalMs, displayMs } = config.thoughtBubble;

  useEffect(() => {
    const [minDisplay, maxDisplay] = displayMs;
    const [minInterval, maxInterval] = intervalMs;

    const showThought = () => {
      const text = generateThought(state);
      setThought(text);
      setVisible(true);

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, minDisplay + Math.random() * (maxDisplay - minDisplay));
    };

    const initialTimeout = setTimeout(showThought, initialDelayMs);

    intervalRef.current = setInterval(
      showThought,
      minInterval + Math.random() * (maxInterval - minInterval),
    );

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.mood, initialDelayMs, intervalMs, displayMs]);

  // Also show a thought on mood changes
  useEffect(() => {
    if (state.mood === 'idle') return;
    const text = generateThought(state);
    setThought(text);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [state.mood, state.lastInteraction]);

  return (
    <AnimatePresence>
      {visible && thought && (
        <motion.div
          className="thought-bubble"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="thought-text">{thought}</div>
          <div className="thought-tail" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
