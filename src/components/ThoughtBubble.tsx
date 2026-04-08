import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PetState } from '../types/pet';
import { generateThought } from '../services/personality';

interface ThoughtBubbleProps {
  state: PetState;
}

export function ThoughtBubble({ state }: ThoughtBubbleProps) {
  const [thought, setThought] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showThought = () => {
      const text = generateThought(state);
      setThought(text);
      setVisible(true);

      // Hide after 4-6 seconds
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 4000 + Math.random() * 2000);
    };

    // First thought after 3 seconds
    const initialTimeout = setTimeout(showThought, 3000);

    // Then every 12-25 seconds
    intervalRef.current = setInterval(showThought, 12000 + Math.random() * 13000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.mood]);

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
