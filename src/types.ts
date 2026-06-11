/**
 * @file types.ts
 * @description Współdzielone typy gry: pytania, postęp nauki, tryby kolejności i UI.
 * @dependencies Artwork z data/artworks
 */

export type QuestionTypeKey = 'artist' | 'title' | 'epoka' | 'style';

export type OrderMode = 'smart' | 'random' | 'weak';

export type TabKey = 'play' | 'exam' | 'learn' | 'gallery' | 'stats' | 'plan';

export interface FieldProgress {
  attempts: number;
  correct: number;
  wrong: number;
  mastery: number;
}

export interface ItemProgress {
  attempts: number;
  correct: number;
  wrong: number;
  mastery: number;
  fields: Partial<Record<QuestionTypeKey | 'flashcard', FieldProgress>>;
  lastSeen: string | null;
}

export interface ProgressState {
  items: Record<string, ItemProgress>;
  totalAttempts: number;
  totalCorrect: number;
}
