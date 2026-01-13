import type { CEFRLevel } from '../data/curriculum';

export interface PlacementResult {
  level: CEFRLevel;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  takenAt: string;
  breakdown: {
    A1: { correct: number; total: number };
    A2: { correct: number; total: number };
    B1: { correct: number; total: number };
    B2: { correct: number; total: number };
  };
}
