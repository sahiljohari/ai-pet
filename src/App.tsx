import { motion } from 'framer-motion';
import { Pet } from './components/Pet';
import { Particles } from './components/Particles';
import { ActionBar } from './components/ActionBar';
import { usePetState } from './hooks/usePetState';
import './App.css';

function App() {
  const { state, performAction } = usePetState();

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
          Mochi
        </motion.h1>

        <div className="pet-wrapper">
          <Particles mood={state.mood} trigger={state.lastInteraction} />
          <Pet state={state} onPet={() => performAction('pet')} />
          <motion.div
            className="pet-shadow"
            animate={{
              scaleX: state.mood === 'excited' ? [0.9, 1.1] : [0.95, 1.05],
              opacity: state.mood === 'excited' ? [0.1, 0.2] : [0.12, 0.18],
            }}
            transition={{
              duration: state.mood === 'excited' ? 0.3 : 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        <ActionBar onAction={performAction} />
      </div>

      {/* Stat bars */}
      <div className="stats-bar">
        <StatBar emoji="😊" value={state.stats.happiness} color="#FFB5E8" label="Happy" />
        <StatBar emoji="⚡" value={state.stats.energy} color="#AFF8DB" label="Energy" />
        <StatBar emoji="🍪" value={Math.max(0, 100 - state.stats.hunger)} color="#FFDAC1" label="Full" />
        <StatBar emoji="💕" value={state.stats.love} color="#D5AAFF" label="Love" />
      </div>

      <motion.p
        className="hint-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2, duration: 1 }}
      >
        click on Mochi to pet! 💕
      </motion.p>
    </div>
  );
}

function StatBar({ emoji, value, color, label }: { emoji: string; value: number; color: string; label: string }) {
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

export default App;
