import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { PetState, PetMood, Expression } from '../types/pet';
import { useMouseTracker } from '../hooks/useMouseTracker';
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
    petRef, mood: state.mood, onMoodChange,
  });

  const expr = getExpression(state);
  if (isStaring && state.mood === 'idle') expr.pupilScale = 1.3;

  const bodyAnim = getBodyAnimation(state.mood);
  const timing =
    (config.animationTimings as Record<string, { duration: number; repeat: boolean }>)[state.mood]
    ?? config.animationTimings.default;

  const leftEye = crossEyed ? { x: 4, y: 3 } : eyeOffset;
  const rightEye = crossEyed ? { x: -4, y: 3 } : eyeOffset;

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
        className="pet-body-wrapper"
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

        {/* Tail */}
        <div className={`pet-tail ${isHappyMood(state.mood) ? 'pet-tail-wag' : ''}`} />

        {/* Small torso */}
        <div className="pet-torso" />

        {/* Paws */}
        <div className="pet-paw pet-paw-left" />
        <div className="pet-paw pet-paw-right" />

        {/* Head (main blob) */}
        <div className="pet-head">
          <motion.div className="pet-ear pet-ear-left"
            animate={{ rotate: -15 + expr.earDrop }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          />
          <motion.div className="pet-ear pet-ear-right"
            animate={{ rotate: 15 - expr.earDrop }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          />

          <div className="pet-face">
            <div className="pet-eyes">
              <Eye offset={leftEye} expr={expr} isBlinking={state.isBlinking} />
              <Eye offset={rightEye} expr={expr} isBlinking={state.isBlinking} />
            </div>

            <motion.div className="pet-cheek pet-cheek-left"
              animate={{ opacity: expr.blushIntensity, scale: expr.blushIntensity > 0.6 ? 1.15 : 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div className="pet-cheek pet-cheek-right"
              animate={{ opacity: expr.blushIntensity, scale: expr.blushIntensity > 0.6 ? 1.15 : 1 }}
              transition={{ duration: 0.3 }}
            />

            <div className="pet-mouth-container">
              <motion.div className={`pet-mouth ${expr.mouthClass}`}
                animate={expr.mouthClass === 'mouth-eating'
                  ? { scaleY: [1, 0.6, 1], scaleX: [1, 1.1, 1] } : {}}
                transition={expr.mouthClass === 'mouth-eating'
                  ? { duration: 0.4, repeat: 4, ease: 'easeInOut' } : {}}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---- Eye sub-component ---- */

function Eye({ offset, expr, isBlinking }: {
  offset: { x: number; y: number };
  expr: Expression;
  isBlinking: boolean;
}) {
  if (expr.halfEyes) {
    return (
      <div className="pet-eye">
        <div className="pet-eye-half">
          <motion.div className="pet-iris"
            style={{ x: offset.x * 0.5, y: 2 }}
            animate={{ scale: expr.pupilScale * 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="pet-pupil-inner" />
            <div className="pet-highlight" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-eye">
      {(isBlinking || expr.eyesClosed) ? (
        <motion.div className="pet-eye-closed"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 0.08 }}
        />
      ) : (
        <motion.div className="pet-iris"
          animate={{ x: offset.x, y: offset.y, scale: expr.pupilScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="pet-pupil-inner" />
          <div className="pet-highlight" />
          <div className="pet-highlight-sm" />
          {expr.starEyes && <div className="pet-star-eye">✦</div>}
        </motion.div>
      )}
    </div>
  );
}

/* ---- Helpers ---- */

function isHappyMood(mood: string) {
  return ['happy', 'excited', 'dancing', 'loved'].includes(mood);
}

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

function getBodyAnimation(mood: string) {
  return (config.bodyAnimations as Record<string, Record<string, number[]>>)[mood]
    ?? config.bodyAnimations.idle;
}
