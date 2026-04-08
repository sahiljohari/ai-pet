import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PetMood } from '../types/pet';
import config from '../data/ember.json';

interface ParticlesProps {
  mood: PetMood;
  trigger: number;
}

interface Particle {
  id: number;
  x: number;
  emoji: string;
  delay: number;
  size: number;
}

const particleMap = config.particles as Record<string, string[]>;

export function Particles({ mood, trigger }: ParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (mood === 'idle') return;

    const emojis = particleMap[mood] ?? particleMap.default;
    const count = mood === 'loved' ? 8 : 6;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: -40 + Math.random() * 80,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: i * 0.12,
      size: 20 + Math.random() * 12,
    }));

    setParticles(newParticles);
    const timeout = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(timeout);
  }, [trigger, mood]);

  return (
    <div className="particles-container">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="particle"
            style={{ fontSize: p.size }}
            initial={{ opacity: 0, x: p.x, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -100 - Math.random() * 80,
              x: p.x + (Math.random() - 0.5) * 60,
              scale: [0, 1.3, 1, 0.6],
              rotate: (Math.random() - 0.5) * 40,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 1.8,
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
