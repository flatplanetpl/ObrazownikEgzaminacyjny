/**
 * @file useUiStore.ts
 * @description Stan interfejsu: aktywna zakładka, wybrane typy pytań, filtry,
 *   tryb kolejności, zwinięcie ustawień i tryb minimalistyczny. Część preferencji jest persystowana.
 * @dependencies zustand, zustand/middleware, ../types
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderMode, QuestionTypeKey, TabKey } from '../types';

interface UiStore {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  minimal: boolean;
  toggleMinimal: () => void;

  settingsCollapsed: boolean;
  toggleSettingsCollapsed: () => void;

  questionTypes: QuestionTypeKey[];
  toggleQuestionType: (type: QuestionTypeKey) => void;

  periodFilter: string;
  styleFilter: string;
  setPeriodFilter: (value: string) => void;
  setStyleFilter: (value: string) => void;

  orderMode: OrderMode;
  setOrderMode: (mode: OrderMode) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    set => ({
      activeTab: 'play',
      setActiveTab: tab => set({ activeTab: tab }),

      minimal: false,
      toggleMinimal: () => set(state => ({ minimal: !state.minimal })),

      settingsCollapsed: false,
      toggleSettingsCollapsed: () => set(state => ({ settingsCollapsed: !state.settingsCollapsed })),

      questionTypes: ['artist', 'title'],
      toggleQuestionType: type =>
        set(state => {
          const has = state.questionTypes.includes(type);
          const next = has ? state.questionTypes.filter(t => t !== type) : [...state.questionTypes, type];
          return { questionTypes: next.length ? next : state.questionTypes };
        }),

      periodFilter: '',
      styleFilter: '',
      setPeriodFilter: value => set({ periodFilter: value }),
      setStyleFilter: value => set({ styleFilter: value }),

      orderMode: 'smart',
      setOrderMode: mode => set({ orderMode: mode }),
    }),
    {
      name: 'obrazownik-ui-v1',
      partialize: state => ({
        minimal: state.minimal,
        settingsCollapsed: state.settingsCollapsed,
        questionTypes: state.questionTypes,
        orderMode: state.orderMode,
      }),
    },
  ),
);
