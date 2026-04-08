import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { PetState, PetMood, Expression } from '../types/pet';
import { useMouseTracker } from '../hooks/useMouseTracker';
import { SvgEye } from './SvgEye';
import { SvgMouth } from './SvgMouth';
import { evaluateCondition } from '../services/conditions';
import config from '../data/ember.json';

interface PetProps {
  state: PetState;
  onPet: () => void;
  onMoodChange?: (mood: PetMood) => void;
}

export function Pet({ state, onPet, onMoodChange }: PetProps) {
  const petRef = useRef<HTMLDivElement>(null);
  const { eyeOffset, crossEyed, isStaring } = useMouseTracker({
    petRef,
    mood: state.mood,
    onMoodChange,
  });

  const effectiveEyeOffset = crossEyed ? { x: 0, y: 3 } : eyeOffset;

  const expr = getExpression(state);
  if (isStaring && state.mood === 'idle') {
    expr.pupilScale = 1.3;
  }

  const bodyAnim = getBodyAnimation(state.mood);
  const timing =
    (config.animationTimings as Record<string, { duration: number; repeat: boolean }>)[state.mood] ??
    config.animationTimings.default;

  return (
    <motion.div
      ref={petRef}
      className="pet-container"
      onClick={onPet}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <motion.div
        animate={bodyAnim}
        transition={{
          duration: timing.duration,
          repeat: timing.repeat ? Infinity : 0,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="pet-glow"
          animate={{ opacity: expr.glowIntensity, scale: expr.glowIntensity > 0.3 ? 1.1 : 1 }}
          transition={{ duration: 0.5 }}
        />

        <svg viewBox="0 0 200 240" width="210" height="252" className="pet-svg">
          <defs>
            <radialGradient id="body-grad" cx="42%" cy="32%" r="62%">
              <stop offset="0%" stopColor="#D8B4FE" />
              <stop offset="40%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7B52AE" />
            </radialGradient>
            <radialGradient id="iris-grad" cx="38%" cy="32%" r="55%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="30%" stopColor="#C084FC" />
              <stop offset="65%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#581C87" />
            </radialGradient>
            <linearGradient id="ear-inner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0A8A0" />
              <stop offset="100%" stopColor="#D4756B" />
            </linearGradient>
            <radialGradient id="blush-grad">
              <stop offset="0%" stopColor="rgba(255,120,80,0.5)" />
              <stop offset="100%" stopColor="rgba(255,100,60,0)" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="soft-shadow">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#3B0764" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Tail */}
          <motion.path
            d="M 142 175 Q 170 160 168 138 Q 167 128 158 134"
            fill="none"
            stroke="#9333EA"
            strokeWidth={7}
            strokeLinecap="round"
            animate={{ d: state.mood === 'happy' || state.mood === 'excited' || state.mood === 'dancing'
              ? 'M 142 175 Q 175 150 170 128 Q 168 118 160 126'
              : 'M 142 175 Q 170 160 168 138 Q 167 128 158 134'
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          />

          {/* Left ear */}
          <motion.g
            style={{ transformOrigin: '60px 75px' }}
            animate={{ rotate: -5 + expr.earDrop }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <path d="M 38 22 Q 48 50 60 75 L 22 68 Q 28 40 38 22 Z" fill="#6D3FA8" filter="url(#soft-shadow)" />
            <path d="M 42 34 Q 50 52 56 70 L 30 64 Q 34 46 42 34 Z" fill="url(#ear-inner)" />
          </motion.g>

          {/* Right ear */}
          <motion.g
            style={{ transformOrigin: '140px 75px' }}
            animate={{ rotate: 5 - expr.earDrop }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <path d="M 162 22 Q 152 50 140 75 L 178 68 Q 172 40 162 22 Z" fill="#6D3FA8" filter="url(#soft-shadow)" />
            <path d="M 158 34 Q 150 52 144 70 L 170 64 Q 166 46 158 34 Z" fill="url(#ear-inner)" />
          </motion.g>

          {/* Body */}
          <ellipse cx={100} cy={178} rx={34} ry={22} fill="url(#body-grad)" filter="url(#soft-shadow)" />

          {/* Left paw */}
          <ellipse cx={74} cy={198} rx={13} ry={9} fill="#8B5CF6" />
          <ellipse cx={67} cy={197} rx={3.5} ry={2.5} fill="#A78BFA" opacity={0.6} />
          <ellipse cx={74} cy={195} rx={3.5} ry={2.5} fill="#A78BFA" opacity={0.6} />
          <ellipse cx={81} cy={197} rx={3.5} ry={2.5} fill="#A78BFA" opacity={0.6} />

          {/* Right paw */}
          <ellipse cx={126} cy={198} rx={13} ry={9} fill="#8B5CF6" />
          <ellipse cx={119} cy={197} rx={3.5} ry={2.5} fill="#A78BFA" opacity={0.6} />
          <ellipse cx={126} cy={195} rx={3.5} ry={2.5} fill="#A78BFA" opacity={0.6} />
          <ellipse cx={133} cy={197} rx={3.5} ry={2.5} fill="#A78BFA" opacity={0.6} />

          {/* Head */}
          <circle cx={100} cy={95} r={68} fill="url(#body-grad)" filter="url(#soft-shadow)" />

          {/* Head highlight */}
          <ellipse cx={80} cy={62} rx={32} ry={20} fill="rgba(255,255,255,0.07)" />

          {/* Hair tuft */}
          <path d="M 92 27 Q 96 10 103 20 Q 108 8 107 26 Q 112 14 110 28" fill="#B07CED" stroke="#C4A0F5" strokeWidth={0.8} />

          {/* Eyes */}
          <SvgEye cx={74} cy={90}
            eyeOffset={crossEyed ? { x: 4, y: 3 } : effectiveEyeOffset}
            expr={expr} isBlinking={state.isBlinking}
          />
          <SvgEye cx={126} cy={90}
            eyeOffset={crossEyed ? { x: -4, y: 3 } : effectiveEyeOffset}
            expr={expr} isBlinking={state.isBlinking}
          />

          {/* Blush */}
          <motion.ellipse cx={48} cy={108} rx={14} ry={7} fill="url(#blush-grad)"
            animate={{ opacity: expr.blushIntensity, scale: expr.blushIntensity > 0.6 ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.ellipse cx={152} cy={108} rx={14} ry={7} fill="url(#blush-grad)"
            animate={{ opacity: expr.blushIntensity, scale: expr.blushIntensity > 0.6 ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Mouth */}
          <SvgMouth type={expr.mouthClass} />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* ---- Expression from config ---- */

function getExpression(state: PetState): Expression {
  if (state.mood !== 'idle') {
    const moodExpr = (config.expressions as Record<string, Expression>)[state.mood];
    if (moodExpr) return { ...moodExpr };
  }

  const base: Expression = { ...config.expressions.idle };
  for (const rule of config.statDrivenExpressions) {
    if (evaluateCondition(rule.condition, state.stats)) {
      return { ...base, ...rule.overrides } as Expression;
    }
  }
  return base;
}

/* ---- Body animation from config ---- */

function getBodyAnimation(mood: string) {
  const animations = config.bodyAnimations as Record<string, Record<string, number[]>>;
  return animations[mood] ?? animations.idle;
}
