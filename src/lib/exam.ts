/**
 * @file exam.ts
 * @description Logika trybu egzaminacyjnego: presety, generowanie pytań, ocena wyniku i format czasu.
 * @dependencies ../data/artworks, ./quiz, ../types
 */

import { ARTWORKS, type Artwork } from '../data/artworks';
import { QUESTION_TYPES, buildOptions, normalize, shuffle } from './quiz';
import type { QuestionTypeKey } from '../types';

export interface ExamPreset {
  questionCount: 20 | 40 | 60;
  limitMinutes: 20 | 40 | 60;
  label: string;
  description: string;
}

export interface ExamQuestion {
  id: string;
  item: Artwork;
  questionType: QuestionTypeKey;
  options: string[];
  correctAnswer: string;
}

export type ExamReviewStatus = 'wrong' | 'unanswered';

export interface ExamReviewItem {
  itemId: string;
  questionType: QuestionTypeKey;
  correctAnswer: string;
  selectedAnswer: string | null;
  status: ExamReviewStatus;
}

export interface ExamResult {
  id: string;
  completedAt: string;
  presetSize: number;
  limitMinutes: number;
  durationSeconds: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  reviewItems: ExamReviewItem[];
}

export const EXAM_PRESETS: ExamPreset[] = [
  { questionCount: 20, limitMinutes: 20, label: 'Krótki egzamin', description: 'Szybka próba kontrolna przed nauką.' },
  { questionCount: 40, limitMinutes: 40, label: 'Pełna sesja', description: 'Najlepszy balans tempa i zakresu.' },
  { questionCount: 60, limitMinutes: 60, label: 'Maraton', description: 'Dłuższy sprawdzian odporności na materiał.' },
];

const EXAM_QUESTION_TYPES: QuestionTypeKey[] = ['artist', 'title', 'epoka', 'style'];

export function createExamQuestions(questionCount: number): ExamQuestion[] {
  const candidates = shuffle(
    ARTWORKS.flatMap(item =>
      EXAM_QUESTION_TYPES.map(questionType => ({
        item,
        questionType,
      })),
    ),
  );

  return candidates.slice(0, questionCount).map((candidate, index) => {
    const correctAnswer = QUESTION_TYPES[candidate.questionType].value(candidate.item);
    return {
      id: `${candidate.item.id}-${candidate.questionType}-${index}`,
      item: candidate.item,
      questionType: candidate.questionType,
      options: buildOptions(candidate.item, candidate.questionType, ARTWORKS, ARTWORKS),
      correctAnswer,
    };
  });
}

export function scoreExam(
  questions: ExamQuestion[],
  answers: Record<string, string>,
  preset: ExamPreset,
  startedAt: number,
  finishedAt: number,
): ExamResult {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const reviewItems: ExamReviewItem[] = [];

  questions.forEach(question => {
    const selectedAnswer = answers[question.id] ?? null;
    if (!selectedAnswer) {
      unanswered += 1;
      reviewItems.push({
        itemId: question.item.id,
        questionType: question.questionType,
        correctAnswer: question.correctAnswer,
        selectedAnswer: null,
        status: 'unanswered',
      });
      return;
    }

    if (normalize(selectedAnswer) === normalize(question.correctAnswer)) {
      correct += 1;
      return;
    }

    wrong += 1;
    reviewItems.push({
      itemId: question.item.id,
      questionType: question.questionType,
      correctAnswer: question.correctAnswer,
      selectedAnswer,
      status: 'wrong',
    });
  });

  const total = questions.length;
  return {
    id: `exam-${finishedAt}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date(finishedAt).toISOString(),
    presetSize: preset.questionCount,
    limitMinutes: preset.limitMinutes,
    durationSeconds: Math.max(0, Math.round((finishedAt - startedAt) / 1000)),
    total,
    correct,
    wrong,
    unanswered,
    percentage: total ? Math.round((correct / total) * 100) : 0,
    reviewItems,
  };
}

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
