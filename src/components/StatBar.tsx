import { motion } from 'framer-motion';

interface StatBarProps {
  emoji: string;
  value: number;
  color: string;
  label: string;
}

export function StatBar({ emoji, value, color, label }: StatBarProps) {
  return (
    <div className="stat-bar" title={label}>
      <span className="stat-emoji">{emoji}</span>
      <div className="stat-track">
        <motion.div
          className="stat-fill"
          style={{ backgroundColor: color }}
          animate={{ width: `${Math.max(2, value)}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>
    </div>
  );
}
