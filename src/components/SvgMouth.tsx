import { motion } from 'framer-motion';

interface SvgMouthProps {
  type: string;
}

export function SvgMouth({ type }: SvgMouthProps) {
  switch (type) {
    case 'mouth-smile':
      return <path d="M 90 120 Q 100 129 110 120" fill="none" stroke="#D4C5E8" strokeWidth={2.5} strokeLinecap="round" />;
    case 'mouth-happy':
      return <path d="M 86 118 Q 100 133 114 118" fill="none" stroke="#D4C5E8" strokeWidth={2.5} strokeLinecap="round" />;
    case 'mouth-open-happy':
      return <ellipse cx={100} cy={122} rx={10} ry={11} fill="#1A0E2E" />;
    case 'mouth-open-small':
      return <circle cx={100} cy={122} r={5} fill="#1A0E2E" />;
    case 'mouth-eating':
      return (
        <motion.ellipse cx={100} cy={122} rx={7} ry={8} fill="#1A0E2E"
          animate={{ ry: [8, 4, 8], rx: [7, 9, 7] }}
          transition={{ duration: 0.4, repeat: 4, ease: 'easeInOut' }}
        />
      );
    case 'mouth-sleepy':
      return <path d="M 93 122 Q 100 126 107 122" fill="none" stroke="#D4C5E8" strokeWidth={2} strokeLinecap="round" opacity={0.6} />;
    case 'mouth-sad':
      return <path d="M 90 126 Q 100 118 110 126" fill="none" stroke="#D4C5E8" strokeWidth={2.5} strokeLinecap="round" />;
    case 'mouth-curious':
      return <circle cx={100} cy={122} r={4} fill="#1A0E2E" />;
    case 'mouth-dancing':
      return <path d="M 84 118 Q 100 136 116 118" fill="none" stroke="#D4C5E8" strokeWidth={2.5} strokeLinecap="round" />;
    case 'mouth-grumpy':
      return <line x1={92} y1={122} x2={108} y2={122} stroke="#D4C5E8" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />;
    case 'mouth-dizzy':
      return (
        <motion.path d="M 92 122 Q 100 128 108 122" fill="none" stroke="#D4C5E8" strokeWidth={2} strokeLinecap="round"
          animate={{ rotate: [-5, 5] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          style={{ transformOrigin: '100px 122px' }}
        />
      );
    case 'mouth-surprised':
      return <ellipse cx={100} cy={124} rx={7} ry={10} fill="#1A0E2E" />;
    default:
      return <path d="M 90 120 Q 100 129 110 120" fill="none" stroke="#D4C5E8" strokeWidth={2.5} strokeLinecap="round" />;
  }
}
