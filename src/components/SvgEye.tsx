import { motion } from 'framer-motion';
import type { Expression } from '../types/pet';

interface SvgEyeProps {
  cx: number;
  cy: number;
  eyeOffset: { x: number; y: number };
  expr: Expression;
  isBlinking: boolean;
}

export function SvgEye({ cx, cy, eyeOffset, expr, isBlinking }: SvgEyeProps) {
  const isClosed = isBlinking || expr.eyesClosed;
  const irisR = 14 * expr.pupilScale;
  const pupilR = 8 * expr.pupilScale;

  if (isClosed) {
    return (
      <g>
        <path d={`M ${cx - 14} ${cy} Q ${cx} ${cy + 6} ${cx + 14} ${cy}`} fill="none" stroke="#D4C5E8" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  }

  if (expr.halfEyes) {
    return (
      <g>
        <path d={`M ${cx - 20} ${cy} A 20 20 0 0 0 ${cx + 20} ${cy} Z`} fill="#F0EBF5" />
        <motion.circle cx={cx} cy={cy} r={Math.min(irisR * 0.7, 10)} fill="url(#iris-grad)"
          animate={{ cx: cx + eyeOffset.x * 0.3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
        <motion.circle cx={cx} cy={cy + 1} r={Math.min(pupilR * 0.6, 5)} fill="#1A0E35"
          animate={{ cx: cx + eyeOffset.x * 0.3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
        <line x1={cx - 18} y1={cy} x2={cx + 18} y2={cy} stroke="#6D3FA8" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g>
      {/* Sclera */}
      <circle cx={cx} cy={cy} r={20} fill="#F5F0FA" />
      <circle cx={cx} cy={cy} r={20} fill="none" stroke="rgba(100,60,160,0.1)" strokeWidth={0.5} />

      {/* Iris */}
      <motion.circle cx={cx} cy={cy} r={irisR} fill="url(#iris-grad)"
        animate={{ cx: cx + eyeOffset.x, cy: cy + eyeOffset.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Iris inner ring */}
      <motion.circle cx={cx} cy={cy} r={irisR * 0.75} fill="none" stroke="rgba(192,132,252,0.25)" strokeWidth={1}
        animate={{ cx: cx + eyeOffset.x, cy: cy + eyeOffset.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Pupil */}
      <motion.circle cx={cx} cy={cy} r={pupilR} fill="#0F0520"
        animate={{ cx: cx + eyeOffset.x, cy: cy + eyeOffset.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Big highlight */}
      <motion.circle cx={cx + 6} cy={cy - 7} r={5.5} fill="white" filter="url(#glow)"
        animate={{ cx: cx + 6 + eyeOffset.x * 0.3, cy: cy - 7 + eyeOffset.y * 0.3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Small highlight */}
      <motion.circle cx={cx - 5} cy={cy + 4} r={3} fill="white" opacity={0.6}
        animate={{ cx: cx - 5 + eyeOffset.x * 0.15, cy: cy + 4 + eyeOffset.y * 0.15 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Tiny sparkle */}
      <motion.circle cx={cx + 2} cy={cy - 12} r={1.5} fill="white" opacity={0.4}
        animate={{ cx: cx + 2 + eyeOffset.x * 0.1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Star eyes */}
      {expr.starEyes && (
        <motion.text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fill="#FFD700" fontSize={14} filter="url(#glow)"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >✦</motion.text>
      )}
    </g>
  );
}
