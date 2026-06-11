/**
 * @file useExamStore.ts
 * @description Historia wyników trybu egzaminacyjnego zapisywana w localStorage.
 * @dependencies zustand, zustand/middleware, ../lib/exam
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamResult } from '../lib/exam';

const MAX_EXAM_RESULTS = 20;

interface ExamStore {
  results: ExamResult[];
  addResult: (result: ExamResult) => void;
  clearResults: () => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    set => ({
      results: [],
      addResult: result =>
        set(state => ({
          results: [result, ...state.results].slice(0, MAX_EXAM_RESULTS),
        })),
      clearResults: () => set({ results: [] }),
    }),
    {
      name: 'obrazownik-egzaminy-v1',
      partialize: state => ({ results: state.results }),
    },
  ),
);
