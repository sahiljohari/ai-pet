import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PetState } from '../types/pet';

interface PetProps {
  state: PetState;
  onPet: () => void;
}

export function Pet({ state, onPet }: PetProps) {
  const petRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!petRef.current) return;
      const rect = petRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.35;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = Math.min(
        Math.hypot(e.clientX - centerX, e.clientY - centerY) / 15,
        12,
      );
      setEyeOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const expr = getExpression(state);

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
        className="pet-body"
        animate={getBodyAnimation(state.mood)}
        transition={{
          duration: state.mood === 'excited' ? 0.3 : 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect for happy moods */}
        <motion.div
          className="pet-glow"
          animate={{ opacity: expr.glowIntensity, scale: expr.glowIntensity > 0.3 ? 1.1 : 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Ears */}
        <motion.div
          className="pet-ear pet-ear-left"
          animate={{ rotate: -15 + expr.earDrop }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        />
        <motion.div
          className="pet-ear pet-ear-right"
          animate={{ rotate: 15 - expr.earDrop }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        />

        {/* Face */}
        <div className="pet-face">
          <div className="pet-eyes">
            <Eye
              side="left"
              eyeOffset={eyeOffset}
              isClosed={state.isBlinking || expr.eyesClosed}
              pupilScale={expr.pupilScale}
              hasStars={expr.starEyes}
              isHalf={expr.halfEyes}
            />
            <Eye
              side="right"
              eyeOffset={eyeOffset}
              isClosed={state.isBlinking || expr.eyesClosed}
              pupilScale={expr.pupilScale}
              hasStars={expr.starEyes}
              isHalf={expr.halfEyes}
            />
          </div>

          {/* Cheeks */}
          <motion.div
            className="pet-cheek pet-cheek-left"
            animate={{ opacity: expr.blushIntensity, scale: expr.blushIntensity > 0.6 ? 1.15 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="pet-cheek pet-cheek-right"
            animate={{ opacity: expr.blushIntensity, scale: expr.blushIntensity > 0.6 ? 1.15 : 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Mouth */}
          <div className="pet-mouth-container">
            <motion.div
              className={`pet-mouth ${expr.mouthClass}`}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              animate={(expr.mouthAnim || {}) as any}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---- Eye sub-component ---- */

function Eye({
  side,
  eyeOffset,
  isClosed,
  pupilScale,
  hasStars,
  isHalf,
}: {
  side: 'left' | 'right';
  eyeOffset: { x: number; y: number };
  isClosed: boolean;
  pupilScale: number;
  hasStars: boolean;
  isHalf: boolean;
}) {
  if (isHalf) {
    return (
      <div className={`pet-eye pet-eye-${side}`}>
        <div className="pet-eye-half">
          <motion.div
            className="pet-pupil"
            style={{ x: eyeOffset.x * 0.5, y: 2 }}
            animate={{ scale: pupilScale * 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="pet-pupil-highlight" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pet-eye pet-eye-${side}`}>
      {isClosed ? (
        <motion.div
          className="pet-eye-closed"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.08 }}
        />
      ) : (
        <motion.div
          className="pet-pupil"
          animate={{ x: eyeOffset.x, y: eyeOffset.y, scale: pupilScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="pet-pupil-highlight" />
          {hasStars && <div className="pet-star-eye">✦</div>}
        </motion.div>
      )}
    </div>
  );
}

/* ---- Expression helpers ---- */

interface Expression {
  pupilScale: number;
  eyesClosed: boolean;
  halfEyes: boolean;
  starEyes: boolean;
  blushIntensity: number;
  glowIntensity: number;
  mouthClass: string;
  mouthAnim?: object;
  earDrop: number;
}

function getExpression(state: PetState): Expression {
  const base: Expression = {
    pupilScale: 1,
    eyesClosed: false,
    halfEyes: false,
    starEyes: false,
    blushIntensity: 0.3,
    glowIntensity: 0,
    mouthClass: 'mouth-smile',
    earDrop: 0,
  };

  switch (state.mood) {
    case 'happy':
      return { ...base, pupilScale: 1.1, blushIntensity: 0.7, glowIntensity: 0.3, mouthClass: 'mouth-happy', earDrop: -5 };
    case 'excited':
      return { ...base, pupilScale: 1.3, starEyes: true, blushIntensity: 0.8, glowIntensity: 0.5, mouthClass: 'mouth-open-happy', earDrop: -10 };
    case 'sleepy':
      return { ...base, halfEyes: true, blushIntensity: 0.4, mouthClass: 'mouth-sleepy', earDrop: 8 };
    case 'eating':
      return {
        ...base,
        eyesClosed: true,
        blushIntensity: 0.6,
        mouthClass: 'mouth-eating',
        mouthAnim: { scaleY: [1, 0.6, 1], scaleX: [1, 1.1, 1], transition: { duration: 0.4, repeat: 4, ease: 'easeInOut' } },
        earDrop: -3,
      };
    case 'loved':
      return { ...base, eyesClosed: true, blushIntensity: 1, glowIntensity: 0.6, mouthClass: 'mouth-happy', earDrop: -8 };
    default: {
      const { happiness, energy, hunger } = state.stats;
      if (energy < 25) return { ...base, halfEyes: true, mouthClass: 'mouth-sleepy', earDrop: 6 };
      if (hunger > 75) return { ...base, pupilScale: 1.15, mouthClass: 'mouth-open-small', blushIntensity: 0.2 };
      if (happiness < 30) return { ...base, pupilScale: 0.85, mouthClass: 'mouth-sad', blushIntensity: 0.1, earDrop: 10 };
      return base;
    }
  }
}

function getBodyAnimation(mood: string) {
  switch (mood) {
    case 'excited':
      return { y: [-8, 8], rotate: [-3, 3], scale: [1, 1.06, 1] };
    case 'sleepy':
      return { y: [0, 4], scale: [1, 1.02] };
    case 'happy':
    case 'loved':
      return { y: [-4, 4], scale: [1, 1.03] };
    case 'eating':
      return { y: [0, 2], rotate: [-1, 1] };
    default:
      return { y: [-3, 3], scale: [1, 1.015] };
  }
}
