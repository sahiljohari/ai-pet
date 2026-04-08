import { motion } from 'framer-motion';
import type { PetAction } from '../types/pet';

interface ActionBarProps {
  onAction: (action: PetAction) => void;
}

const actions: { action: PetAction; emoji: string; label: string }[] = [
  { action: 'feed', emoji: '🍪', label: 'Feed' },
  { action: 'play', emoji: '🎾', label: 'Play' },
  { action: 'sleep', emoji: '🌙', label: 'Sleep' },
];

export function ActionBar({ onAction }: ActionBarProps) {
  return (
    <motion.div
      className="action-bar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {actions.map(({ action, emoji, label }, i) => (
        <motion.button
          key={action}
          className="action-button"
          onClick={() => onAction(action)}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
            delay: 0.4 + i * 0.1,
          }}
        >
          <span className="action-emoji">{emoji}</span>
          <span className="action-label">{label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
