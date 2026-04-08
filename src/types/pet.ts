export type PetMood = 'idle' | 'happy' | 'excited' | 'sleepy' | 'eating' | 'loved' | 'curious' | 'dancing' | 'grumpy' | 'dizzy' | 'surprised';

export type PetAction = 'pet' | 'feed' | 'play' | 'sleep' | 'dance' | 'surprise';

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

export interface Expression {
  pupilScale: number;
  eyesClosed: boolean;
  halfEyes: boolean;
  starEyes: boolean;
  blushIntensity: number;
  glowIntensity: number;
  mouthClass: string;
  earDrop: number;
}
