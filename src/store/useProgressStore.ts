/**
 * @file useProgressStore.ts
 * @description Stan postępu nauki (mastery, próby, błędy) zapisywany w localStorage
 *   pod tym samym kluczem i kształtem co poprzednia, statyczna wersja gry.
 * @dependencies zustand, zustand/middleware, ../types
 */

import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import type { FieldProgress, ItemProgress, ProgressState, QuestionTypeKey } from '../types';

const STORAGE_KEY = 'obrazownik-egzaminacyjny-v1';

export const DEFAULT_FIELD_PROGRESS: FieldProgress = { attempts: 0, correct: 0, wrong: 0, mastery: 0 };

export const DEFAULT_ITEM_PROGRESS: ItemProgress = {
  attempts: 0,
  correct: 0,
  wrong: 0,
  mastery: 0,
  fields: {},
  lastSeen: null,
};

interface ProgressStore extends ProgressState {
  getItemProgress: (id: string) => ItemProgress;
  getFieldProgress: (id: string, field: QuestionTypeKey | 'flashcard') => FieldProgress;
  updateProgress: (itemId: string, field: QuestionTypeKey | 'flashcard', correct: boolean) => void;
  resetProgress: () => void;
}

/** Adapter zachowujący na dysku dokładnie kształt {items, totalAttempts, totalCorrect}. */
const rawStorage: PersistStorage<ProgressState> = {
  getItem: name => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      const state: ProgressState = {
        items: parsed.items ?? {},
        totalAttempts: Number(parsed.totalAttempts ?? 0),
        totalCorrect: Number(parsed.totalCorrect ?? 0),
      };
      return { state, version: 0 } satisfies StorageValue<ProgressState>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const { state } = value;
    const payload: ProgressState = {
      items: state.items,
      totalAttempts: state.totalAttempts,
      totalCorrect: state.totalCorrect,
    };
    localStorage.setItem(name, JSON.stringify(payload));
  },
  removeItem: name => localStorage.removeItem(name),
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      items: {},
      totalAttempts: 0,
      totalCorrect: 0,

      getItemProgress: id => get().items[id] ?? DEFAULT_ITEM_PROGRESS,

      getFieldProgress: (id, field) => get().getItemProgress(id).fields[field] ?? DEFAULT_FIELD_PROGRESS,

      updateProgress: (itemId, field, correct) =>
        set(state => {
          const existing = state.items[itemId] ?? DEFAULT_ITEM_PROGRESS;
          const itemProgress: ItemProgress = { ...existing, fields: { ...existing.fields } };
          const fieldProgress: FieldProgress = { ...(itemProgress.fields[field] ?? DEFAULT_FIELD_PROGRESS) };

          itemProgress.attempts += 1;
          fieldProgress.attempts += 1;
          itemProgress.lastSeen = new Date().toISOString();

          if (correct) {
            itemProgress.correct += 1;
            fieldProgress.correct += 1;
            itemProgress.mastery = Math.min(5, (itemProgress.mastery || 0) + 1);
            fieldProgress.mastery = Math.min(5, (fieldProgress.mastery || 0) + 1);
          } else {
            itemProgress.wrong += 1;
            fieldProgress.wrong += 1;
            itemProgress.mastery = Math.max(0, (itemProgress.mastery || 0) - 1);
            fieldProgress.mastery = Math.max(0, (fieldProgress.mastery || 0) - 2);
          }

          itemProgress.fields[field] = fieldProgress;

          return {
            items: { ...state.items, [itemId]: itemProgress },
            totalAttempts: state.totalAttempts + 1,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
          };
        }),

      resetProgress: () => set({ items: {}, totalAttempts: 0, totalCorrect: 0 }),
    }),
    {
      name: STORAGE_KEY,
      storage: rawStorage,
    },
  ),
);
