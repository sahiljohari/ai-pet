import type { PetState, PetMood } from '../types/pet';
import config from '../data/ember.json';
import { evaluateCondition } from './conditions';

/* ============================================================
   Ember's Personality Engine
   Reads thoughts and autonomous rules from config.
   ============================================================ */

const THOUGHTS: Record<string, string[]> = config.thoughts;

// ---- Autonomous Behavior Engine ----

export type AutonomousAction =
  | { type: 'mood'; mood: PetMood }
  | { type: 'thought'; text: string }
  | { type: 'none' };

export function generateThought(state: PetState): string {
  const pool = getThoughtPool(state);
  return pool[Math.floor(Math.random() * pool.length)];
}

function getThoughtPool(state: PetState): string[] {
  const { mood, stats } = state;

  if (mood !== 'idle' && THOUGHTS[mood]) {
    return THOUGHTS[mood];
  }

  const pools: string[] = [];

  if (stats.hunger > 75) pools.push(...THOUGHTS.veryHungry);
  else if (stats.energy < 20) pools.push(...THOUGHTS.veryTired);
  else if (stats.happiness < 25) pools.push(...THOUGHTS.verySad);
  else if (stats.love > 80) pools.push(...THOUGHTS.veryLoved);

  pools.push(...THOUGHTS.idle);

  return pools;
}

export function decideAutonomousAction(state: PetState): AutonomousAction {
  if (state.mood !== 'idle') return { type: 'none' };

  const roll = Math.random();

  for (const rule of config.autonomousBehavior.rules) {
    if (evaluateCondition(rule.condition, state.stats) && roll < rule.chance) {
      return { type: 'mood', mood: rule.mood as PetMood };
    }
  }

  if (roll < 0.08) {
    return { type: 'thought', text: generateThought(state) };
  }

  return { type: 'none' };
}

// ---- Interaction Memory ----

interface InteractionMemory {
  totalPets: number;
  totalFeeds: number;
  totalPlays: number;
  totalDances: number;
  totalSurprises: number;
  totalSleeps: number;
  sessionStart: number;
}

const MEMORY_KEY = 'ember_memory';

export function getMemory(): InteractionMemory {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {
    totalPets: 0,
    totalFeeds: 0,
    totalPlays: 0,
    totalDances: 0,
    totalSurprises: 0,
    totalSleeps: 0,
    sessionStart: Date.now(),
  };
}

export function recordInteraction(action: string): void {
  const memory = getMemory();
  switch (action) {
    case 'pet': memory.totalPets++; break;
    case 'feed': memory.totalFeeds++; break;
    case 'play': memory.totalPlays++; break;
    case 'dance': memory.totalDances++; break;
    case 'surprise': memory.totalSurprises++; break;
    case 'sleep': memory.totalSleeps++; break;
  }
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}
