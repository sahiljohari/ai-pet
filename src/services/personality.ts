import type { PetState, PetMood } from '../types/pet';

/* ============================================================
   Ember's Personality Engine
   A rich, context-aware system that makes Ember feel alive
   without needing any external API.
   ============================================================ */

// ---- Thought Templates ----
// Each array is keyed by mood or stat condition.
// Thoughts are randomly selected and feel organic.

const THOUGHTS: Record<string, string[]> = {
  idle: [
    '*looks around curiously* ...what was that?',
    'hmm... I wonder what clouds taste like ☁️',
    '*wiggles ears* ...did someone say snacks?',
    'la la la~ 🎵',
    '*stares into the void philosophically*',
    'I bet I could catch my own tail if I really tried...',
    'what if... I took a little nap right here... 😴',
    '*pretends to be a statue* 🗿',
    'is it snack time yet? ...it should be snack time.',
    'I wonder if the moon is made of cookies 🌙🍪',
    '*does a tiny spin* wheee~',
    'you know what would be nice? a head pat.',
    '*contemplates the meaning of existence* ...nah, cookies.',
  ],
  happy: [
    'hehe~ life is good! ✨',
    '*bounces around* today is the BEST!',
    'everything feels so sparkly right now~',
    'I love everything and everyone!! 💕',
    '*purrs loudly* mrrrrp~',
    'this is the happiest I\'ve ever been! ...wait I say that every time',
  ],
  excited: [
    'YAAAY LET\'S GOOOO!! 🎉',
    '*zoomies intensify* WHEEEEE!',
    'I can\'t contain my excitement!! ⭐⭐⭐',
    'THIS IS AMAZING!! *bounces off walls*',
    'so much energy!! I could run FOREVER!',
  ],
  sleepy: [
    'so... sleepy... *yawns* 😴',
    'five more minutes... zzz...',
    '*eyelids getting heavy* must... stay... awake...',
    'maybe just a tiny little nap... 💤',
    'the world is getting all fuzzy and warm...',
    '*nods off* ...huh? I wasn\'t sleeping!',
  ],
  eating: [
    'nom nom nom~ 🍪',
    'mmm this is SO good!! *happy chomps*',
    'food is the best invention ever!',
    '*stuffs face* mmmrph! 😋',
    'can I have seconds? ...thirds?',
  ],
  loved: [
    '*melts into a happy puddle* 💕💕💕',
    'aaaa I love you too!! 💗',
    '*purrs so loud the screen shakes* mrrrrRRRRR~',
    'more pets!! never stop!! 🥰',
    'I\'m the luckiest pet in the whole internet~ ✨',
    '*nuzzles you* you\'re the best human ever!',
  ],
  curious: [
    'ooh! what\'s THAT over there?! 👀',
    '*sniff sniff* ...something smells interesting!',
    'hmm... *tilts head* ...what does this button do?',
    '*investigates a suspicious shadow* 🔍',
    'I sense... something... mysterious! ✨',
    'wait wait wait— did you see that?!',
  ],
  dancing: [
    '🎵 shake shake shake~ 🎵',
    '*busts out sick dance moves* 💃',
    'I\'m a dancing machine!! 🪩',
    'you can\'t stop the groove~ 🎶',
    'everybody dance NOW! ✨💃✨',
  ],
  grumpy: [
    'hmph. 😤',
    '*sulks in the corner* ...I\'m fine.',
    'nobody appreciates me around here... 💢',
    '*angrily stares at nothing* 😠',
    'maybe if SOMEONE paid attention to me...',
    'I\'m not mad. I\'m just... disappointed.',
  ],
  dizzy: [
    'everything is spinning... 🌀',
    'whoa whoa whoa... *wobbles*',
    'I see... three of everything... 💫',
    'maybe I overdid it a little... 😵‍💫',
    'the room won\'t stop moving...',
  ],
  surprised: [
    'AAAH!! 😱',
    'WHAT WAS THAT?! *jumps three feet*',
    'you SCARED me!! 💀',
    '*heart racing* oh my gosh oh my gosh!',
    'DON\'T DO THAT!! ...ok do it again 👀',
  ],

  // Stat-driven thoughts (when idle)
  veryHungry: [
    'my tummy is growling SO loud... 🍪',
    'feed me... feeeed meeee... *dramatic collapse*',
    'I\'m wasting away here!! *lies on floor*',
    'is that... a crumb? *lunges at nothing*',
    'I would do ANYTHING for a cookie right now.',
  ],
  veryTired: [
    'I can barely keep my eyes open... 😴',
    '*dragging self across the floor* ...so... tired...',
    'energy levels: critically low ⚠️',
    'my brain is buffering... 🔄',
    'need... sleep... immediately...',
  ],
  verySad: [
    '*sits alone in the corner* 😢',
    'does anyone even care about me...?',
    'I just want someone to play with... 🥺',
    '*quiet sniffles* ...I\'m okay. really.',
    'why is everything so gray today...',
  ],
  veryLoved: [
    'I feel SO loved right now!! 💕💕💕',
    '*overflowing with happiness* you\'re the BEST!',
    'my heart is so full it might burst! 💗',
    'I never want this feeling to end~ ✨',
  ],
};

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

  // If in a specific mood, use that pool
  if (mood !== 'idle' && THOUGHTS[mood]) {
    return THOUGHTS[mood];
  }

  // For idle, check stat conditions first
  const pools: string[] = [];

  if (stats.hunger > 75) pools.push(...THOUGHTS.veryHungry);
  else if (stats.energy < 20) pools.push(...THOUGHTS.veryTired);
  else if (stats.happiness < 25) pools.push(...THOUGHTS.verySad);
  else if (stats.love > 80) pools.push(...THOUGHTS.veryLoved);

  // Always include some general idle thoughts
  pools.push(...THOUGHTS.idle);

  return pools;
}

export function decideAutonomousAction(state: PetState): AutonomousAction {
  // Only act autonomously when idle
  if (state.mood !== 'idle') return { type: 'none' };

  const roll = Math.random();

  // Stat-driven autonomous moods
  const { happiness, energy, hunger } = state.stats;

  if (energy < 10 && roll < 0.3) {
    return { type: 'mood', mood: 'sleepy' };
  }
  if (hunger > 85 && roll < 0.25) {
    return { type: 'mood', mood: 'grumpy' };
  }
  if (happiness < 15 && roll < 0.2) {
    return { type: 'mood', mood: 'grumpy' };
  }

  // Random autonomous behaviors
  if (roll < 0.15) {
    return { type: 'mood', mood: 'curious' };
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
