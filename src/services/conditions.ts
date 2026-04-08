import type { PetStats } from '../types/pet';

export function evaluateCondition(
  condition: { stat: string; op: string; value: number } | string,
  stats: PetStats
): boolean {
  if (typeof condition === 'string') return condition === 'always';
  const statValue = stats[condition.stat as keyof PetStats];
  switch (condition.op) {
    case '<': return statValue < condition.value;
    case '>': return statValue > condition.value;
    case '<=': return statValue <= condition.value;
    case '>=': return statValue >= condition.value;
    default: return false;
  }
}
