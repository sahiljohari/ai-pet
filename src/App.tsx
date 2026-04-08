import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pet } from './components/Pet';
import { Particles } from './components/Particles';
import { ActionBar } from './components/ActionBar';
import { ThoughtBubble } from './components/ThoughtBubble';
import { StatBar } from './components/StatBar';
import { usePetState } from './hooks/usePetState';
import { useAutonomousBehavior } from './hooks/useAutonomousBehavior';
import { recordInteraction } from './services/personality';
import type { PetAction, PetMood } from './types/pet';
import config from './data/ember.json';
import './App.css';

function App() {
  const { state, performAction, setMood } = usePetState();

  const handleAction = useCallback((action: PetAction) => {
    recordInteraction(action);
    performAction(action);
  }, [performAction]);

  const handleMoodChange = useCallback((mood: PetMood) => {
    setMood(mood);
  }, [setMood]);

  useAutonomousBehavior({ state, onMoodChange: handleMoodChange });

  return (
    <div className="app">
      {/* Floating background shapes */}
      <div className="bg-decorations">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`bg-shape bg-shape-${i}`}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="pet-scene">
        <motion.h1
          className="pet-name"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {config.name}
        </motion.h1>

        <div className="pet-wrapper">
          <ThoughtBubble state={state} />
          <Particles mood={state.mood} trigger={state.lastInteraction} />
          <Pet state={state} onPet={() => handleAction('pet')} onMoodChange={handleMoodChange} />
          <motion.div
            className="pet-shadow"
            animate={{
              scaleX: state.mood === 'excited' || state.mood === 'dancing' ? [0.85, 1.15] : [0.95, 1.05],
              opacity: state.mood === 'excited' ? [0.08, 0.18] : [0.1, 0.15],
            }}
            transition={{
              duration: state.mood === 'excited' ? 0.3 : state.mood === 'dancing' ? 0.4 : 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        <ActionBar onAction={handleAction} />
      </div>

      {/* Stat bars */}
      <div className="stats-bar">
        {config.statBars.map((bar) => {
          const rawValue = state.stats[bar.stat as keyof typeof state.stats];
          const value = 'invert' in bar && bar.invert ? Math.max(0, 100 - rawValue) : rawValue;
          return (
            <StatBar
              key={bar.stat}
              emoji={bar.emoji}
              value={value}
              color={bar.color}
              label={bar.label}
            />
          );
        })}
      </div>

      <motion.p
        className="hint-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 2, duration: 1 }}
      >
        click on {config.name} to pet! 🔥
      </motion.p>
    </div>
  );
}

export default App;
