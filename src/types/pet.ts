export type PetMood = 'idle' | 'happy' | 'excited' | 'sleepy' | 'eating' | 'loved';

export type PetAction = 'pet' | 'feed' | 'play' | 'sleep';

export interface PetStats {
  happiness: number;
  energy: number;
  hunger: number;
  love: number;
}

export interface PetState {
  mood: PetMood;
  stats: PetStats;
  isBlinking: boolean;
  lastInteraction: number;
}
