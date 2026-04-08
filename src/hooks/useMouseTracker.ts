import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { PetMood } from '../types/pet';
import config from '../data/ember.json';

interface UseMouseTrackerProps {
  petRef: RefObject<HTMLDivElement | null>;
  mood: PetMood;
  onMoodChange?: (mood: PetMood) => void;
}

export function useMouseTracker({ petRef, mood, onMoodChange }: UseMouseTrackerProps) {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [crossEyed, setCrossEyed] = useState(false);
  const [isStaring, setIsStaring] = useState(false);

  const mouseSpeedHistory = useRef<number[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });
  const stareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dizzyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossEyedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { dizzyFromShaking, crossEyed: crossEyedCfg, stareContest } = config.mouseTraits;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!petRef.current) return;
      const rect = petRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.35;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = Math.min(
        Math.hypot(e.clientX - centerX, e.clientY - centerY) / 15,
        8,
      );
      setEyeOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });

      // Mouse velocity tracking
      const now = Date.now();
      const dt = now - lastMousePos.current.time;
      if (dt > 0) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const speed = Math.hypot(dx, dy) / dt;
        mouseSpeedHistory.current.push(speed);
        if (mouseSpeedHistory.current.length > 30) mouseSpeedHistory.current.shift();
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };

      // Dizzy from fast movement
      const avgSpeed =
        mouseSpeedHistory.current.reduce((a, b) => a + b, 0) /
        (mouseSpeedHistory.current.length || 1);
      if (
        avgSpeed > dizzyFromShaking.avgSpeedThreshold &&
        mouseSpeedHistory.current.length >= dizzyFromShaking.minSamples &&
        mood === 'idle'
      ) {
        if (!dizzyTimer.current) {
          dizzyTimer.current = setTimeout(() => {
            onMoodChange?.('dizzy');
            mouseSpeedHistory.current = [];
            dizzyTimer.current = null;
            setTimeout(() => onMoodChange?.('idle'), dizzyFromShaking.recoveryMs);
          }, dizzyFromShaking.triggerDelayMs);
        }
      } else if (dizzyTimer.current && avgSpeed < 1.5) {
        clearTimeout(dizzyTimer.current);
        dizzyTimer.current = null;
      }

      // Cross-eyed when mouse near nose
      const noseDist = Math.hypot(e.clientX - centerX, e.clientY - (centerY + 30));
      if (noseDist < crossEyedCfg.noseProximityPx) {
        if (!crossEyedTimer.current) {
          crossEyedTimer.current = setTimeout(
            () => setCrossEyed(true),
            crossEyedCfg.triggerDelayMs,
          );
        }
      } else {
        if (crossEyedTimer.current) {
          clearTimeout(crossEyedTimer.current);
          crossEyedTimer.current = null;
        }
        if (crossEyed) setCrossEyed(false);
      }

      // Stare / curious detection
      setIsStaring(false);
      if (stareTimer.current) clearTimeout(stareTimer.current);
      stareTimer.current = setTimeout(() => {
        if (distance < stareContest.maxDistancePx) {
          setIsStaring(true);
          setTimeout(() => {
            if (mood === 'idle') onMoodChange?.('curious');
            setIsStaring(false);
          }, stareContest.curiousAfterMs);
        }
      }, stareContest.idleThresholdMs);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (stareTimer.current) clearTimeout(stareTimer.current);
      if (dizzyTimer.current) clearTimeout(dizzyTimer.current);
      if (crossEyedTimer.current) clearTimeout(crossEyedTimer.current);
    };
  }, [mood, crossEyed, onMoodChange, petRef, dizzyFromShaking, crossEyedCfg, stareContest]);

  return { eyeOffset, crossEyed, isStaring };
}
